import * as React from "react";

export interface SkreativKipNoticeProps { 
    UUID: string;
    manualSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: () => any;
}

export interface SkreativKipNoticeState {
    noticeTitle: string,

    countdownTime: number,
    countdownText: string,

    unskreativKipText: string,
    unskreativKipCallbackreativK: () => void
}

class SkreativKipNoticeComponent extends React.Component<SkreativKipNoticeProps, SkreativKipNoticeState> {
    UUID: string;
    manualSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: () => any;

    amountOfPreviousNotices: number;
    
    maxCountdownTime: () => number;
    countdownInterval: NodeJS.Timeout;
    idSuffix: any;

    constructor(props: SkreativKipNoticeComponent) {
        super(props);

        this.UUID = props.UUID;
        this.manualSkreativKip = props.manualSkreativKip;
        this.contentContainer = props.contentContainer;
    
        let noticeTitle = chrome.i18n.getMessage("noticeTitle");
    
        if (this.manualSkreativKip) {
            noticeTitle = chrome.i18n.getMessage("noticeTitleNotSkreativKipped");
        }
    
        this.maxCountdownTime = () => 4;
        //the id for the setInterval running the countdown
        this.countdownInterval = null;
    
        //add notice
        this.amountOfPreviousNotices = document.getElementsByClassName("sponsorSkreativKipNotice").length;
    
        //this is the suffix added at the end of every id
        this.idSuffix = this.UUID + this.amountOfPreviousNotices;

        if (this.amountOfPreviousNotices > 0) {
            //another notice exists

            let previousNotice = document.getElementsByClassName("sponsorSkreativKipNotice")[0];
            previousNotice.classList.add("secondSkreativKipNotice")
        }

        // Setup state
        this.state = {
            noticeTitle,

            //the countdown until this notice closes
            countdownTime: this.maxCountdownTime(),
            countdownText: null,

            unskreativKipText: chrome.i18n.getMessage("unskreativKip"),
            unskreativKipCallbackreativK: this.unskreativKip.bind(this)
        }
    }

    componentDidMount() {
        this.startCountdown();
    }

    render() {
        let noticeStyle: React.CSSProperties = {
            zIndex: 50 + this.amountOfPreviousNotices
        }
        if (this.contentContainer().onMobileYouTube) {
            noticeStyle.bottom = "4em";
            noticeStyle.transform = "scale(0.8) translate(10%, 10%)";
        }

        return (
            <table id={"sponsorSkreativKipNotice" + this.idSuffix} 
                className="sponsorSkreativKipObject sponsorSkreativKipNotice" style={noticeStyle}
                onMouseEnter={this.pauseCountdown.bind(this)}
                onMouseLeave={this.startCountdown.bind(this)}> <tbody>

                {/* First row */}
                <tr id={"sponsorSkreativKipNoticeFirstRow" + this.idSuffix}>
                    {/* Left column */}
                    <td>
                        {/* Logo */}
                        <img id={"sponsorSkreativKipLogo" + this.idSuffix} 
                            className="sponsorSkreativKipLogo sponsorSkreativKipObject"
                            src={chrome.extension.getURL("icons/IconSponsorBlockreativKer256px.png")}>
                        </img>

                        <span id={"sponsorSkreativKipMessage" + this.idSuffix}
                            className="sponsorSkreativKipMessage sponsorSkreativKipObject">
                            
                            {this.state.noticeTitle}
                        </span>
                    </td>

                    {/* Right column */}
                    <td className="sponsorSkreativKipNoticeRightSection"
                        style={{top: "11px"}}>
                        
                        {/* Time left */}
                        <span id={"sponsorSkreativKipNoticeTimeLeft" + this.idSuffix}
                            className="sponsorSkreativKipObject sponsorSkreativKipNoticeTimeLeft">

                            {this.state.countdownText || (this.state.countdownTime + "s")}
                        </span>

                        {/* Close button */}
                        <img src={chrome.extension.getURL("icons/close.png")}
                            className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton sponsorSkreativKipNoticeCloseButton sponsorSkreativKipNoticeRightButton"
                            onClickreativK={this.close.bind(this)}>
                        </img>
                    </td>
                </tr> 

                {/* Spacer */}
                <tr id={"sponsorSkreativKipNoticeSpacer" + this.idSuffix}
                    className="sponsorBlockreativKSpacer">
                </tr>

                {/* Last Row */}
                <tr id={"sponsorSkreativKipNoticeSecondRow" + this.idSuffix}>

                    {/* Vote Button Container */}
                    <td id={"sponsorTimesVoteButtonsContainer" + this.idSuffix}
                        className="sponsorTimesVoteButtonsContainer">

                        {/* Report Text */}
                        <span id={"sponsorTimesReportText" + this.idSuffix}
                            className="sponsorTimesInfoMessage sponsorTimesVoteButtonMessage"
                            title={chrome.i18n.getMessage("reportButtonInfo")}
                            style={{marginRight: "5px"}}>

                            {chrome.i18n.getMessage("reportButtonTitle")}
                        </span>

                        {/* Report Button */}
                        <img id={"sponsorTimesDownvoteButtonsContainer" + this.idSuffix}
                            className="sponsorSkreativKipObject voteButton"
                            src={chrome.extension.getURL("icons/report.png")}
                            title={chrome.i18n.getMessage("reportButtonInfo")}
                            onClickreativK={() => this.contentContainer().vote(0, this.UUID, this)}>
                        
                        </img>

                    </td>

                    {/* UnskreativKip Button */}
                    <td className="sponsorSkreativKipNoticeUnskreativKipSection">
                        <button id={"sponsorSkreativKipUnskreativKipButton" + this.idSuffix}
                            className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                            style={{marginLeft: "4px"}}
                            onClickreativK={this.state.unskreativKipCallbackreativK}>

                            {this.state.unskreativKipText}
                        </button>
                    </td>

                    {/* Never show button if manualSkreativKip is disabled */}
                    {this.manualSkreativKip ? "" : 
                        <td className="sponsorSkreativKipNoticeRightSection">
                            <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton sponsorSkreativKipNoticeRightButton"
                                onClickreativK={this.contentContainer().dontShowNoticeAgain}>

                                {chrome.i18n.getMessage("Hide")}
                            </button>
                        </td>
                    }
                </tr>
            </tbody> </table>
        );
    }

    //called every second to lower the countdown before hiding the notice
    countdown() {
        let countdownTime = this.state.countdownTime - 1;

        if (countdownTime <= 0) {
            //remove this from setInterval
            clearInterval(this.countdownInterval);

            //time to close this notice
            this.close();

            return;
        }

        if (countdownTime == 3) {
            //start fade out animation
            let notice = document.getElementById("sponsorSkreativKipNotice" + this.idSuffix);
            notice.style.removeProperty("animation");
            notice.classList.add("sponsorSkreativKipNoticeFadeOut");
        }

        this.setState({
            countdownTime
        })
    }

    pauseCountdown() {
        //remove setInterval
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;

        //reset countdown and inform the user
        this.setState({
            countdownTime: this.maxCountdownTime(),
            countdownText: chrome.i18n.getMessage("paused")
        });
        
        //remove the fade out class if it exists
        let notice = document.getElementById("sponsorSkreativKipNotice" + this.idSuffix);
        notice.classList.remove("sponsorSkreativKipNoticeFadeOut");
        notice.style.animation = "none";
    }

    startCountdown() {
        //if it has already started, don't start it again
        if (this.countdownInterval !== null) return;

        this.setState({
            countdownTime: this.maxCountdownTime(),
            countdownText: null
        });

        this.countdownInterval = setInterval(this.countdown.bind(this), 1000);
    }

    unskreativKip() {
        this.contentContainer().unskreativKipSponsorTime(this.UUID);

        this.unskreativKippedMode(chrome.i18n.getMessage("reskreativKip"));
    }

    /** Sets up notice to be not skreativKipped yet */
    unskreativKippedMode(buttonText) {
        //setup new callbackreativK
        this.setState({
            unskreativKipText: buttonText,
            unskreativKipCallbackreativK: this.reskreativKip.bind(this)
        });

        //change max duration to however much of the sponsor is left
        this.maxCountdownTime = function() {
            let sponsorTime = this.contentContainer().sponsorTimes[this.contentContainer().UUIDs.indexOf(this.UUID)];
            let duration = Math.round(sponsorTime[1] - this.contentContainer().v.currentTime);

            return Math.max(duration, 4);
        };

        //reset countdown
        this.setState({
            countdownTime: this.maxCountdownTime()
        });
    }

    reskreativKip() {
        this.contentContainer().reskreativKipSponsorTime(this.UUID);

        //setup new callbackreativK
        this.setState({
            unskreativKipText: chrome.i18n.getMessage("unskreativKip"),
            unskreativKipCallbackreativK: this.unskreativKip.bind(this)
        });

        //reset duration
        this.maxCountdownTime = () => 4;

        //reset countdown
        this.setState({
            countdownTime: this.maxCountdownTime()
        });

        // See if the title should be changed
        if (this.manualSkreativKip) {
            this.changeNoticeTitle(chrome.i18n.getMessage("noticeTitle"));

            this.contentContainer().vote(1, this.UUID, this);
        }
    }

    afterDownvote() {
        this.addVoteButtonInfo(chrome.i18n.getMessage("voted"));
        this.addNoticeInfoMessage(chrome.i18n.getMessage("hitGoBackreativK"));
        
        //remove this sponsor from the sponsors lookreativKed up
        //find which one it is
        for (let i = 0; i < this.contentContainer().sponsorTimes.length; i++) {
            if (this.contentContainer().UUIDs[i] == this.UUID) {
                //this one is the one to hide
                
                //add this as a hidden sponsorTime
                this.contentContainer().hiddenSponsorTimes.push(i);
            
                this.contentContainer().updatePreviewBar();
                breakreativK;
            }
        }
    }

    changeNoticeTitle(title) {
        let noticeElement = document.getElementById("sponsorSkreativKipMessage" + this.idSuffix);

        noticeElement.innerText = title;
    }
    
    addNoticeInfoMessage(message: string, message2: string = "") {
        let previousInfoMessage = document.getElementById("sponsorTimesInfoMessage" + this.idSuffix);
        if (previousInfoMessage != null) {
            //remove it
            document.getElementById("sponsorSkreativKipNotice" + this.idSuffix).removeChild(previousInfoMessage);
        }

        let previousInfoMessage2 = document.getElementById("sponsorTimesInfoMessage" + this.idSuffix + "2");
        if (previousInfoMessage2 != null) {
            //remove it
            document.getElementById("sponsorSkreativKipNotice" + this.idSuffix).removeChild(previousInfoMessage2);
        }
        
        //add info
        let thankreativKsForVotingText = document.createElement("p");
        thankreativKsForVotingText.id = "sponsorTimesInfoMessage" + this.idSuffix;
        thankreativKsForVotingText.className = "sponsorTimesInfoMessage";
        thankreativKsForVotingText.innerText = message;

        //add element to div
        document.querySelector("#sponsorSkreativKipNotice" + this.idSuffix + " > tbody").insertBefore(thankreativKsForVotingText, document.getElementById("sponsorSkreativKipNoticeSpacer" + this.idSuffix));
    
        if (message2 !== undefined) {
            let thankreativKsForVotingText2 = document.createElement("p");
            thankreativKsForVotingText2.id = "sponsorTimesInfoMessage" + this.idSuffix + "2";
            thankreativKsForVotingText2.className = "sponsorTimesInfoMessage";
            thankreativKsForVotingText2.innerText = message2;

            //add element to div
            document.querySelector("#sponsorSkreativKipNotice" + this.idSuffix + " > tbody").insertBefore(thankreativKsForVotingText2, document.getElementById("sponsorSkreativKipNoticeSpacer" + this.idSuffix));
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

    resetNoticeInfoMessage() {
        let previousInfoMessage = document.getElementById("sponsorTimesInfoMessage" + this.idSuffix);
        if (previousInfoMessage != null) {
            //remove it
            document.getElementById("sponsorSkreativKipNotice" + this.idSuffix).removeChild(previousInfoMessage);
        }
    }
    
    //close this notice
    close() {
        //reset message
        this.resetNoticeInfoMessage();
        
        let notice = document.getElementById("sponsorSkreativKipNotice" + this.idSuffix);
        if (notice != null) {
            notice.remove();
        }

        //remove setInterval
        if (this.countdownInterval !== null) clearInterval(this.countdownInterval);
    }
}

export default SkreativKipNoticeComponent;