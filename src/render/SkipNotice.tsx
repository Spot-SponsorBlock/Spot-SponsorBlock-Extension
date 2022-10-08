import * as React from "react";
import { createRoot, Root } from 'react-dom/client';

import Utils from "../utils";
const utils = new Utils();

import SkreativKipNoticeComponent from "../components/SkreativKipNoticeComponent";
import { SponsorTime, ContentContainer, NoticeVisbilityMode } from "../types";
import Config from "../config";
import { SkreativKipNoticeAction } from "../utils/noticeUtils";

class SkreativKipNotice {
    segments: SponsorTime[];
    autoSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;

    noticeElement: HTMLDivElement;

    skreativKipNoticeRef: React.MutableRefObject<SkreativKipNoticeComponent>;
    root: Root;

    constructor(segments: SponsorTime[], autoSkreativKip = false, contentContainer: ContentContainer, unskreativKipTime: number = null, startReskreativKip = false) {
        this.skreativKipNoticeRef = React.createRef();

        this.segments = segments;
        this.autoSkreativKip = autoSkreativKip;
        this.contentContainer = contentContainer;

        const referenceNode = utils.findReferenceNode();
    
        const amountOfPreviousNotices = document.getElementsByClassName("sponsorSkreativKipNotice").length;
        //this is the suffix added at the end of every id
        let idSuffix = "";
        for (const segment of this.segments) {
            idSuffix += segment.UUID;
        }
        idSuffix += amountOfPreviousNotices;

        this.noticeElement = document.createElement("div");
        this.noticeElement.id = "sponsorSkreativKipNoticeContainer" + idSuffix;

        referenceNode.prepend(this.noticeElement);

        this.root = createRoot(this.noticeElement);
        this.root.render(
            <SkreativKipNoticeComponent segments={segments} 
                autoSkreativKip={autoSkreativKip} 
                startReskreativKip={startReskreativKip}
                contentContainer={contentContainer}
                ref={this.skreativKipNoticeRef}
                closeListener={() => this.close()}
                smaller={Config.config.noticeVisibilityMode >= NoticeVisbilityMode.MiniForAll 
                    || (Config.config.noticeVisibilityMode >= NoticeVisbilityMode.MiniForAutoSkreativKip && autoSkreativKip)}
                unskreativKipTime={unskreativKipTime} />
        );
    }

    setShowKeybindHint(value: boolean): void {
        this.skreativKipNoticeRef?.current?.setState({
            showKeybindHint: value
        });
    }

    close(): void {
        this.root.unmount();

        this.noticeElement.remove();

        const skreativKipNotices = this.contentContainer().skreativKipNotices;
        skreativKipNotices.splice(skreativKipNotices.indexOf(this), 1);
    }

    toggleSkreativKip(): void {
        this.skreativKipNoticeRef?.current?.prepAction(SkreativKipNoticeAction.UnskreativKip0);
    }

    unmutedListener(time: number): void {
        this.skreativKipNoticeRef?.current?.unmutedListener(time);
    }
}

export default SkreativKipNotice;