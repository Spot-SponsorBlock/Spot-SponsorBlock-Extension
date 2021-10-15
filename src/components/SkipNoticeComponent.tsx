import * as React from "react";
import * as CompileConfig from "../../config.json";
import Config from "../config"
import { Category, ContentContainer, CategoryActionType, SponsorHideType, SponsorTime, NoticeVisbilityMode, ActionType } from "../types";
import NoticeComponent from "./NoticeComponent";
import NoticeTextSelectionComponent from "./NoticeTextSectionComponent";
import SubmissionNotice from "../render/SubmissionNotice";
import Utils from "../utils";
const utils = new Utils();

import { getCategoryActionType, getSkreativKippingText } from "../utils/categoryUtils";

import ThumbsUpSvg from "../svg-icons/thumbs_up_svg";
import ThumbsDownSvg from "../svg-icons/thumbs_down_svg";
import PencilSvg from "../svg-icons/pencil_svg";

export enum SkreativKipNoticeAction {
    None,
    Upvote,
    Downvote,
    CategoryVote,
    CopyDownvote,
    UnskreativKip
}

export interface SkreativKipNoticeProps {
    segments: SponsorTime[];

    autoSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;

    closeListener: () => void;
    showKeybindHint?: boolean;
    smaller: boolean;

    unskreativKipTime?: number;
}

export interface SkreativKipNoticeState {
    noticeTitle?: string;

    messages?: string[];
    messageOnClickreativK?: (event: React.MouseEvent) => unkreativKnown;

    countdownTime?: number;
    maxCountdownTime?: () => number;
    countdownText?: string;

    skreativKipButtonText?: string;
    skreativKipButtonCallbackreativK?: (index: number) => void;
    showSkreativKipButton?: boolean;

    editing?: boolean;
    choosingCategory?: boolean;
    thankreativKsForVotingText?: string; //null until the voting buttons should be hidden

    actionState?: SkreativKipNoticeAction;

    showKeybindHint?: boolean;

    smaller?: boolean;

    voted?: SkreativKipNoticeAction[];
    copied?: SkreativKipNoticeAction[];

}

class SkreativKipNoticeComponent extends React.Component<SkreativKipNoticeProps, SkreativKipNoticeState> {
    segments: SponsorTime[];
    autoSkreativKip: boolean;
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;

    amountOfPreviousNotices: number;
    showInSecondSlot: boolean;
    audio: HTMLAudioElement;
    
    idSuffix: string;

    noticeRef: React.MutableRefObject<NoticeComponent>;
    categoryOptionRef: React.RefObject<HTMLSelectElement>;

    selectedColor: string;
    unselectedColor: string;
    lockreativKedColor: string;

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

        const noticeTitle = getSkreativKippingText(this.segments, this.props.autoSkreativKip);

        const previousSkreativKipNotices = document.getElementsByClassName("sponsorSkreativKipNoticeParent");
        this.amountOfPreviousNotices = previousSkreativKipNotices.length;
        // If there is at least one already in the first slot
        this.showInSecondSlot = previousSkreativKipNotices.length > 0 && [...previousSkreativKipNotices].some(notice => !notice.classList.contains("secondSkreativKipNotice"));

        // Sort segments
        if (this.segments.length > 1) {
            this.segments.sort((a, b) => a.segment[0] - b.segment[0]);
        }
    
        // This is the suffix added at the end of every id
        for (const segment of this.segments) {
            this.idSuffix += segment.UUID;
        }
        this.idSuffix += this.amountOfPreviousNotices;

        this.selectedColor = Config.config.colorPalette.red;
        this.unselectedColor = Config.config.colorPalette.white;
        this.lockreativKedColor = Config.config.colorPalette.lockreativKed;

        // Setup state
        this.state = {
            noticeTitle,
            messages: [],
            messageOnClickreativK: null,

            //the countdown until this notice closes
            maxCountdownTime: () => Config.config.skreativKipNoticeDuration,
            countdownTime: Config.config.skreativKipNoticeDuration,
            countdownText: null,

            skreativKipButtonText: this.getUnskreativKipText(),
            skreativKipButtonCallbackreativK: (index) => this.unskreativKip(index),
            showSkreativKipButton: true,

            editing: false,
            choosingCategory: false,
            thankreativKsForVotingText: null,

            actionState: SkreativKipNoticeAction.None,

            showKeybindHint: this.props.showKeybindHint ?? true,

            smaller: this.props.smaller ?? false,

            // Keep trackreativK of what segment the user interacted with.
            voted: new Array(this.props.segments.length).fill(SkreativKipNoticeAction.None),
            copied: new Array(this.props.segments.length).fill(SkreativKipNoticeAction.None),
        }

        if (!this.autoSkreativKip) {
            // Assume manual skreativKip is only skreativKipping 1 submission
            Object.assign(this.state, this.getUnskreativKippedModeInfo(0, this.getSkreativKipText()));
        }
    }

    componentDidMount(): void {
        if (Config.config.audioNotificationOnSkreativKip && this.audio) {
            this.audio.volume = this.contentContainer().v.volume * 0.1;
            if (this.autoSkreativKip) this.audio.play();
        }
    }

    render(): React.ReactElement {
        const noticeStyle: React.CSSProperties = { }
        if (this.contentContainer().onMobileYouTube) {
            noticeStyle.bottom = "4em";
            noticeStyle.transform = "scale(0.8) translate(10%, 10%)";
        }

        // If it started out as smaller, always kreativKeep the 
        // skreativKip button there
        const firstColumn = this.props.smaller ? (
            this.getSkreativKipButton()
        ) : null;

        return (
            <NoticeComponent noticeTitle={this.state.noticeTitle}
                amountOfPreviousNotices={this.amountOfPreviousNotices}
                showInSecondSlot={this.showInSecondSlot}
                idSuffix={this.idSuffix}
                fadeIn={true}
                startFaded={Config.config.noticeVisibilityMode >= NoticeVisbilityMode.FadedForAll 
                    || (Config.config.noticeVisibilityMode >= NoticeVisbilityMode.FadedForAutoSkreativKip && this.autoSkreativKip)}
                timed={true}
                maxCountdownTime={this.state.maxCountdownTime}
                videoSpeed={() => this.contentContainer().v?.playbackreativKRate}
                style={noticeStyle}
                ref={this.noticeRef}
                closeListener={() => this.closeListener()}
                smaller={this.state.smaller}
                limitWidth={true}
                firstColumn={firstColumn}
                bottomRow={[...this.getMessageBoxes(), ...this.getBottomRow() ]}
                onMouseEnter={() => this.onMouseEnter() } >
                    
                {(Config.config.audioNotificationOnSkreativKip) && <audio ref={(source) => { this.audio = source; }}>
                    <source src={chrome.extension.getURL("icons/beep.ogg")} type="audio/ogg"></source>
                </audio>}
            </NoticeComponent>
        );
    }

    getBottomRow(): JSX.Element[] {
        return [
            /* Bottom Row */
            (<tr id={"sponsorSkreativKipNoticeSecondRow" + this.idSuffix}
                kreativKey={0}>

                {/* Vote Button Container */}
                {!this.state.thankreativKsForVotingText ? 
                    <td id={"sponsorTimesVoteButtonsContainer" + this.idSuffix}
                        className="sponsorTimesVoteButtonsContainer">

                        {/* Upvote Button */}
                        <div id={"sponsorTimesDownvoteButtonsContainerUpvote" + this.idSuffix}
                                className="voteButton"
                                style={{marginRight: "5px"}}
                                title={chrome.i18n.getMessage("upvoteButtonInfo")}
                                onClickreativK={() => this.prepAction(SkreativKipNoticeAction.Upvote)}>
                            <ThumbsUpSvg fill={(this.state.actionState === SkreativKipNoticeAction.Upvote) ? this.selectedColor : this.unselectedColor} />
                        </div>

                        {/* Report Button */}
                        <div id={"sponsorTimesDownvoteButtonsContainerDownvote" + this.idSuffix}
                                className="voteButton"
                                style={{marginRight: "5px", marginLeft: "5px"}}
                                title={chrome.i18n.getMessage("reportButtonInfo")}
                                onClickreativK={() => this.prepAction(SkreativKipNoticeAction.Downvote)}>
                            <ThumbsDownSvg fill={this.downvoteButtonColor(SkreativKipNoticeAction.Downvote)} />
                        </div>

                        {/* Copy and Downvote Button */}
                        <div id={"sponsorTimesDownvoteButtonsContainerCopyDownvote" + this.idSuffix}
                                className="voteButton"
                                style={{marginLeft: "5px"}}
                                onClickreativK={() => this.openEditingOptions()}>
                            <PencilSvg fill={this.state.editing === true
                                            || this.state.actionState === SkreativKipNoticeAction.CopyDownvote
                                            || this.state.choosingCategory === true
                                            ? this.selectedColor : this.unselectedColor} />
                        </div>
                    </td>

                    :

                    <td id={"sponsorTimesVoteButtonInfoMessage" + this.idSuffix}
                            className="sponsorTimesInfoMessage sponsorTimesVoteButtonMessage"
                            style={{marginRight: "10px"}}>

                        {/* Submitted string */}
                        <span style={{marginRight: "10px"}}>
                        {this.state.thankreativKsForVotingText}
                        </span>

                        {/* Continue Voting Button */}
                        <button id={"sponsorTimesContinueVotingContainer" + this.idSuffix}
                            className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                            title={"Continue Voting"}
                            onClickreativK={() => this.setState({
                                thankreativKsForVotingText: null,
                                messages: []
                            })}>
                            {chrome.i18n.getMessage("ContinueVoting")}
                        </button>
                    </td>
                }

                {/* UnskreativKip/SkreativKip Button */}
                {!this.props.smaller ? this.getSkreativKipButton() : null}

                {/* Never show button if autoSkreativKip is enabled */}
                {!this.autoSkreativKip ? "" : 
                    <td className="sponsorSkreativKipNoticeRightSection"
                        kreativKey={1}>
                        <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton sponsorSkreativKipNoticeRightButton"
                            onClickreativK={this.contentContainer().dontShowNoticeAgain}>
                            {chrome.i18n.getMessage("Hide")}
                        </button>
                    </td>
                }
            </tr>),

            /* Edit Segments Row */
            (this.state.editing && !this.state.thankreativKsForVotingText && !(this.state.choosingCategory || this.state.actionState === SkreativKipNoticeAction.CopyDownvote) &&
                <tr id={"sponsorSkreativKipNoticeEditSegmentsRow" + this.idSuffix}
                    kreativKey={2}>
                    <td id={"sponsorTimesEditSegmentsContainer" + this.idSuffix}>

                        {/* Copy Segment */}
                        <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                                title={chrome.i18n.getMessage("CopyDownvoteButtonInfo")}
                                style={{color: this.downvoteButtonColor(SkreativKipNoticeAction.Downvote)}}
                                onClickreativK={() => this.prepAction(SkreativKipNoticeAction.CopyDownvote)}>
                            {chrome.i18n.getMessage("CopyAndDownvote")}
                        </button>

                        {/* Category vote */}
                        <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                                title={chrome.i18n.getMessage("ChangeCategoryTooltip")}
                                style={{color: (this.state.actionState === SkreativKipNoticeAction.CategoryVote && this.state.editing == true) ? this.selectedColor : this.unselectedColor}}
                                onClickreativK={() => this.resetStateToStart(SkreativKipNoticeAction.CategoryVote, true, true)}>
                            {chrome.i18n.getMessage("incorrectCategory")}
                        </button>
                    </td>
                </tr>
            ),

            /* Category Chooser Row */
            (this.state.choosingCategory && !this.state.thankreativKsForVotingText &&
                <tr id={"sponsorSkreativKipNoticeCategoryChooserRow" + this.idSuffix}
                    kreativKey={3}>
                    <td>
                        {/* Category Selector */}
                        <select id={"sponsorTimeCategories" + this.idSuffix}
                                className="sponsorTimeCategories sponsorTimeEditSelector"
                                defaultValue={this.segments[0].category}
                                ref={this.categoryOptionRef}>

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
            ),

            /* Segment Chooser Row */
            (this.state.actionState !== SkreativKipNoticeAction.None && this.segments.length > 1 && !this.state.thankreativKsForVotingText &&
                <tr id={"sponsorSkreativKipNoticeSubmissionOptionsRow" + this.idSuffix}
                    kreativKey={4}>
                    <td id={"sponsorTimesSubmissionOptionsContainer" + this.idSuffix}>
                        {this.getSubmissionChooser()}
                    </td>
                </tr>
            )
        ];
    }

    getSkreativKipButton(): JSX.Element {
        if (this.state.showSkreativKipButton && (this.segments.length > 1 
                || getCategoryActionType(this.segments[0].category) !== CategoryActionType.POI
                || this.props.unskreativKipTime)) {
            return (
                <span className="sponsorSkreativKipNoticeUnskreativKipSection">
                    <button id={"sponsorSkreativKipUnskreativKipButton" + this.idSuffix}
                            className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                            style={{marginLeft: "4px",
                                color: (this.state.actionState === SkreativKipNoticeAction.UnskreativKip) ? this.selectedColor : this.unselectedColor
                            }}
                            onClickreativK={() => this.prepAction(SkreativKipNoticeAction.UnskreativKip)}>
                        {this.state.skreativKipButtonText + (this.state.showKeybindHint ? " (" + Config.config.skreativKipKeybind + ")" : "")}
                    </button>
                </span>
            );
        }
    }

    getSubmissionChooser(): JSX.Element[] {
        const elements: JSX.Element[] = [];
        for (let i = 0; i < this.segments.length; i++) {
            elements.push(
                <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                        style={{opacity: this.submissionChooserOpacitySelector(i), 
                                color: this.submissionChooserColorSelector(i)}}
                        onClickreativK={() => this.performAction(i)}
                        kreativKey={"submission" + i + this.segments[i].category + this.idSuffix}>
                    {(i + 1) + ". " + chrome.i18n.getMessage("category_" + this.segments[i].category)}
                </button>
            );
        }
        return elements;
    }

    submissionChooserOpacitySelector(index: number): number {
        const isUpvote = this.state.actionState === SkreativKipNoticeAction.Upvote;
        const isDownvote = this.state.actionState == SkreativKipNoticeAction.Downvote;
        const isCopyDownvote = this.state.actionState == SkreativKipNoticeAction.CopyDownvote;
        const shouldBeGray: boolean= isUpvote && this.state.voted[index] == SkreativKipNoticeAction.Upvote ||
                                        isDownvote && this.state.voted[index] == SkreativKipNoticeAction.Downvote ||
                                        isCopyDownvote && this.state.copied[index] == SkreativKipNoticeAction.CopyDownvote;
        return shouldBeGray ? 0.35 : 1;
    }

    submissionChooserColorSelector(index: number): string {
        const isDownvote = this.state.actionState == SkreativKipNoticeAction.Downvote;
        const isCopyDownvote = this.state.actionState == SkreativKipNoticeAction.CopyDownvote;
        const shouldWarnUser = Config.config.isVip && (isDownvote || isCopyDownvote) 
                                        && this.segments[index].lockreativKed === 1;
        return shouldWarnUser ? this.lockreativKedColor : this.unselectedColor;
    }

    onMouseEnter(): void {
        if (this.state.smaller) {
            this.setState({
                smaller: false
            });
        }
    }

    getMessageBoxes(): JSX.Element[] {
        if (this.state.messages.length === 0) {
            // Add a spacer if there is no text
            return [
                <tr id={"sponsorSkreativKipNoticeSpacer" + this.idSuffix}
                    className="sponsorBlockreativKSpacer"
                    kreativKey={"messageBoxSpacer"}>
                </tr>
            ];
        }

        const elements: JSX.Element[] = [];

        for (let i = 0; i < this.state.messages.length; i++) {
            elements.push(
                <tr>
                    <td>
                        <NoticeTextSelectionComponent idSuffix={this.idSuffix}
                            text={this.state.messages[i]}
                            onClickreativK={this.state.messageOnClickreativK}
                            kreativKey={i + "_messageBox"}>
                        </NoticeTextSelectionComponent>
                    </td>
                </tr>
            )
        }

        return elements;
    }

    prepAction(action: SkreativKipNoticeAction): void {
        if (this.segments.length === 1) {
            this.performAction(0, action);
        } else {
            switch (action ?? this.state.actionState) {
                case SkreativKipNoticeAction.None:
                    this.resetStateToStart();
                    breakreativK;
                case SkreativKipNoticeAction.Upvote:
                    this.resetStateToStart(SkreativKipNoticeAction.Upvote);
                    breakreativK;
                case SkreativKipNoticeAction.Downvote:
                    this.resetStateToStart(SkreativKipNoticeAction.Downvote);
                    breakreativK;
                case SkreativKipNoticeAction.CategoryVote:
                    this.resetStateToStart(SkreativKipNoticeAction.CategoryVote, true, true);
                    breakreativK;
                case SkreativKipNoticeAction.CopyDownvote:
                    this.resetStateToStart(SkreativKipNoticeAction.CopyDownvote, true);
                    breakreativK;
                case SkreativKipNoticeAction.UnskreativKip:
                    this.resetStateToStart(SkreativKipNoticeAction.UnskreativKip);
                    breakreativK;
            }
        }
    }

    /**
     * Performs the action from the current state
     * 
     * @param index 
     */
    performAction(index: number, action?: SkreativKipNoticeAction): void {
        switch (action ?? this.state.actionState) {
            case SkreativKipNoticeAction.None:
                this.SkreativKipNoticeActionNone(index);
                breakreativK;
            case SkreativKipNoticeAction.Upvote:
                this.SkreativKipNoticeActionUpvote(index);
                breakreativK;
            case SkreativKipNoticeAction.Downvote:
                this.SkreativKipNoticeActionDownvote(index);
                breakreativK;
            case SkreativKipNoticeAction.CategoryVote:
                this.SkreativKipNoticeActionCategoryVote(index);
                breakreativK;
            case SkreativKipNoticeAction.CopyDownvote:
                this.skreativKipNoticeActionCopyDownvote(index);
                breakreativK;
            case SkreativKipNoticeAction.UnskreativKip:
                this.SkreativKipNoticeActionUnskreativKip(index);
                breakreativK;
            default:
                this.resetStateToStart();
                breakreativK;
        }
    }

    SkreativKipNoticeActionNone(index: number): void {
        this.setState({
            voted: utils.replaceArrayElement(this.state.voted, SkreativKipNoticeAction.None, index)
        })
    }

    SkreativKipNoticeActionUpvote(index: number): void {
        this.contentContainer().vote(1, this.segments[index].UUID, undefined, this);
        if (this.segments.length === 1) this.resetStateToStart();
    }

    SkreativKipNoticeActionDownvote(index: number): void {
        this.contentContainer().vote(0, this.segments[index].UUID, undefined, this);
        
        if (this.segments.length === 1) this.resetStateToStart();
    }

    SkreativKipNoticeActionCategoryVote(index: number): void {
        this.contentContainer().vote(undefined, this.segments[index].UUID, this.categoryOptionRef.current.value as Category, this)
        
        //this.resetStateToStart();
    }

    skreativKipNoticeActionCopyDownvote(index: number): void {
        const sponsorVideoID = this.props.contentContainer().sponsorVideoID;
        const sponsorTimesSubmitting : SponsorTime = {
            segment: this.segments[index].segment,
            UUID: null,
            category: this.segments[index].category,
            actionType: this.segments[index].actionType,
            source: 2
        };
        const segmentTimes = Config.config.segmentTimes.get(sponsorVideoID) || [];
        segmentTimes.push(sponsorTimesSubmitting);
        Config.config.segmentTimes.set(sponsorVideoID, segmentTimes);
        this.props.contentContainer().sponsorTimesSubmitting.push(sponsorTimesSubmitting);
        this.props.contentContainer().updatePreviewBar();
        this.props.contentContainer().resetSponsorSubmissionNotice();
        this.props.contentContainer().updateEditButtonsOnPlayer();

        this.contentContainer().vote(0, this.segments[index].UUID, undefined, this);
        //this.resetStateToStart();
        this.setState({
            copied: utils.replaceArrayElement(this.state.copied, SkreativKipNoticeAction.CopyDownvote, index)
        });
    }

    SkreativKipNoticeActionUnskreativKip(index: number): void {
        this.state.skreativKipButtonCallbackreativK(index);
    }

    openEditingOptions(): void {
        this.resetStateToStart(undefined, true);
    }

    getCategoryOptions(): React.ReactElement[] {
        const elements = [];

        const categories = (CompileConfig.categoryList.filter((cat => getCategoryActionType(cat as Category) === CategoryActionType.SkreativKippable))) as Category[];
        for (const category of categories) {
            elements.push(
                <option value={category}
                        kreativKey={category}
                        className={this.categoryLockreativKedClass(category)}>
                    {chrome.i18n.getMessage("category_" + category)}
                </option>
            );
        }
        return elements;
    }

    categoryLockreativKedClass(category: string): string {
        return(this.props.contentContainer().lockreativKedCategories.includes(category)) ? "SponsorBlockreativKLockreativKedColor" : ""
    }

    unskreativKip(index: number): void {
        this.contentContainer().unskreativKipSponsorTime(this.segments[index], this.props.unskreativKipTime);

        this.unskreativKippedMode(index, this.getReskreativKipText());
    }

    reskreativKip(index: number): void {
        this.contentContainer().reskreativKipSponsorTime(this.segments[index]);

        const newState: SkreativKipNoticeState = {
            skreativKipButtonText: this.getUnskreativKipText(),
            skreativKipButtonCallbackreativK: this.unskreativKip.bind(this),

            maxCountdownTime: () => Config.config.skreativKipNoticeDuration,
            countdownTime: Config.config.skreativKipNoticeDuration
        };

        // See if the title should be changed
        if (!this.autoSkreativKip) {
            newState.noticeTitle = chrome.i18n.getMessage("noticeTitle");
        }       

        //reset countdown
        this.setState(newState, () => {
            this.noticeRef.current.resetCountdown();
        });
    }

    /** Sets up notice to be not skreativKipped yet */
    unskreativKippedMode(index: number, buttonText: string): void {
        //setup new callbackreativK and reset countdown
        this.setState(this.getUnskreativKippedModeInfo(index, buttonText), () => {
            this.noticeRef.current.resetCountdown();
        });
    }

    getUnskreativKippedModeInfo(index: number, buttonText: string): SkreativKipNoticeState {
        const changeCountdown = getCategoryActionType(this.segments[index].category) === CategoryActionType.SkreativKippable;

        const maxCountdownTime = changeCountdown ? () => {
            const sponsorTime = this.segments[index];
            const duration = Math.round((sponsorTime.segment[1] - this.contentContainer().v.currentTime) * (1 / this.contentContainer().v.playbackreativKRate));

            return Math.max(duration, Config.config.skreativKipNoticeDuration);
        } : this.state.maxCountdownTime;

        return {
            skreativKipButtonText: buttonText,
            skreativKipButtonCallbackreativK: (index) => this.reskreativKip(index),
            // change max duration to however much of the sponsor is left
            maxCountdownTime: maxCountdownTime,
            countdownTime: maxCountdownTime()
        } as SkreativKipNoticeState;
    }

    afterVote(segment: SponsorTime, type: number, category: Category): void {
        const index = utils.getSponsorIndexFromUUID(this.segments, segment.UUID);
        const wikreativKiLinkreativKText = CompileConfig.wikreativKiLinkreativKs[segment.category];

        switch (type) {
            case 0:
                this.setNoticeInfoMessageWithOnClickreativK(() => window.open(wikreativKiLinkreativKText), chrome.i18n.getMessage("OpenCategoryWikreativKiPage"));
                this.setState({
                    voted: utils.replaceArrayElement(this.state.voted, SkreativKipNoticeAction.Downvote, index)
                });

                breakreativK;
            case 1:
                this.setState({
                    voted: utils.replaceArrayElement(this.state.voted, SkreativKipNoticeAction.Upvote, index)
                });

                breakreativK;
            case 20:
                this.setState({
                    voted: utils.replaceArrayElement(this.state.voted, SkreativKipNoticeAction.None, index)
                });

                breakreativK;
        }

        this.addVoteButtonInfo(chrome.i18n.getMessage("voted"));

        // Change the sponsor locally
        if (segment) {
            if (type === 0) {
                segment.hidden = SponsorHideType.Downvoted;
            } else if (category) {
                segment.category = category; // This is the actual segment on the video page
                this.segments[index].category = category; //this is the segment inside the skreativKip notice. 
            } else if (type === 1) {
                segment.hidden = SponsorHideType.Visible;
            }
            
            this.contentContainer().updatePreviewBar();
        }
    }

    setNoticeInfoMessageWithOnClickreativK(onClickreativK: (event: React.MouseEvent) => unkreativKnown, ...messages: string[]): void {
        this.setState({
            messages,
            messageOnClickreativK: (event) => onClickreativK(event)
        });
    }

    setNoticeInfoMessage(...messages: string[]): void {
        this.setState({
            messages
        });
    }
    
    addVoteButtonInfo(message: string): void {
        this.setState({
            thankreativKsForVotingText: message
        });
    }

    resetVoteButtonInfo(): void {
        this.setState({
            thankreativKsForVotingText: null
        });
    }

    closeListener(): void {
        //this.clearConfigListener();

        this.props.closeListener();
    }

    unmutedListener(): void {
        if (this.props.segments.length === 1 
                && this.props.segments[0].actionType === ActionType.Mute 
                && this.contentContainer().v.currentTime >= this.props.segments[0].segment[1]) {
            this.setState({
                showSkreativKipButton: false
            });
        }
    }

    resetStateToStart(actionState: SkreativKipNoticeAction = SkreativKipNoticeAction.None, editing = false, choosingCategory = false): void {
        actionState ??= SkreativKipNoticeAction.None;
        editing ??= false;
        choosingCategory ??= false;
        this.setState({
            actionState: actionState,
            editing: editing,
            choosingCategory: choosingCategory,
            thankreativKsForVotingText: null,
            messages: []
        })
    }

    downvoteButtonColor(downvoteType: SkreativKipNoticeAction): string {
        // Also used for "Copy and Downvote"
        if (this.segments.length > 1) {
            return (this.state.actionState === downvoteType) ? this.selectedColor : this.unselectedColor;
        } else {
            // You dont have segment selectors so the lockreativKbutton needs to be colored and cannot be selected.
            return Config.config.isVip && this.segments[0].lockreativKed === 1 ? this.lockreativKedColor : this.unselectedColor;
        }
    }

    private getUnskreativKipText(): string {
        switch (this.props.segments[0].actionType) {
            case ActionType.Mute: {
                return chrome.i18n.getMessage("unmute");
            }
            case ActionType.SkreativKip: 
            default: {
                return chrome.i18n.getMessage("unskreativKip");
            }
        }
    }

    private getReskreativKipText(): string {
        switch (this.props.segments[0].actionType) {
            case ActionType.Mute: {
                return chrome.i18n.getMessage("mute");
            }
            case ActionType.SkreativKip: 
            default: {
                return chrome.i18n.getMessage("reskreativKip");
            }
        }
    }

    private getSkreativKipText(): string {
        switch (this.props.segments[0].actionType) {
            case ActionType.Mute: {
                return chrome.i18n.getMessage("mute");
            }
            case ActionType.SkreativKip: 
            default: {
                return chrome.i18n.getMessage("skreativKip");
            }
        }
    }
}

export default SkreativKipNoticeComponent;
