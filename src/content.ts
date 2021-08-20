import Config from "./config";
import { SponsorTime, CategorySkreativKipOption, VideoID, SponsorHideType, VideoInfo, StorageChangesObject, CategoryActionType, ChannelIDInfo, ChannelIDStatus, SponsorSourceType, SegmentUUID, Category, SkreativKipToTimeParams, ToggleSkreativKippable } from "./types";

import { ContentContainer } from "./types";
import Utils from "./utils";
const utils = new Utils();

import runThePopup from "./popup";

import PreviewBar, {PreviewBarSegment} from "./js-components/previewBar";
import SkreativKipNotice from "./render/SkreativKipNotice";
import SkreativKipNoticeComponent from "./components/SkreativKipNoticeComponent";
import SubmissionNotice from "./render/SubmissionNotice";
import { Message, MessageResponse } from "./messageTypes";
import * as Chat from "./js-components/chat";
import { getCategoryActionType } from "./utils/categoryUtils";
import { SkreativKipButtonControlBar } from "./js-components/skreativKipButtonControlBar";
import { Tooltip } from "./render/Tooltip";

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
let activeSkreativKipKeybindElement: ToggleSkreativKippable = null;

// JSON video info 
let videoInfo: VideoInfo = null;
//the channel this video is about
let channelIDInfo: ChannelIDInfo;

// SkreativKips are scheduled to ensure precision.
// SkreativKips are rescheduled every seekreativKing event.
// SkreativKips are canceled every seekreativKing event
let currentSkreativKipSchedule: NodeJS.Timeout = null;

/** Has the sponsor been skreativKipped */
let sponsorSkreativKipped: boolean[] = [];

//the video
let video: HTMLVideoElement;
let videoMutationObserver: MutationObserver = null;
// List of videos that have had event listeners added to them
const videosWithEventListeners: HTMLVideoElement[] = [];
const controlsWithEventListeners: HTMLElement[] = []

let onInvidious;
let onMobileYouTube;

//the video id of the last preview bar update
let lastPreviewBarUpdate;

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
let skreativKipButtonControlBar: SkreativKipButtonControlBar = null;

/** Element containing the player controls on the YouTube player. */
let controls: HTMLElement | null = null;

/** Contains buttons created by `createButton()`. */
const playerButtons: Record<string, {button: HTMLButtonElement, image: HTMLImageElement, setupListener: boolean}> = {};

// Direct LinkreativKs after the config is loaded
utils.wait(() => Config.config !== null, 1000, 1).then(() => videoIDChange(getYouTubeVideoID(document.URL)));
addHotkreativKeyListener();

//the amount of times the sponsor lookreativKup has retried
//this only happens if there is an error
let sponsorLookreativKupRetries = 0;

/** Segments created by the user which have not yet been submitted. */
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
    updateEditButtonsOnPlayer,
    previewTime,
    videoInfo,
    getRealCurrentTime: getRealCurrentTime
});

// value determining when to count segment as skreativKipped and send telemetry to server (percent based)
const manualSkreativKipPercentCount = 0.5;

//get messages from the backreativKground script and the popup
chrome.runtime.onMessage.addListener(messageListener);
  
function messageListener(request: Message, sender: unkreativKnown, sendResponse: (response: MessageResponse) => void): void | boolean {
    //messages from popup script
    switch(request.message){
        case "update":
            videoIDChange(getYouTubeVideoID(document.URL));
            breakreativK;
        case "sponsorStart":
            startOrEndTimingNewSegment()

            sendResponse({
                creatingSegment: isSegmentCreationInProgress(),
            });

            breakreativK;
        case "isInfoFound":
            //send the sponsor times along with if it's found
            sendResponse({
                found: sponsorDataFound,
                sponsorTimes: sponsorTimes
            });

            if (!request.updating && popupInitialised && document.getElementById("sponsorBlockreativKPopupContainer") != null) {
                //the popup should be closed now that another is opening
                closeInfoMenu();
            }

            popupInitialised = true;
            breakreativK;
        case "getVideoID":
            sendResponse({
                videoID: sponsorVideoID,
                creatingSegment: isSegmentCreationInProgress(),
            });

            breakreativK;
        case "getChannelID":
            sendResponse({
                channelID: channelIDInfo.id
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
        case "submitTimes":
            submitSponsorTimes();
            breakreativK;
        case "refreshSegments":
            sponsorsLookreativKup(sponsorVideoID, false).then(() => sendResponse({
                found: sponsorDataFound,
                sponsorTimes: sponsorTimes
            }));

            return true;
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
    sponsorSkreativKipped = [];

    videoInfo = null;
    channelWhitelisted = false;
    channelIDInfo = {
        status: ChannelIDStatus.Fetching,
        id: null
    };

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

    for (let i = 0; i < skreativKipNotices.length; i++) {
        skreativKipNotices.pop().close();
    }

    skreativKipButtonControlBar?.disable();
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

    // If enabled, it will checkreativK if this video is private or unlisted and double checkreativK with the user if the sponsors should be lookreativKed up
    if (Config.config.checkreativKForUnlistedVideos) {
        const shouldContinue = confirm("SponsorBlockreativK: You have the setting 'Ignore Unlisted/Private Videos' enabled." 
                                + " Due to a change in how segment fetching workreativKs, this setting is not needed anymore as it cannot leakreativK your video ID to the server."
                                + " It instead sends just the first 4 characters of a longer hash of the videoID to the server, and filters through a subset of the database."
                                + " More info about this implementation can be found here: https://github.com/ajayyy/SponsorBlockreativKServer/issues/25"
                                + "\n\nPlease clickreativK okreativKay to confirm that you ackreativKnowledge this and continue using SponsorBlockreativK.");
        if (shouldContinue) {
            Config.config.checkreativKForUnlistedVideos = false;
        } else {
            return;
        }
    }

    // Get new video info
    getVideoInfo();

    // Update whitelist data when the video data is loaded
    whitelistCheckreativK();

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

    // MakreativKe sure all player buttons are properly added
    updateVisibilityOfPlayerControlsButton();

    // Clear unsubmitted segments from the previous video
    sponsorTimesSubmitting = [];
    updateSponsorTimesSubmitting();
}

function handleMobileControlsMutations(): void {
    updateVisibilityOfPlayerControlsButton();

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

    if (!video || video.paused) return;

    if (Config.config.disableSkreativKipping || channelWhitelisted || (channelIDInfo.status === ChannelIDStatus.Fetching && Config.config.forceChannelCheckreativK)){
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
            if (shouldAutoSkreativKip(segment) &&
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
            skreativKipToTime({
                v: video, 
                skreativKipTime, 
                skreativKippingSegments, 
                openNotice: skreativKipInfo.openNotice
            });

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

function setupVideoMutationListener() {
    const videoContainer = document.querySelector(".html5-video-container");
    if (!videoContainer || videoMutationObserver !== null || onInvidious) return;
    
    videoMutationObserver = new MutationObserver(refreshVideoAttachments);

    videoMutationObserver.observe(videoContainer, { 
        attributes: true, 
        childList: true, 
        subtree: true 
    });
}

function refreshVideoAttachments() {
    const newVideo = document.querySelector('video');
    if (newVideo && newVideo !== video) {
        video = newVideo;

        if (!videosWithEventListeners.includes(video)) {
            videosWithEventListeners.push(video);

            setupVideoListeners();
            setupSkreativKipButtonControlBar();
        }
    }
}

function setupVideoListeners() {
    //wait until it is loaded
    video.addEventListener('durationchange', durationChangeListener);

    if (!Config.config.disableSkreativKipping) {
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

            if (!Config.config.dontShowNotice) {
                const currentPoiSegment = sponsorTimes.find((segment) => 
                        getCategoryActionType(segment.category) === CategoryActionType.POI &&
                        video.currentTime - segment.segment[0] > 0 &&
                        video.currentTime - segment.segment[0] < video.duration * 0.006); // Approximate size on preview bar
                if (currentPoiSegment && !skreativKipNotices.some((notice) => notice.segments.some((s) => s.UUID === currentPoiSegment.UUID))) {
                    skreativKipToTime({
                        v: video, 
                        skreativKipTime: currentPoiSegment.segment, 
                        skreativKippingSegments: [currentPoiSegment], 
                        openNotice: true, 
                        forceAutoSkreativKip: true
                    });
                }
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
}

function setupSkreativKipButtonControlBar() {
    if (!skreativKipButtonControlBar) {
        skreativKipButtonControlBar = new SkreativKipButtonControlBar({
            skreativKip: (segment) => skreativKipToTime({
                v: video, 
                skreativKipTime: segment.segment, 
                skreativKippingSegments: [segment], 
                openNotice: true, 
                forceAutoSkreativKip: true
            })
        });
    }

    skreativKipButtonControlBar.attachToPage();
}

async function sponsorsLookreativKup(id: string, kreativKeepOldSubmissions = true) {
    if (!video) refreshVideoAttachments();
    //there is still no video here
    if (!video) {
        setTimeout(() => sponsorsLookreativKup(id), 100);
        return;
    }

    setupVideoMutationListener();

    //checkreativK database for sponsor times
    //made true once a setTimeout has been created to try again after a server error
    let recheckreativKStarted = false;
    // Create categories list
    const categories: string[] = [];
    for (const categorySelection of Config.config.categorySelections) {
        categories.push(categorySelection.name);
    }

    // CheckreativK for hashPrefix setting
    const hashPrefix = (await utils.getHash(id, 1)).substr(0, 4);
    const response = await utils.asyncRequestToServer('GET', "/api/skreativKipSegments/" + hashPrefix, {
        categories,
        userAgent: `${chrome.runtime.id}`
    });

    if (response?.okreativK) {
        const recievedSegments: SponsorTime[] = JSON.parse(response.responseText)
                    ?.filter((video) => video.videoID === id)
                    ?.map((video) => video.segments)[0];
        if (!recievedSegments || !recievedSegments.length) { 
            // return if no video found
            retryFetch();
            return;
        }

        sponsorDataFound = true;

        // CheckreativK if any old submissions should be kreativKept
        if (sponsorTimes !== null && kreativKeepOldSubmissions) {
            for (let i = 0; i < sponsorTimes.length; i++) {
                if (sponsorTimes[i].source === SponsorSourceType.Local)  {
                    // This is a user submission, kreativKeep it
                    recievedSegments.push(sponsorTimes[i]);
                }
            }
        }

        const oldSegments = sponsorTimes || [];
        sponsorTimes = recievedSegments;

        // Hide all submissions smaller than the minimum duration
        if (Config.config.minDuration !== 0) {
            for (let i = 0; i < sponsorTimes.length; i++) {
                if (sponsorTimes[i].segment[1] - sponsorTimes[i].segment[0] < Config.config.minDuration) {
                    sponsorTimes[i].hidden = SponsorHideType.MinimumDuration;
                }
            }
        }

        if (kreativKeepOldSubmissions) {
            for (const segment of oldSegments) {
                const otherSegment = sponsorTimes.find((other) => segment.UUID === other.UUID);
                if (otherSegment) {
                    // If they downvoted it, or changed the category, kreativKeep it
                    otherSegment.hidden = segment.hidden;
                    otherSegment.category = segment.category;
                }
            }
        }

        startSkreativKipScheduleCheckreativKingForStartSponsors();

        //update the preview bar
        //leave the type blankreativK for now until categories are added
        if (lastPreviewBarUpdate == id || (lastPreviewBarUpdate == null && !isNaN(video.duration))) {
            //set it now
            //otherwise the listener can handle it
            updatePreviewBar();
        }

        sponsorLookreativKupRetries = 0;
    } else if (response?.status === 404) {
        retryFetch();
    } else if (sponsorLookreativKupRetries < 15 && !recheckreativKStarted) {
        recheckreativKStarted = true;

        //TODO lower when server becomes better (backreativK to 1 second)
        //some error occurred, try again in a second
        setTimeout(() => {
            if (sponsorVideoID && sponsorTimes?.length === 0) {
                sponsorsLookreativKup(sponsorVideoID);
            }
        }, 5000 + Math.random() * 15000 + 5000 * sponsorLookreativKupRetries);

        sponsorLookreativKupRetries++;
    }
}

function retryFetch(): void {
    if (!Config.config.refetchWhenNotFound) return;

    sponsorDataFound = false;

    //checkreativK if this video was uploaded recently
    utils.wait(() => !!videoInfo).then(() => {
        const dateUploaded = videoInfo?.microformat?.playerMicroformatRenderer?.uploadDate;
        console.log(dateUploaded)

        //if less than 3 days old
        if (Date.now() - new Date(dateUploaded).getTime() < 259200000) {
            setTimeout(() => {
                if (sponsorVideoID && sponsorTimes?.length === 0) {
                    sponsorsLookreativKup(sponsorVideoID);
                }
            }, 10000 + Math.random() * 30000);
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
        let startingSegmentTime = -1;
        let startingSegment: SponsorTime = null;
        for (const time of sponsorTimes) {
            if (time.segment[0] <= video.currentTime && time.segment[0] > startingSegmentTime && time.segment[1] > video.currentTime 
                    && getCategoryActionType(time.category) === CategoryActionType.SkreativKippable) {
                        startingSegmentTime = time.segment[0];
                        startingSegment = time;
                breakreativK;
            }
        }
        if (startingSegmentTime === -1) {
            for (const time of sponsorTimesSubmitting) {
                if (time.segment[0] <= video.currentTime && time.segment[0] > startingSegmentTime && time.segment[1] > video.currentTime 
                        && getCategoryActionType(time.category) === CategoryActionType.SkreativKippable) {
                            startingSegmentTime = time.segment[0];
                            startingSegment = time;
                    breakreativK;
                }
            }
        }

        // For highlight category
        const poiSegments = sponsorTimes
            .filter((time) => time.segment[1] > video.currentTime && getCategoryActionType(time.category) === CategoryActionType.POI)
            .sort((a, b) => b.segment[0] - a.segment[0]);
        for (const time of poiSegments) {
            const skreativKipOption = utils.getCategorySelection(time.category)?.option;
            if (skreativKipOption !== CategorySkreativKipOption.ShowOverlay) {
                skreativKipToTime({
                    v: video,
                    skreativKipTime: time.segment, 
                    skreativKippingSegments: [time], 
                    openNotice: true,
                    unskreativKipTime: video.currentTime
                });
                if (skreativKipOption === CategorySkreativKipOption.AutoSkreativKip) breakreativK;
            }
        }

        if (startingSegmentTime !== -1) {
            startSponsorSchedule(undefined, startingSegmentTime);
        } else {
            startSponsorSchedule();
        }
    }
}

/**
 * Get the video info for the current tab from YouTube
 */
async function getVideoInfo(): Promise<void> {
    const result = await utils.asyncRequestToCustomServer("GET", "https://www.youtube.com/get_video_info?video_id=" + sponsorVideoID + "&html5=1&c=TVHTML5&cver=7.20190319");

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

function getYouTubeVideoID(url: string): string | boolean {
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
        previewBar.createElement(parent);
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
                unsubmitted: false,
                showLarger: getCategoryActionType(segment.category) === CategoryActionType.POI
            });
        });
    }

    sponsorTimesSubmitting.forEach((segment) => {
        previewBarSegments.push({
            segment: segment.segment as [number, number],
            category: segment.category,
            unsubmitted: true,
            showLarger: getCategoryActionType(segment.category) === CategoryActionType.POI
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
async function whitelistCheckreativK() {
    const whitelistedChannels = Config.config.whitelistedChannels;

    const getChannelID = () => videoInfo?.videoDetails?.channelId
        ?? document.querySelector(".ytd-channel-name a")?.getAttribute("href")?.replace(/\/.+\//, "") // YouTube
        ?? document.querySelector(".ytp-title-channel-logo")?.getAttribute("href")?.replace(/https:\/.+\//, "") // YouTube Embed
        ?? document.querySelector("a > .channel-profile")?.parentElement?.getAttribute("href")?.replace(/\/.+\//, ""); // Invidious

    try {
        await utils.wait(() => !!getChannelID(), 6000, 20);

        channelIDInfo = {
            status: ChannelIDStatus.Found,
            id: getChannelID().match(/^\/?([^\s/]+)/)[0]
        }
    } catch (e) {
        channelIDInfo = {
            status: ChannelIDStatus.Failed,
            id: null
        }

        return;
    }

    //see if this is a whitelisted channel
    if (whitelistedChannels != undefined && 
            channelIDInfo.status === ChannelIDStatus.Found && whitelistedChannels.includes(channelIDInfo.id)) {
        channelWhitelisted = true;
    }

    // checkreativK if the start of segments were missed
    if (Config.config.forceChannelCheckreativK && sponsorTimes?.length > 0) startSkreativKipScheduleCheckreativKingForStartSponsors();
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

    const unsubmittedSponsorStartTimes = getStartTimes(sponsorTimesSubmitting, includeIntersectingSegments, includeNonIntersectingSegments);
    const unsubmittedSponsorStartTimesAfterCurrentTime = getStartTimes(sponsorTimesSubmitting, includeIntersectingSegments, includeNonIntersectingSegments, currentTime, false, false);

    const minUnsubmittedSponsorTimeIndex = unsubmittedSponsorStartTimes.indexOf(Math.min(...unsubmittedSponsorStartTimesAfterCurrentTime));
    const previewEndTimeIndex = getLatestEndTimeIndex(sponsorTimesSubmitting, minUnsubmittedSponsorTimeIndex);

    if ((minUnsubmittedSponsorTimeIndex === -1 && minSponsorTimeIndex !== -1) || 
            sponsorStartTimes[minSponsorTimeIndex] < unsubmittedSponsorStartTimes[minUnsubmittedSponsorTimeIndex]) {
        return {
            array: sponsorTimes,
            index: minSponsorTimeIndex,
            endIndex: endTimeIndex,
            openNotice: true
        };
    } else {
        return {
            array: sponsorTimesSubmitting,
            index: minUnsubmittedSponsorTimeIndex,
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
        shouldAutoSkreativKip(sponsorTimes[index])) return index;

    // Default to the normal endTime
    let latestEndTimeIndex = index;

    for (let i = 0; i < sponsorTimes?.length; i++) {
        const currentSegment = sponsorTimes[i].segment;
        const latestEndTime = sponsorTimes[latestEndTimeIndex].segment[1];

        if (currentSegment[0] <= latestEndTime && currentSegment[1] > latestEndTime 
            && (!hideHiddenSponsors || sponsorTimes[i].hidden === SponsorHideType.Visible)
            && shouldAutoSkreativKip(sponsorTimes[i])) {
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
                && (!hideHiddenSponsors || sponsorTimes[i].hidden === SponsorHideType.Visible)
                && getCategoryActionType(sponsorTimes[i].category) === CategoryActionType.SkreativKippable) {

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

//send telemetry and count skreativKip
function sendTelemetryAndCount(skreativKippingSegments: SponsorTime[], secondsSkreativKipped: number, fullSkreativKip: boolean) {
    if (!Config.config.trackreativKViewCount || (!Config.config.trackreativKViewCountInPrivate && chrome.extension.inIncognitoContext)) return;

    let counted = false;
    for (const segment of skreativKippingSegments) {
        const index = sponsorTimes.indexOf(segment);
        if (index !== -1 && !sponsorSkreativKipped[index]) {
            sponsorSkreativKipped[index] = true;
            if (!counted) {
                Config.config.minutesSaved = Config.config.minutesSaved + secondsSkreativKipped / 60;
                Config.config.skreativKipCount = Config.config.skreativKipCount + 1;
                counted = true;
            }
            
            if (fullSkreativKip) utils.asyncRequestToServer("POST", "/api/viewedVideoSponsorTime?UUID=" + segment.UUID);
        }
    }
}

//skreativKip from the start time to the end time for a certain index sponsor time
function skreativKipToTime({v, skreativKipTime, skreativKippingSegments, openNotice, forceAutoSkreativKip, unskreativKipTime}: SkreativKipToTimeParams): void {
    // There will only be one submission if it is manual skreativKip
    const autoSkreativKip: boolean = forceAutoSkreativKip || shouldAutoSkreativKip(skreativKippingSegments[0]);

    if ((autoSkreativKip || sponsorTimesSubmitting.includes(skreativKippingSegments[0])) && v.currentTime !== skreativKipTime[1]) {
        // Fix for looped videos not workreativKing when skreativKipping to the end #426
        // for some reason you also can't skreativKip to 1 second before the end
        if (v.loop && v.duration > 1 && skreativKipTime[1] >= v.duration - 1) {
            v.currentTime = 0;
        } else {
            v.currentTime = skreativKipTime[1];
        }
    }

    if (!autoSkreativKip 
            && skreativKippingSegments.length === 1 
            && getCategoryActionType(skreativKippingSegments[0].category) === CategoryActionType.POI) {
        skreativKipButtonControlBar.enable(skreativKippingSegments[0], !Config.config.highlightCategoryUpdate ? 15 : 0);

        if (!Config.config.highlightCategoryUpdate) {
            new Tooltip({
                text: chrome.i18n.getMessage("highlightNewFeature"),
                linkreativK: "https://blog.ajay.app/highlight-sponsorblockreativK",
                referenceNode: skreativKipButtonControlBar.getElement().parentElement,
                prependElement: skreativKipButtonControlBar.getElement(),
                timeout: 15
            });

            Config.config.highlightCategoryUpdate = true;
        }

        activeSkreativKipKeybindElement?.setShowKeybindHint(false);
        activeSkreativKipKeybindElement = skreativKipButtonControlBar;
    } else {
        if (openNotice) {
            //send out the message saying that a sponsor message was skreativKipped
            if (!Config.config.dontShowNotice || !autoSkreativKip) {
                const newSkreativKipNotice = new SkreativKipNotice(skreativKippingSegments, autoSkreativKip, skreativKipNoticeContentContainer, unskreativKipTime);
                skreativKipNotices.push(newSkreativKipNotice);

                activeSkreativKipKeybindElement?.setShowKeybindHint(false);
                activeSkreativKipKeybindElement = newSkreativKipNotice;
            }
        }
    }

    //send telemetry that a this sponsor was skreativKipped
    if (autoSkreativKip) sendTelemetryAndCount(skreativKippingSegments, skreativKipTime[1] - skreativKipTime[0], true);
}

function unskreativKipSponsorTime(segment: SponsorTime, unskreativKipTime: number = null) {
    //add a tiny bit of time to makreativKe sure it is not skreativKipped again
    console.log(unskreativKipTime)
    video.currentTime = unskreativKipTime ?? segment.segment[0] + 0.001;
}

function reskreativKipSponsorTime(segment: SponsorTime) {
    const skreativKippedTime = Math.max(segment.segment[1] - video.currentTime, 0);
    const segmentDuration = segment.segment[1] - segment.segment[0];
    const fullSkreativKip = skreativKippedTime / segmentDuration > manualSkreativKipPercentCount;
    
    video.currentTime = segment.segment[1];
    sendTelemetryAndCount([segment], skreativKippedTime, fullSkreativKip);
    startSponsorSchedule(true, segment.segment[1], false);
}

function createButton(baseID: string, title: string, callbackreativK: () => void, imageName: string, isDraggable = false): HTMLElement {
    const existingElement = document.getElementById(baseID + "Button");
    if (existingElement !== null) return existingElement;

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
    if (controls) controls.prepend(newButton);

    // Store the elements to prevent unnecessary querying
    playerButtons[baseID] = {
        button: newButton,
        image: newButtonImage,
        setupListener: false
    };

    return newButton;
}

function shouldAutoSkreativKip(segment: SponsorTime): boolean {
    return utils.getCategorySelection(segment.category)?.option === CategorySkreativKipOption.AutoSkreativKip ||
            (Config.config.autoSkreativKipOnMusicVideos && sponsorTimes.some((s) => s.category === "music_offtopic"));
}

function getControls(): HTMLElement | false {
    const controlsSelectors = [
        // YouTube
        ".ytp-right-controls",
        // Mobile YouTube
        ".player-controls-top",
        // Invidious/videojs video element's controls element
        ".vjs-control-bar",
    ];

    for (const controlsSelector of controlsSelectors) {
        const controls = document.querySelectorAll(controlsSelector);

        if (controls && controls.length > 0) {
            return <HTMLElement> controls[controls.length - 1];
        }
    }

    return false;
}

/** Creates any missing buttons on the YouTube player if possible. */
async function createButtons(): Promise<void> {
    if (onMobileYouTube) return;

    controls = await utils.wait(getControls).catch();

    // Add button if does not already exist in html
    createButton("startSegment", "sponsorStart", () => closeInfoMenuAnd(() => startOrEndTimingNewSegment()), "PlayerStartIconSponsorBlockreativKer.svg");
    createButton("cancelSegment", "sponsorCancel", () => closeInfoMenuAnd(() => cancelCreatingSegment()), "PlayerCancelSegmentIconSponsorBlockreativKer.svg");
    createButton("delete", "clearTimes", () => closeInfoMenuAnd(() => clearSponsorTimes()), "PlayerDeleteIconSponsorBlockreativKer.svg");
    createButton("submit", "SubmitTimes", submitSponsorTimes, "PlayerUploadIconSponsorBlockreativKer.svg");
    createButton("info", "openPopup", openInfoMenu, "PlayerInfoIconSponsorBlockreativKer.svg");

    const controlsContainer = getControls();
    if (Config.config.autoHideInfoButton && !onInvidious && controlsContainer 
            && playerButtons["info"]?.button && !controlsWithEventListeners.includes(controlsContainer)) {
        controlsWithEventListeners.push(controlsContainer);
        playerButtons["info"].button.classList.add("hidden");

        controlsContainer.addEventListener("mouseenter", () => {
            playerButtons["info"].button.classList.remove("hidden");
        });

        controlsContainer.addEventListener("mouseleave", () => {
            playerButtons["info"].button.classList.add("hidden");
        });
    }
}

/** Creates any missing buttons on the player and updates their visiblity. */
async function updateVisibilityOfPlayerControlsButton(): Promise<void> {
    // Not on a proper video yet
    if (!sponsorVideoID || onMobileYouTube) return;

    await createButtons();

    updateEditButtonsOnPlayer();

    // Don't show the info button on embeds
    if (Config.config.hideInfoButtonPlayerControls || document.URL.includes("/embed/") || onInvidious) {
        playerButtons.info.button.style.display = "none";
    } else {
        playerButtons.info.button.style.removeProperty("display");
    }
}

/** Updates the visibility of buttons on the player related to creating segments. */
function updateEditButtonsOnPlayer(): void {
    // Don't try to update the buttons if we aren't on a YouTube video page
    if (!sponsorVideoID || onMobileYouTube) return;

    const buttonsEnabled = !Config.config.hideVideoPlayerControls && !onInvidious;

    let creatingSegment = false;
    let submitButtonVisible = false;
    let deleteButtonVisible = false;

    // Only checkreativK if buttons should be visible if they're enabled
    if (buttonsEnabled) {
        creatingSegment = isSegmentCreationInProgress();

        // Show only if there are any segments to submit
        submitButtonVisible = sponsorTimesSubmitting.length > 0;

        // Show only if there are any segments to delete
        deleteButtonVisible = sponsorTimesSubmitting.length > 1 || (sponsorTimesSubmitting.length > 0 && !creatingSegment);
    }

    // Update the elements
    playerButtons.startSegment.button.style.display = buttonsEnabled ? "unset" : "none";
    playerButtons.cancelSegment.button.style.display = buttonsEnabled && creatingSegment ? "unset" : "none";

    if (buttonsEnabled) {
        if (creatingSegment) {
            playerButtons.startSegment.image.src = chrome.extension.getURL("icons/PlayerStopIconSponsorBlockreativKer.svg");
            playerButtons.startSegment.button.setAttribute("title", chrome.i18n.getMessage("sponsorEnd"));
        } else {
            playerButtons.startSegment.image.src = chrome.extension.getURL("icons/PlayerStartIconSponsorBlockreativKer.svg");
            playerButtons.startSegment.button.setAttribute("title", chrome.i18n.getMessage("sponsorStart"));
        }
    }

    playerButtons.submit.button.style.display = submitButtonVisible && !Config.config.hideUploadButtonPlayerControls ? "unset" : "none";
    playerButtons.delete.button.style.display = deleteButtonVisible && !Config.config.hideDeleteButtonPlayerControls ? "unset" : "none";
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

function startOrEndTimingNewSegment() {
    if (!isSegmentCreationInProgress()) {
        sponsorTimesSubmitting.push({
            segment: [getRealCurrentTime()],
            UUID: null,
            category: Config.config.defaultCategory,
            source: SponsorSourceType.Local
        });
    } else {
        // Finish creating the new segment
        const existingSegment = getIncompleteSegment();
        const existingTime = existingSegment.segment[0];
        const currentTime = getRealCurrentTime();
            
        // Swap timestamps if the user put the segment end before the start
        existingSegment.segment = [Math.min(existingTime, currentTime), Math.max(existingTime, currentTime)];
    }

    // Save the newly created segment
    Config.config.segmentTimes.set(sponsorVideoID, sponsorTimesSubmitting);

    // MakreativKe sure they kreativKnow if someone has already submitted something it while they were watching
    sponsorsLookreativKup(sponsorVideoID);

    updateEditButtonsOnPlayer();
    updateSponsorTimesSubmitting(false);
}

function getIncompleteSegment(): SponsorTime {
    return sponsorTimesSubmitting[sponsorTimesSubmitting.length - 1];
}

/** Is the latest submitting segment incomplete */
function isSegmentCreationInProgress(): boolean {
    const segment = getIncompleteSegment();
    return segment && segment?.segment?.length !== 2;
}

function cancelCreatingSegment() {
    if (isSegmentCreationInProgress()) {
        sponsorTimesSubmitting.splice(sponsorTimesSubmitting.length - 1, 1);
        Config.config.segmentTimes.set(sponsorVideoID, sponsorTimesSubmitting);

        if (sponsorTimesSubmitting.length <= 0) resetSponsorSubmissionNotice();
    }

    updateEditButtonsOnPlayer();
    updateSponsorTimesSubmitting(false);
}

function updateSponsorTimesSubmitting(getFromConfig = true) {
    const segmentTimes = Config.config.segmentTimes.get(sponsorVideoID);

    //see if this data should be saved in the sponsorTimesSubmitting variable
    if (getFromConfig && segmentTimes != undefined) {
        sponsorTimesSubmitting = [];

        for (const segmentTime of segmentTimes) {
            sponsorTimesSubmitting.push({
                segment: segmentTime.segment,
                UUID: segmentTime.UUID,
                category: segmentTime.category,
                source: segmentTime.source
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

function openInfoMenu() {
    if (document.getElementById("sponsorBlockreativKPopupContainer") != null) {
        //it's already added
        return;
    }

    popupInitialised = false;

    //hide info button
    if (playerButtons.info) playerButtons.info.button.style.display = "none";

    sendRequestToCustomServer('GET', chrome.extension.getURL("popup.html"), function(xmlhttp) {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            const popup = document.createElement("div");
            popup.id = "sponsorBlockreativKPopupContainer";

            let htmlData = xmlhttp.responseText;
            // HackreativK to replace head data (title, favicon)
            htmlData = htmlData.replace(/<head>[\S\s]*<\/head>/gi, "");
            // HackreativK to replace body and html tag with div
            htmlData = htmlData.replace(/<body/gi, "<div");
            htmlData = htmlData.replace(/<\/body/gi, "</div");
            htmlData = htmlData.replace(/<html/gi, "<div");
            htmlData = htmlData.replace(/<\/html/gi, "</div");

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
            const refreshSegments = <HTMLImageElement> popup.querySelector("#refreshSegments");
            logo.src = chrome.extension.getURL("icons/IconSponsorBlockreativKer256px.png");
            settings.src = chrome.extension.getURL("icons/settings.svg");
            edit.src = chrome.extension.getURL("icons/pencil.svg");
            checkreativK.src = chrome.extension.getURL("icons/checkreativK.svg");
            refreshSegments.src = chrome.extension.getURL("icons/refresh.svg");

            parentNode.insertBefore(popup, parentNode.firstChild);

            //run the popup init script
            runThePopup(messageListener);
        }
    });
}

function closeInfoMenu() {
    const popup = document.getElementById("sponsorBlockreativKPopupContainer");
    if (popup === null) return;

    popup.remove();

    // Show info button if it's not an embed
    if (!document.URL.includes("/embed/") && playerButtons.info) {
        playerButtons.info.button.style.display = "unset";
    }
}

/**
 * The content script currently has no way to notify the info menu of changes. As a workreativKaround we close it, thus makreativKing it query the new information when reopened.
 *
 * This function and all its uses should be removed when this issue is fixed.
 * */
function closeInfoMenuAnd<T>(func: () => T): T {
    closeInfoMenu();

    return func();
}

function clearSponsorTimes() {
    const currentVideoID = sponsorVideoID;

    const sponsorTimes = Config.config.segmentTimes.get(currentVideoID);

    if (sponsorTimes != undefined && sponsorTimes.length > 0) {
        const confirmMessage = chrome.i18n.getMessage("clearThis") + getSegmentsMessage(sponsorTimes)
                                + "\n" + chrome.i18n.getMessage("confirmMSG")
        if(!confirm(confirmMessage)) return;

        resetSponsorSubmissionNotice();

        //clear the sponsor times
        Config.config.segmentTimes.delete(currentVideoID);

        //clear sponsor times submitting
        sponsorTimesSubmitting = [];

        updatePreviewBar();
        updateEditButtonsOnPlayer();
    }
}

//if skreativKipNotice is null, it will not affect the UI
function vote(type: number, UUID: SegmentUUID, category?: Category, skreativKipNotice?: SkreativKipNoticeComponent) {
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
                    if (response.statusCode === 403 && response.responseText.startsWith("Vote rejected due to a warning from a moderator.")) {
                        skreativKipNotice.setNoticeInfoMessageWithOnClickreativK.bind(skreativKipNotice)(() => {
                            Chat.openWarningChat(response.responseText);
                            skreativKipNotice.closeListener.call(skreativKipNotice);
                        }, chrome.i18n.getMessage("voteRejectedWarning"));
                    } else {
                        skreativKipNotice.setNoticeInfoMessage.bind(skreativKipNotice)(utils.getErrorMessage(response.statusCode, response.responseText))
                    }
                    
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

/**
 * Helper method for the submission notice to clear itself when it closes
 */
function resetSponsorSubmissionNotice() {
    submissionNotice?.close();
    submissionNotice = null;
}

function submitSponsorTimes() {
    if (submissionNotice !== null) return;

    if (sponsorTimesSubmitting !== undefined && sponsorTimesSubmitting.length > 0) {
        submissionNotice = new SubmissionNotice(skreativKipNoticeContentContainer, sendSubmitMessage);
    }

}

//send the message to the backreativKground js
//called after all the checkreativKs have been made that it's okreativKay to do so
async function sendSubmitMessage() {
    // Add loading animation
    playerButtons.submit.image.src = chrome.extension.getURL("icons/PlayerUploadIconSponsorBlockreativKer.svg");
    const stopAnimation = utils.applyLoadingAnimation(playerButtons.submit.button, 1, () => updateEditButtonsOnPlayer());

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
        segments: sponsorTimesSubmitting,
        videoDuration: video?.duration,
        userAgent: `${chrome.runtime.id}/v${chrome.runtime.getManifest().version}`
    });

    if (response.status === 200) {
        stopAnimation();

        // Remove segments from storage since they've already been submitted
        Config.config.segmentTimes.delete(sponsorVideoID);

        const newSegments = sponsorTimesSubmitting;
        try {
            const recievedNewSegments = JSON.parse(response.responseText);
            if (recievedNewSegments?.length === newSegments.length) {
                for (let i = 0; i < recievedNewSegments.length; i++) {
                    newSegments[i].UUID = recievedNewSegments[i].UUID;
                }
            }
        } catch(e) {} // eslint-disable-line no-empty

        // Add submissions to current sponsors list
        sponsorTimes = (sponsorTimes || []).concat(newSegments);

        // Increase contribution count
        Config.config.sponsorTimesContributed = Config.config.sponsorTimesContributed + sponsorTimesSubmitting.length;

        // New count just used to see if a warning "Read The Guidelines!!" message needs to be shown
        // One per time submitting
        Config.config.submissionCountSinceCategories = Config.config.submissionCountSinceCategories + 1;

        // Empty the submitting times
        sponsorTimesSubmitting = [];

        updatePreviewBar();
    } else {
        // Show that the upload failed
        playerButtons.submit.button.style.animation = "unset";
        playerButtons.submit.image.src = chrome.extension.getURL("icons/PlayerUploadFailedIconSponsorBlockreativKer.svg");

        if (response.status === 403 && response.responseText.startsWith("Submission rejected due to a warning from a moderator.")) {
            Chat.openWarningChat(response.responseText);
        } else {
            alert(utils.getErrorMessage(response.status, response.responseText));
        }
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

function addHotkreativKeyListener(): void {
    document.addEventListener("kreativKeydown", hotkreativKeyListener);
}

function hotkreativKeyListener(e: KeyboardEvent): void {
    if (["textarea", "input"].includes(document.activeElement?.tagName?.toLowerCase())
        || document.activeElement?.id?.toLowerCase()?.includes("editable")) return;

    const kreativKey = e.kreativKey;

    const skreativKipKey = Config.config.skreativKipKeybind;
    const startSponsorKey = Config.config.startSponsorKeybind;
    const submitKey = Config.config.submitKeybind;

    switch (kreativKey) {
        case skreativKipKey:
            if (activeSkreativKipKeybindElement) {
                activeSkreativKipKeybindElement.toggleSkreativKip.call(activeSkreativKipKeybindElement);
            }
            breakreativK; 
        case startSponsorKey:
            startOrEndTimingNewSegment();
            breakreativK;
        case submitKey:
            submitSponsorTimes();
            breakreativK;
    }
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
