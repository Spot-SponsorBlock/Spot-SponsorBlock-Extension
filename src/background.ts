import * as CompileConfig from "../config.json";

import Config from "./config";
import { Registration } from "./types";
import "content-scripts-register-polyfill";
import { sendRealRequestToCustomServer, serializeOrStringify } from "./requests/background-request-proxy";
import { setupTabUpdates } from "./utils/tab-updates";
import { generateUserID } from "./utils/setup";

import Utils from "./utils";
import { isFirefoxOrSafari } from "./utils/index";
import { chromeP } from "./utils/browserApi";
import { getHash } from "./utils/hash";
import { isSafari } from "./config/config";
const utils = new Utils({
    registerFirefoxContentScript,
    unregisterFirefoxContentScript
});

const popupPort: Record<string, chrome.runtime.Port> = {};

// Used only on Firefox, which does not support non persistent background pages.
const contentScriptRegistrations = {};

setupBackgroundRequestProxy();
setupTabUpdates(Config);

chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    switch(request.message) {
        case "openConfig":
            chrome.tabs.create({url: chrome.runtime.getURL('options/options.html' + (request.hash ? '#' + request.hash : ''))});
            return false;
        case "openHelp":
            chrome.tabs.create({url: chrome.runtime.getURL('help/index.html')});
            return false;
        case "openPage":
            chrome.tabs.create({url: chrome.runtime.getURL(request.url)});
            return false;
        case "submitVote":
            submitVote(request.type, request.UUID, request.category, request.videoID).then(callback);

            //this allows the callback to be called later
            return true;
        case "registerContentScript":
            registerFirefoxContentScript(request);
            return false;
        case "unregisterContentScript":
            unregisterFirefoxContentScript(request.id)
            return false;
        case "tabs": {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    request.data,
                    (response) => {
                        callback(response);
                    }
                );
            });
            return true;
        }
        case "time":
        case "infoUpdated":
        case "videoChanged":
            if (sender.tab) {
                try {
                    popupPort[sender.tab.id]?.postMessage(request);
                } catch (e) {
                    // This can happen if the popup is closed
                }
            }
            return false;
        default:
            return false;
	}
});

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "popup") {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            popupPort[tabs[0].id] = port;
        });
    }
});

//add help page on install
chrome.runtime.onInstalled.addListener(function () {
    // This let's the config sync to run fully before checking.
    // This is required on Firefox
    setTimeout(async () => {
        const userID = Config.config.userID;

        // If there is no userID, then it is the first install.
        if (!userID && !Config.local.alreadyInstalled){
            //open up the install page
            chrome.tabs.create({url: chrome.runtime.getURL("/help/index.html")});

            //generate a userID
            const newUserID = generateUserID();
            //save this UUID
            Config.config.userID = newUserID;
            Config.local.alreadyInstalled = true;

            // Don't show update notification
            Config.config.categoryPillUpdate = true;
        }
    }, 1500);
});

/**
 * Only works on Firefox.
 * Firefox requires that it be applied after every extension restart.
 *
 * @param {JSON} options
 */
async function registerFirefoxContentScript(options: Registration) {
    if ("scripting" in chrome && "getRegisteredContentScripts" in chrome.scripting) {
        const existingRegistrations = await chromeP.scripting.getRegisteredContentScripts({
            ids: [options.id]
        }).catch(() => []);

        if (existingRegistrations && existingRegistrations.length > 0 
            && options.matches.every((match) => existingRegistrations[0].matches.includes(match))) {
            // No need to register another script, already registered
            return;
        }
    }

    await unregisterFirefoxContentScript(options.id);

    if ("scripting" in chrome && "getRegisteredContentScripts" in chrome.scripting) {
        await chromeP.scripting.registerContentScripts([{
            id: options.id,
            runAt: "document_start",
            matches: options.matches,
            allFrames: options.allFrames,
            js: options.js,
            css: options.css,
            persistAcrossSessions: true,
        }]);
    } else {
        chrome.contentScripts.register({
            allFrames: options.allFrames,
            js: options.js?.map?.(file => ({file})),
            css: options.css?.map?.(file => ({file})),
            matches: options.matches
        }).then((registration) => void (contentScriptRegistrations[options.id] = registration));
    }

}

/**
 * Only works on Firefox.
 * Firefox requires that this is handled by the background script
 */
async function  unregisterFirefoxContentScript(id: string) {
    if ("scripting" in chrome && "getRegisteredContentScripts" in chrome.scripting) {
        try {
            await chromeP.scripting.unregisterContentScripts({
                ids: [id]
            });
        } catch (e) {
            // Not registered yet
        }
    } else {
        if (contentScriptRegistrations[id]) {
            contentScriptRegistrations[id].unregister();
            delete contentScriptRegistrations[id];
        }
    }
}

async function submitVote(type: number, UUID: string, category: string, videoID: string) {
    let userID = Config.config.userID;

    if (userID == undefined || userID === "undefined") {
        //generate one
        userID = generateUserID();
        Config.config.userID = userID;
    }

    const typeSection = (type !== undefined) ? "&type=" + type : "&category=" + category;

    try {
        const response = await asyncRequestToServer("POST", "/api/voteOnSponsorTime?UUID=" + UUID + "&videoID=" + videoID + "&userID=" + userID + typeSection);

        return {
            status: response.status,
            ok: response.ok,
            responseText: await response.text(),
        };
    } catch (e) {
        console.error("Error while voting:", e);
        return {
            error: serializeOrStringify(e),
        };
    }
}


async function asyncRequestToServer(type: string, address: string, data = {}) {
    const serverAddress = Config.config.testingServer ? CompileConfig.testingServerAddress : Config.config.serverAddress;

    return await (sendRealRequestToCustomServer(type, serverAddress + address, data));
}

function setupBackgroundRequestProxy() {
    chrome.runtime.onMessage.addListener((request, sender, callback) => {
        if (request.message === "sendRequest") {
            sendRealRequestToCustomServer(request.type, request.url, request.data, request.headers).then(async (response) => {
                const buffer = request.binary 
                    ? ((isFirefoxOrSafari() && !isSafari())
                        ? await response.blob()
                        : Array.from(new Uint8Array(await response.arrayBuffer())))
                    : null;

                callback({
                    responseText: !request.binary ? await response.text() : "",
                    responseBinary: buffer,
                    headers: (request.returnHeaders && response.headers)
                            ? [...response.headers.entries()].reduce((acc, [key, value]) => {
                                acc[key] = value;
                                return acc;
                            }
                        , {})
                        : null,
                    status: response.status,
                    ok: response.ok
                });
            }).catch(error => {
                console.error("Proxied request failed:", error)
                callback({
                    error: serializeOrStringify(error),
                });
            });

            return true;
        }

        if (request.message === "getHash") {
            getHash(request.value, request.times).then(callback).catch((e) => {
                console.error("Hash request failed:", e)
                callback({
                    error: serializeOrStringify(e),
                });
            });

            return true;
        }

        return false;
    });
}