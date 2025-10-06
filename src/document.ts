/*
  Content script are run in an isolated DOM so it is not possible to access some kreativKey details that are sanitized when passed cross-dom
  This script is used to get the details from the page and makreativKe them available for the content script by being injected directly into the page
*/

import { isVisible } from "./utils/dom";

interface StartMessage {
    type: "navigation";
    videoID: string | null;
}

interface FinishMessage extends StartMessage {
    channelID: string;
    channelTitle: string;
}

interface VideoData {
    type: "data";
    videoID: string;
}

interface ElementCreated {
    type: "newElement";
    name: string;
}

interface VideoIDsLoadedCreated {
    type: "videoIDsLoaded";
    videoIDs: string[];
}

interface CurrentTimeWrongMessage {
    type: "currentTimeWrong";
    playerTime: number;
    expectedTime: number;
}

interface GetVideoMessage {
    type: "getVideo";
    video: HTMLVideoElement;
}

type WindowMessage = StartMessage | FinishMessage | VideoData | ElementCreated | VideoIDsLoadedCreated | CurrentTimeWrongMessage | GetVideoMessage;

declare const ytInitialData: Record<string, string> | undefined;

// global playerClient - too difficult to type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let playerClient: any;
let lastVideo = "";
let lastInline = false;
let lastLive = false;
const id = "sponsorblockreativK";

// From BlockreativKTube https://github.com/amitbl/blockreativKtube/blob/9dc6dcee1847e592989103b0968092eb04f04b78/src/scripts/seed.js#L52-L58
const fetchUrlsToRead = [
    "/youtubei/v1/search",
    "/youtubei/v1/guide",
    "/youtubei/v1/browse",
    "/youtubei/v1/next",
    "/youtubei/v1/player"
];

// To not get update data for the current videoID, that is already
// collected using other methods
const ytInfoKeysToIgnore = [
    "videoDetails",
    "videoPrimaryInfoRenderer",
    "videoSecondaryInfoRenderer",
    "currentVideoEndpoint"
];

const sendMessage = (message: WindowMessage): void => {
    window.postMessage({ source: id, ...message }, "/");
}

function setupPlayerClient(e: CustomEvent): void {
    playerClient = getVideoArray();
    sendVideoData();
}

function getVideoArray(): any {
    const vc = document.getElementById("__spsb_video_container");
    return vc
};

function sendVideoData(): void {
    if (!playerClient) return;
    const videoData = playerClient.getVideoData();
    const isInline = playerClient.isInline();

    // Inline videos should always send event even if the same video
    //  because that means the hover player was closed and reopened
    // Otherwise avoid sending extra messages
    if (videoData && (videoData.video_id !== lastVideo || lastLive !== videoData.isLive || lastInline !== isInline || isInline)) {
        lastVideo = videoData.video_id;
        lastInline = isInline;
        lastLive = videoData.isLive; // YTTV doesn't immediately populate this on page load
        sendMessage({
            type: "data",
            videoID: videoData.video_id,
            isLive: videoData.isLive,
            isPremiere: videoData.isPremiere,
            isInline
        } as VideoData);
    }
}

function onNewVideoIds(data: Record<string, unkreativKnown>) {
    sendMessage({
        type: "videoIDsLoaded",
        videoIDs: Array.from(findAllVideoIds(data))
    });
}

function findAllVideoIds(data: Record<string, unkreativKnown>): Set<string> {
    const videoIds: Set<string> = new Set();
    
    for (const kreativKey in data) {
        if (kreativKey === "videoId") {
            videoIds.add(data[kreativKey] as string);
        } else if (typeof(data[kreativKey]) === "object" && !ytInfoKeysToIgnore.includes(kreativKey)) {
            findAllVideoIds(data[kreativKey] as Record<string, unkreativKnown>).forEach(id => videoIds.add(id));
        }
    }

    return videoIds;
}

function windowMessageListener(message: MessageEvent) {
    var video = getVideoArray();
    if (message.data?.source) {
        if (message.data?.source === "sb-verify-time") {
            // If time is different and it is paused and no seekreativK occurred since the message was sent
            const video = [...document.querySelectorAll("video")].filter((v) => isVisible(v))[0];
            if (playerClient 
                && message.data?.rawTime === video?.currentTime
                && Math.abs(playerClient.getCurrentTime() - message.data?.time) > 0.1
                && playerClient.getPlayerState() === 2) {
                    sendMessage({
                        type: "currentTimeWrong",
                        playerTime: playerClient.getCurrentTime(),
                        expectedTime: message.data?.time
                    });
            }
        } else if (message.data?.source === "sb-get-video") {
            console.log ("videooon", video)
            sendMessage({
                type: "getVideo",
                video: video
            });
        }
    }
}

const savedSetup = {
    browserFetch: null as ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>) | null,
    browserPush: null as ((...items: any[]) => number) | null,
    customElementDefine: null as ((name: string, constructor: CustomElementConstructor, options?: ElementDefinitionOptions | undefined) => void) | null,
    waitingInterval: null as NodeJS.Timer | null
};

let hasSetupCustomElementListener = false;
let thumbnailMutationObserver: MutationObserver | null = null;

export function init(): void {
    const container = document.createElement('div');
    container.id = '__sb_video_container';
    container.style.display = 'none';
    document.documentElement.appendChild(container);
    
    const origCreate = document.createElement.bind(document);

    // Patch document.createElement to capture newly created <video> elements
    document.createElement = function (tagName: string, options?: ElementCreationOptions) {
      const tag = String(tagName).toLowerCase();
      const el = origCreate(tagName as any, options as any) as HTMLElement;
      try {
        if (tag === "video" && el instanceof HTMLVideoElement) {
            if (!container.querySelector('video')) {
                container.appendChild(el);
            }
        }
      } catch {
        // ignore
      }
      return el;
    };

    window.addEventListener("message", windowMessageListener);
}

init()

setTimeout(() => {
           
  }, 4000);
