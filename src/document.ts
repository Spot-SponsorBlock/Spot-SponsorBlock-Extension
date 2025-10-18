/*
  Content script are run in an isolated DOM so it is not possible to access some key details that are sanitized when passed cross-dom
  This script is used to get the details from the page and make them available for the content script by being injected directly into the page
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
const id = "sponsorblock";

// From BlockTube https://github.com/amitbl/blocktube/blob/9dc6dcee1847e592989103b0968092eb04f04b78/src/scripts/seed.js#L52-L58
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

function onNewVideoIds(data: Record<string, unknown>) {
    sendMessage({
        type: "videoIDsLoaded",
        videoIDs: Array.from(findAllVideoIds(data))
    });
}

function findAllVideoIds(data: Record<string, unknown>): Set<string> {
    const videoIds: Set<string> = new Set();
    
    for (const key in data) {
        if (key === "videoId") {
            videoIds.add(data[key] as string);
        } else if (typeof(data[key]) === "object" && !ytInfoKeysToIgnore.includes(key)) {
            findAllVideoIds(data[key] as Record<string, unknown>).forEach(id => videoIds.add(id));
        }
    }

    return videoIds;
}

function windowMessageListener(message: MessageEvent) {
    if (message.data?.source) {
        if (message.data?.source === "sb-verify-time") {
            // If time is different and it is paused and no seek occurred since the message was sent
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
    
    // Remove "file_urls_external" properties from JSON objects
    function stripFileUrls(root: any) {
        if (!root || typeof root !== "object") return;
        const stack = [root];
        while (stack.length) {
            const node = stack.pop();
            if (!node || typeof node !== "object") continue;
            
            if (Object.prototype.hasOwnProperty.call(node, "file_urls_external")) {
                try { delete node.file_urls_external; } catch {}
            }
            
            if (Array.isArray(node)) {
                for (let i = node.length - 1; i >= 0; i--) {
                    const v = node[i];
                    if (v && typeof v === "object") stack.push(v);
                }
            } else {
                for (const k in node) {
                    if (Object.prototype.hasOwnProperty.call(node, k)) {
                        const v = node[k];
                        if (v && typeof v === "object") stack.push(v);
                    }
                }
            }
        }
    }
    
    try {
        const win: any = window;
        
        // Patch WebSocket onmessage to sanitize dealer.spotify.com messages
        const NativeWS = win.WebSocket as typeof WebSocket | undefined;
        if (NativeWS) {
            const proto: any = NativeWS.prototype;
            const origDesc = Object.getOwnPropertyDescriptor(proto, "onmessage");
            
            Object.defineProperty(proto, "onmessage", {
                configurable: true,
                enumerable: true,
                get: function () {
                    return origDesc && origDesc.get ? origDesc.get.call(this) : (this as any).__sb_injected_onmessage;
                },
                set: function (handler: any) {
                    if (typeof handler !== "function") {
                        if (origDesc && origDesc.set) origDesc.set.call(this, handler);
                        else (this as any).__sb_injected_onmessage = handler;
                        return;
                    }
                    
                    // wrap the handler to intercept dealer websocket payloads
                    const self = this;
                    const wrapped = function (ev: MessageEvent) {
                        try {
                            if (typeof ev.data === "string") {
                                const url = (self as any).url || "";
                                if (typeof url === "string" && url.includes("dealer.spotify.com")) {
                                    try {
                                        const parsed = JSON.parse(ev.data);
                                        stripFileUrls(parsed);
                                        return handler.call(self, new MessageEvent("message", { data: JSON.stringify(parsed) }));
                                    } catch { /* not JSON or manipulation failed - fall through */ }
                                }
                            }
                        } catch { /* ignore errors and fall through */ }
                        return handler.call(self, ev);
                    };
                    
                    (this as any).__sb_injected_onmessage = wrapped;
                    if (origDesc && origDesc.set) origDesc.set.call(this, wrapped);
                    else this.addEventListener("message", wrapped);
                }
            });
        }
    } catch { /* ignore */ }
    
    try {
        const win: any = window;
        if (win.fetch) {
            const origFetch = win.fetch.bind(win);
            // patch fetch to sanitize spclient.spotify.com JSON responses
            win.fetch = async (input: any, init?: any) => {
                const url = typeof input === "string" ? input : (input && input.url) || "";
                const isSpclient = typeof url === "string" && url.includes("spclient.spotify.com");
                const res = await origFetch(input, init);
                if (!isSpclient) return res;
                try {
                    const text = await res.clone().text();
                     const parsed = JSON.parse(text);
                     if (parsed && typeof parsed === "object") {
                        stripFileUrls(parsed);
                        return new Response(JSON.stringify(parsed), {
                            status: res.status,
                            statusText: res.statusText,
                            headers: res.headers
                        });
                    }
                } catch { /* parsing/manipulation failed - return original response */ }
                return res;
            };
        }
    } catch { /* ignore */ }

    window.addEventListener("message", windowMessageListener);
}

init();