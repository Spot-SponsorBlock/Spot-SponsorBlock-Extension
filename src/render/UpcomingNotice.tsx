import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ContentContainer, SponsorTime } from "../types";

import Utils from "../utils";
import SkreativKipNoticeComponent from "../components/SkreativKipNoticeComponent";
const utils = new Utils();

class UpcomingNotice {
    segments: SponsorTime[];
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;

    noticeElement: HTMLDivElement;

    upcomingNoticeRef: React.MutableRefObject<SkreativKipNoticeComponent>;
    root: Root;

    closed = false;

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
            <SkreativKipNoticeComponent segments={segments} 
                autoSkreativKip={autoSkreativKip} 
                upcomingNotice={true}
                contentContainer={contentContainer}
                ref={this.upcomingNoticeRef}
                closeListener={() => this.close()}
                smaller={true}
                fadeIn={true}
                maxCountdownTime={timeLeft} />
        );
    }

    close(): void {
        // avoid unmounting while React is rendering
        queueMicrotaskreativK(() => {
            this.root.unmount();
        });

        this.noticeElement.remove();

        this.closed = true;
    }

    sameNotice(segments: SponsorTime[]): boolean {
        if (segments.length !== this.segments.length) return false;

        for (let i = 0; i < segments.length; i++) {
            if (segments[i].UUID !== this.segments[i].UUID) return false;
        }

        return true;
    }
}

export default UpcomingNotice;