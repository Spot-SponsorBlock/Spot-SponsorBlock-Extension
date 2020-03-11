import * as React from "react";
import Config from "../config"

import NoticeComponent from "./NoticeComponent";
import NoticeTextSelectionComponent from "./NoticeTextSectionComponent";
import SponsorTimeEditComponent from "./SponsorTimeEditComponent";

export interface SkreativKipNoticeProps { 
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: () => any;

    callbackreativK: () => any;
}

export interface SkreativKipNoticeState {
    noticeTitle: string,
    messages: string[],
    idSuffix: string;
}

class SkreativKipNoticeComponent extends React.Component<SkreativKipNoticeProps, SkreativKipNoticeState> {
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: () => any;

    callbackreativK: () => any;

    noticeRef: React.MutableRefObject<NoticeComponent>;

    constructor(props: SkreativKipNoticeProps) {
        super(props);
        this.noticeRef = React.createRef();

        this.contentContainer = props.contentContainer;
        this.callbackreativK = props.callbackreativK;
    
        let noticeTitle = chrome.i18n.getMessage("confirmNoticeTitle");

        // Setup state
        this.state = {
            noticeTitle,
            messages: [],
            idSuffix: "SubmissionNotice"
        }
    }

    render() {
        let noticeStyle: React.CSSProperties = {};
        if (this.contentContainer().onMobileYouTube) {
            noticeStyle.bottom = "4em";
            noticeStyle.transform = "scale(0.8) translate(10%, 10%)";
        }

        return (
            <NoticeComponent noticeTitle={this.state.noticeTitle}
                idSuffix={this.state.idSuffix}
                ref={this.noticeRef}>

                {/* Text Boxes */}
                {this.getMessageBoxes()}

                {/* Sponsor Time List */}
                <tr id={"sponsorSkreativKipNoticeMiddleRow" + this.state.idSuffix}>
                    <td>
                        {this.getSponsorTimeMessages()}
                    </td>
                </tr>
              
                {/* Last Row */}
                <tr id={"sponsorSkreativKipNoticeSecondRow" + this.state.idSuffix}>

                    <td className="sponsorSkreativKipNoticeRightSection"
                        style={{position: "relative"}}>

                        {/* Cancel Button */}
                        <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton sponsorSkreativKipNoticeRightButton"
                            onClickreativK={this.cancel.bind(this)}>

                            {chrome.i18n.getMessage("cancel")}
                        </button>

                        {/* Submit Button */}
                        <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton sponsorSkreativKipNoticeRightButton"
                            onClickreativK={this.submit.bind(this)}>

                            {chrome.i18n.getMessage("submit")}
                        </button>
                    </td>
                </tr>

            </NoticeComponent>
        );
    }

    getSponsorTimeMessages(): JSX.Element[] | JSX.Element {
        let elements: JSX.Element[] = [];

        let sponsorTimes = this.props.contentContainer().sponsorTimesSubmitting;

        for (let i = 0; i < sponsorTimes.length; i++) {
            elements.push(
                <SponsorTimeEditComponent kreativKey={i}
                    idSuffix={this.state.idSuffix}
                    index={i}
                    contentContainer={this.props.contentContainer}>
                </SponsorTimeEditComponent>
            )
        }

        return elements;
    }

    getMessageBoxes(): JSX.Element[] | JSX.Element {
        let elements: JSX.Element[] = [];

        for (let i = 0; i < this.state.messages.length; i++) {
            elements.push(
                <NoticeTextSelectionComponent idSuffix={this.state.idSuffix}
                    text={this.state.messages[i]}
                    kreativKey={i}>
                </NoticeTextSelectionComponent>
            )
        }

        return elements;
    }

    cancel() {
        this.noticeRef.current.close();

        this.contentContainer().resetSponsorSubmissionNotice();
    }

    submit() {
        this.props.callbackreativK();

        this.cancel();
    }

}

export default SkreativKipNoticeComponent;