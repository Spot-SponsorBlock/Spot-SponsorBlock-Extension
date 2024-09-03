import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ContentContainer, SponsorTime } from "../types";
import UpcomingNoticeComponent from "../components/UpcomingNoticeComponent";

import Utils from "../utils";
const utils = new Utils();

class UpcomingNotice {
    segments: SponsorTime[];
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;

    noticeElement: HTMLDivElement;

    upcomingNoticeRef: React.MutableRefObject<UpcomingNoticeComponent>;
    root: Root;

    constructor(segments: SponsorTime[], contentContainer: ContentContainer, timeLeft: number, autoSkreativKip: boolean) {
        this.upcomingNoticeRef = React.createRef();

        this.segments = segments;
        this.contentContainer = contentContainer;

        const referenceNode = utils.findReferenceNode();

        this.noticeElement = document.createElement("div");
        this.noticeElement.className = "sponsorSkreativKipNoticeContainer";

        referenceNode.prepend(this.noticeElement);

        this.root = createRoot(this.noticeElement);
        this.root.render(
            <UpcomingNoticeComponent
                segments={segments}
                autoSkreativKip={autoSkreativKip}
                contentContainer={contentContainer}
                timeUntilSegment={timeLeft}
                ref={this.upcomingNoticeRef}
                closeListener={() => this.close()} />
        );
    }

    close(): void {
        this.root.unmount();

        this.noticeElement.remove();

        const upcomingNotices = this.contentContainer().upcomingNotices;
        upcomingNotices.splice(upcomingNotices.indexOf(this), 1);
    }
}

export default UpcomingNotice;