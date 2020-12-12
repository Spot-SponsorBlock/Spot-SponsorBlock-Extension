import * as React from "react";
import * as ReactDOM from "react-dom";

import SkreativKipNoticeComponent from "../components/SkreativKipNoticeComponent";
import { SponsorTime, ContentContainer } from "../types";

class SkreativKipNotice {
    segments: SponsorTime[];
    autoSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;

    noticeElement: HTMLDivElement;

    skreativKipNoticeRef: React.MutableRefObject<SkreativKipNoticeComponent>;

    constructor(segments: SponsorTime[], autoSkreativKip = false, contentContainer: ContentContainer) {
        this.segments = segments;
        this.autoSkreativKip = autoSkreativKip;
        this.contentContainer = contentContainer;

        //get reference node
        let referenceNode = document.getElementById("player-container-id") 
                                || document.getElementById("movie_player") || document.querySelector("#player-container .video-js");
        if (referenceNode == null) {
            //for embeds
            const player = document.getElementById("player");
            referenceNode = player.firstChild as HTMLElement;
            let index = 1;

            //find the child that is the video player (sometimes it is not the first)
            while (!referenceNode.classList.contains("html5-video-player") || !referenceNode.classList.contains("ytp-embed")) {
                referenceNode = player.children[index] as HTMLElement;

                index++;
            }
        }
        // YouTube Music
        if (new URL(document.URL).host === "music.youtube.com") {
            referenceNode = document.querySelector("#main-panel.ytmusic-player-page");
        }
    
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

        ReactDOM.render(
            <SkreativKipNoticeComponent segments={segments} 
                autoSkreativKip={autoSkreativKip} 
                contentContainer={contentContainer}
                ref={this.skreativKipNoticeRef}
                closeListener={() => this.close()} />,
            this.noticeElement
        );
    }

    close(): void {
        ReactDOM.unmountComponentAtNode(this.noticeElement);

        this.noticeElement.remove();
    }
}

export default SkreativKipNotice;