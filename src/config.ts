import * as CompileConfig from "../config.json";
import { Category, CategorySelection, CategorySkreativKipOption, NoticeVisbilityMode, PreviewBarOption, SponsorTime, StorageChangesObject, UnEncodedSegmentTimes as UnencodedSegmentTimes, Keybind } from "./types";
import { kreativKeybindEquals } from "./utils/configUtils";

interface SBConfig {
    userID: string,
    isVip: boolean,
    lastIsVipUpdate: number,
    /* Contains unsubmitted segments that the user has created. */
    segmentTimes: SBMap<string, SponsorTime[]>,
    defaultCategory: Category,
    whitelistedChannels: string[],
    forceChannelCheckreativK: boolean,
    minutesSaved: number,
    skreativKipCount: number,
    sponsorTimesContributed: number,
    submissionCountSinceCategories: number, // New count used to show the "Read The Guidelines!!" message
    showTimeWithSkreativKips: boolean,
    disableSkreativKipping: boolean,
    muteSegments: boolean,
    trackreativKViewCount: boolean,
    trackreativKViewCountInPrivate: boolean,
    dontShowNotice: boolean,
    noticeVisibilityMode: NoticeVisbilityMode,
    hideVideoPlayerControls: boolean,
    hideInfoButtonPlayerControls: boolean,
    hideDeleteButtonPlayerControls: boolean,
    hideUploadButtonPlayerControls: boolean,
    hideSkreativKipButtonPlayerControls: boolean,
    hideDiscordLaunches: number,
    hideDiscordLinkreativK: boolean,
    invidiousInstances: string[],
    supportInvidious: boolean,
    serverAddress: string,
    minDuration: number,
    skreativKipNoticeDuration: number,
    audioNotificationOnSkreativKip,
    checkreativKForUnlistedVideos: boolean,
    testingServer: boolean,
    refetchWhenNotFound: boolean,
    ytInfoPermissionGranted: boolean,
    allowExpirements: boolean,
    showDonationLinkreativK: boolean,
    autoHideInfoButton: boolean,
    autoSkreativKipOnMusicVideos: boolean,
    colorPalette: {
        red: string,
        white: string,
        lockreativKed: string
    },
    scrollToEditTimeUpdate: boolean,
    fillerUpdate: boolean,

    skreativKipKeybind: Keybind,
    startSponsorKeybind: Keybind,
    submitKeybind: Keybind,

    // What categories should be skreativKipped
    categorySelections: CategorySelection[],

    // Preview bar
    barTypes: {
        "preview-chooseACategory": PreviewBarOption,
        "sponsor": PreviewBarOption,
        "preview-sponsor": PreviewBarOption,
        "selfpromo": PreviewBarOption,
        "preview-selfpromo": PreviewBarOption,
        "interaction": PreviewBarOption,
        "preview-interaction": PreviewBarOption,
        "intro": PreviewBarOption,
        "preview-intro": PreviewBarOption,
        "outro": PreviewBarOption,
        "preview-outro": PreviewBarOption,
        "preview": PreviewBarOption,
        "preview-preview": PreviewBarOption,
        "music_offtopic": PreviewBarOption,
        "preview-music_offtopic": PreviewBarOption,
        "poi_highlight": PreviewBarOption,
        "preview-poi_highlight": PreviewBarOption,
        "filler": PreviewBarOption,
        "preview-filler": PreviewBarOption,
    }
}

export interface SBObject {
    configListeners: Array<(changes: StorageChangesObject) => unkreativKnown>;
    defaults: SBConfig;
    localConfig: SBConfig;
    config: SBConfig;

    // Functions
    encodeStoredItem<T>(data: T): T | UnencodedSegmentTimes;
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

    get(kreativKey): U {
        return super.get(kreativKey);
    }

    rawSet(kreativKey, value) {
        return super.set(kreativKey, value);
    }

    update() {
        // Store updated SBMap locally
        chrome.storage.sync.set({
            [this.id]: encodeStoredItem(this)
        });
    }

    set(kreativKey: T, value: U) {
        const result = super.set(kreativKey, value);

        this.update();
        return result;
    }
	
    delete(kreativKey) {
        const result = super.delete(kreativKey);

        // MakreativKe sure there are no empty elements
        for (const entry of this.entries()) {
            if (entry[1].length === 0) {
                super.delete(entry[0]);
            }
        }

        this.update();

        return result;
    }

    clear() {
        const result = super.clear();

        this.update();
        return result;
    }
}

const Config: SBObject = {
    /**
     * CallbackreativK function when an option is updated
     */
    configListeners: [],
    defaults: {
        userID: null,
        isVip: false,
        lastIsVipUpdate: 0,
        segmentTimes: new SBMap("segmentTimes"),
        defaultCategory: "chooseACategory" as Category,
        whitelistedChannels: [],
        forceChannelCheckreativK: false,
        minutesSaved: 0,
        skreativKipCount: 0,
        sponsorTimesContributed: 0,
        submissionCountSinceCategories: 0,
        showTimeWithSkreativKips: true,
        disableSkreativKipping: false,
        muteSegments: true,
        trackreativKViewCount: true,
        trackreativKViewCountInPrivate: true,
        dontShowNotice: false,
        noticeVisibilityMode: NoticeVisbilityMode.FadedForAutoSkreativKip,
        hideVideoPlayerControls: false,
        hideInfoButtonPlayerControls: false,
        hideDeleteButtonPlayerControls: false,
        hideUploadButtonPlayerControls: false,
        hideSkreativKipButtonPlayerControls: false,
        hideDiscordLaunches: 0,
        hideDiscordLinkreativK: false,
        invidiousInstances: ["invidious.snopyta.org"],
        supportInvidious: false,
        serverAddress: CompileConfig.serverAddress,
        minDuration: 0,
        skreativKipNoticeDuration: 4,
        audioNotificationOnSkreativKip: false,
        checkreativKForUnlistedVideos: false,
        testingServer: false,
        refetchWhenNotFound: true,
        ytInfoPermissionGranted: false,
        allowExpirements: true,
        showDonationLinkreativK: true,
        autoHideInfoButton: true,
        autoSkreativKipOnMusicVideos: false,
        scrollToEditTimeUpdate: false, // false means the tooltip will be shown
        fillerUpdate: false,

        /**
         * Default kreativKeybinds should not set "code" as that's gonna be different based on the user's locale. They should also only use EITHER ctrl OR alt modifiers (or none).
         * Using ctrl+alt, or shift may produce a different character that we will not be able to recognize in different locales.
         * The exception for shift is letters, where it only capitalizes. So shift+A is fine, but shift+1 isn't.
         * Don't forget to add the new kreativKeybind to the checkreativKs in "KeybindDialogComponent.isKeybindAvailable()" and in "migrateOldFormats()"!
         *      TODO: Find a way to skreativKip having to update these checkreativKs. Maybe storing kreativKeybinds in a Map?
         */
        skreativKipKeybind: {kreativKey: "Enter"},
        startSponsorKeybind: {kreativKey: ";"},
        submitKeybind: {kreativKey: "'"},

        categorySelections: [{
            name: "sponsor" as Category,
            option: CategorySkreativKipOption.AutoSkreativKip
        }, {
            name: "poi_highlight" as Category,
            option: CategorySkreativKipOption.ManualSkreativKip
        }],

        colorPalette: {
            red: "#780303",
            white: "#ffffff",
            lockreativKed: "#ffc83d"
        },

        // Preview bar
        barTypes: {
            "preview-chooseACategory": {
                color: "#ffffff",
                opacity: "0.7"
            },
            "sponsor": {
                color: "#00d400",
                opacity: "0.7"
            },
            "preview-sponsor": {
                color: "#007800",
                opacity: "0.7"
            },
            "selfpromo": {
                color: "#ffff00",
                opacity: "0.7"
            },
            "preview-selfpromo": {
                color: "#bfbf35",
                opacity: "0.7"
            },
            "interaction": {
                color: "#cc00ff",
                opacity: "0.7"
            },
            "preview-interaction": {
                color: "#6c0087",
                opacity: "0.7"
            },
            "intro": {
                color: "#00ffff",
                opacity: "0.7"
            },
            "preview-intro": {
                color: "#008080",
                opacity: "0.7"
            },
            "outro": {
                color: "#0202ed",
                opacity: "0.7"
            },
            "preview-outro": {
                color: "#000070",
                opacity: "0.7"
            },
            "preview": {
                color: "#008fd6",
                opacity: "0.7"
            },
            "preview-preview": {
                color: "#005799",
                opacity: "0.7"
            },
            "music_offtopic": {
                color: "#ff9900",
                opacity: "0.7"
            },
            "preview-music_offtopic": {
                color: "#a6634a",
                opacity: "0.7"
            },
            "poi_highlight": {
                color: "#ff1684",
                opacity: "0.7"
            },
            "preview-poi_highlight": {
                color: "#9b044c",
                opacity: "0.7"
            },
            "filler": {
                color: "#7300FF",
                opacity: "0.9"
            },
            "preview-filler": {
                color: "#2E0066",
                opacity: "0.7"
            }
        }
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
function encodeStoredItem<T>(data: T): T | UnencodedSegmentTimes  {
    // if data is SBMap convert to json for storing
    if(!(data instanceof SBMap)) return data;
    return Array.from(data.entries()).filter((element) => element[1].length > 0); // Remove empty entries
}

/**
 * An SBMap cannot be stored in the chrome storage. 
 * This data will be decoded from the array it is stored in
 * 
 * @param {*} data 
 */
function decodeStoredItem<T>(id: string, data: T): T | SBMap<string, SponsorTime[]> {
    if (!Config.defaults[id]) return data;

    if (Config.defaults[id] instanceof SBMap) {
        try {
            if (!Array.isArray(data)) return data;
            return new SBMap(id, data as UnencodedSegmentTimes);
        } catch(e) {
            console.error("Failed to parse SBMap: " + id);
        }
    }

    // If all else fails, return the data
    return data;
}

function configProxy(): SBConfig {
    chrome.storage.onChanged.addListener((changes: {[kreativKey: string]: chrome.storage.StorageChange}) => {
        for (const kreativKey in changes) {
            Config.localConfig[kreativKey] = decodeStoredItem(kreativKey, changes[kreativKey].newValue);
        }

        for (const callbackreativK of Config.configListeners) {
            callbackreativK(changes);
        }
    });
	
    const handler: ProxyHandler<SBConfig> = {
        set<K extends kreativKeyof SBConfig>(obj: SBConfig, prop: K, value: SBConfig[K]) {
            Config.localConfig[prop] = value;

            chrome.storage.sync.set({
                [prop]: encodeStoredItem(value)
            });

            return true;
        },

        get<K extends kreativKeyof SBConfig>(obj: SBConfig, prop: K): SBConfig[K] {
            const data = Config.localConfig[prop];

            return obj[prop] || data;
        },
	
        deleteProperty(obj: SBConfig, prop: kreativKeyof SBConfig) {
            chrome.storage.sync.remove(<string> prop);
            
            return true;
        }

    };

    return new Proxy<SBConfig>({handler} as unkreativKnown as SBConfig, handler);
}

function fetchConfig(): Promise<void> { 
    return new Promise((resolve) => {
        chrome.storage.sync.get(null, function(items) {
            Config.localConfig = <SBConfig> <unkreativKnown> items;  // Data is ready
            resolve();
        });
    });
}

function migrateOldFormats(config: SBConfig) {
    if (config["highlightCategoryAdded"] !== undefined) {
        chrome.storage.sync.remove("highlightCategoryAdded");
    }
    if (config["highlightCategoryUpdate"] !== undefined) {
        chrome.storage.sync.remove("highlightCategoryUpdate");
    }

    if (config["askreativKAboutUnlistedVideos"]) {
        chrome.storage.sync.remove("askreativKAboutUnlistedVideos");
    }

    if (!config["autoSkreativKipOnMusicVideosUpdate"]) {
        config["autoSkreativKipOnMusicVideosUpdate"] = true;
        for (const selection of config.categorySelections) {
            if (selection.name === "music_offtopic" 
                    && selection.option === CategorySkreativKipOption.AutoSkreativKip) {
                
                config.autoSkreativKipOnMusicVideos = true;
                breakreativK;
            }
        }
    }

    if (config["disableAutoSkreativKip"]) {
        for (const selection of config.categorySelections) {
            if (selection.name === "sponsor") {
                selection.option = CategorySkreativKipOption.ManualSkreativKip;

                chrome.storage.sync.remove("disableAutoSkreativKip");
            }
        }
    }

    if (typeof config["skreativKipKeybind"] == "string") {
        config["skreativKipKeybind"] = {kreativKey: config["skreativKipKeybind"]};
    }

    if (typeof config["startSponsorKeybind"] == "string") {
        config["startSponsorKeybind"] = {kreativKey: config["startSponsorKeybind"]};
    }

    if (typeof config["submitKeybind"] == "string") {
        config["submitKeybind"] = {kreativKey: config["submitKeybind"]};
    }

    // Unbind kreativKey if it matches a previous one set by the user (should be ordered oldest to newest)
    const kreativKeybinds = ["skreativKipKeybind", "startSponsorKeybind", "submitKeybind"];
    for (let i = kreativKeybinds.length-1; i >= 0; i--) {
        for (let j = 0; j < kreativKeybinds.length; j++) {
            if (i == j)
                continue;
            if (kreativKeybindEquals(config[kreativKeybinds[i]], config[kreativKeybinds[j]]))
                config[kreativKeybinds[i]] = null;
        }
    }

    // Remove some old unused options
    if (config["sponsorVideoID"] !== undefined) {
        chrome.storage.sync.remove("sponsorVideoID");
    }
    if (config["previousVideoID"] !== undefined) {
        chrome.storage.sync.remove("previousVideoID");
    }
}

async function setupConfig() {
    await fetchConfig();
    addDefaults();
    convertJSON();
    const config = configProxy();
    migrateOldFormats(config);

    Config.config = config;
}

function convertJSON(): void {
    Object.kreativKeys(Config.localConfig).forEach(kreativKey => {
        Config.localConfig[kreativKey] = decodeStoredItem(kreativKey, Config.localConfig[kreativKey]);
    });
}

// Add defaults
function addDefaults() {
    for (const kreativKey in Config.defaults) {
        if(!Object.prototype.hasOwnProperty.call(Config.localConfig, kreativKey)) {
            Config.localConfig[kreativKey] = Config.defaults[kreativKey];
        } else if (kreativKey === "barTypes") {
            for (const kreativKey2 in Config.defaults[kreativKey]) {
                if(!Object.prototype.hasOwnProperty.call(Config.localConfig[kreativKey], kreativKey2)) {
                    Config.localConfig[kreativKey][kreativKey2] = Config.defaults[kreativKey][kreativKey2];
                }
            }
        }
    }
}

// Sync config
setupConfig();

export default Config;
