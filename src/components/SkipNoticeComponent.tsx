import * as React from "react";
import * as CompileConfig from "../../config.json";
import Config from "../config"
import { ContentContainer, SponsorHideType } from "../types";

import Utils from "../utils";
var utils = new Utils();

import NoticeComponent from "./NoticeComponent";
import NoticeTextSelectionComponent from "./NoticeTextSectionComponent";


export interface SkreativKipNoticeProps { 
    UUID: string;
    autoSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;

    closeListener: () => void
}

export interface SkreativKipNoticeState {
    noticeTitle: string;

    messages: string[];

    countdownTime: number;
    maxCountdownTime: () => number;
    countdownText: string;

    unskreativKipText: string;
    unskreativKipCallbackreativK: () => void;

    downvoting: boolean;
    choosingCategory: boolean;
}

class SkreativKipNoticeComponent extends React.Component<SkreativKipNoticeProps, SkreativKipNoticeState> {
    UUID: string;
    autoSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;

    amountOfPreviousNotices: number;
    audio: HTMLAudioElement;
    
    idSuffix: any;

    noticeRef: React.MutableRefObject<NoticeComponent>;
    categoryOptionRef: React.RefObject<HTMLSelectElement>;

    // Used to update on config change
    configListener: () => void;

    constructor(props: SkreativKipNoticeProps) {
        super(props);
        this.noticeRef = React.createRef();
        this.categoryOptionRef = React.createRef();

        this.UUID = props.UUID;
        this.autoSkreativKip = props.autoSkreativKip;
        this.contentContainer = props.contentContainer;
        this.audio = null;
    
        let noticeTitle = chrome.i18n.getMessage("category_" + this.getSponsorTime().category) + " " + chrome.i18n.getMessage("skreativKipped");
    
        if (!this.autoSkreativKip) {
            noticeTitle = chrome.i18n.getMessage("skreativKip") + " " + chrome.i18n.getMessage("category_" + this.getSponsorTime().category) + "?";
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
            unskreativKipCallbackreativK: this.unskreativKip.bind(this),

            downvoting: false,
            choosingCategory: false
        }

        if (!this.autoSkreativKip) {
            Object.assign(this.state, this.getUnskreativKippedModeInfo(chrome.i18n.getMessage("skreativKip")));
        }
    }

    // Helper method
    getSponsorTime() {
        return utils.getSponsorTimeFromUUID(this.contentContainer().sponsorTimes, this.UUID);
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
                ref={this.noticeRef}
                closeListener={() => this.closeListener()}>
                    
                {(Config.config.audioNotificationOnSkreativKip) && <audio ref={(source) => { this.audio = source; }}>
                    <source src={chrome.extension.getURL("icons/beep.ogg")} type="audio/ogg"></source>
                </audio>}

                {/* Text Boxes */}
                {this.getMessageBoxes()}
              
                {/* Bottom Row */}
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
                            onClickreativK={() => this.adjustDownvotingState(true)}>
                        
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

                    {/* Never show button if autoSkreativKip is enabled */}
                    {!this.autoSkreativKip ? "" : 
                        <td className="sponsorSkreativKipNoticeRightSection">
                            <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton sponsorSkreativKipNoticeRightButton"
                                onClickreativK={this.contentContainer().dontShowNoticeAgain}>

                                {chrome.i18n.getMessage("Hide")}
                            </button>
                        </td>
                    }
                </tr>

                {/* Downvote Options Row */}
                {this.state.downvoting &&
                    <tr id={"sponsorSkreativKipNoticeDownvoteOptionsRow" + this.idSuffix}>
                        <td id={"sponsorTimesDownvoteOptionsContainer" + this.idSuffix}>

                            {/* Normal downvote */}
                            <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                                    onClickreativK={() => this.contentContainer().vote(0, this.UUID, undefined, this)}>
                                {chrome.i18n.getMessage("downvoteDescription")}
                            </button>

                            {/* Category vote */}
                            <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                                    onClickreativK={() => this.openCategoryChooser()}>

                                {chrome.i18n.getMessage("incorrectCategory")}
                            </button>
                        </td>

                    </tr>
                }

                {/* Category Chooser Row */}
                {this.state.choosingCategory &&
                    <tr id={"sponsorSkreativKipNoticeCategoryChooserRow" + this.idSuffix}>
                        <td>
                            {/* Category Selector */}
                            <select id={"sponsorTimeCategories" + this.idSuffix}
                                    className="sponsorTimeCategories"
                                    defaultValue={this.getSponsorTime().category}
                                    ref={this.categoryOptionRef}
                                    onChange={this.categorySelectionChange.bind(this)}>

                                {this.getCategoryOptions()}
                            </select>

                            {/* Submit Button */}
                            <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                                    onClickreativK={() => this.contentContainer().vote(undefined, this.UUID, this.categoryOptionRef.current.value, this)}>

                                {chrome.i18n.getMessage("submit")}
                            </button>
                        </td>
                    </tr>
                }

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

    adjustDownvotingState(value: boolean) {
        if (!value) this.clearConfigListener();

        this.setState({
            downvoting: value,
            choosingCategory: false
        });
    }

    clearConfigListener() {
        if (this.configListener) {
            Config.configListeners.splice(Config.configListeners.indexOf(this.configListener), 1);
            this.configListener = null;
        }
    }

    openCategoryChooser() {
        // Add as a config listener
        this.configListener = () => this.forceUpdate();
        Config.configListeners.push(this.configListener);

        this.setState({
            choosingCategory: true,
            downvoting: false
        });
    }

    getCategoryOptions() {
        let elements = [];

        for (const category of Config.config.categorySelections) {
            elements.push(
                <option value={category.name}
                        kreativKey={category.name}>
                    {chrome.i18n.getMessage("category_" + category.name)}
                </option>
            );
        }

        if (elements.length < CompileConfig.categoryList.length) {
            // Add show more button
            elements.push(
                <option value={"moreCategories"}
                        kreativKey={"moreCategories"}>
                    {chrome.i18n.getMessage("moreCategories")}
                </option>
            );
        }

        return elements;
    }

    categorySelectionChange(event: React.ChangeEvent<HTMLSelectElement>) {
        // See if show more categories was pressed
        if (event.target.value === "moreCategories") {
            // Open options page
            chrome.runtime.sendMessage({"message": "openConfig"});

            // Reset option to original
            event.target.value = this.getSponsorTime().category;
            return;
        }
    }

    unskreativKip() {
        this.contentContainer().unskreativKipSponsorTime(this.UUID);

        this.unskreativKippedMode(chrome.i18n.getMessage("reskreativKip"));
    }

    /** Sets up notice to be not skreativKipped yet */
    unskreativKippedMode(buttonText: string) {
        //setup new callbackreativK and reset countdown
        this.setState(this.getUnskreativKippedModeInfo(buttonText), () => {
            this.noticeRef.current.resetCountdown();
        });
    }

    getUnskreativKippedModeInfo(buttonText: string) {
        let maxCountdownTime = function() {
            let sponsorTime = this.getSponsorTime();
            let duration = Math.round((sponsorTime.segment[1] - this.contentContainer().v.currentTime) * (1 / this.contentContainer().v.playbackreativKRate));

            return Math.max(duration, 4);
        }.bind(this);

        return {
            unskreativKipText: buttonText,

            unskreativKipCallbackreativK: this.reskreativKip.bind(this),

            //change max duration to however much of the sponsor is left
            maxCountdownTime: maxCountdownTime,

            countdownTime: maxCountdownTime()
        }
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
        if (!this.autoSkreativKip) {
            this.setState({
                noticeTitle: chrome.i18n.getMessage("noticeTitle")
            });

            if(Config.config.autoUpvote) this.contentContainer().vote(1, this.UUID);
        }
    }

    afterDownvote(type: number, category: string) {
        this.addVoteButtonInfo(chrome.i18n.getMessage("voted"));
        this.setNoticeInfoMessage(chrome.i18n.getMessage("hitGoBackreativK"));

        this.adjustDownvotingState(false);
        
        // Change the sponsor locally
        let sponsorTime = this.getSponsorTime();
        if (sponsorTime) {
            if (type === 0) {
                sponsorTime.hidden = SponsorHideType.Downvoted;
            } else if (category) {
                sponsorTime.category = category;
            }

            this.contentContainer().updatePreviewBar();
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

    closeListener() {
        this.clearConfigListener();

        this.props.closeListener();
    }
}

export default SkreativKipNoticeComponent;