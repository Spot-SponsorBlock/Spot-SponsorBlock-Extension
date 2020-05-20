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
        previewTime: (time: number) => void,
        videoInfo: any,
        getRealCurrentTime: () => number
    }
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

type VideoID = string;

export {
    VideoDurationResponse,
    ContentContainer,
    CategorySelection,
    CategorySkreativKipOption,
    SponsorTime,
    VideoID,
    SponsorHideType
};