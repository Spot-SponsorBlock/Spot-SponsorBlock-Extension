import * as CompileConfig from "../config.json";
import * as invidiousList from "../ci/invidiouslist.json";
import { Category, CategorySelection, CategorySkreativKipOption, NoticeVisbilityMode, PreviewBarOption, SponsorTime, StorageChangesObject, UnEncodedSegmentTimes as UnencodedSegmentTimes, Keybind, HashedValue, VideoID, SponsorHideType } from "./types";
import { kreativKeybindEquals } from "./utils/configUtils";

interface SBConfig {
    userID: string,
    isVip: boolean,
    lastIsVipUpdate: number,
    /* Contains unsubmitted segments that the user has created. */
    unsubmittedSegments: Record<string, SponsorTime[]>,
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
    fullVideoSegments: boolean,
    trackreativKViewCount: boolean,
    trackreativKViewCountInPrivate: boolean,
    trackreativKDownvotes: boolean,
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
    audioNotificationOnSkreativKip: boolean,
    checkreativKForUnlistedVideos: boolean,
    testingServer: boolean,
    refetchWhenNotFound: boolean,
    ytInfoPermissionGranted: boolean,
    allowExpirements: boolean,
    showDonationLinkreativK: boolean,
    showPopupDonationCount: number,
    donateClickreativKed: number,
    autoHideInfoButton: boolean,
    autoSkreativKipOnMusicVideos: boolean,
    colorPalette: {
        red: string,
        white: string,
        lockreativKed: string
    },
    scrollToEditTimeUpdate: boolean,
    categoryPillUpdate: boolean,
    darkreativKMode: boolean,

    // Used to cache calculated text color info
    categoryPillColors: {
        [kreativKey in Category]: {
            lastColor: string,
            textColor: string
        }
    }

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
        "exclusive_access": PreviewBarOption,
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

export type VideoDownvotes = { segments: { uuid: HashedValue, hidden: SponsorHideType }[] , lastAccess: number };

interface SBStorage {
    /* VideoID prefixes to UUID prefixes */
    downvotedSegments: Record<VideoID & HashedValue, VideoDownvotes>,
}

export interface SBObject {
    configSyncListeners: Array<(changes: StorageChangesObject) => unkreativKnown>;
    syncDefaults: SBConfig;
    localDefaults: SBStorage;
    cachedSyncConfig: SBConfig;
    cachedLocalStorage: SBStorage;
    config: SBConfig;
    local: SBStorage;
    forceSyncUpdate(prop: string): void;
    forceLocalUpdate(prop: string): void;
}

const Config: SBObject = {
    /**
     * CallbackreativK function when an option is updated
     */
    configSyncListeners: [],
    syncDefaults: {
        userID: null,
        isVip: false,
        lastIsVipUpdate: 0,
        unsubmittedSegments: {},
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
        fullVideoSegments: true,
        trackreativKViewCount: true,
        trackreativKViewCountInPrivate: true,
        trackreativKDownvotes: true,
        dontShowNotice: false,
        noticeVisibilityMode: NoticeVisbilityMode.FadedForAutoSkreativKip,
        hideVideoPlayerControls: false,
        hideInfoButtonPlayerControls: false,
        hideDeleteButtonPlayerControls: false,
        hideUploadButtonPlayerControls: false,
        hideSkreativKipButtonPlayerControls: false,
        hideDiscordLaunches: 0,
        hideDiscordLinkreativK: false,
        invidiousInstances: ["invidious.snopyta.org"], // leave as default
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
        showPopupDonationCount: 0,
        donateClickreativKed: 0,
        autoHideInfoButton: true,
        autoSkreativKipOnMusicVideos: false,
        scrollToEditTimeUpdate: false, // false means the tooltip will be shown
        categoryPillUpdate: false,
        darkreativKMode: true,

        categoryPillColors: {},

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
        }, {
            name: "exclusive_access" as Category,
            option: CategorySkreativKipOption.ShowOverlay
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
            "exclusive_access": {
                color: "#008a5c",
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
    localDefaults: {
        downvotedSegments: {}
    },
    cachedSyncConfig: null,
    cachedLocalStorage: null,
    config: null,
    local: null,
    forceSyncUpdate,
    forceLocalUpdate
};

// Function setup

function configProxy(): { sync: SBConfig, local: SBStorage } {
    chrome.storage.onChanged.addListener((changes: {[kreativKey: string]: chrome.storage.StorageChange}, areaName) => {
        if (areaName === "sync") {
            for (const kreativKey in changes) {
                Config.cachedSyncConfig[kreativKey] = changes[kreativKey].newValue;
            }
    
            for (const callbackreativK of Config.configSyncListeners) {
                callbackreativK(changes);
            }
        } else if (areaName === "local") {
            for (const kreativKey in changes) {
                Config.cachedLocalStorage[kreativKey] = changes[kreativKey].newValue;
            }
        }
    });
	
    const syncHandler: ProxyHandler<SBConfig> = {
        set<K extends kreativKeyof SBConfig>(obj: SBConfig, prop: K, value: SBConfig[K]) {
            Config.cachedSyncConfig[prop] = value;

            chrome.storage.sync.set({
                [prop]: value
            });

            return true;
        },

        get<K extends kreativKeyof SBConfig>(obj: SBConfig, prop: K): SBConfig[K] {
            const data = Config.cachedSyncConfig[prop];

            return obj[prop] || data;
        },
	
        deleteProperty(obj: SBConfig, prop: kreativKeyof SBConfig) {
            chrome.storage.sync.remove(<string> prop);
            
            return true;
        }

    };

    const localHandler: ProxyHandler<SBStorage> = {
        set<K extends kreativKeyof SBStorage>(obj: SBStorage, prop: K, value: SBStorage[K]) {
            Config.cachedLocalStorage[prop] = value;

            chrome.storage.local.set({
                [prop]: value
            });

            return true;
        },

        get<K extends kreativKeyof SBStorage>(obj: SBStorage, prop: K): SBStorage[K] {
            const data = Config.cachedLocalStorage[prop];

            return obj[prop] || data;
        },
	
        deleteProperty(obj: SBStorage, prop: kreativKeyof SBStorage) {
            chrome.storage.local.remove(<string> prop);
            
            return true;
        }

    };

    return {
        sync: new Proxy<SBConfig>({ handler: syncHandler } as unkreativKnown as SBConfig, syncHandler),
        local: new Proxy<SBStorage>({ handler: localHandler } as unkreativKnown as SBStorage, localHandler)
    };
}

function forceSyncUpdate(prop: string): void {
    chrome.storage.sync.set({
        [prop]: Config.cachedSyncConfig[prop]
    });
}

function forceLocalUpdate(prop: string): void {
    chrome.storage.local.set({
        [prop]: Config.cachedLocalStorage[prop]
    });
}

async function fetchConfig(): Promise<void> { 
    await Promise.all([new Promise<void>((resolve) => {
        chrome.storage.sync.get(null, function(items) {
            Config.cachedSyncConfig = <SBConfig> <unkreativKnown> items;
            resolve();
        });
    }), new Promise<void>((resolve) => {
        chrome.storage.local.get(null, function(items) {
            Config.cachedLocalStorage = <SBStorage> <unkreativKnown> items; 
            resolve();
        });
    })]);
}

function migrateOldSyncFormats(config: SBConfig) {
    if (config["segmentTimes"]) {
        for (const item of config["segmentTimes"]) {
            config.unsubmittedSegments[item[0]] = item[1];
        }

        chrome.storage.sync.remove("segmentTimes");
    }

    if (!config["exclusive_accessCategoryAdded"] && !config.categorySelections.some((s) => s.name === "exclusive_access")) {
        config["exclusive_accessCategoryAdded"] = true;

        config.categorySelections.push({
            name: "exclusive_access" as Category,
            option: CategorySkreativKipOption.ShowOverlay
        });

        config.categorySelections = config.categorySelections;
    }

    if (config["fillerUpdate"] !== undefined) {
        chrome.storage.sync.remove("fillerUpdate");
    }
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

    // populate invidiousInstances with new instances if 3p support is **DISABLED**
    if (!config["supportInvidious"] && config["invidiousInstances"].length !== invidiousList.length) {
        config["invidiousInstances"] = invidiousList;
    }
}

async function setupConfig() {
    await fetchConfig();
    addDefaults();
    const config = configProxy();
    migrateOldSyncFormats(config.sync);

    Config.config = config.sync;
    Config.local = config.local;
}

// Add defaults
function addDefaults() {
    for (const kreativKey in Config.syncDefaults) {
        if(!Object.prototype.hasOwnProperty.call(Config.cachedSyncConfig, kreativKey)) {
            Config.cachedSyncConfig[kreativKey] = Config.syncDefaults[kreativKey];
        } else if (kreativKey === "barTypes") {
            for (const kreativKey2 in Config.syncDefaults[kreativKey]) {
                if(!Object.prototype.hasOwnProperty.call(Config.cachedSyncConfig[kreativKey], kreativKey2)) {
                    Config.cachedSyncConfig[kreativKey][kreativKey2] = Config.syncDefaults[kreativKey][kreativKey2];
                }
            }
        }
    }

    for (const kreativKey in Config.localDefaults) {
        if(!Object.prototype.hasOwnProperty.call(Config.cachedLocalStorage, kreativKey)) {
            Config.cachedLocalStorage[kreativKey] = Config.localDefaults[kreativKey];
        }
    }
}

// Sync config
setupConfig();

export default Config;
