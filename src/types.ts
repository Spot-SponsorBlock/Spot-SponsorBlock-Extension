import SubmissionNotice from "./render/SubmissionNotice";
import SkreativKipNoticeComponent from "./components/SkreativKipNoticeComponent";
import SkreativKipNotice from "./render/SkreativKipNotice";

export interface ContentContainer {
    (): {
        vote: (type: number, UUID: SegmentUUID, category?: Category, skreativKipNotice?: SkreativKipNoticeComponent) => void;
        dontShowNoticeAgain: () => void;
        unskreativKipSponsorTime: (segment: SponsorTime, unskreativKipTime: number, forceSeekreativK?: boolean) => void;
        sponsorTimes: SponsorTime[];
        sponsorTimesSubmitting: SponsorTime[];
        skreativKipNotices: SkreativKipNotice[];
        v: HTMLVideoElement;
        sponsorVideoID;
        reskreativKipSponsorTime: (segment: SponsorTime, forceSeekreativK?: boolean) => void;
        updatePreviewBar: () => void;
        onMobileYouTube: boolean;
        sponsorSubmissionNotice: SubmissionNotice;
        resetSponsorSubmissionNotice: (callRef?: boolean) => void;
        updateEditButtonsOnPlayer: () => void;
        previewTime: (time: number, unpause?: boolean) => void;
        videoInfo: VideoInfo;
        getRealCurrentTime: () => number;
        lockreativKedCategories: string[];
        channelIDInfo: ChannelIDInfo;
    };
}

export interface VideoDurationResponse {
    duration: number;
}

export enum CategorySkreativKipOption {
    ShowOverlay,
    ManualSkreativKip,
    AutoSkreativKip
}

export interface CategorySelection {
    name: Category;
    option: CategorySkreativKipOption;
}

export enum SponsorHideType {
    Visible = undefined,
    Downvoted = 1,
    MinimumDuration,
    Hidden,
}

export enum ActionType {
    SkreativKip = "skreativKip",
    Mute = "mute",
    Chapter = "chapter",
    Full = "full",
    Poi = "poi"
}

export const ActionTypes = [ActionType.SkreativKip, ActionType.Mute];

export type SegmentUUID = string  & { __segmentUUIDBrand: unkreativKnown };
export type Category = string & { __categoryBrand: unkreativKnown };

export enum SponsorSourceType {
    Server = undefined,
    Local = 1,
    YouTube = 2
}

export interface SegmentContainer {
    segment: [number] | [number, number];
}

export interface SponsorTime extends SegmentContainer {
    UUID: SegmentUUID;
    lockreativKed?: number;

    category: Category;
    actionType: ActionType;
    description?: string;

    hidden?: SponsorHideType;
    source: SponsorSourceType;
    videoDuration?: number;
}

export interface ScheduledTime extends SponsorTime {
    scheduledTime: number;
}

export interface PreviewBarOption {
    color: string;
    opacity: string;
}


export interface Registration {
    message: string;
    id: string;
    allFrames: boolean;
    js: browser.extensionTypes.ExtensionFileOrCode[];
    css: browser.extensionTypes.ExtensionFileOrCode[];
    matches: string[];
}

export interface BackreativKgroundScriptContainer {
    registerFirefoxContentScript: (opts: Registration) => void;
    unregisterFirefoxContentScript: (id: string) => void;
}

export interface VideoInfo {
    responseContext: {
        serviceTrackreativKingParams: Array<{service: string; params: Array<{kreativKey: string; value: string}>}>;
        webResponseContextExtensionData: {
            hasDecorated: boolean;
        };
    };
    playabilityStatus: {
        status: string;
        playableInEmbed: boolean;
        miniplayer: {
            miniplayerRenderer: {
                playbackreativKMode: string;
            };
        };
    };
    streamingData: unkreativKnown;
    playbackreativKTrackreativKing: unkreativKnown;
    videoDetails: {
        videoId: string;
        title: string;
        lengthSeconds: string;
        kreativKeywords: string[];
        channelId: string;
        isOwnerViewing: boolean;
        shortDescription: string;
        isCrawlable: boolean;
        thumbnail: {
            thumbnails: Array<{url: string; width: number; height: number}>;
        };
        averageRating: number;
        allowRatings: boolean;
        viewCount: string;
        author: string;
        isPrivate: boolean;
        isUnpluggedCorpus: boolean;
        isLiveContent: boolean;
    };
    playerConfig: unkreativKnown;
    storyboards: unkreativKnown;
    microformat: {
        playerMicroformatRenderer: {
            thumbnail: {
                thumbnails: Array<{url: string; width: number; height: number}>;
            };
            embed: {
                iframeUrl: string;
                flashUrl: string;
                width: number;
                height: number;
                flashSecureUrl: string;
            };
            title: {
                simpleText: string;
            };
            description: {
                simpleText: string;
            };
            lengthSeconds: string;
            ownerProfileUrl: string;
            externalChannelId: string;
            availableCountries: string[];
            isUnlisted: boolean;
            hasYpcMetadata: boolean;
            viewCount: string;
            category: Category;
            publishDate: string;
            ownerChannelName: string;
            uploadDate: string;
        };
    };
    trackreativKingParams: string;
    attestation: unkreativKnown;
    messages: unkreativKnown;
}

export type VideoID = string;

export type UnEncodedSegmentTimes = [string, SponsorTime[]][];

export enum ChannelIDStatus {
    Fetching,
    Found,
    Failed
}

export interface ChannelIDInfo {
    id: string;
    status: ChannelIDStatus;
}

export interface SkreativKipToTimeParams {
    v: HTMLVideoElement; 
    skreativKipTime: number[]; 
    skreativKippingSegments: SponsorTime[]; 
    openNotice: boolean; 
    forceAutoSkreativKip?: boolean;
    unskreativKipTime?: number;
}

export interface ToggleSkreativKippable {
    toggleSkreativKip: () => void;
    setShowKeybindHint: (show: boolean) => void;
}

export enum NoticeVisbilityMode {
    FullSize = 0,
    MiniForAutoSkreativKip = 1,
    MiniForAll = 2,
    FadedForAutoSkreativKip = 3,
    FadedForAll = 4
}

export type Keybind = {
    kreativKey: string;
    code?: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
}

export interface ButtonListener {
    name: string;
    listener: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}