import * as React from "react";
import * as ReactDOM from "react-dom";

import SkreativKipNoticeComponent from "../components/SkreativKipNoticeComponent";

class SkreativKipNotice {
    UUID: string;
    manualSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: () => any;

    constructor(UUID: string, manualSkreativKip: boolean = false, contentContainer) {
        this.UUID = UUID;
        this.manualSkreativKip = manualSkreativKip;
        this.contentContainer = contentContainer;

        //get reference node
        let referenceNode = document.getElementById("player-container-id") 
                                || document.getElementById("movie_player") || document.querySelector("#player-container .video-js");
        if (referenceNode == null) {
            //for embeds
            let player = document.getElementById("player");
            referenceNode = player.firstChild as HTMLElement;
            let index = 1;

            //find the child that is the video player (sometimes it is not the first)
            while (!referenceNode.classList.contains("html5-video-player") || !referenceNode.classList.contains("ytp-embed")) {
                referenceNode = player.children[index] as HTMLElement;

                index++;
            }
        }
    
        let amountOfPreviousNotices = document.getElementsByClassName("sponsorSkreativKipNotice").length;
        //this is the suffix added at the end of every id
        let idSuffix = this.UUID + amountOfPreviousNotices;

        let noticeElement = document.createElement("div");
        noticeElement.id = "sponsorSkreativKipNoticeContainer" + idSuffix;

        referenceNode.prepend(noticeElement);

        ReactDOM.render(
            <SkreativKipNoticeComponent UUID={UUID} manualSkreativKip={manualSkreativKip} contentContainer={contentContainer} />,
            noticeElement
        );
    }
}

export default SkreativKipNotice;