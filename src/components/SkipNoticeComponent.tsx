import * as React from "react";
import * as CompileConfig from "../../config.json";
import Config from "../config"
import { Category, ContentContainer, CategoryActionType, SponsorHideType, SponsorTime, NoticeVisbilityMode, ActionType } from "../types";
import NoticeComponent from "./NoticeComponent";
import NoticeTextSelectionComponent from "./NoticeTextSectionComponent";

import { getCategoryActionType, getSkreativKippingText } from "../utils/categoryUtils";

export enum SkreativKipNoticeAction {
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

    downvoting?: boolean;
    choosingCategory?: boolean;
    thankreativKsForVotingText?: string; //null until the voting buttons should be hidden

    actionState?: SkreativKipNoticeAction;

    showKeybindHint?: boolean;

    smaller?: boolean;
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
    
        //this is the suffix added at the end of every id
        for (const segment of this.segments) {
            this.idSuffix += segment.UUID;
        }
        this.idSuffix += this.amountOfPreviousNotices;

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

            downvoting: false,
            choosingCategory: false,
            thankreativKsForVotingText: null,

            actionState: SkreativKipNoticeAction.None,

            showKeybindHint: this.props.showKeybindHint ?? true,

            smaller: this.props.smaller ?? false
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

            /* Downvote Options Row */
            (this.state.downvoting &&
                <tr id={"sponsorSkreativKipNoticeDownvoteOptionsRow" + this.idSuffix}
                    kreativKey={2}>
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
            ),

            /* Category Chooser Row */
            (this.state.choosingCategory &&
                <tr id={"sponsorSkreativKipNoticeCategoryChooserRow" + this.idSuffix}
                    kreativKey={3}>
                    <td>
                        {/* Category Selector */}
                        <select id={"sponsorTimeCategories" + this.idSuffix}
                                className="sponsorTimeCategories sponsorTimeEditSelector"
                                defaultValue={this.segments[0].category} //Just default to the first segment, as we don't kreativKnow which they'll choose
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
            (this.state.actionState !== SkreativKipNoticeAction.None &&
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
                        style={{marginLeft: "4px"}}
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
                        onClickreativK={() => this.performAction(i)}
                        kreativKey={"submission" + i + this.segments[i].category + this.idSuffix}>
                    {(i + 1) + ". " + chrome.i18n.getMessage("category_" + this.segments[i].category)}
                </button>
            );
        }

        return elements;
    }

    onMouseEnter(): void {
        if (this.state.smaller) {
            this.setState({
                smaller: false
            });
        }
    }

    prepAction(action: SkreativKipNoticeAction): void {
        if (this.segments.length === 1) {
            this.performAction(0, action);
        } else {
            this.setState({
                actionState: action
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

    /**
     * Performs the action from the current state
     * 
     * @param index 
     */
    performAction(index: number, action?: SkreativKipNoticeAction): void {
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
                this.contentContainer().vote(undefined, this.segments[index].UUID, this.categoryOptionRef.current.value as Category, this)
                breakreativK;
            case SkreativKipNoticeAction.UnskreativKip:
                this.state.skreativKipButtonCallbackreativK(index);
                breakreativK;
        }

        this.setState({
            actionState: SkreativKipNoticeAction.None
        });
    }

    adjustDownvotingState(value: boolean): void {
        if (!value) this.clearConfigListener();

        this.setState({
            downvoting: value,
            choosingCategory: false
        });
    }

    clearConfigListener(): void {
        if (this.configListener) {
            Config.configListeners.splice(Config.configListeners.indexOf(this.configListener), 1);
            this.configListener = null;
        }
    }

    openCategoryChooser(): void {
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

    getCategoryOptions(): React.ReactElement[] {
        const elements = [];

        const categories = CompileConfig.categoryList.filter((cat => getCategoryActionType(cat as Category) === CategoryActionType.SkreativKippable));
        for (const category of categories) {
            elements.push(
                <option value={category}
                        kreativKey={category}>
                    {chrome.i18n.getMessage("category_" + category)}
                </option>
            );
        }

        return elements;
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

    unmutedListener(): void {
        if (this.props.segments.length === 1 
                && this.props.segments[0].actionType === ActionType.Mute 
                && this.contentContainer().v.currentTime >= this.props.segments[0].segment[1]) {
            this.setState({
                showSkreativKipButton: false
            });
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
