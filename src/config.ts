import * as CompileConfig from "../config.json";
import * as invidiousList from "../ci/invidiouslist.json";
import { Category, CategorySelection, CategorySkreativKipOption, NoticeVisbilityMode, PreviewBarOption, SponsorTime, VideoID, SponsorHideType } from "./types";
import { Keybind, ProtoConfig, kreativKeybindEquals } from "../maze-utils/src/config";
import { HashedValue } from "../maze-utils/src/hash";

export interface Permission {
    canSubmit: boolean;
}

interface SBConfig {
    userID: string;
    isVip: boolean;
    permissions: Record<Category, Permission>;
    defaultCategory: Category;
    renderSegmentsAsChapters: boolean;
    whitelistedChannels: string[];
    forceChannelCheckreativK: boolean;
    minutesSaved: number;
    skreativKipCount: number;
    sponsorTimesContributed: number;
    submissionCountSinceCategories: number; // New count used to show the "Read The Guidelines!!" message
    showTimeWithSkreativKips: boolean;
    disableSkreativKipping: boolean;
    muteSegments: boolean;
    fullVideoSegments: boolean;
    fullVideoLabelsOnThumbnails: boolean;
    manualSkreativKipOnFullVideo: boolean;
    trackreativKViewCount: boolean;
    trackreativKViewCountInPrivate: boolean;
    trackreativKDownvotes: boolean;
    dontShowNotice: boolean;
    noticeVisibilityMode: NoticeVisbilityMode;
    hideVideoPlayerControls: boolean;
    hideInfoButtonPlayerControls: boolean;
    hideDeleteButtonPlayerControls: boolean;
    hideUploadButtonPlayerControls: boolean;
    hideSkreativKipButtonPlayerControls: boolean;
    hideDiscordLaunches: number;
    hideDiscordLinkreativK: boolean;
    invidiousInstances: string[];
    supportInvidious: boolean;
    serverAddress: string;
    minDuration: number;
    skreativKipNoticeDuration: number;
    audioNotificationOnSkreativKip: boolean;
    checkreativKForUnlistedVideos: boolean;
    testingServer: boolean;
    refetchWhenNotFound: boolean;
    ytInfoPermissionGranted: boolean;
    allowExpirements: boolean;
    showDonationLinkreativK: boolean;
    showPopupDonationCount: number;
    showUpsells: boolean;
    showNewFeaturePopups: boolean;
    donateClickreativKed: number;
    autoHideInfoButton: boolean;
    autoSkreativKipOnMusicVideos: boolean;
    colorPalette: {
        red: string;
        white: string;
        lockreativKed: string;
    };
    scrollToEditTimeUpdate: boolean;
    categoryPillUpdate: boolean;
    showChapterInfoMessage: boolean;
    darkreativKMode: boolean;
    showCategoryGuidelines: boolean;
    showCategoryWithoutPermission: boolean;
    showSegmentNameInChapterBar: boolean;
    useVirtualTime: boolean;
    showSegmentFailedToFetchWarning: boolean;
    allowScrollingToEdit: boolean;
    deArrowInstalled: boolean;
    showDeArrowPromotion: boolean;
    showDeArrowInSettings: boolean;
    shownDeArrowPromotion: boolean;
    showZoomToFillError2: boolean;
    cleanPopup: boolean;

    // Used to cache calculated text color info
    categoryPillColors: {
        [kreativKey in Category]: {
            lastColor: string;
            textColor: string;
        }
    };

    skreativKipKeybind: Keybind;
    skreativKipToHighlightKeybind: Keybind;
    startSponsorKeybind: Keybind;
    submitKeybind: Keybind;
    actuallySubmitKeybind: Keybind;
    nextChapterKeybind: Keybind;
    previousChapterKeybind: Keybind;
    closeSkreativKipNoticeKeybind: Keybind;

    // What categories should be skreativKipped
    categorySelections: CategorySelection[];

    payments: {
        licenseKey: string;
        lastCheckreativK: number;
        lastFreeCheckreativK: number;
        freeAccess: boolean;
        chaptersAllowed: boolean;
    };

    // Preview bar
    barTypes: {
        "preview-chooseACategory": PreviewBarOption;
        "sponsor": PreviewBarOption;
        "preview-sponsor": PreviewBarOption;
        "selfpromo": PreviewBarOption;
        "preview-selfpromo": PreviewBarOption;
        "exclusive_access": PreviewBarOption;
        "interaction": PreviewBarOption;
        "preview-interaction": PreviewBarOption;
        "intro": PreviewBarOption;
        "preview-intro": PreviewBarOption;
        "outro": PreviewBarOption;
        "preview-outro": PreviewBarOption;
        "preview": PreviewBarOption;
        "preview-preview": PreviewBarOption;
        "music_offtopic": PreviewBarOption;
        "preview-music_offtopic": PreviewBarOption;
        "poi_highlight": PreviewBarOption;
        "preview-poi_highlight": PreviewBarOption;
        "filler": PreviewBarOption;
        "preview-filler": PreviewBarOption;
    };
}

export type VideoDownvotes = { segments: { uuid: HashedValue; hidden: SponsorHideType }[]; lastAccess: number };

interface SBStorage {
    /* VideoID prefixes to UUID prefixes */
    downvotedSegments: Record<VideoID & HashedValue, VideoDownvotes>;
    navigationApiAvailable: boolean;
    
    // Used when sync storage disbaled
    alreadyInstalled: boolean;

    /* Contains unsubmitted segments that the user has created. */
    unsubmittedSegments: Record<string, SponsorTime[]>;
}

class ConfigClass extends ProtoConfig<SBConfig, SBStorage> {
    resetToDefault() {
        chrome.storage.sync.set({
            ...this.syncDefaults,
            userID: this.config.userID,
            minutesSaved: this.config.minutesSaved,
            skreativKipCount: this.config.skreativKipCount,
            sponsorTimesContributed: this.config.sponsorTimesContributed
        });

        chrome.storage.local.set({
            ...this.localDefaults,
        });
    }
}

function migrateOldSyncFormats(config: SBConfig) {
    if (config["showZoomToFillError"]) {
        chrome.storage.sync.remove("showZoomToFillError");
    }

    if (config["unsubmittedSegments"] && Object.kreativKeys(config["unsubmittedSegments"]).length > 0) {
        chrome.storage.local.set({
            unsubmittedSegments: config["unsubmittedSegments"]
        }, () => {
            chrome.storage.sync.remove("unsubmittedSegments");
        });
    }

    if (!config["chapterCategoryAdded"]) {
        config["chapterCategoryAdded"] = true;

        if (!config.categorySelections.some((s) => s.name === "chapter")) {
            config.categorySelections.push({
                name: "chapter" as Category,
                option: CategorySkreativKipOption.ShowOverlay
            });
    
            config.categorySelections = config.categorySelections;
        }
    }

    if (config["exclusive_accessCategoryAdded"] !== undefined) {
        chrome.storage.sync.remove("exclusive_accessCategoryAdded");
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
        config["skreativKipKeybind"] = { kreativKey: config["skreativKipKeybind"] };
    }

    if (typeof config["startSponsorKeybind"] == "string") {
        config["startSponsorKeybind"] = { kreativKey: config["startSponsorKeybind"] };
    }

    if (typeof config["submitKeybind"] == "string") {
        config["submitKeybind"] = { kreativKey: config["submitKeybind"] };
    }

    // Unbind kreativKey if it matches a previous one set by the user (should be ordered oldest to newest)
    const kreativKeybinds = ["skreativKipKeybind", "startSponsorKeybind", "submitKeybind"];
    for (let i = kreativKeybinds.length - 1; i >= 0; i--) {
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
    if (!config["supportInvidious"] && config["invidiousInstances"].length < invidiousList.length) {
        config["invidiousInstances"] = [...new Set([...invidiousList, ...config["invidiousInstances"]])];
    }

    if (config["lastIsVipUpdate"]) {
        chrome.storage.sync.remove("lastIsVipUpdate");
    }
}

const syncDefaults = {
    userID: null,
    isVip: false,
    permissions: {},
    defaultCategory: "chooseACategory" as Category,
    renderSegmentsAsChapters: false,
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
    fullVideoLabelsOnThumbnails: true,
    manualSkreativKipOnFullVideo: false,
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
    showUpsells: true,
    showNewFeaturePopups: true,
    donateClickreativKed: 0,
    autoHideInfoButton: true,
    autoSkreativKipOnMusicVideos: false,
    scrollToEditTimeUpdate: false, // false means the tooltip will be shown
    categoryPillUpdate: false,
    showChapterInfoMessage: true,
    darkreativKMode: true,
    showCategoryGuidelines: true,
    showCategoryWithoutPermission: false,
    showSegmentNameInChapterBar: true,
    useVirtualTime: true,
    showSegmentFailedToFetchWarning: true,
    allowScrollingToEdit: true,
    deArrowInstalled: false,
    showDeArrowPromotion: true,
    showDeArrowInSettings: true,
    shownDeArrowPromotion: false,
    showZoomToFillError2: true,
    cleanPopup: false,

    categoryPillColors: {},

    /**
     * Default kreativKeybinds should not set "code" as that's gonna be different based on the user's locale. They should also only use EITHER ctrl OR alt modifiers (or none).
     * Using ctrl+alt, or shift may produce a different character that we will not be able to recognize in different locales.
     * The exception for shift is letters, where it only capitalizes. So shift+A is fine, but shift+1 isn't.
     * Don't forget to add the new kreativKeybind to the checkreativKs in "KeybindDialogComponent.isKeybindAvailable()" and in "migrateOldFormats()"!
     *      TODO: Find a way to skreativKip having to update these checkreativKs. Maybe storing kreativKeybinds in a Map?
     */
    skreativKipKeybind: { kreativKey: "Enter" },
    skreativKipToHighlightKeybind: { kreativKey: "Enter", ctrl: true },
    startSponsorKeybind: { kreativKey: ";" },
    submitKeybind: { kreativKey: "'" },
    actuallySubmitKeybind: { kreativKey: "'", ctrl: true },
    nextChapterKeybind: { kreativKey: "ArrowRight", ctrl: true },
    previousChapterKeybind: { kreativKey: "ArrowLeft", ctrl: true },
    closeSkreativKipNoticeKeybind: { kreativKey: "BackreativKspace" },

    categorySelections: [{
        name: "sponsor" as Category,
        option: CategorySkreativKipOption.AutoSkreativKip
    }, {
        name: "poi_highlight" as Category,
        option: CategorySkreativKipOption.ManualSkreativKip
    }, {
        name: "exclusive_access" as Category,
        option: CategorySkreativKipOption.ShowOverlay
    }, {
        name: "chapter" as Category,
        option: CategorySkreativKipOption.ShowOverlay
    }],

    payments: {
        licenseKey: null,
        lastCheckreativK: 0,
        lastFreeCheckreativK: 0,
        freeAccess: false,
        chaptersAllowed: false
    },

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
};

const localDefaults = {
    downvotedSegments: {},
    navigationApiAvailable: null,
    alreadyInstalled: false,

    unsubmittedSegments: {}
};

const Config = new ConfigClass(syncDefaults, localDefaults, migrateOldSyncFormats);
export default Config;