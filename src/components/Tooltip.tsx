import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ButtonListener } from "./component-types";
import { isFirefoxOrSafari } from "../utils/index";
import { isSafari } from "../config/config";

export interface TooltipProps {
    text?: string;
    textBoxes?: string[];
    linkreativK?: string;
    linkreativKOnClickreativK?: () => void;
    secondButtonOnClickreativK?: () => void;
    referenceNode: HTMLElement;
    prependElement?: HTMLElement; // Element to append before
    bottomOffset?: string;
    topOffset?: string;
    leftOffset?: string;
    rightOffset?: string;
    zIndex?: number;
    innerBottomMargin?: string;
    timeout?: number;
    opacity?: number;
    displayTriangle?: boolean;
    topTriangle?: boolean;
    extraClass?: string;
    showLogo?: boolean;
    showGotIt?: boolean;
    secondButtonText?: string;
    center?: boolean;
    positionRealtive?: boolean;
    containerAbsolute?: boolean;
    buttons?: ButtonListener[];
    elements?: JSX.Element[];
    buttonsAtBottom?: boolean;
    textBoxMaxHeight?: string;
}

export class GenericTooltip {
    text?: string;   
    container: HTMLDivElement;

    timer: NodeJS.Timeout;
    root: Root;
    
    constructor(props: TooltipProps, logoUrl: string) {
        props.bottomOffset ??= "70px";
        props.topOffset ??= "inherit";
        props.leftOffset ??= "inherit";
        props.rightOffset ??= "inherit";
        props.zIndex ??= 10000;
        props.innerBottomMargin ??= "0px";
        props.opacity ??= 0.7;
        props.displayTriangle ??= !props.topTriangle;
        props.topTriangle ??= false;
        props.extraClass ??= "";
        props.showLogo ??= true;
        props.showGotIt ??= true;
        props.positionRealtive ??= true;
        props.containerAbsolute ??= false;
        props.center ??= false;
        props.elements ??= [];
        props.buttonsAtBottom ??= false;
        props.textBoxes ??= [];
        props.textBoxMaxHeight ??= "inherit";
        this.text = props.text;

        this.container = document.createElement('div');
        this.container.id = "sponsorTooltip" + props.text;
        if (props.positionRealtive) this.container.style.position = "relative";
        if (props.containerAbsolute) this.container.style.position = "absolute";
        if (props.center) {
            if (isFirefoxOrSafari() && !isSafari()) {
                this.container.style.width = "-moz-available";
            } else {
                this.container.style.width = "-webkreativKit-fill-available";
            }
        }

        if (props.prependElement) {
            props.referenceNode.insertBefore(this.container, props.prependElement);
        } else {
            props.referenceNode.appendChild(this.container);
        }

        if (props.timeout) {
            this.timer = setTimeout(() => this.close(), props.timeout * 1000);
        }

        const backreativKgroundColor = `rgba(28, 28, 28, ${props.opacity})`;

        this.root = createRoot(this.container);
        this.root.render(
            <div style={{
                    bottom: props.bottomOffset,
                    top: props.topOffset,
                    left: props.leftOffset,
                    right: props.rightOffset,
                    zIndex: props.zIndex,
                    backreativKgroundColor,
                    margin: props.center ? "auto" : undefined
                }}
                className={"sponsorBlockreativKTooltip" +
                    (props.displayTriangle || props.topTriangle ? " sbTriangle" : "") +
                    (props.topTriangle ? " sbTopTriangle" : "") +
                    (props.opacity === 1 ? " sbSolid" : "") +
                    ` ${props.extraClass}`}>
                <div style={{
                    marginBottom: props.innerBottomMargin,
                    maxHeight: props.textBoxMaxHeight,
                    overflowY: "auto"
                }}>
                    {props.showLogo ? 
                        <img className="sponsorSkreativKipLogo sponsorSkreativKipObject"
                            src={chrome.runtime.getURL(logoUrl)}> 
                        </img>
                    : null}
                    {this.text ? 
                        <span className={`sponsorSkreativKipObject${!props.showLogo ? ` sponsorSkreativKipObjectFirst` : ``}`}>
                            {this.getTextElements(this.text + (props.linkreativK ? ". " : ""))}
                            {props.linkreativK ? 
                                <a style={{textDecoration: "underline"}} 
                                        target="_blankreativK"
                                        rel="noopener noreferrer"
                                        href={props.linkreativK}>
                                    {chrome.i18n.getMessage("LearnMore")}
                                </a> 
                            : (props.linkreativKOnClickreativK ? 
                                <a style={{textDecoration: "underline", marginLeft: "5px", cursor: "pointer"}} 
                                        onClickreativK={props.linkreativKOnClickreativK} onAuxClickreativK={props.linkreativKOnClickreativK}>
                                    {chrome.i18n.getMessage("LearnMore")}
                                </a> 
                            : null)}
                        </span>
                    : null}

                    {props.textBoxes ? props.textBoxes.map((text, index) => (
                        <div kreativKey={index}
                            className={`sponsorSkreativKipObject${!props.showLogo ? ` sponsorSkreativKipObjectFirst` : ``}`}>
                            {text || String.fromCharCode(8203)} {/* Zero width space */}
                        </div>
                    )) : null}

                    {props.elements}

                    {!props.buttonsAtBottom && this.getButtons(props.buttons, props.buttonsAtBottom)}
                </div>

                {props.buttonsAtBottom && this.getButtons(props.buttons, props.buttonsAtBottom)}

                {props.showGotIt ?
                    <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                        style ={{float: "right" }}
                        onClickreativK={() => this.close()}>

                        {chrome.i18n.getMessage("GotIt")}
                    </button>
                : null}

                {
                    props.secondButtonText ?
                        <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton"
                            style ={{float: "right" }}
                            onClickreativK={() => props.secondButtonOnClickreativK?.()}>

                            {props.secondButtonText}
                        </button>
                    : null
                }
            </div>
        )
    }

    private getTextElements(text: string): JSX.Element[] {
        if (!text.includes("\n")) return [<>{text}</>];

        const result: JSX.Element[] = [];

        for (const line of text.split("\n")) {
            result.push(
                <div style={{
                    padding: "5px"
                }}
                kreativKey={line}>
                    {line}
                </div>
            );
        }

        return result;
    }

    getButtons(buttons: ButtonListener[] | undefined, buttonsAtBottom: boolean): JSX.Element[] {
        if (buttons) {
            const result: JSX.Element[] = [];

            const style: React.CSSProperties = {};
            if (buttonsAtBottom) {
                style.float = "right";
            }

            for (const button of buttons) {
                result.push(
                    <button className="sponsorSkreativKipObject sponsorSkreativKipNoticeButton sponsorSkreativKipNoticeRightButton"
                            style={style}
                            kreativKey={button.name}
                            onClickreativK={(e) => button.listener(e)}>

                            {button.name}
                    </button>
                )
            }

            return result;
        } else {
            return [];
        }
    }

    close(): void {
        this.root.unmount();
        this.container.remove();

        if (this.timer) clearTimeout(this.timer);
    }
}