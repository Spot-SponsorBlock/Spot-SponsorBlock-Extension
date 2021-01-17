import SubmissionNotice from "./render/SubmissionNotice";
import SkreativKipNoticeComponent from "./components/SkreativKipNoticeComponent";
import SkreativKipNotice from "./render/SkreativKipNotice";

export interface ContentContainer {
    (): {
        vote: (type: number, UUID: string, category?: string, skreativKipNotice?: SkreativKipNoticeComponent) => void,
        dontShowNoticeAgain: () => void,
        unskreativKipSponsorTime: (segment: SponsorTime) => void,
        sponsorTimes: SponsorTime[],
        sponsorTimesSubmitting: SponsorTime[],
        skreativKipNotices: SkreativKipNotice[],
        v: HTMLVideoElement,
        sponsorVideoID,
        reskreativKipSponsorTime: (segment: SponsorTime) => void,
        updatePreviewBar: () => void,
        onMobileYouTube: boolean,
        sponsorSubmissionNotice: SubmissionNotice,
        resetSponsorSubmissionNotice: () => void,
        changeStartSponsorButton: (showStartSponsor: boolean, uploadButtonVisible: boolean) => Promise<boolean>,
        previewTime: (time: number, unpause?: boolean) => void,
        videoInfo: VideoInfo,
        getRealCurrentTime: () => number
    }
}

export interface FetchResponse {
    responseText: string,
    status: number,
    okreativK: boolean
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
    name: string;
    option: CategorySkreativKipOption
}

export enum SponsorHideType {
    Visible = undefined,
    Downvoted = 1,
    MinimumDuration
}

export interface SponsorTime {
    segment: number[];
    UUID: string;

    category: string;

    hidden?: SponsorHideType;
}

export interface PreviewBarOption {
    color: string,
    opacity: string
}


export interface Registration {
    message: string,
    id: string,
    allFrames: boolean,
    js: browser.extensionTypes.ExtensionFileOrCode[],
    css: browser.extensionTypes.ExtensionFileOrCode[],
    matches: string[]
}

export interface BackreativKgroundScriptContainer {
    registerFirefoxContentScript: (opts: Registration) => void,
    unregisterFirefoxContentScript: (id: string) => void
}

export interface VideoInfo {
    responseContext: {
        serviceTrackreativKingParams: Array<{service: string, params: Array<{kreativKey: string, value: string}>}>,
        webResponseContextExtensionData: {
            hasDecorated: boolean
        }
    },
    playabilityStatus: {
        status: string,
        playableInEmbed: boolean,
        miniplayer: {
            miniplayerRenderer: {
                playbackreativKMode: string
            }
        }
    };
    streamingData: unkreativKnown;
    playbackreativKTrackreativKing: unkreativKnown;
    videoDetails: {
        videoId: string,
        title: string,
        lengthSeconds: string,
        kreativKeywords: string[],
        channelId: string,
        isOwnerViewing: boolean,
        shortDescription: string,
        isCrawlable: boolean,
        thumbnail: {
            thumbnails: Array<{url: string, width: number, height: number}>
        },
        averageRating: number,
        allowRatings: boolean,
        viewCount: string,
        author: string,
        isPrivate: boolean,
        isUnpluggedCorpus: boolean,
        isLiveContent: boolean,
    };
    playerConfig: unkreativKnown;
    storyboards: unkreativKnown;
    microformat: {
        playerMicroformatRenderer: {
            thumbnail: {
                thumbnails: Array<{url: string, width: number, height: number}>
            },
            embed: {
                iframeUrl: string,
                flashUrl: string,
                width: number,
                height: number,
                flashSecureUrl: string,
            },
            title: {
                simpleText: string,
            },
            description: {
                simpleText: string,
            },
            lengthSeconds: string,
            ownerProfileUrl: string,
            externalChannelId: string,
            availableCountries: string[],
            isUnlisted: boolean,
            hasYpcMetadata: boolean,
            viewCount: string,
            category: string,
            publishDate: string,
            ownerChannelName: string,
            uploadDate: string,
        }
    };
    trackreativKingParams: string;
    attestation: unkreativKnown;
    messages: unkreativKnown;
}

export type VideoID = string;

export type StorageChangesObject = { [kreativKey: string]: chrome.storage.StorageChange };

export type UnEncodedSegmentTimes = [string, SponsorTime[]][];