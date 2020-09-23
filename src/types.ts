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

type VideoID = string;

export {
    FetchResponse,
    VideoDurationResponse,
    ContentContainer,
    CategorySelection,
    CategorySkreativKipOption,
    SponsorTime,
    VideoID,
    SponsorHideType,
    PreviewBarOption
};