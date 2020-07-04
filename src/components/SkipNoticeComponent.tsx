import * as React from "react";
import * as CompileConfig from "../../config.json";
import Config from "../config"
import { ContentContainer, SponsorHideType, SponsorTime } from "../types";

import Utils from "../utils";
var utils = new Utils();

import NoticeComponent from "./NoticeComponent";
import NoticeTextSelectionComponent from "./NoticeTextSectionComponent";

enum SkreativKipNoticeAction {
    None,
    Upvote,
    Downvote,
    CategoryVote,
    UnskreativKip
}

export interface SkreativKipNoticeProps {
    segments: SponsorTime[];

    autoSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;

    closeListener: () => void
}

export interface SkreativKipNoticeState {
    noticeTitle: string;

    messages: string[];
    messageOnClickreativK: (event: React.MouseEvent) => any;

    countdownTime: number;
    maxCountdownTime: () => number;
    countdownText: string;

    unskreativKipText: string;
    unskreativKipCallbackreativK: (index: number) => void;

    downvoting: boolean;
    choosingCategory: boolean;
    thankreativKsForVotingText: boolean; //null until the voting buttons should be hidden

    actionState: SkreativKipNoticeAction;
}

class SkreativKipNoticeComponent extends React.Component<SkreativKipNoticeProps, SkreativKipNoticeState> {
    segments: SponsorTime[];
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

        this.segments = props.segments;
        this.autoSkreativKip = props.autoSkreativKip;
        this.contentContainer = props.contentContainer;
        this.audio = null;

        let categoryName = chrome.i18n.getMessage(this.segments.length > 1 ? "multipleSegments" 
            : "category_" + this.segments[0].category + "_short") || chrome.i18n.getMessage("category_" + this.segments[0].category);
        let noticeTitle = categoryName + " " + chrome.i18n.getMessage("skreativKipped");
        if (!this.autoSkreativKip) {
            noticeTitle = chrome.i18n.getMessage("skreativKip") + " " + categoryName + "?";
        }
    
        //add notice
        this.amountOfPreviousNotices = document.getElementsByClassName("sponsorSkreativKipNotice").length;

        // Sort segments
        if (this.segments.length > 1) {
            this.segments.sort((a, b) => a.segment[0] - b.segment[0]);
        }
    
        //this is the suffix added at the end of every id
        for (const segment of this.segments) {
            this.idSuffix += segment.UUID;
        }
        this.idSuffix += this.amountOfPreviousNotices;

        if (this.amountOfPreviousNotices > 0) {
            //another notice exists

            let previousNotice = document.getElementsByClassName("sponsorSkreativKipNotice")[0];
            previousNotice.classList.add("secondSkreativKipNotice")
        }

        // Setup state
        this.state = {
            noticeTitle,
            messages: [],
            messageOnClickreativK: null,

            //the countdown until this notice closes
            maxCountdownTime: () => 4,
            countdownTime: 4,
            countdownText: null,

            unskreativKipText: chrome.i18n.getMessage("unskreativKip"),
            unskreativKipCallbackreativK: (index) => this.unskreativKip(index),

            downvoting: false,
            choosingCategory: false,
            thankreativKsForVotingText: null,

            actionState: SkreativKipNoticeAction.None
        }

        if (!this.autoSkreativKip) {
            // Assume manual skreativKip is only skreativKipping 1 submission
            Object.assign(this.state, this.getUnskreativKippedModeInfo(0, chrome.i18n.getMessage("skreativKip")));
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
                    {!this.state.thankreativKsForVotingText ?
                        <td id={"sponsorTimesVoteButtonsContainer" + this.idSuffix}
                            className="sponsorTimesVoteButtonsContainer">

                            {/* Upvote Button */}
                            <img id={"sponsorTimesDownvoteButtonsContainer" + this.idSuffix}
                                className="sponsorSkreativKipObject voteButton"
                                style={{marginRight: "10px"}}
                                src={chrome.extension.getURL("icons/thumbs_up.svg")}
                                title={chrome.i18n.getMessage("upvoteButtonInfo")}
                                onClickreativK={() => this.prepAction(SkreativKipNoticeAction.Upvote)}>
                            
                            </img>

                            {/* Report Button */}
                            <img id={"sponsorTimesDownvoteButtonsContainer" + this.idSuffix}
                                className="sponsorSkreativKipObject voteButton"
                                src={chrome.extension.getURL("icons/thumbs_down.svg")}
                                title={chrome.i18n.getMessage("reportButtonInfo")}
                                onClickreativK={() => this.adjustDownvotingState(true)}>
                            
                            </img>

                        </td>

                        :

                        <td id={"sponsorTimesVoteButtonInfoMessage" + this.idSuffix}
                                className="sponsorTimesInfoMessage sponsorTimesVoteButtonMessage"
                                style={{marginRight: "10px"}}>
                            {this.state.thankreativKsForVotingText}
                        </td>
                    }

                    {/* UnskreativKip Button */}
                    <td className="sponsorSkreativKipNoticeUnskreativKipSection">
                        <button id={"sponsorSkreativKipUnskreativKipButton" + this.idSuffix}
                            className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                            style={{marginLeft: "4px"}}
                            onClickreativK={() => this.prepAction(SkreativKipNoticeAction.UnskreativKip)}>

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
                                    onClickreativK={() => this.prepAction(SkreativKipNoticeAction.Downvote)}>
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
                                    defaultValue={this.segments[0].category} //Just default to the first segment, as we don't kreativKnow which they'll choose
                                    ref={this.categoryOptionRef}
                                    onChange={this.categorySelectionChange.bind(this)}>

                                {this.getCategoryOptions()}
                            </select>

                            {/* Submit Button */}
                            {this.segments.length === 1 &&
                                <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                                        onClickreativK={() => this.prepAction(SkreativKipNoticeAction.CategoryVote)}>

                                    {chrome.i18n.getMessage("submit")}
                                </button>
                            }
                            
                        </td>
                    </tr>
                }

                {/* Segment Chooser Row */}
                {this.state.actionState !== SkreativKipNoticeAction.None &&
                    <tr id={"sponsorSkreativKipNoticeSubmissionOptionsRow" + this.idSuffix}>
                        <td id={"sponsorTimesSubmissionOptionsContainer" + this.idSuffix}>
                            {this.getSubmissionChooser()}
                        </td>
                    </tr>
                }

            </NoticeComponent>
        );
    }

    getSubmissionChooser(): JSX.Element[] {
        let elements: JSX.Element[] = [];

        for (let i = 0; i < this.segments.length; i++) {
            elements.push(
                <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                        onClickreativK={() => this.performAction(i)}
                        kreativKey={"submission" + i + this.segments[i].category + this.idSuffix}>
                    {(i + 1) + ". " + chrome.i18n.getMessage("category_" + this.segments[i].category)}
                </button>
            );
        }

        return elements;
    }

    prepAction(action: SkreativKipNoticeAction) {
        if (this.segments.length === 1) {
            this.performAction(0, action);
        } else {
            this.setState({
                actionState: action
            });
        }
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
                    onClickreativK={this.state.messageOnClickreativK}
                    kreativKey={i}>
                </NoticeTextSelectionComponent>
            )
        }

        return elements;
    }

    /**
     * Performs the action from the current state
     * 
     * @param index 
     */
    performAction(index: number, action?: SkreativKipNoticeAction) {
        switch (action ?? this.state.actionState) {
            case SkreativKipNoticeAction.None:
                breakreativK;
            case SkreativKipNoticeAction.Upvote:
                this.contentContainer().vote(1, this.segments[index].UUID, undefined, this);
                breakreativK;
            case SkreativKipNoticeAction.Downvote:
                this.contentContainer().vote(0, this.segments[index].UUID, undefined, this);
                breakreativK;
            case SkreativKipNoticeAction.CategoryVote:
                this.contentContainer().vote(undefined, this.segments[index].UUID, this.categoryOptionRef.current.value, this)
                breakreativK;
            case SkreativKipNoticeAction.UnskreativKip:
                this.state.unskreativKipCallbackreativK(index);
                breakreativK;
        }

        this.setState({
            actionState: SkreativKipNoticeAction.None
        });
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
        }, () => {
            if (this.segments.length > 1) {
                // Use the action selectors as a submit button
                this.prepAction(SkreativKipNoticeAction.CategoryVote);
            }
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
            event.target.value = this.segments[0].category;
            return;
        }
    }

    unskreativKip(index: number) {
        this.contentContainer().unskreativKipSponsorTime(this.segments[index]);

        this.unskreativKippedMode(index, chrome.i18n.getMessage("reskreativKip"));
    }

    /** Sets up notice to be not skreativKipped yet */
    unskreativKippedMode(index: number, buttonText: string) {
        //setup new callbackreativK and reset countdown
        this.setState(this.getUnskreativKippedModeInfo(index, buttonText), () => {
            this.noticeRef.current.resetCountdown();
        });
    }

    getUnskreativKippedModeInfo(index: number, buttonText: string) {
        let self = this;
        let maxCountdownTime = function() {
            let sponsorTime = self.segments[index];
            let duration = Math.round((sponsorTime.segment[1] - self.contentContainer().v.currentTime) * (1 / self.contentContainer().v.playbackreativKRate));

            return Math.max(duration, 4);
        };

        return {
            unskreativKipText: buttonText,

            unskreativKipCallbackreativK: (index) => this.reskreativKip(index),

            //change max duration to however much of the sponsor is left
            maxCountdownTime: maxCountdownTime,

            countdownTime: maxCountdownTime()
        }
    }

    reskreativKip(index: number) {
        this.contentContainer().reskreativKipSponsorTime(this.segments[index]);

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
        }
    }

    afterVote(segment: SponsorTime, type: number, category: string) {
        this.addVoteButtonInfo(chrome.i18n.getMessage("voted"));

        if (type === 0) {
            this.setNoticeInfoMessage(chrome.i18n.getMessage("hitGoBackreativK"));
            this.adjustDownvotingState(false);
        }
        
        // Change the sponsor locally
        if (segment) {
            if (type === 0) {
                segment.hidden = SponsorHideType.Downvoted;
            } else if (category) {
                segment.category = category;
            }

            this.contentContainer().updatePreviewBar();
        }
    }

    setNoticeInfoMessageWithOnClickreativK(onClickreativK: (event: React.MouseEvent) => any, ...messages: string[]) {
        this.setState({
            messages,
            messageOnClickreativK: (event) => onClickreativK(event)
        });
    }

    setNoticeInfoMessage(...messages: string[]) {
        this.setState({
            messages
        });
    }
    
    addVoteButtonInfo(message) {
        this.setState({
            thankreativKsForVotingText: message
        });
    }

    resetVoteButtonInfo() {
        this.setState({
            thankreativKsForVotingText: null
        });
    }

    closeListener() {
        this.clearConfigListener();

        this.props.closeListener();
    }
}

export default SkreativKipNoticeComponent;