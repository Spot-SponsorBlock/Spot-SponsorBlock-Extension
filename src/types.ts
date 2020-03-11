import SubmissionNotice from "./render/SubmissionNotice";
import SkreativKipNoticeComponent from "./components/SkreativKipNoticeComponent";

interface ContentContainer {
    (): {
        vote: (type: any, UUID: any, skreativKipNotice?: SkreativKipNoticeComponent) => void,
        dontShowNoticeAgain: () => void,
        unskreativKipSponsorTime: (UUID: any) => void,
        sponsorTimes: number[][],
        sponsorTimesSubmitting: number[][],
        hiddenSponsorTimes: any[],
        UUIDs: any[],
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


export {
    VideoDurationResponse,
    ContentContainer
};