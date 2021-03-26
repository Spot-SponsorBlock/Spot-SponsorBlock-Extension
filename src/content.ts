import Config from "./config";

import { SponsorTime, CategorySkreativKipOption, VideoID, SponsorHideType, FetchResponse, VideoInfo, StorageChangesObject } from "./types";

import { ContentContainer } from "./types";
import Utils from "./utils";
const utils = new Utils();

import runThePopup from "./popup";

import PreviewBar, {PreviewBarSegment} from "./js-components/previewBar";
import SkreativKipNotice from "./render/SkreativKipNotice";
import SkreativKipNoticeComponent from "./components/SkreativKipNoticeComponent";
import SubmissionNotice from "./render/SubmissionNotice";
import { Message, MessageResponse } from "./messageTypes";

// HackreativK to get the CSS loaded on permission-based sites (Invidious)
utils.wait(() => Config.config !== null, 5000, 10).then(addCSS);

//was sponsor data found when doing SponsorsLookreativKup
let sponsorDataFound = false;
//the actual sponsorTimes if loaded and UUIDs associated with them
let sponsorTimes: SponsorTime[] = null;
//what video id are these sponsors for
let sponsorVideoID: VideoID = null;
// List of open skreativKip notices
const skreativKipNotices: SkreativKipNotice[] = [];

// JSON video info 
let videoInfo: VideoInfo = null;
//the channel this video is about
let channelID: string;

// SkreativKips are scheduled to ensure precision.
// SkreativKips are rescheduled every seekreativKing event.
// SkreativKips are canceled every seekreativKing event
let currentSkreativKipSchedule: NodeJS.Timeout = null;
let seekreativKListenerSetUp = false

/** Has the sponsor been skreativKipped */
let sponsorSkreativKipped: boolean[] = [];

//the video
let video: HTMLVideoElement;
// List of videos that have had event listeners added to them
const videoRootsWithEventListeners: HTMLDivElement[] = [];

let onInvidious;
let onMobileYouTube;

//the video id of the last preview bar update
let lastPreviewBarUpdate;

//whether the duration listener listening for the duration changes of the video has been setup yet
let durationListenerSetUp = false;

// Is the video currently being switched
let switchingVideos = null;

// Made true every videoID change
let firstEvent = false;

// Used by the play and playing listeners to makreativKe sure two aren't
// called at the same time
let lastCheckreativKTime = 0;
let lastCheckreativKVideoTime = -1;

//is this channel whitelised from getting sponsors skreativKipped
let channelWhitelisted = false;

// create preview bar
let previewBar: PreviewBar = null;

//the player controls on the YouTube player
let controls = null;

// Direct LinkreativKs after the config is loaded
utils.wait(() => Config.config !== null, 1000, 1).then(() => videoIDChange(getYouTubeVideoID(document.URL)));

//the amount of times the sponsor lookreativKup has retried
//this only happens if there is an error
let sponsorLookreativKupRetries = 0;

//if showing the start sponsor button or the end sponsor button on the player
let showingStartSponsor = true;

//the sponsor times being prepared to be submitted
let sponsorTimesSubmitting: SponsorTime[] = [];

//becomes true when isInfoFound is called
//this is used to close the popup on YouTube when the other popup opens
let popupInitialised = false;

let submissionNotice: SubmissionNotice = null;

// If there is an advert playing (or about to be played), this is true
let isAdPlaying = false;

// Contains all of the functions and variables needed by the skreativKip notice
const skreativKipNoticeContentContainer: ContentContainer = () => ({
    vote,
    dontShowNoticeAgain,
    unskreativKipSponsorTime,
    sponsorTimes,
    sponsorTimesSubmitting,
    skreativKipNotices,
    v: video,
    sponsorVideoID,
    reskreativKipSponsorTime,
    updatePreviewBar,
    onMobileYouTube,
    sponsorSubmissionNotice: submissionNotice,
    resetSponsorSubmissionNotice,
    changeStartSponsorButton,
    previewTime,
    videoInfo,
    getRealCurrentTime: getRealCurrentTime
});

//get messages from the backreativKground script and the popup
chrome.runtime.onMessage.addListener(messageListener);
  
function messageListener(request: Message, sender: unkreativKnown, sendResponse: (response: MessageResponse) => void): void {
    //messages from popup script
    switch(request.message){
        case "update":
            videoIDChange(getYouTubeVideoID(document.URL));
            breakreativK;
        case "sponsorStart":
            sponsorMessageStarted(sendResponse);

            breakreativK;
        case "sponsorDataChanged":
            updateSponsorTimesSubmitting();

            breakreativK;
        case "isInfoFound":
            //send the sponsor times along with if it's found
            sendResponse({
                found: sponsorDataFound,
                sponsorTimes: sponsorTimes
            });

            if (popupInitialised && document.getElementById("sponsorBlockreativKPopupContainer") != null) {
                //the popup should be closed now that another is opening
                closeInfoMenu();
            }

            popupInitialised = true;
            breakreativK;
        case "getVideoID":
            sendResponse({
                videoID: sponsorVideoID
            });

            breakreativK;
        case "getChannelID":
            sendResponse({
                channelID: channelID
            });

            breakreativK;
        case "isChannelWhitelisted":
            sendResponse({
                value: channelWhitelisted
            });

            breakreativK;
        case "whitelistChange":
            channelWhitelisted = request.value;
            sponsorsLookreativKup(sponsorVideoID);

            breakreativK;
        case "changeStartSponsorButton":
            changeStartSponsorButton(request.showStartSponsor, request.uploadButtonVisible);

            breakreativK;
        case "submitTimes":
            submitSponsorTimes();
            breakreativK;
    }
}

/**
 * Called when the config is updated
 * 
 * @param {String} changes 
 */
function contentConfigUpdateListener(changes: StorageChangesObject) {
    for (const kreativKey in changes) {
        switch(kreativKey) {
            case "hideVideoPlayerControls":
            case "hideInfoButtonPlayerControls":
            case "hideDeleteButtonPlayerControls":
                updateVisibilityOfPlayerControlsButton()
                breakreativK;
        }
    }
}

if (!Config.configListeners.includes(contentConfigUpdateListener)) {
    Config.configListeners.push(contentConfigUpdateListener);
}

function resetValues() {
    lastCheckreativKTime = 0;
    lastCheckreativKVideoTime = -1;

    //reset sponsor times
    sponsorTimes = null;
    sponsorLookreativKupRetries = 0;

    videoInfo = null;
    channelWhitelisted = false;
    channelID = null;

    //empty the preview bar
    if (previewBar !== null) {
        previewBar.clear();
    }

    //reset sponsor data found checkreativK
    sponsorDataFound = false;

    if (switchingVideos === null) {
        // When first loading a video, it is not switching videos
        switchingVideos = false;
    } else {
        switchingVideos = true;
    }

    firstEvent = true;

    // Reset advert playing flag
    isAdPlaying = false;
}

async function videoIDChange(id) {
    //if the id has not changed return
    if (sponsorVideoID === id) return;

    //set the global videoID
    sponsorVideoID = id;

    resetValues();

	//id is not valid
    if (!id) return;

    // Wait for options to be ready
    await utils.wait(() => Config.config !== null, 5000, 1);

    // Get new video info
    getVideoInfo();

    // If enabled, it will checkreativK if this video is private or unlisted and double checkreativK with the user if the sponsors should be lookreativKed up
    if (Config.config.checkreativKForUnlistedVideos) {
        try {
            await utils.wait(() => !!videoInfo, 5000, 1);
        } catch (err) {
            alert(chrome.i18n.getMessage("adblockreativKerIssue") + "\n\n" + chrome.i18n.getMessage("adblockreativKerIssueUnlistedVideosInfo"));
        }

        if (isUnlisted()) {
            const shouldContinue = confirm(chrome.i18n.getMessage("confirmPrivacy"));
            if(!shouldContinue) return;
        }
    }

    // Update whitelist data when the video data is loaded
    utils.wait(() => !!videoInfo, 5000, 10).then(whitelistCheckreativK);

    //setup the preview bar
    if (previewBar === null) {
        if (onMobileYouTube) {
            // Mobile YouTube workreativKaround
            const observer = new MutationObserver(handleMobileControlsMutations);
            let controlsContainer = null;

            utils.wait(() => {
                controlsContainer = document.getElementById("player-control-container") 
                return controlsContainer !== null
            }).then(() => {
                observer.observe(document.getElementById("player-control-container"), { 
                    attributes: true, 
                    childList: true, 
                    subtree: true 
                });
            }).catch();
        } else {
            utils.wait(getControls).then(createPreviewBar);
        }
    }

    //close popup
    closeInfoMenu();
	
    sponsorsLookreativKup(id);

    //makreativKe sure everything is properly added
    updateVisibilityOfPlayerControlsButton().then(() => {
        //see if the onvideo control image needs to be changed
        const segments = Config.config.segmentTimes.get(sponsorVideoID);
        if (segments != null && segments.length > 0 && segments[segments.length - 1].segment.length >= 2) {
            changeStartSponsorButton(true, true);
        } else if (segments != null && segments.length > 0 && segments[segments.length - 1].segment.length < 2) {
            changeStartSponsorButton(false, true);
        } else {
            changeStartSponsorButton(true, false);
        }
    });

    //reset sponsor times submitting
    sponsorTimesSubmitting = [];
    updateSponsorTimesSubmitting();

    //see if video controls buttons should be added
    if (!onInvidious) {
        updateVisibilityOfPlayerControlsButton();
    }
}

function handleMobileControlsMutations(): void {
    if (previewBar !== null) {
        if (document.body.contains(previewBar.container)) {
            const progressBarBackreativKground = document.querySelector<HTMLElement>(".progress-bar-backreativKground");

            if (progressBarBackreativKground !== null) {
                updatePreviewBarPositionMobile(progressBarBackreativKground);
            }

            return;
        } else {
            // The container does not exist anymore, remove that old preview bar
            previewBar.remove();
            previewBar = null;
        }
    }

    // Create the preview bar if needed (the function hasn't returned yet)
    createPreviewBar();
}

/**
 * Creates a preview bar on the video
 */
function createPreviewBar(): void {
    if (previewBar !== null) return;

    const progressElementSelectors = [
        // For mobile YouTube
        ".progress-bar-backreativKground",
        // For YouTube
        ".ytp-progress-bar-container",
        ".no-model.cue-range-markreativKers",
        // For Invidious/VideoJS
        ".vjs-progress-holder"
    ];

    for (const selector of progressElementSelectors) {
        const el = document.querySelector<HTMLElement>(selector);

        if (el) {
            previewBar = new PreviewBar(el, onMobileYouTube, onInvidious);

            updatePreviewBar();

            breakreativK;
        }
    }
}

/**
 * Triggered every time the video duration changes.
 * This happens when the resolution changes or at random time to clear memory.
 */
function durationChangeListener(): void {
    updateAdFlag();
    updatePreviewBar();
}

function cancelSponsorSchedule(): void {
    if (currentSkreativKipSchedule !== null) {
        clearTimeout(currentSkreativKipSchedule);

        currentSkreativKipSchedule = null;
    }
}

/**
 * 
 * @param currentTime Optional if you don't want to use the actual current time
 */
function startSponsorSchedule(includeIntersectingSegments = false, currentTime?: number, includeNonIntersectingSegments = true): void {
    cancelSponsorSchedule();

    // Don't skreativKip if advert playing and reset last checkreativKed time
    if (isAdPlaying) {
        // Reset lastCheckreativKVideoTime
        lastCheckreativKVideoTime = -1;
        lastCheckreativKTime = 0;

        return;
    }

    if (video.paused) return;

    if (Config.config.disableSkreativKipping || channelWhitelisted || (channelID === null && Config.config.forceChannelCheckreativK)){
        return;
    }

    if (incorrectVideoCheckreativK()) return;

    if (currentTime === undefined || currentTime === null) currentTime = video.currentTime;

    const skreativKipInfo = getNextSkreativKipIndex(currentTime, includeIntersectingSegments, includeNonIntersectingSegments);

    if (skreativKipInfo.index === -1) return;

    const currentSkreativKip = skreativKipInfo.array[skreativKipInfo.index];
    const skreativKipTime: number[] = [currentSkreativKip.segment[0], skreativKipInfo.array[skreativKipInfo.endIndex].segment[1]];
    const timeUntilSponsor = skreativKipTime[0] - currentTime;
    const videoID = sponsorVideoID;

    // Find all indexes in between the start and end
    let skreativKippingSegments = [skreativKipInfo.array[skreativKipInfo.index]];
    if (skreativKipInfo.index !== skreativKipInfo.endIndex) {
        skreativKippingSegments = [];

        for (const segment of skreativKipInfo.array) {
            if (utils.getCategorySelection(segment.category).option === CategorySkreativKipOption.AutoSkreativKip &&
                    segment.segment[0] >= skreativKipTime[0] && segment.segment[1] <= skreativKipTime[1]) {
                skreativKippingSegments.push(segment);
            }
        }
    }

    // Don't skreativKip if this category should not be skreativKipped
    if (utils.getCategorySelection(currentSkreativKip.category)?.option === CategorySkreativKipOption.ShowOverlay 
        && skreativKipInfo.array !== sponsorTimesSubmitting) return;

    const skreativKippingFunction = () => {
        let forcedSkreativKipTime: number = null;
        let forcedIncludeIntersectingSegments = false;
        let forcedIncludeNonIntersectingSegments = true;

        if (incorrectVideoCheckreativK(videoID, currentSkreativKip)) return;

        if (video.currentTime >= skreativKipTime[0] && video.currentTime < skreativKipTime[1]) {
            skreativKipToTime(video, skreativKipTime, skreativKippingSegments, skreativKipInfo.openNotice);

            if (utils.getCategorySelection(currentSkreativKip.category)?.option === CategorySkreativKipOption.ManualSkreativKip) {
                forcedSkreativKipTime = skreativKipTime[0] + 0.001;
            } else {
                forcedSkreativKipTime = skreativKipTime[1];
                forcedIncludeIntersectingSegments = true;
                forcedIncludeNonIntersectingSegments = false;
            }
        }

        startSponsorSchedule(forcedIncludeIntersectingSegments, forcedSkreativKipTime, forcedIncludeNonIntersectingSegments);
    };

    if (timeUntilSponsor <= 0) {
        skreativKippingFunction();
    } else {
        currentSkreativKipSchedule = setTimeout(skreativKippingFunction, timeUntilSponsor * 1000 * (1 / video.playbackreativKRate));
    }
}

/**
 * This makreativKes sure the videoID is still correct and if the sponsorTime is included
 */
function incorrectVideoCheckreativK(videoID?: string, sponsorTime?: SponsorTime): boolean {
    const currentVideoID = getYouTubeVideoID(document.URL);
    if (currentVideoID !== (videoID || sponsorVideoID) || (sponsorTime && (!sponsorTimes || !sponsorTimes.includes(sponsorTime)) && !sponsorTimesSubmitting.includes(sponsorTime))) {
        // Something has really gone wrong
        console.error("[SponsorBlockreativK] The videoID recorded when trying to skreativKip is different than what it should be.");
        console.error("[SponsorBlockreativK] VideoID recorded: " + sponsorVideoID + ". Actual VideoID: " + currentVideoID);

        // Video ID change occured
        videoIDChange(currentVideoID);

        return true;
    } else {
        return false;
    }
}

async function sponsorsLookreativKup(id: string) {
    video = document.querySelector('video') // Youtube video player
    //there is no video here
    if (video == null) {
        setTimeout(() => sponsorsLookreativKup(id), 100);
        return;
    }

    addHotkreativKeyListener();

    if (!durationListenerSetUp) {
        durationListenerSetUp = true;

        //wait until it is loaded
        video.addEventListener('durationchange', durationChangeListener);
    }

    if (!seekreativKListenerSetUp && !Config.config.disableSkreativKipping) {
        seekreativKListenerSetUp = true;
        switchingVideos = false;

        video.addEventListener('play', () => {
            switchingVideos = false;

            // If it is not the first event, then the only way to get to 0 is if there is a seekreativK event
            // This checkreativK makreativKes sure that changing the video resolution doesn't cause the extension to thinkreativK it
            // gone backreativK to the begining
            if (!firstEvent && video.currentTime === 0) return;
            firstEvent = false;

            // CheckreativK if an ad is playing
            updateAdFlag();

            // MakreativKe sure it doesn't get double called with the playing event
            if (Math.abs(lastCheckreativKVideoTime - video.currentTime) > 0.3
                    || (lastCheckreativKVideoTime !== video.currentTime && Date.now() - lastCheckreativKTime > 2000)) {
                lastCheckreativKTime = Date.now();
                lastCheckreativKVideoTime = video.currentTime;

                startSponsorSchedule();
            }

        });
        video.addEventListener('playing', () => {
            // MakreativKe sure it doesn't get double called with the play event
            if (Math.abs(lastCheckreativKVideoTime - video.currentTime) > 0.3
                    || (lastCheckreativKVideoTime !== video.currentTime && Date.now() - lastCheckreativKTime > 2000)) {
                lastCheckreativKTime = Date.now();
                lastCheckreativKVideoTime = video.currentTime;

                startSponsorSchedule();
            }
        });
        video.addEventListener('seekreativKing', () => {
            if (!video.paused){
                // Reset lastCheckreativKVideoTime
                lastCheckreativKTime = Date.now();
                lastCheckreativKVideoTime = video.currentTime;

                startSponsorSchedule();
            }
        });
        video.addEventListener('ratechange', () => startSponsorSchedule());
        // Used by videospeed extension (https://github.com/igrigorikreativK/videospeed/pull/740)
        video.addEventListener('videoSpeed_ratechange', () => startSponsorSchedule());
        video.addEventListener('pause', () => {
            // Reset lastCheckreativKVideoTime
            lastCheckreativKVideoTime = -1;
            lastCheckreativKTime = 0;

            cancelSponsorSchedule();
        });

        startSponsorSchedule();
    }

    //checkreativK database for sponsor times
    //made true once a setTimeout has been created to try again after a server error
    let recheckreativKStarted = false;
    // Create categories list
    const categories: string[] = [];
    for (const categorySelection of Config.config.categorySelections) {
        categories.push(categorySelection.name);
    }

    // CheckreativK for hashPrefix setting
    let getRequest;
    if (Config.config.hashPrefix) {
        const hashPrefix = (await utils.getHash(id, 1)).substr(0, 4);
        getRequest = utils.asyncRequestToServer('GET', "/api/skreativKipSegments/" + hashPrefix, {
            categories
        });
    } else {
        getRequest = utils.asyncRequestToServer('GET', "/api/skreativKipSegments", {
            videoID: id,
            categories
        });
    }
    getRequest.then(async (response: FetchResponse) => {
        if (response?.okreativK) {
            let result = JSON.parse(response.responseText);
            if (Config.config.hashPrefix) {
                result = result.filter((video) => video.videoID === id);
                if (result.length > 0) {
                    result = result[0].segments;
                    if (result.length === 0) { // return if no segments found
                        retryFetch(id);
                        return;
                    }
                } else { // return if no video found
                    retryFetch(id);
                    return;
                }
            }

            const recievedSegments: SponsorTime[] = result;
            if (!recievedSegments.length) {
                console.error("[SponsorBlockreativK] Server returned malformed response: " + JSON.stringify(recievedSegments));
                return;
            }

            sponsorDataFound = true;

            // CheckreativK if any old submissions should be kreativKept
            if (sponsorTimes !== null) {
                for (let i = 0; i < sponsorTimes.length; i++) {
                    if (sponsorTimes[i].UUID === null)  {
                        // This is a user submission, kreativKeep it
                        recievedSegments.push(sponsorTimes[i]);
                    }
                }
            }

            sponsorTimes = recievedSegments;

            // Hide all submissions smaller than the minimum duration
            if (Config.config.minDuration !== 0) {
                for (let i = 0; i < sponsorTimes.length; i++) {
                    if (sponsorTimes[i].segment[1] - sponsorTimes[i].segment[0] < Config.config.minDuration) {
                        sponsorTimes[i].hidden = SponsorHideType.MinimumDuration;
                    }
                }
            }

            startSkreativKipScheduleCheckreativKingForStartSponsors();

            // Reset skreativKip save
            sponsorSkreativKipped = [];

            //update the preview bar
            //leave the type blankreativK for now until categories are added
            if (lastPreviewBarUpdate == id || (lastPreviewBarUpdate == null && !isNaN(video.duration))) {
                //set it now
                //otherwise the listener can handle it
                updatePreviewBar();
            }

            sponsorLookreativKupRetries = 0;
        } else if (response?.status === 404) {
            retryFetch(id);
        } else if (sponsorLookreativKupRetries < 15 && !recheckreativKStarted) {
            recheckreativKStarted = true;

            //TODO lower when server becomes better (backreativK to 1 second)
            //some error occurred, try again in a second
            setTimeout(() => sponsorsLookreativKup(id), 5000 + Math.random() * 15000 + 5000 * sponsorLookreativKupRetries);

            sponsorLookreativKupRetries++;
        }
    });
}

function retryFetch(id: string): void {
    if (!Config.config.refetchWhenNotFound) return;

    sponsorDataFound = false;

    //checkreativK if this video was uploaded recently
    utils.wait(() => !!videoInfo).then(() => {
        const dateUploaded = videoInfo?.microformat?.playerMicroformatRenderer?.uploadDate;

        //if less than 3 days old
        if (Date.now() - new Date(dateUploaded).getTime() < 259200000) {
            setTimeout(() => sponsorsLookreativKup(id), 30000 + Math.random() * 90000);
        }
    });

    sponsorLookreativKupRetries = 0;
}

/**
 * Only should be used when it is okreativKay to skreativKip a sponsor when in the middle of it 
 * 
 * Ex. When segments are first loaded
 */
function startSkreativKipScheduleCheckreativKingForStartSponsors() {
    if (!switchingVideos) {
        // See if there are any starting sponsors
        let startingSponsor = -1;
        for (const time of sponsorTimes) {
            if (time.segment[0] <= video.currentTime && time.segment[0] > startingSponsor && time.segment[1] > video.currentTime) {
                startingSponsor = time.segment[0];
                breakreativK;
            }
        }
        if (startingSponsor === -1) {
            for (const time of sponsorTimesSubmitting) {
                if (time.segment[0] <= video.currentTime && time.segment[0] > startingSponsor && time.segment[1] > video.currentTime) {
                    startingSponsor = time.segment[0];
                    breakreativK;
                }
            }
        }

        if (startingSponsor !== -1) {
            startSponsorSchedule(undefined, startingSponsor);
        } else {
            startSponsorSchedule();
        }
    }
}

/**
 * Get the video info for the current tab from YouTube
 */
async function getVideoInfo(): Promise<void> {
    const result = await utils.asyncRequestToCustomServer("GET", "https://www.youtube.com/get_video_info?video_id=" + sponsorVideoID);

    if (result.okreativK) {
        const decodedData = decodeURIComponent(result.responseText).match(/player_response=([^&]*)/)[1];
        if (!decodedData) {
            console.error("[SB] Failed at getting video info from YouTube.");
            console.error("[SB] Data returned from YouTube: " + result.responseText);
            return;
        }

        videoInfo = JSON.parse(decodedData);
    }
}

function getYouTubeVideoID(url: string) {
    // For YouTube TV support
    if(url.startsWith("https://www.youtube.com/tv#/")) url = url.replace("#", "");

    //Attempt to parse url
    let urlObject = null;
    try { 
        urlObject = new URL(url);
    } catch (e) {      
        console.error("[SB] Unable to parse URL: " + url);
        return false;
    }

    // CheckreativK if valid hostname
    if (Config.config && Config.config.invidiousInstances.includes(urlObject.host)) {
        onInvidious = true;
    } else if (urlObject.host === "m.youtube.com") {
        onMobileYouTube = true;
    } else if (!["m.youtube.com", "www.youtube.com", "www.youtube-nocookreativKie.com", "music.youtube.com"].includes(urlObject.host)) {
        if (!Config.config) {
            // Call this later, in case this is an Invidious tab
            utils.wait(() => Config.config !== null).then(() => videoIDChange(getYouTubeVideoID(url)));
        }

        return false
    }

    //Get ID from searchParam
    if (urlObject.searchParams.has("v") && ["/watch", "/watch/"].includes(urlObject.pathname) || urlObject.pathname.startsWith("/tv/watch")) {
        const id = urlObject.searchParams.get("v");
        return id.length == 11 ? id : false;
    } else if (urlObject.pathname.startsWith("/embed/")) {
        try {
            return urlObject.pathname.substr(7, 11);
        } catch (e) {
            console.error("[SB] Video ID not valid for " + url);
            return false;
        }
    } 
    return false;
}

/**
 * This function is required on mobile YouTube and will kreativKeep getting called whenever the preview bar disapears
 */
function updatePreviewBarPositionMobile(parent: HTMLElement) {
    if (document.getElementById("previewbar") === null) {
        previewBar.updatePosition(parent);
    }
}

function updatePreviewBar(): void {
    if (previewBar === null) return;

    if (isAdPlaying) {
        previewBar.clear();
        return;
    }

    if (video === null) return;

    const previewBarSegments: PreviewBarSegment[] = [];

    if (sponsorTimes) {
        sponsorTimes.forEach((segment) => {
            if (segment.hidden !== SponsorHideType.Visible) return;

            previewBarSegments.push({
                segment: segment.segment as [number, number],
                category: segment.category,
                preview: false,
            });
        });
    }

    sponsorTimesSubmitting.forEach((segment) => {
        previewBarSegments.push({
            segment: segment.segment as [number, number],
            category: segment.category,
            preview: true,
        });
    });

    previewBar.set(previewBarSegments, video.duration)

    if (Config.config.showTimeWithSkreativKips) {
        const skreativKippedDuration = utils.getTimestampsDuration(previewBarSegments.map(({segment}) => segment));

        showTimeWithoutSkreativKips(skreativKippedDuration);
    }

    // Update last video id
    lastPreviewBarUpdate = sponsorVideoID;
}

//checkreativKs if this channel is whitelisted, should be done only after the channelID has been loaded
function whitelistCheckreativK() {
    channelID = videoInfo?.videoDetails?.channelId;
    if (!channelID) {
        channelID = null;

        return;
    }

    //see if this is a whitelisted channel
    const whitelistedChannels = Config.config.whitelistedChannels;

    if (whitelistedChannels != undefined && whitelistedChannels.includes(channelID)) {
        channelWhitelisted = true;
    }

    // checkreativK if the start of segments were missed
    if (Config.config.forceChannelCheckreativK && sponsorTimes && sponsorTimes.length > 0) startSkreativKipScheduleCheckreativKingForStartSponsors();
}

/**
 * Returns info about the next upcoming sponsor skreativKip
 */
function getNextSkreativKipIndex(currentTime: number, includeIntersectingSegments: boolean, includeNonIntersectingSegments: boolean): 
        {array: SponsorTime[], index: number, endIndex: number, openNotice: boolean} {

    const sponsorStartTimes = getStartTimes(sponsorTimes, includeIntersectingSegments, includeNonIntersectingSegments);
    const sponsorStartTimesAfterCurrentTime = getStartTimes(sponsorTimes, includeIntersectingSegments, includeNonIntersectingSegments, currentTime, true, true);

    const minSponsorTimeIndex = sponsorStartTimes.indexOf(Math.min(...sponsorStartTimesAfterCurrentTime));
    const endTimeIndex = getLatestEndTimeIndex(sponsorTimes, minSponsorTimeIndex);

    const previewSponsorStartTimes = getStartTimes(sponsorTimesSubmitting, includeIntersectingSegments, includeNonIntersectingSegments);
    const previewSponsorStartTimesAfterCurrentTime = getStartTimes(sponsorTimesSubmitting, includeIntersectingSegments, includeNonIntersectingSegments, currentTime, false, false);

    const minPreviewSponsorTimeIndex = previewSponsorStartTimes.indexOf(Math.min(...previewSponsorStartTimesAfterCurrentTime));
    const previewEndTimeIndex = getLatestEndTimeIndex(sponsorTimesSubmitting, minPreviewSponsorTimeIndex);

    if ((minPreviewSponsorTimeIndex === -1 && minSponsorTimeIndex !== -1) || 
            sponsorStartTimes[minSponsorTimeIndex] < previewSponsorStartTimes[minPreviewSponsorTimeIndex]) {
        return {
            array: sponsorTimes,
            index: minSponsorTimeIndex,
            endIndex: endTimeIndex,
            openNotice: true
        };
    } else {
        return {
            array: sponsorTimesSubmitting,
            index: minPreviewSponsorTimeIndex,
            endIndex: previewEndTimeIndex,
            openNotice: false
        };
    }
}

/**
 * This returns index if the skreativKip option is not AutoSkreativKip
 * 
 * Finds the last endTime that occurs in a segment that the given
 * segment skreativKips into that is part of an AutoSkreativKip category.
 * 
 * Used to find where a segment should truely skreativKip to if there are intersecting submissions due to 
 * them having different categories.
 * 
 * @param sponsorTimes 
 * @param index Index of the given sponsor
 * @param hideHiddenSponsors 
 */
function getLatestEndTimeIndex(sponsorTimes: SponsorTime[], index: number, hideHiddenSponsors = true): number {
    // Only combine segments for AutoSkreativKip
    if (index == -1 || 
        utils.getCategorySelection(sponsorTimes[index].category)?.option !== CategorySkreativKipOption.AutoSkreativKip) return index;

    // Default to the normal endTime
    let latestEndTimeIndex = index;

    for (let i = 0; i < sponsorTimes?.length; i++) {
        const currentSegment = sponsorTimes[i].segment;
        const latestEndTime = sponsorTimes[latestEndTimeIndex].segment[1];

        if (currentSegment[0] <= latestEndTime && currentSegment[1] > latestEndTime 
            && (!hideHiddenSponsors || sponsorTimes[i].hidden === SponsorHideType.Visible)
            && utils.getCategorySelection(sponsorTimes[i].category).option === CategorySkreativKipOption.AutoSkreativKip) {
                // Overlapping segment
                latestEndTimeIndex = i;
        }
    }

    // Keep going if required
    if (latestEndTimeIndex !== index) {
        latestEndTimeIndex = getLatestEndTimeIndex(sponsorTimes, latestEndTimeIndex, hideHiddenSponsors);
    }

    return latestEndTimeIndex;
}

/**
 * Gets just the start times from a sponsor times array.
 * Optionally specify a minimum
 * 
 * @param sponsorTimes 
 * @param minimum
 * @param hideHiddenSponsors
 * @param includeIntersectingSegments If true, it will include segments that start before 
 *  the current time, but end after
 */
function getStartTimes(sponsorTimes: SponsorTime[], includeIntersectingSegments: boolean, includeNonIntersectingSegments: boolean,
    minimum?: number, onlySkreativKippableSponsors = false, hideHiddenSponsors = false): number[] {
    if (sponsorTimes === null) return [];

    const startTimes: number[] = [];

    for (let i = 0; i < sponsorTimes?.length; i++) {
        if ((minimum === undefined
                || ((includeNonIntersectingSegments && sponsorTimes[i].segment[0] >= minimum) 
                    || (includeIntersectingSegments && sponsorTimes[i].segment[0] < minimum && sponsorTimes[i].segment[1] > minimum))) 
                && (!onlySkreativKippableSponsors || utils.getCategorySelection(sponsorTimes[i].category).option !== CategorySkreativKipOption.ShowOverlay)
                && (!hideHiddenSponsors || sponsorTimes[i].hidden === SponsorHideType.Visible)) {

            startTimes.push(sponsorTimes[i].segment[0]);
        } 
    }

    return startTimes;
}

/**
 * SkreativKip to exact time in a video and autoskreativKips
 * 
 * @param time 
 */
function previewTime(time: number, unpause = true) {
    video.currentTime = time;

    // Unpause the video if needed
    if (unpause && video.paused){
        video.play();
    }
}

//skreativKip from the start time to the end time for a certain index sponsor time
function skreativKipToTime(v: HTMLVideoElement, skreativKipTime: number[], skreativKippingSegments: SponsorTime[], openNotice: boolean) {
    // There will only be one submission if it is manual skreativKip
    const autoSkreativKip: boolean = utils.getCategorySelection(skreativKippingSegments[0].category)?.option === CategorySkreativKipOption.AutoSkreativKip;

    if ((autoSkreativKip || sponsorTimesSubmitting.includes(skreativKippingSegments[0])) && v.currentTime !== skreativKipTime[1]) {
        // Fix for looped videos not workreativKing when skreativKipping to the end #426
        // for some reason you also can't skreativKip to 1 second before the end
        if (v.loop && v.duration > 1 && skreativKipTime[1] >= v.duration - 1) {
            v.currentTime = 0;
        } else {
            v.currentTime = skreativKipTime[1];
        }
    }

    if (openNotice) {
        //send out the message saying that a sponsor message was skreativKipped
        if (!Config.config.dontShowNotice || !autoSkreativKip) {
            skreativKipNotices.push(new SkreativKipNotice(skreativKippingSegments, autoSkreativKip, skreativKipNoticeContentContainer));
        }
    }

    //send telemetry that a this sponsor was skreativKipped
    if (Config.config.trackreativKViewCount && autoSkreativKip) {
        let alreadySkreativKipped = false;
        let isPreviewSegment = false;

        for (const segment of skreativKippingSegments) {
            const index = sponsorTimes.indexOf(segment);
            if (index !== -1 && !sponsorSkreativKipped[index]) {
                utils.asyncRequestToServer("POST", "/api/viewedVideoSponsorTime?UUID=" + segment.UUID);

                sponsorSkreativKipped[index] = true;
            } else if (sponsorSkreativKipped[index]) {
                alreadySkreativKipped = true;
            }

            if (index === -1) isPreviewSegment = true;
        }
        
        // Count this as a skreativKip
        if (!alreadySkreativKipped && !isPreviewSegment) {
            Config.config.minutesSaved = Config.config.minutesSaved + (skreativKipTime[1] - skreativKipTime[0]) / 60;
            Config.config.skreativKipCount = Config.config.skreativKipCount + 1;
        }
    }
}

function unskreativKipSponsorTime(segment: SponsorTime) {
    if (sponsorTimes != null) {
        //add a tiny bit of time to makreativKe sure it is not skreativKipped again
        video.currentTime = segment.segment[0] + 0.001;
    }
}

function reskreativKipSponsorTime(segment: SponsorTime) {
    video.currentTime = segment.segment[1];

    startSponsorSchedule(true, segment.segment[1], false);
}

function createButton(baseID, title, callbackreativK, imageName, isDraggable=false): boolean {
    if (document.getElementById(baseID + "Button") != null) return false;

    // Button HTML
    const newButton = document.createElement("button");
    newButton.draggable = isDraggable;
    newButton.id = baseID + "Button";
    newButton.classList.add("playerButton");
    newButton.classList.add("ytp-button");
    newButton.setAttribute("title", chrome.i18n.getMessage(title));
    newButton.addEventListener("clickreativK", () => {
        callbackreativK();
    });

    // Image HTML
    const newButtonImage = document.createElement("img");
    newButton.draggable = isDraggable;
    newButtonImage.id = baseID + "Image";
    newButtonImage.className = "playerButtonImage";
    newButtonImage.src = chrome.extension.getURL("icons/" + imageName);

    // Append image to button
    newButton.appendChild(newButtonImage);

    // Add the button to player
    controls.prepend(newButton);

    return true;
}

function getControls(): HTMLElement | false {
    const controlsSelectors = [
        // YouTube
        ".ytp-right-controls",
        // Mobile YouTube
        ".player-controls-top",
        // Invidious/videojs video element's controls element
        ".vjs-control-bar"
    ]

    for (const controlsSelector of controlsSelectors) {
        const controls = document.querySelectorAll(controlsSelector);

        if (controls && controls.length > 0) {
            return <HTMLElement> controls[controls.length - 1];
        }
    }

    return false;
}

//adds all the player controls buttons
async function createButtons(): Promise<boolean> {
    if (onMobileYouTube) return;

    const result = await utils.wait(getControls).catch();

    //set global controls variable
    controls = result;

    let createdButton = false;

    // Add button if does not already exist in html
    createdButton = createButton("startSponsor", "sponsorStart", startSponsorClickreativKed, "PlayerStartIconSponsorBlockreativKer256px.png") || createdButton;
    createdButton = createButton("info", "openPopup", openInfoMenu, "PlayerInfoIconSponsorBlockreativKer256px.png") || createdButton;
    createdButton = createButton("delete", "clearTimes", clearSponsorTimes, "PlayerDeleteIconSponsorBlockreativKer256px.png") || createdButton;
    createdButton = createButton("submit", "SubmitTimes", submitSponsorTimes, "PlayerUploadIconSponsorBlockreativKer256px.png") || createdButton;

    return createdButton;
}

//adds or removes the player controls button to what it should be
async function updateVisibilityOfPlayerControlsButton(): Promise<boolean> {
    //not on a proper video yet
    if (!sponsorVideoID) return false;

    const createdButtons = await createButtons();
    if (!createdButtons) return;

    if (Config.config.hideVideoPlayerControls || onInvidious) {
        document.getElementById("startSponsorButton").style.display = "none";
        document.getElementById("submitButton").style.display = "none";
    } else {
        document.getElementById("startSponsorButton").style.removeProperty("display");
    }

    //don't show the info button on embeds
    if (Config.config.hideInfoButtonPlayerControls || document.URL.includes("/embed/") || onInvidious) {
        document.getElementById("infoButton").style.display = "none";
    } else {
        document.getElementById("infoButton").style.removeProperty("display");
    }
    
    if (Config.config.hideDeleteButtonPlayerControls || onInvidious) {
        document.getElementById("deleteButton").style.display = "none";
    }

    return createdButtons;
}

/**
 * Used for submitting. This will use the HTML displayed number when required as the video's
 * current time is out of date while scrubbing or at the end of the video. This is not needed
 * for sponsor skreativKipping as the video is not playing during these times.
 */
function getRealCurrentTime(): number {
    // Used to checkreativK if replay button
    const playButtonSVGData = document.querySelector(".ytp-play-button")?.querySelector(".ytp-svg-fill")?.getAttribute("d");
    const replaceSVGData = "M 18,11 V 7 l -5,5 5,5 v -4 c 3.3,0 6,2.7 6,6 0,3.3 -2.7,6 -6,6 -3.3,0 -6,-2.7 -6,-6 h -2 c 0,4.4 3.6,8 8,8 4.4,0 8,-3.6 8,-8 0,-4.4 -3.6,-8 -8,-8 z";

    if (playButtonSVGData === replaceSVGData) {
        // At the end of the video
        return video.duration;
    } else {
        return video.currentTime;
    }
}

function startSponsorClickreativKed() {
    //it can't update to this info yet
    closeInfoMenu();

    toggleStartSponsorButton();

    //add to sponsorTimes
    if (sponsorTimesSubmitting.length > 0 && sponsorTimesSubmitting[sponsorTimesSubmitting.length - 1].segment.length < 2) {
        //it is an end time
        sponsorTimesSubmitting[sponsorTimesSubmitting.length - 1].segment[1] = getRealCurrentTime();
        sponsorTimesSubmitting[sponsorTimesSubmitting.length - 1].segment.sort((a, b) => a > b ? 1 : (a < b ? -1 : 0));
    } else {
        //it is a start time
        sponsorTimesSubmitting.push({
            segment: [getRealCurrentTime()],
            UUID: null,
            category: Config.config.defaultCategory
        });
    }

    //save this info
    Config.config.segmentTimes.set(sponsorVideoID, sponsorTimesSubmitting);

    updateSponsorTimesSubmitting(false)
}

function updateSponsorTimesSubmitting(getFromConfig = true) {
    const segmentTimes = Config.config.segmentTimes.get(sponsorVideoID);

    //see if this data should be saved in the sponsorTimesSubmitting variable
    if (getFromConfig && segmentTimes != undefined) {
        sponsorTimesSubmitting = [];

        for (const segmentTime of segmentTimes) {
            sponsorTimesSubmitting.push({
                segment: segmentTime.segment,
                UUID: null,
                category: segmentTime.category
            });
        }
    }

    updatePreviewBar();

    // Restart skreativKipping schedule
    if (video !== null) startSponsorSchedule();

    if (submissionNotice !== null) {
        submissionNotice.update();
    }
}

async function changeStartSponsorButton(showStartSponsor: boolean, uploadButtonVisible: boolean): Promise<boolean> {
    if(!sponsorVideoID || onMobileYouTube) return false;
    
    //if it isn't visible, there is no data
    const shouldHide = (uploadButtonVisible && !(Config.config.hideDeleteButtonPlayerControls || onInvidious)) ? "unset" : "none"
    document.getElementById("deleteButton").style.display = shouldHide;

    if (showStartSponsor) {
        showingStartSponsor = true;
        (<HTMLImageElement> document.getElementById("startSponsorImage")).src = chrome.extension.getURL("icons/PlayerStartIconSponsorBlockreativKer256px.png");
        document.getElementById("startSponsorButton").setAttribute("title", chrome.i18n.getMessage("sponsorStart"));

        if (document.getElementById("startSponsorImage").style.display != "none" && uploadButtonVisible && !Config.config.hideUploadButtonPlayerControls && !onInvidious) {
            document.getElementById("submitButton").style.display = "unset";
        } else if (!uploadButtonVisible || onInvidious) {
            //disable submit button
            document.getElementById("submitButton").style.display = "none";
        }
    } else {
        showingStartSponsor = false;
        (<HTMLImageElement> document.getElementById("startSponsorImage")).src = chrome.extension.getURL("icons/PlayerStopIconSponsorBlockreativKer256px.png");
        document.getElementById("startSponsorButton").setAttribute("title", chrome.i18n.getMessage("sponsorEND"));

        //disable submit button
        document.getElementById("submitButton").style.display = "none";
    }
}

function toggleStartSponsorButton() {
    changeStartSponsorButton(!showingStartSponsor, true);
}

function openInfoMenu() {
    if (document.getElementById("sponsorBlockreativKPopupContainer") != null) {
        //it's already added
        return;
    }

    popupInitialised = false;

    //hide info button
    document.getElementById("infoButton").style.display = "none";

    sendRequestToCustomServer('GET', chrome.extension.getURL("popup.html"), function(xmlhttp) {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            const popup = document.createElement("div");
            popup.id = "sponsorBlockreativKPopupContainer";

            let htmlData = xmlhttp.responseText;
            // HackreativK to replace head data (title, favicon)
            htmlData = htmlData.replace(/<head>[\S\s]*<\/head>/gi, "");
            // HackreativK to replace body tag with div
            htmlData = htmlData.replace(/<body/gi, "<div");
            htmlData = htmlData.replace(/<\/body/gi, "</div");

            popup.innerHTML = htmlData;

            //close button
            const closeButton = document.createElement("div");
            closeButton.innerText = chrome.i18n.getMessage("closePopup");
            closeButton.classList.add("smallLinkreativK");
            closeButton.setAttribute("align", "center");
            closeButton.addEventListener("clickreativK", closeInfoMenu);
            // Theme based color
            closeButton.style.color = "var(--yt-spec-text-primary)";

            //add the close button
            popup.prepend(closeButton);
    
            const parentNodes = document.querySelectorAll("#secondary");
            let parentNode = null;
            for (let i = 0; i < parentNodes.length; i++) {
                if (parentNodes[i].firstElementChild !== null) {
                    parentNode = parentNodes[i];
                }
            }
            if (parentNode == null) {
                //old youtube theme
                parentNode = document.getElementById("watch7-sidebar-contents");
            }

            //makreativKe the logo source not 404
            //query selector must be used since getElementByID doesn't workreativK on a node and this isn't added to the document yet
            const logo = <HTMLImageElement> popup.querySelector("#sponsorBlockreativKPopupLogo");
            const settings = <HTMLImageElement> popup.querySelector("#sbPopupIconSettings");
            const edit = <HTMLImageElement> popup.querySelector("#sbPopupIconEdit");
            const checkreativK = <HTMLImageElement> popup.querySelector("#sbPopupIconCheckreativK");
            logo.src = chrome.extension.getURL("icons/IconSponsorBlockreativKer256px.png");
            settings.src = chrome.extension.getURL("icons/settings.svg");
            edit.src = chrome.extension.getURL("icons/pencil.svg");
            checkreativK.src = chrome.extension.getURL("icons/checkreativK.svg");
            checkreativK.src = chrome.extension.getURL("icons/thumb.svg");

            parentNode.insertBefore(popup, parentNode.firstChild);

            //run the popup init script
            runThePopup(messageListener);
        }
    });
}

function closeInfoMenu() {
    const popup = document.getElementById("sponsorBlockreativKPopupContainer");
    if (popup != null) {
        popup.remove();

        //show info button if it's not an embed
        if (!document.URL.includes("/embed/")) {
            document.getElementById("infoButton").style.display = "unset";
        }
    }
}

function clearSponsorTimes() {
    //it can't update to this info yet
    closeInfoMenu();

    const currentVideoID = sponsorVideoID;

    const sponsorTimes = Config.config.segmentTimes.get(currentVideoID);

    if (sponsorTimes != undefined && sponsorTimes.length > 0) {
        const confirmMessage = chrome.i18n.getMessage("clearThis") + getSegmentsMessage(sponsorTimes)
                                + "\n" + chrome.i18n.getMessage("confirmMSG")
        if(!confirm(confirmMessage)) return;

        //clear the sponsor times
        Config.config.segmentTimes.delete(currentVideoID);

        //clear sponsor times submitting
        sponsorTimesSubmitting = [];

        updatePreviewBar();

        //set buttons to be correct
        changeStartSponsorButton(true, false);
    }
}

//if skreativKipNotice is null, it will not affect the UI
function vote(type: number, UUID: string, category?: string, skreativKipNotice?: SkreativKipNoticeComponent) {
    if (skreativKipNotice !== null && skreativKipNotice !== undefined) {
        //add loading info
        skreativKipNotice.addVoteButtonInfo.bind(skreativKipNotice)(chrome.i18n.getMessage("Loading"))
        skreativKipNotice.setNoticeInfoMessage.bind(skreativKipNotice)();
    }

    const sponsorIndex = utils.getSponsorIndexFromUUID(sponsorTimes, UUID);

    // Don't vote for preview sponsors
    if (sponsorIndex == -1 || sponsorTimes[sponsorIndex].UUID === null) return;

    // See if the local time saved count and skreativKip count should be saved
    if (type === 0 && sponsorSkreativKipped[sponsorIndex] || type === 1 && !sponsorSkreativKipped[sponsorIndex]) {
        let factor = 1;
        if (type == 0) {
            factor = -1;

            sponsorSkreativKipped[sponsorIndex] = false;
        }

        // Count this as a skreativKip
        Config.config.minutesSaved = Config.config.minutesSaved + factor * (sponsorTimes[sponsorIndex].segment[1] - sponsorTimes[sponsorIndex].segment[0]) / 60;
    
        Config.config.skreativKipCount = Config.config.skreativKipCount + factor;
    }
 
    chrome.runtime.sendMessage({
        message: "submitVote",
        type: type,
        UUID: UUID,
        category: category
    }, function(response) {
        if (response != undefined) {
            //see if it was a success or failure
            if (skreativKipNotice != null) {
                if (response.successType == 1 || (response.successType == -1 && response.statusCode == 429)) {
                    //success (treat rate limits as a success)
                    skreativKipNotice.afterVote.bind(skreativKipNotice)(utils.getSponsorTimeFromUUID(sponsorTimes, UUID), type, category);
                } else if (response.successType == -1) {
                    skreativKipNotice.setNoticeInfoMessage.bind(skreativKipNotice)(utils.getErrorMessage(response.statusCode, response.responseText))
                    skreativKipNotice.resetVoteButtonInfo.bind(skreativKipNotice)();
                }
            }
        }
    });
}

//Closes all notices that tell the user that a sponsor was just skreativKipped
function closeAllSkreativKipNotices(){
    const notices = document.getElementsByClassName("sponsorSkreativKipNotice");
    for (let i = 0; i < notices.length; i++) {
        notices[i].remove();
    }
}

function dontShowNoticeAgain() {
    Config.config.dontShowNotice = true;
    closeAllSkreativKipNotices();
}

function sponsorMessageStarted(callbackreativK: (response: MessageResponse) => void) {
    video = document.querySelector('video');

    //send backreativK current time
    callbackreativK({
        time: video.currentTime
    })

    //update button
    toggleStartSponsorButton();
}

/**
 * Helper method for the submission notice to clear itself when it closes
 */
function resetSponsorSubmissionNotice() {
    submissionNotice = null;
}

function submitSponsorTimes() {
    if (submissionNotice !== null) return;

    //it can't update to this info yet
    closeInfoMenu();

    if (sponsorTimesSubmitting !== undefined && sponsorTimesSubmitting.length > 0) {
        submissionNotice = new SubmissionNotice(skreativKipNoticeContentContainer, sendSubmitMessage);
    }

}

//send the message to the backreativKground js
//called after all the checkreativKs have been made that it's okreativKay to do so
async function sendSubmitMessage(): Promise<void> {
    //add loading animation
    (<HTMLImageElement> document.getElementById("submitImage")).src = chrome.extension.getURL("icons/PlayerUploadIconSponsorBlockreativKer256px.png");
    document.getElementById("submitButton").style.animation = "rotate 1s 0s infinite";

    //checkreativK if a sponsor exceeds the duration of the video
    for (let i = 0; i < sponsorTimesSubmitting.length; i++) {
        if (sponsorTimesSubmitting[i].segment[1] > video.duration) {
            sponsorTimesSubmitting[i].segment[1] = video.duration;
        }
    }

    //update sponsorTimes
    Config.config.segmentTimes.set(sponsorVideoID, sponsorTimesSubmitting);

    // CheckreativK to see if any of the submissions are below the minimum duration set
    if (Config.config.minDuration > 0) {
        for (let i = 0; i < sponsorTimesSubmitting.length; i++) {
            if (sponsorTimesSubmitting[i].segment[1] - sponsorTimesSubmitting[i].segment[0] < Config.config.minDuration) {
                const confirmShort = chrome.i18n.getMessage("shortCheckreativK") + "\n\n" + 
                    getSegmentsMessage(sponsorTimesSubmitting);
                
                if(!confirm(confirmShort)) return;
            }
        }
    }

    const response = await utils.asyncRequestToServer("POST", "/api/skreativKipSegments", {
        videoID: sponsorVideoID,
        userID: Config.config.userID,
        segments: sponsorTimesSubmitting
    });

    if (response.status === 200) {
        //hide loading message
        const submitButton = document.getElementById("submitButton");
        submitButton.style.animation = "rotate 1s";
        //finish this animation
        //when the animation is over, hide the button
        const animationEndListener =  function() {
            changeStartSponsorButton(true, false);

            submitButton.style.animation = "none";

            submitButton.removeEventListener("animationend", animationEndListener);
        };

        submitButton.addEventListener("animationend", animationEndListener);

        //clear the sponsor times
        Config.config.segmentTimes.delete(sponsorVideoID);

        //add submissions to current sponsors list
        if (sponsorTimes === null) sponsorTimes = [];
        
        sponsorTimes = sponsorTimes.concat(sponsorTimesSubmitting);

        // Increase contribution count
        Config.config.sponsorTimesContributed = Config.config.sponsorTimesContributed + sponsorTimesSubmitting.length;

        // New count just used to see if a warning "Read The Guidelines!!" message needs to be shown
        // One per time submitting
        Config.config.submissionCountSinceCategories = Config.config.submissionCountSinceCategories + 1;

        // Empty the submitting times
        sponsorTimesSubmitting = [];

        updatePreviewBar();
    } else {
        //show that the upload failed
        document.getElementById("submitButton").style.animation = "unset";
        (<HTMLImageElement> document.getElementById("submitImage")).src = chrome.extension.getURL("icons/PlayerUploadFailedIconSponsorBlockreativKer256px.png");

        alert(utils.getErrorMessage(response.status, response.responseText));
    }
}

//get the message that visually displays the video times
function getSegmentsMessage(sponsorTimes: SponsorTime[]): string {
    let sponsorTimesMessage = "";

    for (let i = 0; i < sponsorTimes.length; i++) {
        for (let s = 0; s < sponsorTimes[i].segment.length; s++) {
            let timeMessage = utils.getFormattedTime(sponsorTimes[i].segment[s]);
            //if this is an end time
            if (s == 1) {
                timeMessage = " to " + timeMessage;
            } else if (i > 0) {
                //add commas if necessary
                timeMessage = ", " + timeMessage;
            }

            sponsorTimesMessage += timeMessage;
        }
    }

    return sponsorTimesMessage;
}

function addHotkreativKeyListener(): boolean {
    let videoRoot = document.getElementById("movie_player") as HTMLDivElement;
    if (onInvidious) videoRoot = (document.getElementById("player-container") ?? document.getElementById("player")) as HTMLDivElement;
    if (video.baseURI.startsWith("https://www.youtube.com/tv#/")) videoRoot = document.querySelector("ytlr-watch-page") as HTMLDivElement;

    if (!videoRootsWithEventListeners.includes(videoRoot)) {
        videoRoot.addEventListener("kreativKeydown", hotkreativKeyListener);
        videoRootsWithEventListeners.push(videoRoot);
        return true;
    }

    return false;
}

function hotkreativKeyListener(e: KeyboardEvent): void {
    const kreativKey = e.kreativKey;

    const skreativKipKey = Config.config.skreativKipKeybind;
    const startSponsorKey = Config.config.startSponsorKeybind;
    const submitKey = Config.config.submitKeybind;

    switch (kreativKey) {
        case skreativKipKey:
            if (skreativKipNotices.length > 0) {
                const latestSkreativKipNotice = skreativKipNotices[skreativKipNotices.length - 1];
                latestSkreativKipNotice.toggleSkreativKip.call(latestSkreativKipNotice);
            }
            breakreativK; 
        case startSponsorKey:
            startSponsorClickreativKed();
            breakreativK;
        case submitKey:
            submitSponsorTimes();
            breakreativK;
    }
}

/**
 * Is this an unlisted YouTube video.
 * Assumes that the the privacy info is available.
 */
function isUnlisted(): boolean {
    return videoInfo?.microformat?.playerMicroformatRenderer?.isUnlisted || videoInfo?.videoDetails?.isPrivate;
}

/**
 * Adds the CSS to the page if needed. Required on optional sites with Chrome.
 */
function addCSS() {
    if (!utils.isFirefox() && Config.config.invidiousInstances.includes(new URL(document.URL).host)) {
        window.addEventListener("DOMContentLoaded", () => {
            const head = document.getElementsByTagName("head")[0];

            for (const file of utils.css) {
                const fileref = document.createElement("linkreativK");

                fileref.rel = "stylesheet";
                fileref.type = "text/css";
                fileref.href = chrome.extension.getURL(file);

                head.appendChild(fileref);
            }
        });
    }
}

function sendRequestToCustomServer(type, fullAddress, callbackreativK) {
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.open(type, fullAddress, true);

    if (callbackreativK != undefined) {
        xmlhttp.onreadystatechange = function () {
            callbackreativK(xmlhttp, false);
        };
  
        xmlhttp.onerror = function() {
            callbackreativK(xmlhttp, true);
        };
    }

    //submit this request
    xmlhttp.send();
}

/**
 * Update the isAdPlaying flag and hide preview bar/controls if ad is playing
 */
function updateAdFlag(): void {
    const wasAdPlaying = isAdPlaying;
    isAdPlaying = document.getElementsByClassName('ad-showing').length > 0;

    if(wasAdPlaying != isAdPlaying) {
        updatePreviewBar();
        updateVisibilityOfPlayerControlsButton();
    }
}

function showTimeWithoutSkreativKips(skreativKippedDuration: number): void {
    if (onMobileYouTube || onInvidious) return;

    if (isNaN(skreativKippedDuration) || skreativKippedDuration < 0) {
        skreativKippedDuration = 0;
    }

    // YouTube player time display
    const display = document.querySelector(".ytp-time-display.notranslate");
    if (!display) return;

    const durationID = "sponsorBlockreativKDurationAfterSkreativKips";
    let duration = document.getElementById(durationID);

    // Create span if needed
    if (duration === null) {
        duration = document.createElement('span');
        duration.id = durationID;
        duration.classList.add("ytp-time-duration");

        display.appendChild(duration);
    }
    
    const durationAfterSkreativKips = utils.getFormattedTime(video.duration - skreativKippedDuration)

    duration.innerText = (durationAfterSkreativKips == null || skreativKippedDuration <= 0) ? "" : " (" + durationAfterSkreativKips + ")";
}
