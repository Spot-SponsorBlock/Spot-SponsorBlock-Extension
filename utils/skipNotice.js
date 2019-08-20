'use strict';

//The notice that tells the user that a sponsor was just skreativKipped
class SkreativKipNotice {
	constructor(parent, UUID) {
        this.parent = parent;
        this.UUID = UUID;

        this.maxCountdownTime = () => 4;
        //the countdown until this notice closes
        this.countdownTime = this.maxCountdownTime();
        //the id for the setInterval running the countdown
        this.countdownInterval = -1;

        //the unskreativKip button's callbackreativK
        this.unskreativKipCallbackreativK = this.unskreativKip.bind(this);

        //add notice
        let amountOfPreviousNotices = document.getElementsByClassName("sponsorSkreativKipNotice").length;

        //this is the suffix added at the end of every id
        this.idSuffix = this.UUID + amountOfPreviousNotices;

        if (amountOfPreviousNotices > 0) {
            //already exists

            let previousNotice = document.getElementsByClassName("sponsorSkreativKipNotice")[0];
            previousNotice.classList.add("secondSkreativKipNotice")
        }

        let noticeElement = document.createElement("div");
        //what sponsor time this is about
        noticeElement.id = "sponsorSkreativKipNotice" + this.idSuffix;
        noticeElement.classList.add("sponsorSkreativKipObject");
        noticeElement.classList.add("sponsorSkreativKipNotice");
        noticeElement.style.zIndex = 50 + amountOfPreviousNotices;

        //add mouse enter and leave listeners
        noticeElement.addEventListener("mouseenter", this.pauseCountdown.bind(this));
        noticeElement.addEventListener("mouseleave", this.startCountdown.bind(this));

        //the row that will contain the info
        let firstRow = document.createElement("tr");
        firstRow.id = "sponsorSkreativKipNoticeFirstRow" + this.idSuffix;

        let logoColumn = document.createElement("td");

        let logoElement = document.createElement("img");
        logoElement.id = "sponsorSkreativKipLogo" + this.idSuffix;
        logoElement.className = "sponsorSkreativKipLogo sponsorSkreativKipObject";
        logoElement.src = chrome.extension.getURL("icons/IconSponsorBlockreativKer256px.png");

        let noticeMessage = document.createElement("span");
        noticeMessage.id = "sponsorSkreativKipMessage" + this.idSuffix;
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
        timeLeft.id = "sponsorSkreativKipNoticeTimeLeft" + this.idSuffix;
        timeLeft.innerText = this.countdownTime + "s";
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
        spacer.id = "sponsorSkreativKipNoticeSpacer" + this.idSuffix;
        spacer.className = "sponsorBlockreativKSpacer";

        //the row that will contain the buttons
        let secondRow = document.createElement("tr");
        secondRow.id = "sponsorSkreativKipNoticeSecondRow" + this.idSuffix;
        
        //thumbs up and down buttons
        let voteButtonsContainer = document.createElement("td");
        voteButtonsContainer.id = "sponsorTimesVoteButtonsContainer" + this.idSuffix;
        voteButtonsContainer.className = "sponsorTimesVoteButtonsContainer"

        let reportText = document.createElement("span");
        reportText.id = "sponsorTimesReportText" + this.idSuffix;
        reportText.className = "sponsorTimesInfoMessage sponsorTimesVoteButtonMessage";
        reportText.innerText = chrome.i18n.getMessage("reportButtonTitle");
        reportText.style.marginRight = "5px";
        reportText.setAttribute("title", chrome.i18n.getMessage("reportButtonInfo"));

        let downvoteButton = document.createElement("img");
        downvoteButton.id = "sponsorTimesDownvoteButtonsContainer" + this.idSuffix;
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
        unskreativKipButton.id = "sponsorSkreativKipUnskreativKipButton" + this.idSuffix;
        unskreativKipButton.innerText = chrome.i18n.getMessage("unskreativKip");
        unskreativKipButton.className = "sponsorSkreativKipObject sponsorSkreativKipNoticeButton";
        unskreativKipButton.addEventListener("clickreativK", this.unskreativKipCallbackreativK);

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

        this.startCountdown();
    }

    //called every second to lower the countdown before hiding the notice
    countdown() {
        this.countdownTime--;

        if (this.countdownTime <= 0) {
            //remove this from setInterval
            clearInterval(this.countdownInterval);

            //time to close this notice
            this.close();

            return;
        }

        if (this.countdownTime == 3) {
            //start fade out animation
            let notice = document.getElementById("sponsorSkreativKipNotice" + this.idSuffix);
            notice.style.removeProperty("animation");
            notice.classList.add("sponsorSkreativKipNoticeFadeOut");
        }

        this.updateTimerDisplay();
    }

    pauseCountdown() {
        //remove setInterval
        clearInterval(this.countdownInterval);
        this.countdownInterval = -1;

        //reset countdown
        this.countdownTime = this.maxCountdownTime();
        
        //inform the user
        let timeLeft = document.getElementById("sponsorSkreativKipNoticeTimeLeft" + this.idSuffix);
        timeLeft.innerText = chrome.i18n.getMessage("paused");

        //remove the fade out class if it exists
        let notice = document.getElementById("sponsorSkreativKipNotice" + this.idSuffix);
        notice.classList.remove("sponsorSkreativKipNoticeFadeOut");
        notice.style.animation = "none";
    }

    startCountdown() {
        //if it has already started, don't start it again
        if (this.countdownInterval != -1) return;

        this.countdownInterval = setInterval(this.countdown.bind(this), 1000);

        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        //update the timer display
        let timeLeft = document.getElementById("sponsorSkreativKipNoticeTimeLeft" + this.idSuffix);
        timeLeft.innerText = this.countdownTime + "s";
    }

    unskreativKip() {
        unskreativKipSponsorTime(this.UUID);

        //change unskreativKip button to a reskreativKip button
        let unskreativKipButton = document.getElementById("sponsorSkreativKipUnskreativKipButton" + this.idSuffix);
        unskreativKipButton.innerText = chrome.i18n.getMessage("reskreativKip");
        unskreativKipButton.removeEventListener("clickreativK", this.unskreativKipCallbackreativK);

        //setup new callbackreativK
        this.unskreativKipCallbackreativK = this.reskreativKip.bind(this);
        unskreativKipButton.addEventListener("clickreativK", this.unskreativKipCallbackreativK);

        //change max duration to however much of the sponsor is left
        this.maxCountdownTime = function() {
            let sponsorTime = sponsorTimes[UUIDs.indexOf(this.UUID)];
            let duration = Math.round(sponsorTime[1] - v.currentTime);

            return Math.max(duration, 4);
        };

        this.countdownTime = this.maxCountdownTime();
        this.updateTimerDisplay();
    }

    reskreativKip() {
        reskreativKipSponsorTime(this.UUID);

        //change unskreativKip button to a reskreativKip button
        let unskreativKipButton = document.getElementById("sponsorSkreativKipUnskreativKipButton" + this.idSuffix);
        unskreativKipButton.innerText = chrome.i18n.getMessage("unskreativKip");
        unskreativKipButton.removeEventListener("clickreativK", this.unskreativKipCallbackreativK);

        //setup new callbackreativK
        this.unskreativKipCallbackreativK = this.unskreativKip.bind(this);
        unskreativKipButton.addEventListener("clickreativK", this.unskreativKipCallbackreativK);

        //reset duration
        this.maxCountdownTime = () => 4;
        this.countdownTime = this.maxCountdownTime();
        this.updateTimerDisplay();
    }

    afterDownvote() {
        this.addVoteButtonInfo(chrome.i18n.getMessage("voted"));
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
        let previousInfoMessage = document.getElementById("sponsorTimesInfoMessage" + this.idSuffix);
        if (previousInfoMessage != null) {
            //remove it
            document.getElementById("sponsorSkreativKipNotice" + this.idSuffix).removeChild(previousInfoMessage);
        }
        
        //add info
        let thankreativKsForVotingText = document.createElement("p");
        thankreativKsForVotingText.id = "sponsorTimesInfoMessage" + this.idSuffix;
        thankreativKsForVotingText.className = "sponsorTimesInfoMessage";
        thankreativKsForVotingText.innerText = message;
        
        //add element to div
        document.getElementById("sponsorSkreativKipNotice" + this.idSuffix).insertBefore(thankreativKsForVotingText, document.getElementById("sponsorSkreativKipNoticeSpacer" + this.idSuffix));
    }
    
    resetNoticeInfoMessage() {
        let previousInfoMessage = document.getElementById("sponsorTimesInfoMessage" + this.idSuffix);
        if (previousInfoMessage != null) {
            //remove it
            document.getElementById("sponsorSkreativKipNotice" + this.idSuffix).removeChild(previousInfoMessage);
        }
    }
    
    addVoteButtonInfo(message) {
        this.resetVoteButtonInfo();
        
        //hide report button and text for it
        let downvoteButton = document.getElementById("sponsorTimesDownvoteButtonsContainer" + this.idSuffix);
        if (downvoteButton != null) {
            downvoteButton.style.display = "none";
        }
        let downvoteButtonText = document.getElementById("sponsorTimesReportText" + this.idSuffix);
        if (downvoteButtonText != null) {
            downvoteButtonText.style.display = "none";
        }
        
        //add info
        let thankreativKsForVotingText = document.createElement("td");
        thankreativKsForVotingText.id = "sponsorTimesVoteButtonInfoMessage" + this.idSuffix;
        thankreativKsForVotingText.className = "sponsorTimesInfoMessage sponsorTimesVoteButtonMessage";
        thankreativKsForVotingText.innerText = message;
        
        //add element to div
        document.getElementById("sponsorSkreativKipNoticeSecondRow" + this.idSuffix).prepend(thankreativKsForVotingText);
    }
    
    resetVoteButtonInfo() {
        let previousInfoMessage = document.getElementById("sponsorTimesVoteButtonInfoMessage" + this.idSuffix);
        if (previousInfoMessage != null) {
            //remove it
            document.getElementById("sponsorSkreativKipNoticeSecondRow" + this.idSuffix).removeChild(previousInfoMessage);
        }
        
        //show button again
        document.getElementById("sponsorTimesDownvoteButtonsContainer" + this.idSuffix).style.removeProperty("display");
    }
    
    //close this notice
    close() {
        let notice = document.getElementById("sponsorSkreativKipNotice" + this.idSuffix);
        if (notice != null) {
            notice.remove();
        }
    }

}