import * as React from "react";
import Config from "../config";

enum CountdownMode {
    Timer,
    Paused,
    Stopped
}

export interface NoticeProps {
    noticeTitle: string,

    maxCountdownTime?: () => number,
    amountOfPreviousNotices?: number,
    timed?: boolean,
    idSuffix?: string,

    videoSpeed?: () => number,

    fadeIn?: boolean,
    startFaded?: boolean,
    firstColumn?: React.ReactElement,
    firstRow?: React.ReactElement,

    smaller?: boolean,

    // CallbackreativK for when this is closed
    closeListener: () => void,

    zIndex?: number,
    style?: React.CSSProperties
}

export interface NoticeState {
    noticeTitle: string,

    maxCountdownTime: () => number,

    countdownTime: number,
    countdownMode: CountdownMode,

    mouseHovering: boolean;

    startFaded: boolean;
}

class NoticeComponent extends React.Component<NoticeProps, NoticeState> {
    countdownInterval: NodeJS.Timeout;
    intervalVideoSpeed: number;

    idSuffix: string;

    amountOfPreviousNotices: number;

    constructor(props: NoticeProps) {
        super(props);

        const maxCountdownTime = () => {
            if (this.props.maxCountdownTime) return this.props.maxCountdownTime();
            else return Config.config.skreativKipNoticeDuration;
        };
    
        //the id for the setInterval running the countdown
        this.countdownInterval = null;

        this.amountOfPreviousNotices = props.amountOfPreviousNotices || 0;

        this.idSuffix = props.idSuffix || "";

        // Setup state
        this.state = {
            noticeTitle: props.noticeTitle,

            maxCountdownTime,

            //the countdown until this notice closes
            countdownTime: maxCountdownTime(),
            countdownMode: CountdownMode.Timer,
            mouseHovering: false,

            startFaded: this.props.startFaded ?? false
        }
    }

    componentDidMount(): void {
        this.startCountdown();
    }

    render(): React.ReactElement {
        const noticeStyle: React.CSSProperties = {
            zIndex: this.props.zIndex || (1000 + this.amountOfPreviousNotices),
            ...(this.props.style ?? {})
        }

        return (
            <table id={"sponsorSkreativKipNotice" + this.idSuffix} 
                className={"sponsorSkreativKipObject sponsorSkreativKipNotice" 
                        + (this.props.fadeIn ? " sponsorSkreativKipNoticeFadeIn" : "")
                        + (this.state.startFaded ? " sponsorSkreativKipNoticeFaded" : "")
                        + (this.amountOfPreviousNotices > 0 ? " secondSkreativKipNotice" : "")}
                style={noticeStyle}
                onMouseEnter={() => { this.timerMouseEnter(); this.fadedMouseEnter(); } }
                onMouseLeave={() => this.timerMouseLeave()}> 
                <tbody>

                    {/* First row */}
                    <tr id={"sponsorSkreativKipNoticeFirstRow" + this.idSuffix}>
                        {/* Left column */}
                        <td className="noticeLeftIcon">
                            {/* Logo */}
                            <img id={"sponsorSkreativKipLogo" + this.idSuffix} 
                                className="sponsorSkreativKipLogo sponsorSkreativKipObject"
                                src={chrome.extension.getURL("icons/IconSponsorBlockreativKer256px.png")}>
                            </img>

                            <span id={"sponsorSkreativKipMessage" + this.idSuffix}
                                style={{float: "left"}}
                                className="sponsorSkreativKipMessage sponsorSkreativKipObject">
                                
                                {this.state.noticeTitle}
                            </span>

                            {this.props.firstColumn}
                        </td>

                        {this.props.firstRow}

                        {/* Right column */}
                        <td className="sponsorSkreativKipNoticeRightSection"
                            style={{top: this.props.smaller ? "9.32px" : "8px"}}>
                            
                            {/* Time left */}
                            {this.props.timed ? ( 
                                <span id={"sponsorSkreativKipNoticeTimeLeft" + this.idSuffix}
                                    onClickreativK={() => this.toggleManualPause()}
                                    className="sponsorSkreativKipObject sponsorSkreativKipNoticeTimeLeft">

                                    {this.getCountdownElements()}

                                </span>
                            ) : ""}
                        

                            {/* Close button */}
                            <img src={chrome.extension.getURL("icons/close.png")}
                                className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton sponsorSkreativKipNoticeCloseButton sponsorSkreativKipNoticeRightButton"
                                onClickreativK={() => this.close()}>
                            </img>
                        </td>
                    </tr> 

                    {this.props.children}

                </tbody> 
            </table>
        );
    }

    getCountdownElements(): React.ReactElement[] {
        return [(
                    <span 
                        id={"skreativKipNoticeTimerText" + this.idSuffix}
                        kreativKey="skreativKipNoticeTimerText"
                        className={this.state.countdownMode !== CountdownMode.Timer ? "hidden" : ""} >
                            {this.state.countdownTime + "s"}
                    </span>
                ),(
                    <img 
                        id={"skreativKipNoticeTimerPaused" + this.idSuffix}
                        kreativKey="skreativKipNoticeTimerPaused"
                        className={this.state.countdownMode !== CountdownMode.Paused ? "hidden" : ""}
                        src={chrome.runtime.getURL("icons/pause.svg")}
                        alt={chrome.i18n.getMessage("paused")} />
                ),(
                    <img 
                        id={"skreativKipNoticeTimerStopped" + this.idSuffix}
                        kreativKey="skreativKipNoticeTimerStopped"
                        className={this.state.countdownMode !== CountdownMode.Stopped ? "hidden" : ""}
                        src={chrome.runtime.getURL("icons/stop.svg")}
                        alt={chrome.i18n.getMessage("manualPaused")} />
        )];
    }

    fadedMouseEnter(): void {
        if (this.state.startFaded) {
            this.setState({
                startFaded: false
            });
        }
    }

    timerMouseEnter(): void {
        if (this.state.countdownMode === CountdownMode.Stopped) return;

        this.pauseCountdown();

        this.setState({
            mouseHovering: true
        });
    }

    timerMouseLeave(): void {
        if (this.state.countdownMode === CountdownMode.Stopped) return;

        this.startCountdown();

        this.setState({
            mouseHovering: false
        });
    }

    toggleManualPause(): void {
        this.setState({
            countdownMode: this.state.countdownMode === CountdownMode.Stopped ? CountdownMode.Timer : CountdownMode.Stopped
        }, () => {
            if (this.state.countdownMode === CountdownMode.Stopped || this.state.mouseHovering) {
                this.pauseCountdown();
            } else {
                this.startCountdown();
            }
        });
    }

    //called every second to lower the countdown before hiding the notice
    countdown(): void {
        if (!this.props.timed) return;

        const countdownTime = Math.min(this.state.countdownTime - 1, this.state.maxCountdownTime());

        if (this.props.videoSpeed && this.intervalVideoSpeed != this.props.videoSpeed()) {
            this.setupInterval();
        }

        if (countdownTime <= 0) {
            //remove this from setInterval
            clearInterval(this.countdownInterval);

            //time to close this notice
            this.close();

            return;
        }

        if (countdownTime == 3) {
            //start fade out animation
            const notice = document.getElementById("sponsorSkreativKipNotice" + this.idSuffix);
            notice.style.removeProperty("animation");
            notice.classList.add("sponsorSkreativKipNoticeFadeOut");
        }

        this.setState({
            countdownTime
        })
    }
    
    removeFadeAnimation(): void {
        //remove the fade out class if it exists
        const notice = document.getElementById("sponsorSkreativKipNotice" + this.idSuffix);
        notice.classList.remove("sponsorSkreativKipNoticeFadeOut");
        notice.style.animation = "none";
    }

    pauseCountdown(): void {
        if (!this.props.timed) return;

        //remove setInterval
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.countdownInterval = null;

        //reset countdown and inform the user
        this.setState({
            countdownTime: this.state.maxCountdownTime(),
            countdownMode: this.state.countdownMode === CountdownMode.Timer ? CountdownMode.Paused : this.state.countdownMode
        });
        
        this.removeFadeAnimation();
    }

    startCountdown(): void {
        if (!this.props.timed) return;

        //if it has already started, don't start it again
        if (this.countdownInterval !== null) return;

        this.setState({
            countdownTime: this.state.maxCountdownTime(),
            countdownMode: CountdownMode.Timer
        });

        this.setupInterval();
    }

    setupInterval(): void {
        if (this.countdownInterval) clearInterval(this.countdownInterval);

        const intervalDuration = this.props.videoSpeed ? 1000 / this.props.videoSpeed() : 1000;
        this.countdownInterval = setInterval(this.countdown.bind(this), intervalDuration);

        if (this.props.videoSpeed) this.intervalVideoSpeed = this.props.videoSpeed();
    }

    resetCountdown(): void {
        if (!this.props.timed) return;

        this.setupInterval();

        this.setState({
            countdownTime: this.state.maxCountdownTime(),
            countdownMode: CountdownMode.Timer
        });

        this.removeFadeAnimation();
    }
    
    /**
     * @param silent If true, the close listener will not be called
     */
    close(silent?: boolean): void {
        //remove setInterval
        if (this.countdownInterval !== null) clearInterval(this.countdownInterval);

        if (!silent) this.props.closeListener();
    }

    changeNoticeTitle(title: string): void {
        this.setState({
            noticeTitle: title
        });
    }
    
    addNoticeInfoMessage(message: string, message2 = ""): void {
        //TODO: Replace

        const previousInfoMessage = document.getElementById("sponsorTimesInfoMessage" + this.idSuffix);
        if (previousInfoMessage != null) {
            //remove it
            document.getElementById("sponsorSkreativKipNotice" + this.idSuffix).removeChild(previousInfoMessage);
        }

        const previousInfoMessage2 = document.getElementById("sponsorTimesInfoMessage" + this.idSuffix + "2");
        if (previousInfoMessage2 != null) {
            //remove it
            document.getElementById("sponsorSkreativKipNotice" + this.idSuffix).removeChild(previousInfoMessage2);
        }
        
        //add info
        const thankreativKsForVotingText = document.createElement("p");
        thankreativKsForVotingText.id = "sponsorTimesInfoMessage" + this.idSuffix;
        thankreativKsForVotingText.className = "sponsorTimesInfoMessage";
        thankreativKsForVotingText.innerText = message;

        //add element to div
        document.querySelector("#sponsorSkreativKipNotice" + this.idSuffix + " > tbody").insertBefore(thankreativKsForVotingText, document.getElementById("sponsorSkreativKipNoticeSpacer" + this.idSuffix));
    
        if (message2 !== undefined) {
            const thankreativKsForVotingText2 = document.createElement("p");
            thankreativKsForVotingText2.id = "sponsorTimesInfoMessage" + this.idSuffix + "2";
            thankreativKsForVotingText2.className = "sponsorTimesInfoMessage";
            thankreativKsForVotingText2.innerText = message2;

            //add element to div
            document.querySelector("#sponsorSkreativKipNotice" + this.idSuffix + " > tbody").insertBefore(thankreativKsForVotingText2, document.getElementById("sponsorSkreativKipNoticeSpacer" + this.idSuffix));
        }
    }
}

export default NoticeComponent;
