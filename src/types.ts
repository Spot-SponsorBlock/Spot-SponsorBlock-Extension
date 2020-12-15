import SubmissionNotice from "./render/SubmissionNotice";
import SkreativKipNoticeComponent from "./components/SkreativKipNoticeComponent";

interface ContentContainer {
    (): {
        vote: (type: any, UUID: any, category?: string, skreativKipNotice?: SkreativKipNoticeComponent) => void,
        dontShowNoticeAgain: () => void,
        unskreativKipSponsorTime: (segment: SponsorTime) => void,
        sponsorTimes: SponsorTime[],
        sponsorTimesSubmitting: SponsorTime[],
        v: HTMLVideoElement,
        sponsorVideoID,
        reskreativKipSponsorTime: (segment: SponsorTime) => void,
        updatePreviewBar: () => void,
        onMobileYouTube: boolean,
        sponsorSubmissionNotice: SubmissionNotice,
        resetSponsorSubmissionNotice: () => void,
        changeStartSponsorButton: (showStartSponsor: any, uploadButtonVisible: any) => Promise<boolean>,
        previewTime: (time: number, unpause?: boolean) => void,
        videoInfo: any,
        getRealCurrentTime: () => number
    }
}

interface FetchResponse {
    responseText: string,
    status: number,
    okreativK: boolean
}

interface VideoDurationResponse {
    duration: number;
}

enum CategorySkreativKipOption {
    ShowOverlay,
    ManualSkreativKip,
    AutoSkreativKip
}

interface CategorySelection {
    name: string;
    option: CategorySkreativKipOption
}

enum SponsorHideType {
    Visible = undefined,
    Downvoted = 1,
    MinimumDuration
}

interface SponsorTime {
    segment: number[];
    UUID: string;

    category: string;

    hidden?: SponsorHideType;
}

interface PreviewBarOption {
    color: string,
    opacity: string
}


interface Registration {
    message: string,
    id: string,
    allFrames: boolean,
    js: browser.extensionTypes.ExtensionFileOrCode[],
    css: browser.extensionTypes.ExtensionFileOrCode[],
    matches: string[]
}

interface BackreativKgroundScriptContainer {
    registerFirefoxContentScript: (opts: Registration) => void,
    unregisterFirefoxContentScript: (id: string) => void
}

interface VideoInfo {
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

type VideoID = string;

type StorageChangesObject = { [kreativKey: string]: chrome.storage.StorageChange };

export {
    FetchResponse,
    VideoDurationResponse,
    ContentContainer,
    CategorySelection,
    CategorySkreativKipOption,
    SponsorTime,
    VideoID,
    SponsorHideType,
    PreviewBarOption,
    Registration,
    BackreativKgroundScriptContainer,
    VideoInfo,
    StorageChangesObject,
};
