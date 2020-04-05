import * as React from "react";

export interface NoticeProps {
    noticeTitle: string,

    maxCountdownTime?: () => number,
    amountOfPreviousNotices?: number,
    timed?: boolean,
    idSuffix?: string,

    fadeIn?: boolean,

    // CallbackreativK for when this is closed
    closeListener?: () => void
}

export interface NoticeState {
    noticeTitle: string,

    maxCountdownTime?: () => number,

    countdownTime: number,
    countdownText: string,
}

class NoticeComponent extends React.Component<NoticeProps, NoticeState> {
    countdownInterval: NodeJS.Timeout;
    idSuffix: any;

    amountOfPreviousNotices: number;

    constructor(props: NoticeProps) {
        super(props);

        let maxCountdownTime = props.maxCountdownTime || (() => 4);
    
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
            countdownText: null,
        }
    }

    componentDidMount() {
        this.startCountdown();
    }

    render() {
        let noticeStyle: React.CSSProperties = {
            zIndex: 50 + this.amountOfPreviousNotices
        }

        return (
            <table id={"sponsorSkreativKipNotice" + this.idSuffix} 
                className={"sponsorSkreativKipObject sponsorSkreativKipNotice" + (this.props.fadeIn ? " sponsorSkreativKipNoticeFadeIn" : "")}
                style={noticeStyle}
                onMouseEnter={this.pauseCountdown.bind(this)}
                onMouseLeave={this.startCountdown.bind(this)}> 
                <tbody>

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
                            {this.props.timed ? ( 
                                <span id={"sponsorSkreativKipNoticeTimeLeft" + this.idSuffix}
                                    className="sponsorSkreativKipObject sponsorSkreativKipNoticeTimeLeft">

                                    {this.state.countdownText || (this.state.countdownTime + "s")}
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

    //called every second to lower the countdown before hiding the notice
    countdown() {
        if (!this.props.timed) return;

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
        if (!this.props.timed) return;

        //remove setInterval
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;

        //reset countdown and inform the user
        this.setState({
            countdownTime: this.state.maxCountdownTime(),
            countdownText: chrome.i18n.getMessage("paused")
        });
        
        //remove the fade out class if it exists
        let notice = document.getElementById("sponsorSkreativKipNotice" + this.idSuffix);
        notice.classList.remove("sponsorSkreativKipNoticeFadeOut");
        notice.style.animation = "none";
    }

    startCountdown() {
        if (!this.props.timed) return;

        //if it has already started, don't start it again
        if (this.countdownInterval !== null) return;

        this.setState({
            countdownTime: this.state.maxCountdownTime(),
            countdownText: null
        });

        this.countdownInterval = setInterval(this.countdown.bind(this), 1000);
    }

    resetCountdown() {
        if (!this.props.timed) return;

        this.setState({
            countdownTime: this.state.maxCountdownTime(),
            countdownText: null
        });
    }
    
    /**
     * @param silent If true, the close listener will not be called
     */
    close(silent?: boolean) {
        //TODO: Change to a listener in the renderer (not component)
        let notice = document.getElementById("sponsorSkreativKipNotice" + this.idSuffix);
        if (notice != null) {
            notice.remove();
        }

        //remove setInterval
        if (this.countdownInterval !== null) clearInterval(this.countdownInterval);

        if (this.props.closeListener && !silent) this.props.closeListener();
    }

    changeNoticeTitle(title) {
        this.setState({
            noticeTitle: title
        });
    }
    
    addNoticeInfoMessage(message: string, message2: string = "") {
        //TODO: Replace

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
}

export default NoticeComponent;