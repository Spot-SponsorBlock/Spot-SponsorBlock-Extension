/*
  Content script are run in an isolated DOM so it is not possible to access some key details that are sanitized when passed cross-dom
  This script is used to get the details from the page and make them available for the content script by being injected directly into the page
*/

import { isVisible } from "./utils/dom";
import { checkIfOnMobileSpotify, checkIfExternalDevice } from "./utils/video";

interface ChangeEpisodeDataMessage {
    type: "changeEpisodeData";
    episodeID: string;
    showID: string;
    showTitle: string;
    contentType: string;
}

type WindowMessage = ChangeEpisodeDataMessage;

interface episodeData {
    episodeID: string;
    episodeTitle: string;
    showID: string;
    showTitle: string;
    contentType: string;
}

const episodeDataList: episodeData[] = [];
const id = "sponsorblock";

let videoElement: HTMLVideoElement | null = null;

let firstTime = true;
let onMobileSpotify = false;

const sendMessage = (message: WindowMessage): void => {
    window.postMessage({ source: id, ...message }, "/");
}

const titleObserver = new MutationObserver(() => {
    sendEpisodeData();
});

const fullScreenObserver = new MutationObserver(() => {
    const fullScreenTitleElement = getFullScreenTitleElement();
    if (fullScreenTitleElement) {
        fullScreenTitleObserver.observe(fullScreenTitleElement, {
            childList: true,
            subtree: true
        });
    }
});

const fullScreenTitleObserver = new MutationObserver(() => {
    sendEpisodeData();
});

const videoContainerObserver = new MutationObserver(() => {
    if (!document.querySelector(".VideoPlayer__container video")) {
        const sbContainer = document.querySelector("#__sb_video_container");
        // Add back videoElement to __sb_video_container if it's no longer under VideoPlayer__container
        sbContainer.appendChild(videoElement);
    }
});

function sendEpisodeData() {
    if (checkIfExternalDevice()) {
        return;
    } else if (firstTime) {
        firstTime = false;
    }

    const title = getTitleElement().textContent;
    const episode = episodeDataList.find(
    data => data.episodeTitle === title
    );

    if (!episode) {
        setTimeout(sendEpisodeData, 1000);
        return;
    }

    sendMessage({
        type: "changeEpisodeData",
        episodeID: episode.episodeID,
        showID: episode.showID,
        showTitle: episode.showTitle,
        contentType: episode.contentType
    });
};

function hijackVideoElement() {
    const container = document.createElement('div');
    container.id = '__sb_video_container';
    container.style.display = 'none';
    document.documentElement.appendChild(container);
    
    const origCreate = document.createElement.bind(document);

    // Patch document.createElement to capture newly created video or audio elements
    document.createElement = function (tagName: string, options?: ElementCreationOptions) {
      const tag = String(tagName).toLowerCase();
      const el = origCreate(tagName as any, options as any) as HTMLElement;
      try {
        if (tag === "video" && el instanceof HTMLVideoElement && !onMobileSpotify) {
            container.appendChild(el);
            videoElement = el;
            createVideoContainerObserver();
            document.createElement = origCreate;
        } else if (tag === "audio" && el instanceof HTMLAudioElement && onMobileSpotify) {
            container.appendChild(el);
            document.createElement = origCreate;
        }
      } catch { /* ignore */ }
      return el;
    };
}

function createVideoContainerObserver() {
    const videoContainer = document.querySelector(".VideoPlayer__container");

    if (videoContainer) {
        // Observe when videoElement is moved from or to VideoPlayer__container (happens when podcast has a viewable video)
        videoContainerObserver.observe(videoContainer, {
            childList: true
        });
    } else {
        setTimeout(createVideoContainerObserver, 1000);
    }
}

function patchWebSocket() {
    try {
        // Patch WebSocket onmessage to sanitize dealer.spotify.com messages
        const NativeWS = window.WebSocket as typeof WebSocket | undefined;
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
                                    } catch { /* ignore */ }
                                }
                            }
                        } catch { /* ignore */ }
                        return handler.call(self, ev);
                    };
                    
                    (this as any).__sb_injected_onmessage = wrapped;
                    if (origDesc && origDesc.set) origDesc.set.call(this, wrapped);
                    else this.addEventListener("message", wrapped);
                }
            });
        }
    } catch { /* ignore */ }
}

function patchFetch() {
    try {
        if (window.fetch) {
            const origFetch = window.fetch.bind(window);
            // patch fetch to sanitize spclient.spotify.com JSON responses
            window.fetch = async (input: any, init?: any) => {
                const url = typeof input === "string" ? input : (input && input.url) || "";
                const isSpclient = typeof url === "string" && url.includes("spclient.spotify.com");
                const res = await origFetch(input, init);
                if (!isSpclient) return res;
                try {
                    const text = await res.clone().text();
                     const parsed = JSON.parse(text);
                     if (parsed && typeof parsed === "object") {
                        stripFileUrls(parsed);
                        // Can't get episodeID from DOM on mobile
                        if (onMobileSpotify) {
                            getEpisodesFromResponse(parsed);
                        }
                        return new Response(JSON.stringify(parsed), {
                            status: res.status,
                            statusText: res.statusText,
                            headers: res.headers
                        });
                    }
                } catch { /* ignore */ }
                return res;
            };
        }
    } catch { /* ignore */ }
}

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

function createMobileObservers() {
    const titleObserverElement = document.querySelector(".qLJjpgM6PzjjQFiwsHlN");
    const fullScreenObserverElement = document.querySelector(".Yg_FlRTSnjxmfwyAvnFJ");
    
    if (titleObserverElement && fullScreenObserverElement) {
        titleObserver.observe(titleObserverElement, {
            childList: true,
            subtree: true
        });
        fullScreenObserver.observe(fullScreenObserverElement, {
            childList: true
        });
    } else {
        setTimeout(createMobileObservers, 1000);
    }
}

function getFullScreenTitleElement(): Element {
    const selectors = document.querySelectorAll<HTMLAnchorElement>("a[draggable='false']");
    const fullScreenTitleElement = Array.from(selectors).find(element => {
        return element.parentElement?.classList.contains("encore-text-title-small");
    });
    return fullScreenTitleElement;
}

function getTitleElement(): Element | null {
    const fullScreenTitleElement = getFullScreenTitleElement();
    if (fullScreenTitleElement) {
        return fullScreenTitleElement;
    } else {
        const elements = document.querySelectorAll(".TlTafCeV78wyT2Ms8dQW .h05f1NscpvztXBs2ptHa");
        const titleElement = Array.from(elements).find(el => isVisible(el as HTMLElement));
        return titleElement || null;
    }
}

function getEpisodesFromResponse(root: any) {
    if (!root || typeof root !== "object") return;
    try {
        if (root.state_machine.tracks) {
            for (const track of root.state_machine.tracks) {
                const episodeTitle = track.metadata.name;
                const existing = episodeDataList.find(
                    data => data.episodeTitle === episodeTitle
                );
                if (existing) continue;
            
                const uri = track.metadata.uri;
                const split = uri.split(":");
            
                let showID;
                let showTitle;
                const episodeID = split[2];
                const contentType = split[1];
                if (contentType === "episode") {
                    const showUri = track.metadata.context_uri;
                    const showSplit = showUri.split(":");
                    
                    showID = showSplit[2];
                    showTitle = track.metadata.context_description;
                }
                
                const episode: episodeData = {
                    episodeID,
                    episodeTitle,
                    showID,
                    showTitle,
                    contentType
                };

                episodeDataList.push(episode);
                if (firstTime) {
                    sendEpisodeData();
                }
            }
        }
    } catch { /* ignore */ }
}

function init(): void {
    onMobileSpotify = checkIfOnMobileSpotify();
    hijackVideoElement();
    patchWebSocket();
    patchFetch();
    
    if (onMobileSpotify) {
        createMobileObservers();
    }

}

init();