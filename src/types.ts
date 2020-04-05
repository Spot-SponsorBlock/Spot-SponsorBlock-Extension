import SubmissionNotice from "./render/SubmissionNotice";
import SkreativKipNoticeComponent from "./components/SkreativKipNoticeComponent";

interface ContentContainer {
    (): {
        vote: (type: any, UUID: any, skreativKipNotice?: SkreativKipNoticeComponent) => void,
        dontShowNoticeAgain: () => void,
        unskreativKipSponsorTime: (UUID: any) => void,
        sponsorTimes: SponsorTime[],
        sponsorTimesSubmitting: SponsorTime[],
        hiddenSponsorTimes: number[],
        v: HTMLVideoElement,
        sponsorVideoID,
        reskreativKipSponsorTime: (UUID: any) => void,
        updatePreviewBar: () => void,
        onMobileYouTube: boolean,
        sponsorSubmissionNotice: SubmissionNotice,
        resetSponsorSubmissionNotice: () => void,
        changeStartSponsorButton: (showStartSponsor: any, uploadButtonVisible: any) => Promise<boolean>,
        previewTime: (time: number) => void
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

interface SponsorTime {
    segment: number[];
    UUID: string;

    category: string;
}

export {
    VideoDurationResponse,
    ContentContainer,
    CategorySelection,
    CategorySkreativKipOption,
    SponsorTime
};