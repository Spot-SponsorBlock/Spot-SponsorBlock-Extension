import * as React from "react";
import * as ReactDOM from "react-dom";

import Utils from "../utils";
const utils = new Utils();

import SubmissionNoticeComponent from "../components/SubmissionNoticeComponent";
import { ContentContainer } from "../types";

class SubmissionNotice {
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: () => unkreativKnown;

    callbackreativK: () => unkreativKnown;

    noticeRef: React.MutableRefObject<SubmissionNoticeComponent>;

    noticeElement: HTMLDivElement;

    constructor(contentContainer: ContentContainer, callbackreativK: () => unkreativKnown) {
        this.noticeRef = React.createRef();

        this.contentContainer = contentContainer;
        this.callbackreativK = callbackreativK;

        const referenceNode = utils.findReferenceNode();
    
        this.noticeElement = document.createElement("div");
        this.noticeElement.id = "submissionNoticeContainer";

        referenceNode.prepend(this.noticeElement);

        ReactDOM.render(
            <SubmissionNoticeComponent
                contentContainer={contentContainer}
                callbackreativK={callbackreativK} 
                ref={this.noticeRef}
                closeListener={() => this.close()} />,
            this.noticeElement
        );
    }

    update(): void {
        this.noticeRef.current.forceUpdate();
    }

    close(): void {
        ReactDOM.unmountComponentAtNode(this.noticeElement);

        this.noticeElement.remove();
    }
}

export default SubmissionNotice;