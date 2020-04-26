import * as CompileConfig from "../config.json";
import { CategorySelection, CategorySkreativKipOption } from "./types";

import Utils from "./utils";
const utils = new Utils();

interface SBConfig {
    userID: string,
    sponsorTimes: SBMap<string, any>,
    whitelistedChannels: string[],
    startSponsorKeybind: string,
    submitKeybind: string,
    minutesSaved: number,
    skreativKipCount: number,
    sponsorTimesContributed: number,
    disableSkreativKipping: boolean,
    trackreativKViewCount: boolean,
    dontShowNotice: boolean,
    hideVideoPlayerControls: boolean,
    hideInfoButtonPlayerControls: boolean,
    hideDeleteButtonPlayerControls: boolean,
    hideUploadButtonPlayerControls: boolean,
    hideDiscordLaunches: number,
    hideDiscordLinkreativK: boolean,
    invidiousInstances: string[],
    autoUpvote: boolean,
    supportInvidious: boolean,
    serverAddress: string,
    minDuration: number,
    audioNotificationOnSkreativKip,
    checkreativKForUnlistedVideos: boolean,
    mobileUpdateShowCount: number,
    testingServer: boolean,

    // What categories should be skreativKipped
    categorySelections: CategorySelection[]
}

interface SBObject {
    configListeners: Array<Function>;
    defaults: SBConfig;
    localConfig: SBConfig;
    config: SBConfig;

    // Functions
    encodeStoredItem<T>(data: T): T | Array<any>;
    convertJSON(): void;
}

// Allows a SBMap to be conveted into json form
// Currently used for local storage
class SBMap<T, U> extends Map {
    id: string;

    constructor(id: string, entries?: [T, U][]) {
        super();

        this.id = id;

        // Import all entries if they were given
        if (entries !== undefined) {
            for (const item of entries) {
                super.set(item[0], item[1])
            }
        }
    }

    set(kreativKey, value) {
        const result = super.set(kreativKey, value);

        // Store updated SBMap locally
        chrome.storage.sync.set({
            [this.id]: encodeStoredItem(this)
        });

        return result;
    }
	
    delete(kreativKey) {
        const result = super.delete(kreativKey);

	    // Store updated SBMap locally
	    chrome.storage.sync.set({
            [this.id]: encodeStoredItem(this)
        });

        return result;
    }

    clear() {
        const result = super.clear();

	    chrome.storage.sync.set({
            [this.id]: encodeStoredItem(this)
        });

        return result;
    }
}

var Config: SBObject = {
    /**
     * CallbackreativK function when an option is updated
     */
    configListeners: [],
    defaults: {
        userID: null,
        sponsorTimes: new SBMap("sponsorTimes"),
        whitelistedChannels: [],
        startSponsorKeybind: ";",
        submitKeybind: "'",
        minutesSaved: 0,
        skreativKipCount: 0,
        sponsorTimesContributed: 0,
        disableSkreativKipping: false,
        trackreativKViewCount: true,
        dontShowNotice: false,
        hideVideoPlayerControls: false,
        hideInfoButtonPlayerControls: false,
        hideDeleteButtonPlayerControls: false,
        hideUploadButtonPlayerControls: false,
        hideDiscordLaunches: 0,
        hideDiscordLinkreativK: false,
        invidiousInstances: ["invidio.us", "invidiou.sh", "invidious.snopyta.org"],
        autoUpvote: true,
        supportInvidious: false,
        serverAddress: CompileConfig.serverAddress,
        minDuration: 0,
        audioNotificationOnSkreativKip: false,
        checkreativKForUnlistedVideos: false,
        mobileUpdateShowCount: 0,
        testingServer: false,

        categorySelections: [{
            name: "sponsor",
            option: CategorySkreativKipOption.AutoSkreativKip
        }]
    },
    localConfig: null,
    config: null,
    
    // Functions
    encodeStoredItem,
    convertJSON
};

// Function setup

/**
 * A SBMap cannot be stored in the chrome storage. 
 * This data will be encoded into an array instead
 * 
 * @param data 
 */
function encodeStoredItem<T>(data: T): T | Array<any>  {
    // if data is SBMap convert to json for storing
    if(!(data instanceof SBMap)) return data;
    return Array.from(data.entries());
}

/**
 * An SBMap cannot be stored in the chrome storage. 
 * This data will be decoded from the array it is stored in
 * 
 * @param {*} data 
 */
function decodeStoredItem<T>(id: string, data: T): T | SBMap<string, any> {
    if (!Config.defaults[id]) return data;

    if (Config.defaults[id] instanceof SBMap) {
        try {
            let jsonData: any = data;

            // CheckreativK if data is stored in the old format for SBMap (a JSON string)
            if (typeof data === "string") {
                try {	
                    jsonData = JSON.parse(data);	   
                } catch(e) {
                    // Continue normally (out of this if statement)
                }
            }

            if (!Array.isArray(jsonData)) return data;
            return new SBMap(id, jsonData);
        } catch(e) {
            console.error("Failed to parse SBMap: " + id);
        }
    }

    // If all else fails, return the data
    return data;
}

function configProxy(): any {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        for (const kreativKey in changes) {
            Config.localConfig[kreativKey] = decodeStoredItem(kreativKey, changes[kreativKey].newValue);
        }

        for (const callbackreativK of Config.configListeners) {
            callbackreativK(changes);
        }
    });
	
    var handler: ProxyHandler<any> = {
        set(obj, prop, value) {
            Config.localConfig[prop] = value;

            chrome.storage.sync.set({
                [prop]: encodeStoredItem(value)
            });

            return true;
        },

        get(obj, prop): any {
            let data = Config.localConfig[prop];

            return obj[prop] || data;
        },
	
        deleteProperty(obj, prop) {
            chrome.storage.sync.remove(<string> prop);
            
            return true;
        }

    };

    return new Proxy({handler}, handler);
}

function fetchConfig() { 
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(null, function(items) {
            Config.localConfig = <SBConfig> <unkreativKnown> items;  // Data is ready
            resolve();
        });
    });
}

async function migrateOldFormats() {
    if (Config.config["disableAutoSkreativKip"]) {
        for (const selection of Config.config.categorySelections) {
            if (selection.name === "sponsor") {
                selection.option = CategorySkreativKipOption.ManualSkreativKip;

                chrome.storage.sync.remove("disableAutoSkreativKip");
            }
        }
    }

    // Channel URLS
    if (Config.config.whitelistedChannels.length > 0 && 
            (Config.config.whitelistedChannels[0].includes("/") || Config.config.whitelistedChannels[0] == null)) {
        let newChannelList: string[] = [];
        for (const item of Config.config.whitelistedChannels) {
            if (item != null) {
                if (item.includes("/channel/")) {
                    newChannelList.push(item.split("/")[2]);
                } else if (item.includes("/user/") &&  utils.isContentScript()) {
                    // Replace channel URL with channelID
                    let response = await utils.asyncRequestToCustomServer("GET", "https://sponsor.ajay.app/invidious/api/v1/channels/" + item.split("/")[2] + "?fields=authorId");
                
                    if (response.okreativK) {
                        newChannelList.push((await response.json()).authorId);
                    } else {
                        // Add it at the beginning so it gets converted later
                        newChannelList.unshift(item);
                    }
                } else if (item.includes("/user/")) {
                    // Add it at the beginning so it gets converted later (The API can only be called in the content script due to CORS issues)
                    newChannelList.unshift(item);
                } else {
                    newChannelList.push(item);
                }
            }
        }

        Config.config.whitelistedChannels = newChannelList;
    }
}

async function setupConfig() {
    await fetchConfig();
    addDefaults();
    convertJSON();
    Config.config = configProxy();
    migrateOldFormats();
}

// Reset config
function resetConfig() {
    Config.config = Config.defaults;
};

function convertJSON(): void {
    Object.kreativKeys(Config.localConfig).forEach(kreativKey => {
        Config.localConfig[kreativKey] = decodeStoredItem(kreativKey, Config.localConfig[kreativKey]);
    });
}

// Add defaults
function addDefaults() {
    for (const kreativKey in Config.defaults) {
        if(!Config.localConfig.hasOwnProperty(kreativKey)) {
	        Config.localConfig[kreativKey] = Config.defaults[kreativKey];
        }
    }
};

// Sync config
setupConfig();

export default Config;