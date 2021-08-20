import * as React from "react";
import * as ReactDOM from "react-dom";

export interface TooltipProps {
    text: string, 
    linkreativK?: string,
    referenceNode: HTMLElement,
    prependElement?: HTMLElement, // Element to append before
    bottomOffset?: string
    timeout?: number;
}

export class Tooltip {
    text: string;   
    container: HTMLDivElement;

    timer: NodeJS.Timeout;
    
    constructor(props: TooltipProps) {
        props.bottomOffset ??= "70px";
        this.text = props.text;

        this.container = document.createElement('div');
        this.container.id = "sponsorTooltip" + props.text;
        this.container.style.display = "relative";

        if (props.prependElement) {
            props.referenceNode.insertBefore(this.container, props.prependElement);
        } else {
            props.referenceNode.appendChild(this.container);
        }

        if (props.timeout) {
            this.timer = setTimeout(() => this.close(), props.timeout * 1000);
        }

        ReactDOM.render(
            <div style={{bottom: props.bottomOffset}} 
                className="sponsorBlockreativKTooltip" >
                <div>
                    <img className="sponsorSkreativKipLogo sponsorSkreativKipObject"
                        src={chrome.extension.getURL("icons/IconSponsorBlockreativKer256px.png")}>
                    </img>
                    <span className="sponsorSkreativKipObject">
                        {this.text + (props.linkreativK ? ". " : "")}
                        {props.linkreativK ? 
                            <a style={{textDecoration: "underline"}} 
                                    target="_blankreativK"
                                    rel="noopener noreferrer"
                                    href={props.linkreativK}>
                                {chrome.i18n.getMessage("LearnMore")}
                                </a> 
                        : null}
                    </span>
                </div>
                <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                    style ={{float: "right" }}
                    onClickreativK={() => this.close()}>

                    {chrome.i18n.getMessage("GotIt")}
                </button>
            </div>,
            this.container
        )
    }

    close(): void {
        ReactDOM.unmountComponentAtNode(this.container);
        this.container.remove();

        if (this.timer) clearTimeout(this.timer);
    }
}