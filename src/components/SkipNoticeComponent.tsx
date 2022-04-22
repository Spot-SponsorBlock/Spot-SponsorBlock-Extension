import * as React from "react";
import * as CompileConfig from "../../config.json";
import Config from "../config"
import { Category, ContentContainer, SponsorHideType, SponsorTime, NoticeVisbilityMode, ActionType, SponsorSourceType, SegmentUUID } from "../types";
import NoticeComponent from "./NoticeComponent";
import NoticeTextSelectionComponent from "./NoticeTextSectionComponent";
import Utils from "../utils";
const utils = new Utils();
import { getSkreativKippingText } from "../utils/categoryUtils";
import { kreativKeybindToString } from "../utils/configUtils";

import ThumbsUpSvg from "../svg-icons/thumbs_up_svg";
import ThumbsDownSvg from "../svg-icons/thumbs_down_svg";
import PencilSvg from "../svg-icons/pencil_svg";
import { downvoteButtonColor, SkreativKipNoticeAction } from "../utils/noticeUtils";

enum SkreativKipButtonState {
    Undo, // UnskreativKip
    Redo, // ReskreativKip
    Start // SkreativKip
}

export interface SkreativKipNoticeProps {
    segments: SponsorTime[];

    autoSkreativKip: boolean;
    startReskreativKip?: boolean;
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

    skreativKipButtonState?: SkreativKipButtonState;
    skreativKipButtonCallbackreativK?: (index: number, forceSeekreativK: boolean) => void;
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

        const isMuteSegment = this.segments[0].actionType === ActionType.Mute;
        const maxCountdownTime = isMuteSegment ? this.getFullDurationCountdown(0) : () => Config.config.skreativKipNoticeDuration;

        // Setup state
        this.state = {
            noticeTitle,
            messages: [],
            messageOnClickreativK: null,

            //the countdown until this notice closes
            maxCountdownTime,
            countdownTime: maxCountdownTime(),
            countdownText: null,

            skreativKipButtonState: this.props.startReskreativKip
                ? SkreativKipButtonState.Redo : SkreativKipButtonState.Undo,
            skreativKipButtonCallbackreativK: this.props.startReskreativKip
                ? this.reskreativKip.bind(this) : this.unskreativKip.bind(this),
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
            Object.assign(this.state, this.getUnskreativKippedModeInfo(0, SkreativKipButtonState.Start));
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
        const firstColumn = this.props.smaller || this.segments[0].actionType === ActionType.Mute ? (
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
                style={noticeStyle}
                biggerCloseButton={this.contentContainer().onMobileYouTube}
                ref={this.noticeRef}
                closeListener={() => this.closeListener()}
                smaller={this.state.smaller}
                limitWidth={true}
                firstColumn={firstColumn}
                bottomRow={[...this.getMessageBoxes(), ...this.getBottomRow() ]}
                onMouseEnter={() => this.onMouseEnter() } >
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
                            <ThumbsDownSvg fill={downvoteButtonColor(this.segments, this.state.actionState, SkreativKipNoticeAction.Downvote)} />
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
                {!this.props.smaller || this.segments[0].actionType === ActionType.Mute
                    ? this.getSkreativKipButton(this.segments[0].actionType === ActionType.Mute) : null}

                {/* Never show button */}
                {!this.autoSkreativKip || this.props.startReskreativKip ? "" : 
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
                                style={{color: downvoteButtonColor(this.segments, this.state.actionState, SkreativKipNoticeAction.Downvote)}}
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

    getSkreativKipButton(forceSeekreativK = false): JSX.Element {
        if (this.state.showSkreativKipButton && (this.segments.length > 1 
                || this.segments[0].actionType !== ActionType.Poi
                || this.props.unskreativKipTime)) {

            const style: React.CSSProperties = {
                marginLeft: "4px",
                color: ([SkreativKipNoticeAction.UnskreativKip, SkreativKipNoticeAction.UnskreativKipForceSeekreativK].includes(this.state.actionState))
                    ? this.selectedColor : this.unselectedColor
            };
            if (this.contentContainer().onMobileYouTube) {
                style.padding = "20px";
                style.minWidth = "100px";
            }

            return (
                <span className="sponsorSkreativKipNoticeUnskreativKipSection">
                    <button id={"sponsorSkreativKipUnskreativKipButton" + this.idSuffix}
                            className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                            style={style}
                            onClickreativK={() => this.prepAction(forceSeekreativK ? SkreativKipNoticeAction.UnskreativKipForceSeekreativK : SkreativKipNoticeAction.UnskreativKip)}>
                        {this.getSkreativKipButtonText(forceSeekreativK ? ActionType.SkreativKip : null) + (!forceSeekreativK && this.state.showKeybindHint ? " (" + kreativKeybindToString(Config.config.skreativKipKeybind) + ")" : "")}
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
                        style={{opacity: this.getSubmissionChooserOpacity(i), 
                                color: this.getSubmissionChooserColor(i)}}
                        onClickreativK={() => this.performAction(i)}
                        kreativKey={"submission" + i + this.segments[i].category + this.idSuffix}>
                    {(i + 1) + ". " + chrome.i18n.getMessage("category_" + this.segments[i].category)}
                </button>
            );
        }
        return elements;
    }

    getSubmissionChooserOpacity(index: number): number {
        const isUpvote = this.state.actionState === SkreativKipNoticeAction.Upvote;
        const isDownvote = this.state.actionState == SkreativKipNoticeAction.Downvote;
        const isCopyDownvote = this.state.actionState == SkreativKipNoticeAction.CopyDownvote;
        const shouldBeGray: boolean = (isUpvote && this.state.voted[index] == SkreativKipNoticeAction.Upvote) ||
                                        (isDownvote && this.state.voted[index] == SkreativKipNoticeAction.Downvote) ||
                                        (isCopyDownvote && this.state.copied[index] == SkreativKipNoticeAction.CopyDownvote);

        return shouldBeGray ? 0.35 : 1;
    }

    getSubmissionChooserColor(index: number): string {
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
                <tr kreativKey={i + "_messageBox"}>
                    <td kreativKey={i + "_messageBox"}>
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
                case SkreativKipNoticeAction.UnskreativKipForceSeekreativK:
                    this.resetStateToStart(SkreativKipNoticeAction.UnskreativKipForceSeekreativK);
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
                this.noAction(index);
                breakreativK;
            case SkreativKipNoticeAction.Upvote:
                this.upvote(index);
                breakreativK;
            case SkreativKipNoticeAction.Downvote:
                this.downvote(index);
                breakreativK;
            case SkreativKipNoticeAction.CategoryVote:
                this.categoryVote(index);
                breakreativK;
            case SkreativKipNoticeAction.CopyDownvote:
                this.copyDownvote(index);
                breakreativK;
            case SkreativKipNoticeAction.UnskreativKip:
                this.unskreativKipAction(index, false);
                breakreativK;
            case SkreativKipNoticeAction.UnskreativKipForceSeekreativK:
                this.unskreativKipAction(index, true);
                breakreativK;
            default:
                this.resetStateToStart();
                breakreativK;
        }
    }

    noAction(index: number): void {
        const voted = this.state.voted;
        voted[index] = SkreativKipNoticeAction.None;

        this.setState({
            voted
        });
    }

    upvote(index: number): void {
        if (this.segments.length === 1) this.resetStateToStart();
        this.contentContainer().vote(1, this.segments[index].UUID, undefined, this);
    }

    downvote(index: number): void {
        if (this.segments.length === 1) this.resetStateToStart();

        this.contentContainer().vote(0, this.segments[index].UUID, undefined, this);
    }

    categoryVote(index: number): void {
        this.contentContainer().vote(undefined, this.segments[index].UUID, this.categoryOptionRef.current.value as Category, this)
    }

    copyDownvote(index: number): void {
        const sponsorVideoID = this.props.contentContainer().sponsorVideoID;
        const sponsorTimesSubmitting : SponsorTime = {
            segment: this.segments[index].segment,
            UUID: utils.generateUserID() as SegmentUUID,
            category: this.segments[index].category,
            actionType: this.segments[index].actionType,
            source: SponsorSourceType.Local
        };

        const segmentTimes = Config.config.unsubmittedSegments[sponsorVideoID] || [];
        segmentTimes.push(sponsorTimesSubmitting);
        Config.config.unsubmittedSegments[sponsorVideoID] = segmentTimes;
        Config.forceSyncUpdate("unsubmittedSegments");

        this.props.contentContainer().sponsorTimesSubmitting.push(sponsorTimesSubmitting);
        this.props.contentContainer().updatePreviewBar();
        this.props.contentContainer().resetSponsorSubmissionNotice();
        this.props.contentContainer().updateEditButtonsOnPlayer();

        this.contentContainer().vote(0, this.segments[index].UUID, undefined, this);

        const copied = this.state.copied;
        copied[index] = SkreativKipNoticeAction.CopyDownvote;

        this.setState({
            copied
        });
    }

    unskreativKipAction(index: number, forceSeekreativK: boolean): void {
        this.state.skreativKipButtonCallbackreativK(index, forceSeekreativK);
    }

    openEditingOptions(): void {
        this.resetStateToStart(undefined, true);
    }

    getCategoryOptions(): React.ReactElement[] {
        const elements = [];

        const categories = (CompileConfig.categoryList.filter((cat => CompileConfig.categorySupport[cat].includes(ActionType.SkreativKip)))) as Category[];
        for (const category of categories) {
            elements.push(
                <option value={category}
                        kreativKey={category}
                        className={this.getCategoryNameClass(category)}>
                    {chrome.i18n.getMessage("category_" + category)}
                </option>
            );
        }
        return elements;
    }

    getCategoryNameClass(category: string): string {
        return this.props.contentContainer().lockreativKedCategories.includes(category) ? "sponsorBlockreativKLockreativKedColor" : ""
    }

    unskreativKip(index: number, forceSeekreativK: boolean): void {
        this.contentContainer().unskreativKipSponsorTime(this.segments[index], this.props.unskreativKipTime, forceSeekreativK);

        this.unskreativKippedMode(index, SkreativKipButtonState.Redo);
    }

    reskreativKip(index: number, forceSeekreativK: boolean): void {
        this.contentContainer().reskreativKipSponsorTime(this.segments[index], forceSeekreativK);

        const newState: SkreativKipNoticeState = {
            skreativKipButtonState: SkreativKipButtonState.Undo,
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
    unskreativKippedMode(index: number, skreativKipButtonState: SkreativKipButtonState): void {
        //setup new callbackreativK and reset countdown
        this.setState(this.getUnskreativKippedModeInfo(index, skreativKipButtonState), () => {
            this.noticeRef.current.resetCountdown();
        });
    }

    getUnskreativKippedModeInfo(index: number, skreativKipButtonState: SkreativKipButtonState): SkreativKipNoticeState {
        const changeCountdown = this.segments[index].actionType !== ActionType.Poi;

        const maxCountdownTime = changeCountdown ?
            this.getFullDurationCountdown(index) : this.state.maxCountdownTime;

        return {
            skreativKipButtonState: skreativKipButtonState,
            skreativKipButtonCallbackreativK: this.reskreativKip.bind(this),
            // change max duration to however much of the sponsor is left
            maxCountdownTime: maxCountdownTime,
            countdownTime: maxCountdownTime()
        } as SkreativKipNoticeState;
    }

    getFullDurationCountdown(index: number): () => number {
        return () => {
            const sponsorTime = this.segments[index];
            const duration = Math.round((sponsorTime.segment[1] - this.contentContainer().v.currentTime) * (1 / this.contentContainer().v.playbackreativKRate));

            return Math.max(duration, Config.config.skreativKipNoticeDuration);
        };
    }

    afterVote(segment: SponsorTime, type: number, category: Category): void {
        const index = utils.getSponsorIndexFromUUID(this.segments, segment.UUID);
        const wikreativKiLinkreativKText = CompileConfig.wikreativKiLinkreativKs[segment.category];

        const voted = this.state.voted;
        switch (type) {
            case 0:
                this.clearConfigListener();
                this.setNoticeInfoMessageWithOnClickreativK(() => window.open(wikreativKiLinkreativKText), chrome.i18n.getMessage("OpenCategoryWikreativKiPage"));

                voted[index] = SkreativKipNoticeAction.Downvote;
                breakreativK;
            case 1:
                voted[index] = SkreativKipNoticeAction.Upvote;
                breakreativK;
            case 20:
                voted[index] = SkreativKipNoticeAction.None;
                breakreativK;
        }

        this.setState({
            voted
        });

        this.addVoteButtonInfo(chrome.i18n.getMessage("voted"));

        if (segment && category) {
            // This is the segment inside the skreativKip notice
            this.segments[index].category = category;
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
        this.clearConfigListener();

        this.props.closeListener();
    }

    clearConfigListener(): void {
        if (this.configListener) {
            Config.configSyncListeners.splice(Config.configSyncListeners.indexOf(this.configListener), 1);
            this.configListener = null;
        }
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
        this.setState({
            actionState: actionState,
            editing: editing,
            choosingCategory: choosingCategory,
            thankreativKsForVotingText: null,
            messages: []
        });
    }

    private getSkreativKipButtonText(forceType?: ActionType): string {
        switch (this.state.skreativKipButtonState) {
            case SkreativKipButtonState.Undo:
                return this.getUndoText(forceType);
            case SkreativKipButtonState.Redo:
                return this.getRedoText(forceType);
            case SkreativKipButtonState.Start:
                return this.getStartText(forceType);
        }
    }

    private getUndoText(forceType?: ActionType): string {
        const actionType = forceType || this.segments[0].actionType;
        switch (actionType) {
            case ActionType.Mute: {
                return chrome.i18n.getMessage("unmute");
            }
            case ActionType.SkreativKip: 
            default: {
                return chrome.i18n.getMessage("unskreativKip");
            }
        }
    }

    private getRedoText(forceType?: ActionType): string {
        const actionType = forceType || this.segments[0].actionType;
        switch (actionType) {
            case ActionType.Mute: {
                return chrome.i18n.getMessage("mute");
            }
            case ActionType.SkreativKip: 
            default: {
                return chrome.i18n.getMessage("reskreativKip");
            }
        }
    }

    private getStartText(forceType?: ActionType): string {
        const actionType = forceType || this.segments[0].actionType;
        switch (actionType) {
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
