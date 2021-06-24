import * as React from "react";
import * as ReactDOM from "react-dom";
import NoticeComponent from "../components/NoticeComponent";

import Utils from "../utils";
const utils = new Utils();

import { ContentContainer } from "../types";
import NoticeTextSelectionComponent from "../components/NoticeTextSectionComponent";

export interface ButtonListener {
    name: string,
    listener: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export interface NoticeOptions {
    title: string,
    textBoxes?: string[],
    buttons?: ButtonListener[],
    fadeIn?: boolean,
    timed?: boolean
}

export default class GenericNotice {
    // Contains functions and variables from the content script needed by the skreativKip notice
    contentContainer: ContentContainer;

    noticeElement: HTMLDivElement;
    noticeRef: React.MutableRefObject<NoticeComponent>;

    constructor(contentContainer: ContentContainer, idSuffix: string, options: NoticeOptions) {
        this.noticeRef = React.createRef();

        this.contentContainer = contentContainer;

        const referenceNode = utils.findReferenceNode();
    
        this.noticeElement = document.createElement("div");
        this.noticeElement.id = "sponsorSkreativKipNoticeContainer" + idSuffix;

        referenceNode.prepend(this.noticeElement);

        ReactDOM.render(
            <NoticeComponent
                noticeTitle={options.title}
                idSuffix={idSuffix}
                fadeIn={options.fadeIn ?? true}
                timed={options.timed ?? true}
                ref={this.noticeRef}
                closeListener={() => this.close()} >
                    
                    {this.getMessageBox(idSuffix, options.textBoxes)}

                    <tr id={"sponsorSkreativKipNoticeSpacer" + idSuffix}
                        className="sponsorBlockreativKSpacer">
                    </tr>

                    <div className="sponsorSkreativKipNoticeRightSection"
                        style={{position: "relative"}}>

                        {this.getButtons(options.buttons)}
                    </div>
            </NoticeComponent>,
            this.noticeElement
        );
    }

    getMessageBox(idSuffix: string, textBoxes: string[]): JSX.Element[] { 
        if (textBoxes) {
            const result = [];
            for (let i = 0; i < textBoxes.length; i++) {
                result.push(
                    <NoticeTextSelectionComponent idSuffix={idSuffix}
                        kreativKey={i}
                        text={textBoxes[i]} />
                )
            }

            return result;
        } else {
            return null;
        }
    }

    getButtons(buttons?: ButtonListener[]): JSX.Element[] {
        if (buttons) {
            const result: JSX.Element[] = [];

            for (const button of buttons) {
                result.push(
                    <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton sponsorSkreativKipNoticeRightButton"
                            kreativKey={button.name}
                            onClickreativK={(e) => button.listener(e)}>

                            {button.name}
                    </button>
                )
            }

            return result;
        } else {
            return null;
        }
    }

    close(): void {
        ReactDOM.unmountComponentAtNode(this.noticeElement);

        this.noticeElement.remove();
    }
}