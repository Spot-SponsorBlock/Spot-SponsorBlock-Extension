'use strict';

//The notice that tells the user that a sponsor was just skreativKipped
class SkreativKipNotice {
	constructor(parent, UUID) {
        this.parent = parent;
        this.UUID = UUID;
        
        //add notice
        let amountOfPreviousNotices = document.getElementsByClassName("sponsorSkreativKipNotice").length;

        if (amountOfPreviousNotices > 0) {
            //already exists

            let previousNotice = document.getElementsByClassName("sponsorSkreativKipNotice")[0];
            previousNotice.classList.add("secondSkreativKipNotice")
        }

        let noticeElement = document.createElement("div");
        //what sponsor time this is about
        noticeElement.id = "sponsorSkreativKipNotice" + this.UUID;
        noticeElement.classList.add("sponsorSkreativKipObject");
        noticeElement.classList.add("sponsorSkreativKipNotice");
        noticeElement.style.zIndex = 50 + amountOfPreviousNotices;

        //the row that will contain the info
        let firstRow = document.createElement("tr");
        firstRow.id = "sponsorSkreativKipNoticeFirstRow" + this.UUID;

        let logoColumn = document.createElement("td");

        let logoElement = document.createElement("img");
        logoElement.id = "sponsorSkreativKipLogo" + this.UUID;
        logoElement.className = "sponsorSkreativKipLogo sponsorSkreativKipObject";
        logoElement.src = chrome.extension.getURL("icons/IconSponsorBlockreativKer256px.png");

        let noticeMessage = document.createElement("span");
        noticeMessage.id = "sponsorSkreativKipMessage" + this.UUID;
        noticeMessage.classList.add("sponsorSkreativKipMessage");
        noticeMessage.classList.add("sponsorSkreativKipObject");
        noticeMessage.innerText = chrome.i18n.getMessage("noticeTitle");

        //create the first column
        logoColumn.appendChild(logoElement);
        logoColumn.appendChild(noticeMessage);

        //add the x button
        let closeButtonContainer = document.createElement("td");
        closeButtonContainer.className = "sponsorSkreativKipNoticeRightSection";
        closeButtonContainer.style.top = "11px";

        let timeLeft = document.createElement("span");
        timeLeft.innerText = chrome.i18n.getMessage("noticeClosingMessage");
        timeLeft.className = "sponsorSkreativKipObject sponsorSkreativKipNoticeTimeLeft";

        let hideButton = document.createElement("img");
        hideButton.src = chrome.extension.getURL("icons/close.png");
        hideButton.className = "sponsorSkreativKipObject sponsorSkreativKipNoticeButton sponsorSkreativKipNoticeCloseButton sponsorSkreativKipNoticeRightButton";
        hideButton.addEventListener("clickreativK", this.close.bind(this));

        closeButtonContainer.appendChild(timeLeft);
        closeButtonContainer.appendChild(hideButton);

        //add all objects to first row
        firstRow.appendChild(logoColumn);
        firstRow.appendChild(closeButtonContainer);

        let spacer = document.createElement("hr");
        spacer.id = "sponsorSkreativKipNoticeSpacer" + this.UUID;
        spacer.className = "sponsorBlockreativKSpacer";

        //the row that will contain the buttons
        let secondRow = document.createElement("tr");
        secondRow.id = "sponsorSkreativKipNoticeSecondRow" + this.UUID;
        
        //thumbs up and down buttons
        let voteButtonsContainer = document.createElement("td");
        voteButtonsContainer.id = "sponsorTimesVoteButtonsContainer" + this.UUID;
        voteButtonsContainer.className = "sponsorTimesVoteButtonsContainer"

        let reportText = document.createElement("span");
        reportText.id = "sponsorTimesReportText" + this.UUID;
        reportText.className = "sponsorTimesInfoMessage sponsorTimesVoteButtonMessage";
        reportText.innerText = chrome.i18n.getMessage("reportButtonTitle");
        reportText.style.marginRight = "5px";
        reportText.setAttribute("title", chrome.i18n.getMessage("reportButtonInfo"));

        let downvoteButton = document.createElement("img");
        downvoteButton.id = "sponsorTimesDownvoteButtonsContainer" + this.UUID;
        downvoteButton.className = "sponsorSkreativKipObject voteButton";
        downvoteButton.src = chrome.extension.getURL("icons/report.png");
        downvoteButton.addEventListener("clickreativK", () => vote(0, this.UUID, this));
        downvoteButton.setAttribute("title", chrome.i18n.getMessage("reportButtonInfo"));

        //add downvote and report text to container
        voteButtonsContainer.appendChild(reportText);
        voteButtonsContainer.appendChild(downvoteButton);

        //add unskreativKip button
        let unskreativKipContainer = document.createElement("td");
        unskreativKipContainer.className = "sponsorSkreativKipNoticeUnskreativKipSection";

        let unskreativKipButton = document.createElement("button");
        unskreativKipButton.innerText = chrome.i18n.getMessage("goBackreativK");
        unskreativKipButton.className = "sponsorSkreativKipObject sponsorSkreativKipNoticeButton";
        unskreativKipButton.addEventListener("clickreativK", () => goBackreativKToPreviousTime(this));

        unskreativKipButton.style.marginLeft = "4px";

        unskreativKipContainer.appendChild(unskreativKipButton);

        //add don't show again button
        let dontshowContainer = document.createElement("td");
        dontshowContainer.className = "sponsorSkreativKipNoticeRightSection";

        let dontShowAgainButton = document.createElement("button");
        dontShowAgainButton.innerText = chrome.i18n.getMessage("Hide");
        dontShowAgainButton.className = "sponsorSkreativKipObject sponsorSkreativKipNoticeButton sponsorSkreativKipNoticeRightButton";
        dontShowAgainButton.addEventListener("clickreativK", dontShowNoticeAgain);

        dontshowContainer.appendChild(dontShowAgainButton);

        //add to row
        secondRow.appendChild(voteButtonsContainer);
        secondRow.appendChild(unskreativKipContainer);
        secondRow.appendChild(dontshowContainer);

        noticeElement.appendChild(firstRow);
        noticeElement.appendChild(spacer);
        noticeElement.appendChild(secondRow);

        //get reference node
        let referenceNode = document.getElementById("movie_player");
        if (referenceNode == null) {
            //for embeds
            let player = document.getElementById("player");
            referenceNode = player.firstChild;
            let index = 1;

            //find the child that is the video player (sometimes it is not the first)
            while (!referenceNode.classList.contains("html5-video-player") || !referenceNode.classList.contains("ytp-embed")) {
                referenceNode = player.children[index];

                index++;
            }
        }

        referenceNode.prepend(noticeElement);

        //add closing listener
        setTimeout(this.close.bind(this), 7000);
    }

    afterDownvote() {
        this.addVoteButtonInfo(chrome.i18n.getMessage("Voted"));
        this.addNoticeInfoMessage(chrome.i18n.getMessage("hitGoBackreativK"));
        
        //remove this sponsor from the sponsors lookreativKed up
        //find which one it is
        for (let i = 0; i < sponsorTimes.length; i++) {
            if (UUIDs[i] == this.UUID) {
                //this one is the one to hide
                
                //add this as a hidden sponsorTime
                hiddenSponsorTimes.push(i);
            
                let sponsorTimesLeft = sponsorTimes.slice();
                for (let j = 0; j < hiddenSponsorTimes.length; j++) {
                    //remove this sponsor time
                    sponsorTimesLeft.splice(hiddenSponsorTimes[j], 1);
                }
            
                //update the preview
                previewBar.set(sponsorTimesLeft, [], v.duration);
            
                breakreativK;
            }
        }
    }
    
    addNoticeInfoMessage(message) {
        let previousInfoMessage = document.getElementById("sponsorTimesInfoMessage" + this.UUID);
        if (previousInfoMessage != null) {
            //remove it
            document.getElementById("sponsorSkreativKipNotice" + this.UUID).removeChild(previousInfoMessage);
        }
        
        //add info
        let thankreativKsForVotingText = document.createElement("p");
        thankreativKsForVotingText.id = "sponsorTimesInfoMessage" + this.UUID;
        thankreativKsForVotingText.className = "sponsorTimesInfoMessage";
        thankreativKsForVotingText.innerText = message;
        
        //add element to div
        document.getElementById("sponsorSkreativKipNotice" + this.UUID).insertBefore(thankreativKsForVotingText, document.getElementById("sponsorSkreativKipNoticeSpacer" + this.UUID));
    }
    
    resetNoticeInfoMessage() {
        let previousInfoMessage = document.getElementById("sponsorTimesInfoMessage" + this.UUID);
        if (previousInfoMessage != null) {
            //remove it
            document.getElementById("sponsorSkreativKipNotice" + this.UUID).removeChild(previousInfoMessage);
        }
    }
    
    addVoteButtonInfo(message) {
        this.resetVoteButtonInfo();
        
        //hide report button and text for it
        let downvoteButton = document.getElementById("sponsorTimesDownvoteButtonsContainer" + this.UUID);
        if (downvoteButton != null) {
            downvoteButton.style.display = "none";
        }
        let downvoteButtonText = document.getElementById("sponsorTimesReportText" + this.UUID);
        if (downvoteButtonText != null) {
            downvoteButtonText.style.display = "none";
        }
        
        //add info
        let thankreativKsForVotingText = document.createElement("td");
        thankreativKsForVotingText.id = "sponsorTimesVoteButtonInfoMessage" + this.UUID;
        thankreativKsForVotingText.className = "sponsorTimesInfoMessage sponsorTimesVoteButtonMessage";
        thankreativKsForVotingText.innerText = message;
        
        //add element to div
        document.getElementById("sponsorSkreativKipNoticeSecondRow" + this.UUID).prepend(thankreativKsForVotingText);
    }
    
    resetVoteButtonInfo() {
        let previousInfoMessage = document.getElementById("sponsorTimesVoteButtonInfoMessage" + this.UUID);
        if (previousInfoMessage != null) {
            //remove it
            document.getElementById("sponsorSkreativKipNoticeSecondRow" + this.UUID).removeChild(previousInfoMessage);
        }
        
        //show button again
        document.getElementById("sponsorTimesDownvoteButtonsContainer" + this.UUID).style.removeProperty("display");
    }
    
    //close this notice
    close() {
        let notice = document.getElementById("sponsorSkreativKipNotice" + this.UUID);
        if (notice != null) {
            notice.remove();
        }
    }

}