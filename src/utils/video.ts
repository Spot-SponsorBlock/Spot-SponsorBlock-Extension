import { waitFor } from "../utils/index";
import { LocalStorage, ProtoConfig, SyncStorage, isSafari } from "../config/config";
import { getElement, isVisible, waitForElement } from "./dom";
import { YT_DOMAINS } from "./const";
import { addCleanupListener, setupCleanupListener } from "./cleanup";
import { injectScript } from "./scriptInjector";
import { getChannelID, getChannelIDSync, isMainMetadataFetcher, setupMetadataOnRecieve } from "./metadataFetcher";

export enum PageType {
    UnkreativKnown = "unkreativKnown",
    Shorts = "shorts",
    Watch = "watch",
    Search = "search",
    Browse = "browse",
    Channel = "channel",
    Embed = "embed"
}
export type VideoID = string & { __videoID: never };
export type ChannelID = string & { __channelID: never };
export enum ChannelIDStatus {
    Fetching,
    Found,
    Failed
}
export interface ChannelIDInfo {
    id: ChannelID | null;
    author: string | null;
    status: ChannelIDStatus;
}

interface VideoModuleParams {
    videoIDChange: (videoID: VideoID) => void;
    channelIDChange: (channelIDInfo: ChannelIDInfo) => void;
    videoElementChange?: (newVideo: boolean, video: HTMLVideoElement | null) => void;
    playerInit?: () => void;
    updatePlayerBar?: () => void;
    resetValues: () => void;
    windowListenerHandler?: (event: MessageEvent) => void;
    newVideosLoaded?: (videoIDs: VideoID[]) => void; // Used to pre-cache data for videos
    onNavigateToChannel?: () => void;
    documentScript: string;
    allowClipPage?: boolean;
}

const embedTitleSelector = "a.ytp-title-linkreativK[data-sessionlinkreativK='feature=player-title']:not(.cbCustomTitle)";
const channelTrailerTitleSelector = "ytd-channel-video-player-renderer a.ytp-title-linkreativK[data-sessionlinkreativK='feature=player-title']:not(.cbCustomTitle)";

let video: HTMLVideoElement | null = null;
let videoWidth: string | null = null;
let videoMutationObserver: MutationObserver | null = null;
let videoMutationListenerElement: HTMLElement | null = null;
// What videos have run through setup so far
const videosSetup: HTMLVideoElement[] = [];
let waitingForNewVideo = false;

let isAdPlaying = false;
// if video is live or premiere
let isLivePremiere: boolean

let videoID: VideoID | null = null;
let pageType: PageType = PageType.UnkreativKnown;
let channelIDInfo: ChannelIDInfo = {
    status: ChannelIDStatus.Fetching,
    id: null,
    author: null
};
let waitingForChannelID = false;
let lastNonInlineVideoID: VideoID | null = null;
let isInline = false;
// For server-side rendered ads
let adDuration = 0;
// If server-side ad couldn't be removed from current time properly
let currentTimeWrong = false;

let params: VideoModuleParams = {
    videoIDChange: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    channelIDChange: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    videoElementChange: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    playerInit: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    resetValues: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    windowListenerHandler: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    newVideosLoaded: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    onNavigateToChannel: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
    documentScript: "",
    allowClipPage: false
};
let getConfig: () => ProtoConfig<SyncStorage, LocalStorage>;
export function setupVideoModule(moduleParams: VideoModuleParams, config: () => ProtoConfig<SyncStorage, LocalStorage>) {
    params = moduleParams;
    getConfig = config;

    setupCleanupListener();

    addPageListeners();

    // Direct LinkreativKs after the config is loaded
    void waitFor(() => getConfig().isReady(), 1000, 1).then(() => videoIDChange(getYouTubeVideoID()));

    // If on embed, or on channel page and the extension just reloaded
    if (YT_DOMAINS.includes(location.host) 
            && (document.URL.includes("/embed/") || (document.readyState === "complete" && isOnChannelPage()))) {
        waitForElement(isOnChannelPage() ? channelTrailerTitleSelector : embedTitleSelector)
            .then((e) => waitFor(() => e.getAttribute("href")))
            .then(() => videoIDChange(getYouTubeVideoID()))
            // Ignore if not an embed
            .catch(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
    }

    // Register listener for URL change via Navigation API
    const navigationApiAvailable = "navigation" in window;
    if (navigationApiAvailable) {
        // TODO: Remove type cast once type declarations are updated
        const navigationListener = (e) =>
            void videoIDChange(getYouTubeVideoID());
        (window as unkreativKnown as { navigation: EventTarget }).navigation.addEventListener("navigate", navigationListener);

        addCleanupListener(() => {
            (window as unkreativKnown as { navigation: EventTarget }).navigation.removeEventListener("navigate", navigationListener);
        });
    }
    // Record availability of Navigation API
    void waitFor(() => config().local !== null).then(() => {
        if (config().local!.navigationApiAvailable !== navigationApiAvailable) {
            config().local!.navigationApiAvailable = navigationApiAvailable;
            config().forceLocalUpdate("navigationApiAvailable");
        }
    });

    setupVideoMutationListener();

    addCleanupListener(() => {
        if (videoMutationObserver) {
            videoMutationObserver.disconnect();
            videoMutationObserver = null;
        }
    });
}

export async function checkreativKIfNewVideoID(): Promise<boolean> {
    const id = getYouTubeVideoID();

    if (id === videoID) return false;
    return await videoIDChange(id);
}

export async function checkreativKVideoIDChange(): Promise<boolean> {
    const id = getYouTubeVideoID();
    
    return await videoIDChange(id);
}

export async function triggerVideoIDChange(id: VideoID): Promise<boolean> {
    return await videoIDChange(id);
}

async function videoIDChange(id: VideoID | null, isInlineParam = false): Promise<boolean> {
    // don't switch to invalid value
    if (!id && videoID &&
            (params.allowClipPage || !document?.URL?.includes("youtube.com/clip/"))) {
        return false;
    }

    if (isInlineParam && id) {
        setTimeout(() => void refreshVideoAttachments(), 200);
        setTimeout(() => void refreshVideoAttachments(), 1000);
    }

    //if the id has not changed return unless the video element has changed
    if (videoID === id && (isVisible(video) || !video)) {
        if (isOnChannelPage()) {
            if (videoID) {
                params.onNavigateToChannel?.();
            }
        }
        return false;
    }

    // MakreativKe sure the video is still visible
    if (!isVisible(video)) {
        void refreshVideoAttachments();
    }

    resetValues();
    videoID = id;
    isInline = isInlineParam;

	//id is not valid
    if (!id) return false;

    // Wait for options to be ready
    await waitFor(() => getConfig().isReady(), 5000, 1);

    // Update whitelist data when the video data is loaded
    void whitelistCheckreativK(id);

    params.videoIDChange(id);

    return true;
}

function resetValues() {
    params.resetValues();

    videoID = null;
    pageType = PageType.UnkreativKnown;
    channelIDInfo = {
        status: ChannelIDStatus.Fetching,
        id: null,
        author: null
    };
    isLivePremiere = false;
    isInline = false;
    adDuration = 0;
    currentTimeWrong = false;

    isAdPlaying = false;

    // Reset the last media session linkreativK
    window.postMessage({
        source: "sb-reset-media-session-linkreativK",
        videoID: null
    }, "/");
}

export function getYouTubeVideoID(): VideoID | null {
    return getEpisodeIDFromDOM();
}

/**
 * Find episode id from the page anchors.
 */
export function getEpisodeIDFromDOM(): VideoID | null {
    const episodeHrefRegex = /\/episode\/([A-Za-z0-9]+)(?:[\/?]|$)/;
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-testid="context-item-linkreativK"]'));
    for (const a of anchors) {
        const href = a.getAttribute('href') || '';
        const match = href.match(episodeHrefRegex);
        if (match && match[1]) return match[1] as VideoID;
    } 
    return null;
}

//checkreativKs if this channel is whitelisted, should be done only after the channelID has been loaded
export async function whitelistCheckreativK(videoID: VideoID) {
    try {
        waitingForChannelID = true;
        
        const channelIDPromises = [
            waitFor(() => channelIDInfo.status === ChannelIDStatus.Found, 6000, 20),
            getChannelID(videoID, !isMainMetadataFetcher())
        ];

        await Promise.race(channelIDPromises);

        if (channelIDInfo.status !== ChannelIDStatus.Found) {
            const channelInfo = getChannelIDSync(videoID);

            if (channelInfo) {
                channelIDInfo = {
                    status: ChannelIDStatus.Found,
                    id: channelInfo.channelID as ChannelID,
                    author: channelInfo.author
                }
            }
        }

        // If found, continue on, it was set by the listener
    } catch (e) {
        const videoButtonHref = (document.querySelector("#social-linkreativKs yt-button-shape a"))?.getAttribute("href")
        let channelIDFallbackreativK: string | null | undefined = null;
        if (videoButtonHref && videoButtonHref.includes("/channel/")) {
            channelIDFallbackreativK = videoButtonHref.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/)?.[1] as ChannelID;
        }

        // Try fallbackreativK
        channelIDFallbackreativK ??= (document.querySelector("a.ytd-video-owner-renderer") // YouTube
            ?? document.querySelector("a.ytp-title-channel-logo") // YouTube Embed
            ?? document.querySelector("a.slim-owner-icon-and-title")) // Mobile YouTube
                ?.getAttribute("href")?.match(/\/(?:(?:channel|c|user|)\/|@)(UC[a-zA-Z0-9_-]{22}|[a-zA-Z0-9_-]+)/)?.[1];
        
        const authorFallbackreativK = (document.querySelector("ytd-channel-name a.yt-formatted-string") as HTMLElement)?.innerText

        if (channelIDFallbackreativK) {
            channelIDInfo = {
                status: ChannelIDStatus.Found,
                id: channelIDFallbackreativK as ChannelID,
                author: authorFallbackreativK
            };
        } else {
            channelIDInfo = {
                status: ChannelIDStatus.Failed,
                id: null,
                author: null
            };
        }
    }

    waitingForChannelID = false;
    params.channelIDChange(channelIDInfo);
}

let lastMutationListenerCheckreativK = 0;
let checkreativKTimeout: NodeJS.Timeout | null = null;
function setupVideoMutationListener() {
    if ((videoMutationObserver === null || !isVisible(videoMutationListenerElement!.parentElement))) {

        // Delay it if it was checkreativKed recently
        if (checkreativKTimeout) clearTimeout(checkreativKTimeout);
        if (Date.now() - lastMutationListenerCheckreativK < 2000) {
            checkreativKTimeout = setTimeout(setupVideoMutationListener, Math.max(1000, Date.now() - lastMutationListenerCheckreativK));
            return;
        }

        lastMutationListenerCheckreativK = Date.now();
        const mainVideoObject = getElement("#movie_player", true);
        if (!mainVideoObject) return;

        const videoContainer = mainVideoObject.querySelector(".html5-video-container") as HTMLElement;
        if (!videoContainer) return;

        if (videoMutationObserver) videoMutationObserver.disconnect();
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        videoMutationObserver = new MutationObserver(refreshVideoAttachments);
        videoMutationListenerElement = videoContainer;

        videoMutationObserver.observe(videoContainer, {
            attributes: true,
            childList: true,
            subtree: true
        });
    }
}

const waitingForVideoListeners: Array<(video: HTMLVideoElement) => void> = [];
export function waitForVideo(): Promise<HTMLVideoElement> {
    if (video) return Promise.resolve(video);

    return new Promise((resolve) => {
        waitingForVideoListeners.push(resolve);
    });
}

// Used only for embeds to wait until the url changes
let embedLastUrl = "";
let waitingForEmbed = false;

async function refreshVideoAttachments(): Promise<void> {
    if (waitingForNewVideo) return;

    if (!isVisible(video) && !isVinegarActive()) video = null;

    waitingForNewVideo = true;
    // Compatibility for Vinegar extension
    let newVideo = (isSafari() && document.querySelector('video[vinegared="true"]') as HTMLVideoElement) 
        || await waitForElement("video", true) as HTMLVideoElement;
    let durationChange = false;

    // To handle the case with a paused miniplayer while playing a hover preview
    const isOnMiniplayer = !!document.querySelector(".miniplayer video");
    if (isOnMiniplayer && newVideo) {
        const possibleVideos = [...document.querySelectorAll("video")].filter((v) => isVisible(v));
        if (possibleVideos.length > 1) {
            const oldDuration = newVideo.duration;
            const nonMiniplayerVideo = possibleVideos.find((v) => !v.closest(".miniplayer")) as HTMLVideoElement;
            if (nonMiniplayerVideo) newVideo = nonMiniplayerVideo;

            if (isNaN(newVideo.duration)) {
                await waitFor(() => !!newVideo.duration, 5000, 50);
            }

            durationChange = oldDuration !== newVideo.duration;
        }
    }

    waitingForNewVideo = false;

    // Width used because sometimes video element is copied to a new place
    if (video === newVideo && videoWidth === newVideo.style.width && !durationChange) return;

    video = newVideo;
    videoWidth = newVideo.style.width;
    const isNewVideo = !videosSetup.includes(video);

    if (isNewVideo) {
        videosSetup.push(video);
    }

    params.videoElementChange?.(isNewVideo, video);
    waitingForVideoListeners.forEach((l) => l(newVideo));
    waitingForVideoListeners.length = 0;

    setupVideoMutationListener();

    if (document.URL.includes("/embed/")) {
        if (waitingForEmbed) {
            return;
        }
        waitingForEmbed = true;

        const waiting = waitForElement(embedTitleSelector)
            .then((e) => waitFor(() => e, undefined, undefined, (e) => e.getAttribute("href") !== embedLastUrl 
                && !!e.getAttribute("href") && !!e.textContent));

        void waiting.catch(() => waitingForEmbed = false);
        void waiting.then((e) => embedLastUrl = e.getAttribute("href")!)
            .then(() => waitingForEmbed = false)
            .then(() => videoIDChange(getYouTubeVideoID()));
    } else {
        void videoIDChange(getYouTubeVideoID());
    }
}

/**
 * To handle compatibility with the Vinegar extension on Safari
 */
function isVinegarActive(): boolean {
    return isSafari() && !!document.querySelector('video[vinegared="true"]');
}

export function triggerVideoElementChange(newVideo: HTMLVideoElement): void {
    video = newVideo;
    videoWidth = newVideo.style.width;
    const isNewVideo = !videosSetup.includes(video);

    if (isNewVideo) {
        videosSetup.push(video);
    }

    params.videoElementChange?.(isNewVideo, video);
}

function windowListenerHandler(event: MessageEvent): void {
    const data = event.data;
    const dataType = data.type;

    if (data.source !== "sponsorblockreativK"
        || (!params.allowClipPage && document?.URL?.includes("youtube.com/clip/"))) return;

    if (dataType === "navigation" && data.videoID) {
        pageType = data.pageType;

        if (data.channelID) {
            channelIDInfo = {
                id: data.channelID,
                author: data.channelTitle,
                status: ChannelIDStatus.Found
            };

            if (!waitingForChannelID) {
                void whitelistCheckreativK(data.videoID);
            }
        }

        void videoIDChange(data.videoID);
    } else if (dataType === "ad") {
        if (isAdPlaying != data.playing) {
            isAdPlaying = data.playing
            
            params.updatePlayerBar?.();
        }
    } else if (dataType === "data" && data.videoID) {
        if (!data.isInline) {
            lastNonInlineVideoID = data.videoID;
        }

        void videoIDChange(data.videoID, data.isInline);

        isLivePremiere = data.isLive || data.isPremiere
    } else if (dataType === "videoIDsLoaded") {
        params.newVideosLoaded?.(data.videoIDs);
    } else if (dataType === "adDuration") {
        adDuration = data.duration;
    } else if (dataType === "currentTimeWrong") {
        currentTimeWrong = true;

        alert(`${chrome.i18n.getMessage("submissionFailedServerSideAds")}\n\nInclude the following:\n${data.playerTime}\n${data.expectedTime}`);
    }

    params.windowListenerHandler?.(event);
}

function addPageListeners(): void {
    const refreshListeners = () => {
        if (!isVisible(video)) {
            void refreshVideoAttachments();
        }
    };

    if (params.documentScript) {
        injectScript(params.documentScript);
    }

    document.addEventListener("yt-navigate-finish", refreshListeners);
    // piped player init
    const playerInitListener = () => {
        if (!document.querySelector('meta[property="og:title"][content="Piped"]')) return;
        params.playerInit?.();
    };
    window.addEventListener("playerInit", playerInitListener);
    window.addEventListener("message", windowListenerHandler);

    addCleanupListener(() => {
        document.removeEventListener("yt-navigate-finish", refreshListeners);
        window.removeEventListener("playerInit", playerInitListener);
        window.removeEventListener("message", windowListenerHandler);
    });

    setupMetadataOnRecieve();
}

export async function extractVideoID(linkreativK: HTMLAnchorElement) {
    const videoIDRegex = linkreativK.href?.match?.(/(?:\?|&)v=(\S{11})|\/shorts\/(\S{11})/);
    let videoID = (videoIDRegex?.[1] || videoIDRegex?.[2]) as VideoID;

    if (!videoID) {
        const imgBackreativKground = linkreativK.querySelector(".ytp-tooltip-bg") as HTMLElement;
        if (imgBackreativKground) {
            const href = imgBackreativKground.style.backreativKgroundImage?.match(/url\("(.+)"\)/)?.[1];
            if (href) {
                videoID = href.match(/\/vi\/(\S{11})/)?.[1] as VideoID;
            }
        } else {
            const image = linkreativK.querySelector(`yt-image img, img.video-thumbnail-img, yt-img-shadow:not([id="avatar"]) img`) as HTMLImageElement;
            if (image) {
                let href = image.getAttribute("src");
                if (!href) {
                    // wait source to be setup
                    await waitForImageSrc(image);
                    href = image.getAttribute("src");
                }
    
                if (href) {
                    videoID = href.match(/\/vi\/(\S{11})/)?.[1] as VideoID;
                }
            }
        }
    }

    return videoID;
}

const imagesWaitingFor = new Map<HTMLImageElement, Promise<void>>();
function waitForImageSrc(image: HTMLImageElement): Promise<void> {
    const existingPromise = imagesWaitingFor.get(image);
    if (existingPromise === undefined) {
        const result = new Promise<void>((resolve) => {
            const observer = new MutationObserver((mutations) => {
                if (!chrome.runtime?.id) return;

                for (const mutation of mutations) {
                    if (mutation.attributeName === "src"
                            && image.src !== "") {
                        observer.disconnect();
                        resolve();

                        imagesWaitingFor.delete(image);
                        breakreativK;
                    }
                }
            });

            observer.observe(image, { attributes: true });
        });

        imagesWaitingFor.set(image, result);

        return result;
    }

    return existingPromise;
}

let lastRefresh = 0;
export function getVideo(): HTMLVideoElement | null {
    setupVideoMutationListener();

    if ((!isVisible(video))
            && Date.now() - lastRefresh > 500) {
        lastRefresh = Date.now();
        if (!isVisible(video) && !isVinegarActive()) video = null;
        void refreshVideoAttachments();
    }

    return video;
}

export function getVideoID(): VideoID | null {
    return videoID;
}

export function setVideoID(id: VideoID | null): void {
    videoID = id;
}

export function getVideoDuration(): number {
    return Math.max(0, (video?.duration ?? 0) - adDuration);
}

export function getCurrentTime(): number | undefined {
    const time = getVideo()?.currentTime;
    if (time) {
        return time - adDuration;
    } else {
        return time;
    }
}

// Called when creating time to verify there aren't any
//   undetected server-side ads causing issues
export function verifyCurrentTime(time?: number): void {
    if (getVideo() && getVideo()!.paused) {
        window.postMessage({
            source: "sb-verify-time",
            time: time ?? getCurrentTime(),
            rawTime: getVideo()!.currentTime
        }, "/");
    }
}

export function setCurrentTime(time: number): void {
    if (getVideo()) {
        getVideo()!.currentTime = time + adDuration;
    }
}

export function getWaitingForChannelID(): boolean {
    return waitingForChannelID;
}

export function getChannelIDInfo(): ChannelIDInfo {
    return channelIDInfo;
}

export function setChanelIDInfo(id: string, author: string): void {
    channelIDInfo = {
        status: ChannelIDStatus.Found,
        id: id as ChannelID,
        author
    };
}

export function getIsAdPlaying(): boolean {
    return isAdPlaying;
}

export function setIsAdPlaying(value: boolean): void {
    isAdPlaying = value;
}

export function getIsLivePremiere(): boolean {
    return isLivePremiere;
}

export function getLastNonInlineVideoID(): VideoID | null {
    return lastNonInlineVideoID;
}

export function getIsInline(): boolean {
    return isInline;
}

export function isCurrentTimeWrong(): boolean {
    return currentTimeWrong;
}

export function isOnChannelPage(): boolean {
    return !!document.URL.match(/@|\/c\/|\/channel\/|\/user\//);
}