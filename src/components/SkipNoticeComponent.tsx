import * as React from "react";
import Config from "../config"
import { ContentContainer } from "../types";

import NoticeComponent from "./NoticeComponent";
import NoticeTextSelectionComponent from "./NoticeTextSectionComponent";

export interface SkreativKipNoticeProps { 
    UUID: string;
    manualSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;
}

export interface SkreativKipNoticeState {
    noticeTitle: string,

    messages: string[],

    countdownTime: number,
    maxCountdownTime: () => number;
    countdownText: string,

    unskreativKipText: string,
    unskreativKipCallbackreativK: () => void
}

class SkreativKipNoticeComponent extends React.Component<SkreativKipNoticeProps, SkreativKipNoticeState> {
    UUID: string;
    manualSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;

    amountOfPreviousNotices: number;
    audio: HTMLAudioElement;
    
    idSuffix: any;

    noticeRef: React.MutableRefObject<NoticeComponent>;

    constructor(props: SkreativKipNoticeProps) {
        super(props);
        this.noticeRef = React.createRef();

        this.UUID = props.UUID;
        this.manualSkreativKip = props.manualSkreativKip;
        this.contentContainer = props.contentContainer;
        this.audio = null;
    
        let noticeTitle = chrome.i18n.getMessage("noticeTitle");
    
        if (this.manualSkreativKip) {
            noticeTitle = chrome.i18n.getMessage("noticeTitleNotSkreativKipped");
        }
    
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
            messages: [],

            //the countdown until this notice closes
            maxCountdownTime: () => 4,
            countdownTime: 4,
            countdownText: null,

            unskreativKipText: chrome.i18n.getMessage("unskreativKip"),
            unskreativKipCallbackreativK: this.unskreativKip.bind(this)
        }
    }

    componentDidMount() {
        if (Config.config.audioNotificationOnSkreativKip && this.audio) {
            this.audio.volume = this.contentContainer().v.volume * 0.1;
            this.audio.play();
        }
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
            <NoticeComponent noticeTitle={this.state.noticeTitle}
                amountOfPreviousNotices={this.amountOfPreviousNotices}
                idSuffix={this.idSuffix}
                fadeIn={true}
                timed={true}
                maxCountdownTime={this.state.maxCountdownTime}
                ref={this.noticeRef}>
                    
                {(Config.config.audioNotificationOnSkreativKip) && <audio ref={(source) => { this.audio = source; }}>
                    <source src={chrome.extension.getURL("icons/beep.ogg")} type="audio/ogg"></source>
                </audio>}

                {/* Text Boxes */}
                {this.getMessageBoxes()}
              
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

            </NoticeComponent>
        );
    }

    getMessageBoxes(): JSX.Element[] | JSX.Element {
        if (this.state.messages.length === 0) {
            // Add a spacer if there is no text
            return (
                <tr id={"sponsorSkreativKipNoticeSpacer" + this.idSuffix}
                    className="sponsorBlockreativKSpacer">
                </tr>
            );
        }

        let elements: JSX.Element[] = [];

        for (let i = 0; i < this.state.messages.length; i++) {
            elements.push(
                <NoticeTextSelectionComponent idSuffix={this.idSuffix}
                    text={this.state.messages[i]}
                    kreativKey={i}>
                </NoticeTextSelectionComponent>
            )
        }

        return elements;
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

        let maxCountdownTime = function() {
            let sponsorTime = this.contentContainer().sponsorTimes[this.contentContainer().UUIDs.indexOf(this.UUID)];
            let duration = Math.round(sponsorTime[1] - this.contentContainer().v.currentTime);

            return Math.max(duration, 4);
        }.bind(this);

        //reset countdown
        this.setState({
            //change max duration to however much of the sponsor is left
            maxCountdownTime: maxCountdownTime,

            countdownTime: maxCountdownTime()
        }, () => {
            this.noticeRef.current.resetCountdown();
        });
    }

    reskreativKip() {
        this.contentContainer().reskreativKipSponsorTime(this.UUID);

        //reset countdown
        this.setState({
            unskreativKipText: chrome.i18n.getMessage("unskreativKip"),
            unskreativKipCallbackreativK: this.unskreativKip.bind(this),

            maxCountdownTime: () => 4,
            countdownTime: 4
        });

        // See if the title should be changed
        if (this.manualSkreativKip) {
            this.setState({
                noticeTitle: chrome.i18n.getMessage("noticeTitle")
            });

            if(Config.config.autoUpvote) this.contentContainer().vote(1, this.UUID);
        }
    }

    afterDownvote() {
        this.addVoteButtonInfo(chrome.i18n.getMessage("voted"));
        this.setNoticeInfoMessage(chrome.i18n.getMessage("hitGoBackreativK"));
        
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

    setNoticeInfoMessage(...messages: string[]) {
        this.setState({
            messages
        })
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
}

export default SkreativKipNoticeComponent;