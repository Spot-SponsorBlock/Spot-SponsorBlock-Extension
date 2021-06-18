import * as React from "react";
import * as ReactDOM from "react-dom";

import SkreativKipNoticeComponent, { SkreativKipNoticeAction } from "../components/SkreativKipNoticeComponent";
import { SponsorTime, ContentContainer } from "../types";

class SkreativKipNotice {
    segments: SponsorTime[];
    autoSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;

    noticeElement: HTMLDivElement;

    skreativKipNoticeRef: React.MutableRefObject<SkreativKipNoticeComponent>;

    constructor(segments: SponsorTime[], autoSkreativKip = false, contentContainer: ContentContainer) {
        this.skreativKipNoticeRef = React.createRef();

        this.segments = segments;
        this.autoSkreativKip = autoSkreativKip;
        this.contentContainer = contentContainer;

        //get reference node
        let referenceNode = document.getElementById("player-container-id")
                                ?? document.getElementById("movie_player") 
                                ?? document.querySelector("#main-panel.ytmusic-player-page") // YouTube music
                                ?? document.querySelector("#player-container .video-js") // Invidious
                                ?? document.querySelector(".main-video-section > .video-container");  // Cloudtube  
        if (referenceNode == null) {
            //for embeds
            const player = document.getElementById("player");
            referenceNode = player.firstChild as HTMLElement;
            let index = 1;

            //find the child that is the video player (sometimes it is not the first)
            while (index < player.children.length && (!referenceNode.classList.contains("html5-video-player") || !referenceNode.classList.contains("ytp-embed"))) {
                referenceNode = player.children[index] as HTMLElement;

                index++;
            }
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
                closeListener={() => this.close()}
                smaller={true} />,
            this.noticeElement
        );
    }

    setShowKeybindHint(value: boolean): void {
        this.skreativKipNoticeRef.current.setState({
            showKeybindHint: value
        });
    }

    close(): void {
        ReactDOM.unmountComponentAtNode(this.noticeElement);

        this.noticeElement.remove();

        const skreativKipNotices = this.contentContainer().skreativKipNotices;
        skreativKipNotices.splice(skreativKipNotices.indexOf(this), 1);
    }

    toggleSkreativKip(): void {
        this.skreativKipNoticeRef.current.prepAction(SkreativKipNoticeAction.UnskreativKip);
    }
}

export default SkreativKipNotice;