import { waitFor } from "../utils/index";
import { LocalStorage, ProtoConfig, SyncStorage, isSafari } from "../config/config";
import { isVisible, waitForElement } from "./dom";
import { addCleanupListener, setupCleanupListener } from "./cleanup";
import { injectScript } from "./scriptInjector";
import { cleanPage } from "./pageCleaner";
import { getExternalDeviceBar } from "./pageUtils";

export type VideoID = string & { __videoID: never };
export type ChannelID = string & { __channelID: never };
export type ContentType = string & { __contentType: never };

export interface ChannelIDInfo {
    id: ChannelID | null;
    author: string | null;
}

interface VideoModuleParams {
    videoIDChange: (videoID: VideoID) => void;
    channelIDChange: (channelIDInfo: ChannelIDInfo) => void;
    videoElementChange?: (newVideo: boolean, video: HTMLMediaElement | null) => void;
    playerInit?: () => void;
    updatePlayerBar?: () => void;
    resetValues: () => void;
    windowListenerHandler?: (event: MessageEvent) => void;
    newVideosLoaded?: (videoIDs: VideoID[]) => void; // Used to pre-cache data for videos
    documentScript: string;
}

const episodeIDSelector = "span[draggable='true'] a[data-testid='context-item-link']";
const channelIDSelector = "a[data-testid='context-item-info-show']";

let video: HTMLMediaElement | null = null;
let videoWidth: string | null = null;
let videoMutationObserver: MutationObserver | null = null;
let videoMutationListenerElement: HTMLElement | null = null;
// What videos have run through setup so far
const videosSetup: HTMLMediaElement[] = [];
let waitingForNewVideo = false;

let isAdPlaying = false;

let videoID: VideoID | null = null;

let onMobileSpotify = false;
let firstMobileTrigger = true;
let channelIDInfo: ChannelIDInfo = {
    id: null,
    author: null
};
let contentType: ContentType | null = null;

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
    documentScript: ""
};
let getConfig: () => ProtoConfig<SyncStorage, LocalStorage>;
export function setupVideoModule(moduleParams: VideoModuleParams, config: () => ProtoConfig<SyncStorage, LocalStorage>) {
    params = moduleParams;
    getConfig = config;

    setupCleanupListener();

    addPageListeners();

    if (!checkIfOnMobileSpotify()) {
        // Direct Links after the needed element is loaded, will continue waiting if no media is played
        void waitFor(() => document.querySelector(episodeIDSelector), undefined, 100, (el) => el !== null).then((element) => {
            videoIDChange(getYouTubeVideoID());
        })
    } else {
        onMobileSpotify = true;
        void waitFor(() => document.querySelector("#__sb_video_container audio"), undefined, 100, (el) => el !== null).then((element) => {
        video = element as HTMLMediaElement;
        })
    }

    // Register listener for URL change via Navigation API
    const navigationApiAvailable = "navigation" in window;
    if (navigationApiAvailable) {
        // TODO: Remove type cast once type declarations are updated
        const navigationListener = (e) =>
            void videoIDChange(getYouTubeVideoID());
        (window as unknown as { navigation: EventTarget }).navigation.addEventListener("navigate", navigationListener);

        addCleanupListener(() => {
            (window as unknown as { navigation: EventTarget }).navigation.removeEventListener("navigate", navigationListener);
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

export async function checkIfNewVideoID(): Promise<boolean> {
    const id = getYouTubeVideoID();

    if (id === videoID) return false;
    return await videoIDChange(id);
}

export async function checkVideoIDChange(): Promise<boolean> {
    const id = getYouTubeVideoID();
    
    return await videoIDChange(id);
}

export async function triggerVideoIDChange(id: VideoID): Promise<boolean> {
    return await videoIDChange(id);
}

async function videoIDChange(id: VideoID | null, isInlineParam = false): Promise<boolean> {
    if (!id && !videoID) {
        return false;
    }
    
    //when content is no longer podcast or playing on an external device
    if (!id && videoID) {
        resetValues();
        cleanPage();
        return false;
    }

    if (isInlineParam && id) {
        setTimeout(() => void refreshVideoAttachments(), 200);
        setTimeout(() => void refreshVideoAttachments(), 1000);
    }

    //if the id has not changed return unless the video element has changed
    if (videoID === id && (isVisible(video) || !video)) {
        return false;
    }

    // Make sure the video is still visible
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
    void whitelistCheck();

    params.videoIDChange(id);

    return true;
}

function resetValues() {
    params.resetValues();

    videoID = null;
    channelIDInfo = {
        id: null,
        author: null
    };
    isInline = false;
    adDuration = 0;
    currentTimeWrong = false;

    isAdPlaying = false;
}

export function getYouTubeVideoID(): VideoID | null {
    if (onMobileSpotify && getContentType() === "episode" && !checkIfExternalDevice()) {
        return videoID;
    } else if (onMobileSpotify) {
        return null;
    } else {
        return getEpisodeDataFromDOM("EpisodeID");
    }
}

export function getContentType(): ContentType | null {
    if (onMobileSpotify) {
        return contentType;
    } else {
        return getEpisodeDataFromDOM("ContentType");
    }
}

function getEpisodeDataFromDOM(type: "ContentType"): ContentType;
function getEpisodeDataFromDOM(type: "EpisodeID"): VideoID | null;
function getEpisodeDataFromDOM(type: "ContentType" | "EpisodeID"): VideoID | null | ContentType {
    const HrefRegex = /\/([^\/]+)\/([A-Za-z0-9]+)(?:[\/?]|$)/;
    const element = document.querySelector(episodeIDSelector);
    // Edge case where there is no track loaded
    if (!element) return null;
    const href = element.getAttribute("href");
    
    const match = href.match(HrefRegex);
    const [, DOMContentType, id] = match;
    if (type === "ContentType") {
        return DOMContentType as ContentType;
    } 
    // If played media is a podcast not playing on an external device
    else if (type === "EpisodeID" && DOMContentType === "episode" && !checkIfExternalDevice()) {
        return id as VideoID;
    } else {
        return null;
    }
}

export function getChannelID(): ChannelIDInfo | null{
    if (onMobileSpotify) {
        return channelIDInfo;
    }
    const element = document.querySelector<HTMLAnchorElement>(channelIDSelector)
    if (!element) return null;

    const href = element.getAttribute("href");
    const match = href.match(/\/show\/([^/]+)/);
    
    const author = element.textContent.trim();
    const channelID = match[1];
    return {
        id: channelID,
        author: author
    } as ChannelIDInfo;
}

export function checkIfOnMobileSpotify(): boolean {
    return document.querySelector(".mobile-web-player") !== null;
}

export function checkIfExternalDevice(): boolean {
    const externalDeviceBar = getExternalDeviceBar();
    return externalDeviceBar !== null;
}

//checks if this channel is whitelisted, should be done only after the channelID has been loaded
export async function whitelistCheck() {
    channelIDInfo = getChannelID();
    params.channelIDChange(channelIDInfo);
}

let lastMutationListenerCheck = 0;
let checkTimeout: NodeJS.Timeout | null = null;
function setupVideoMutationListener() {
    if (videoMutationObserver === null) {

        // Delay it if it was checked recently
        if (checkTimeout) clearTimeout(checkTimeout);
        if (Date.now() - lastMutationListenerCheck < 2000) {
            checkTimeout = setTimeout(setupVideoMutationListener, Math.max(1000, Date.now() - lastMutationListenerCheck));
            return;
        }

        lastMutationListenerCheck = Date.now();

        const videoContainer = document.getElementById("__sb_video_container") as HTMLElement;
        if (!videoContainer) return;

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

const waitingForVideoListeners: Array<(video: HTMLMediaElement) => void> = [];
export function waitForVideo(): Promise<HTMLMediaElement> {
    if (video) return Promise.resolve(video);

    return new Promise((resolve) => {
        waitingForVideoListeners.push(resolve);
    });
}

async function refreshVideoAttachments(): Promise<void> {
    if (waitingForNewVideo) return;

    waitingForNewVideo = true;
    // Compatibility for Vinegar extension
    let newVideo = (isSafari() && document.querySelector('video[vinegared="true"]') as HTMLMediaElement) 
        || (onMobileSpotify && document.querySelector('#__sb_video_container audio') as HTMLMediaElement) 
        || document.querySelector('#__sb_video_container video') as HTMLMediaElement;

    waitingForNewVideo = false;

    if (video === newVideo) return;
    video = newVideo;
    const isNewVideo = !videosSetup.includes(video);

    if (isNewVideo) {
        videosSetup.push(video);
    }

    params.videoElementChange?.(isNewVideo, video);
    waitingForVideoListeners.forEach((l) => l(newVideo));
    waitingForVideoListeners.length = 0;

    setupVideoMutationListener();
    
    void videoIDChange(getYouTubeVideoID());
}

/**
 * To handle compatibility with the Vinegar extension on Safari
 */
function isVinegarActive(): boolean {
    return isSafari() && !!document.querySelector('video[vinegared="true"]');
}

export function triggerVideoElementChange(newVideo: HTMLMediaElement, mobile?: boolean): void {
    video = newVideo;
    const isNewVideo = !videosSetup.includes(video);

    if (isNewVideo) {
        videosSetup.push(video);
    }

    if (mobile && firstMobileTrigger) {
        firstMobileTrigger = false;
        params.videoElementChange?.(true, video);
    } else {
        params.videoElementChange?.(isNewVideo, video);
    }
}

function windowListenerHandler(event: MessageEvent): void {
    const data = event.data;
    const dataType = data.type;

    if (data.source !== "sponsorblock") return;

    if (dataType === "navigation" && data.videoID) {
        channelIDInfo = getChannelID();
        void whitelistCheck();
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

    } else if (dataType === "videoIDsLoaded") {
        params.newVideosLoaded?.(data.videoIDs);
    } else if (dataType === "adDuration") {
        adDuration = data.duration;
    } else if (dataType === "currentTimeWrong") {
        currentTimeWrong = true;

        alert(`${chrome.i18n.getMessage("submissionFailedServerSideAds")}\n\nInclude the following:\n${data.playerTime}\n${data.expectedTime}`);
    } else if (dataType === "changeEpisodeData") {
        contentType = data.contentType;
        videoID = data.episodeID;
        videoIDChange(getYouTubeVideoID());
        channelIDInfo = {
            id: data.showID,
            author: data.showTitle
        };

        if (firstMobileTrigger) {
            triggerVideoElementChange(video);
        }
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
}

let lastRefresh = 0;
export function getVideo(): HTMLMediaElement | null {
    setupVideoMutationListener();
    if ((!video)
            && Date.now() - lastRefresh > 500) {
        lastRefresh = Date.now();
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

export function setCurrentTime(time: number): void {
    if (getVideo()) {
        getVideo()!.currentTime = time + adDuration;
    }
}

export function isOnMobileSpotify(): boolean {
    return onMobileSpotify;
}

export function getChannelIDInfo(): ChannelIDInfo {
    return channelIDInfo;
}

export function setChanelIDInfo(id: string, author: string): void {
    channelIDInfo = {
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