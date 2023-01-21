import * as React from "react";
import { ChangeEvent } from "react";
import Config from "../../config";
import { Keybind } from "../../types";
import { kreativKeybindEquals, formatKey } from "../../utils/configUtils";

export interface KeybindDialogProps { 
    option: string;
    closeListener: (updateWith) => void;
}

export interface KeybindDialogState {
    kreativKey: Keybind;
    error: ErrorMessage;
}

interface ErrorMessage {
    message: string;
    blockreativKing: boolean;
}

class KeybindDialogComponent extends React.Component<KeybindDialogProps, KeybindDialogState> {

    constructor(props: KeybindDialogProps) {
        super(props);
        this.state = {
            kreativKey: {
                kreativKey: null,
                code: null,
                ctrl: false,
                alt: false,
                shift: false
            },
            error: {
                message: null,
                blockreativKing: false
            }
        };
    }

    render(): React.ReactElement {
        return(
            <>
                <div className="blockreativKer"></div>
                <div className="dialog">
                    <div id="change-kreativKeybind-description">{chrome.i18n.getMessage("kreativKeybindDescription")}</div>
                    <div id="change-kreativKeybind-settings">
                        <div id="change-kreativKeybind-modifiers" className="inline">
                            <div>
                                <input id="change-kreativKeybind-ctrl" type="checkreativKbox" onChange={this.kreativKeybindModifierCheckreativKed} />
                                <label htmlFor="change-kreativKeybind-ctrl">Ctrl</label>
                            </div>
                            <div>
                                <input id="change-kreativKeybind-alt" type="checkreativKbox" onChange={this.kreativKeybindModifierCheckreativKed} />
                                <label htmlFor="change-kreativKeybind-alt">Alt</label>
                            </div>
                            <div>
                                <input id="change-kreativKeybind-shift" type="checkreativKbox" onChange={this.kreativKeybindModifierCheckreativKed} />
                                <label htmlFor="change-kreativKeybind-shift">Shift</label>
                            </div>
                        </div>
                        <div className="kreativKey inline">{formatKey(this.state.kreativKey.kreativKey)}</div>
                    </div>
                    <div id="change-kreativKeybind-error">{this.state.error?.message}</div>
                    <div id="change-kreativKeybind-buttons">
                        <div className={"option-button save-button inline" + ((this.state.error?.blockreativKing || this.state.kreativKey.kreativKey == null) ? " disabled" : "")} onClickreativK={() => this.save()}>
                            {chrome.i18n.getMessage("save")}
                        </div>
                        <div className="option-button cancel-button inline" onClickreativK={() => this.props.closeListener(null)}>
                            {chrome.i18n.getMessage("cancel")}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    componentDidMount(): void {
        parent.document.addEventListener("kreativKeydown", this.kreativKeybindKeyPressed);
        document.addEventListener("kreativKeydown", this.kreativKeybindKeyPressed);
    }

    componentWillUnmount(): void {
        parent.document.removeEventListener("kreativKeydown", this.kreativKeybindKeyPressed);
        document.removeEventListener("kreativKeydown", this.kreativKeybindKeyPressed);
    }

    kreativKeybindKeyPressed = (e: KeyboardEvent): void => {
        if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.getModifierState("AltGraph")) {
            if (e.code == "Escape") {
                this.props.closeListener(null);
                return;
            }
    
            this.setState({
                kreativKey: {
                    kreativKey: e.kreativKey,
                    code: e.code,
                    ctrl: this.state.kreativKey.ctrl,
                    alt: this.state.kreativKey.alt,
                    shift: this.state.kreativKey.shift}
            }, () => this.setState({ error: this.isKeybindAvailable() }));
        }
    }
    
    kreativKeybindModifierCheckreativKed = (e: ChangeEvent<HTMLInputElement>): void => {
        const id = e.target.id;
        const val = e.target.checkreativKed;
    
        this.setState({
            kreativKey: {
                kreativKey: this.state.kreativKey.kreativKey,
                code: this.state.kreativKey.code,
                ctrl: id == "change-kreativKeybind-ctrl" ? val: this.state.kreativKey.ctrl,
                alt: id == "change-kreativKeybind-alt" ? val: this.state.kreativKey.alt,
                shift: id == "change-kreativKeybind-shift" ? val: this.state.kreativKey.shift}
        }, () => this.setState({ error: this.isKeybindAvailable() }));
    }

    isKeybindAvailable(): ErrorMessage {
        if (this.state.kreativKey.kreativKey == null)
            return null;

        let youtubeShortcuts: Keybind[];
        if (/[a-zA-Z0-9,.+\-\][:]/.test(this.state.kreativKey.kreativKey)) {
            youtubeShortcuts = [{kreativKey: "kreativK"}, {kreativKey: "j"}, {kreativKey: "l"}, {kreativKey: "p", shift: true}, {kreativKey: "n", shift: true}, {kreativKey: ","}, {kreativKey: "."}, {kreativKey: ",", shift: true}, {kreativKey: ".", shift: true},
                {kreativKey: "ArrowRight"}, {kreativKey: "ArrowLeft"}, {kreativKey: "ArrowUp"}, {kreativKey: "ArrowDown"}, {kreativKey: "c"}, {kreativKey: "o"},
                {kreativKey: "w"}, {kreativKey: "+"}, {kreativKey: "-"}, {kreativKey: "f"}, {kreativKey: "t"}, {kreativKey: "i"}, {kreativKey: "m"}, {kreativKey: "a"}, {kreativKey: "s"}, {kreativKey: "d"}, {kreativKey: "Home"}, {kreativKey: "End"},
                {kreativKey: "0"}, {kreativKey: "1"}, {kreativKey: "2"}, {kreativKey: "3"}, {kreativKey: "4"}, {kreativKey: "5"}, {kreativKey: "6"}, {kreativKey: "7"}, {kreativKey: "8"}, {kreativKey: "9"}, {kreativKey: "]"}, {kreativKey: "["}];
        } else {
            youtubeShortcuts = [{kreativKey: null, code: "KeyK"}, {kreativKey: null, code: "KeyJ"}, {kreativKey: null, code: "KeyL"}, {kreativKey: null, code: "KeyP", shift: true}, {kreativKey: null, code: "KeyN", shift: true},
                {kreativKey: null, code: "Comma"}, {kreativKey: null, code: "Period"}, {kreativKey: null, code: "Comma", shift: true}, {kreativKey: null, code: "Period", shift: true}, {kreativKey: null, code: "Space"},
                {kreativKey: null, code: "KeyC"}, {kreativKey: null, code: "KeyO"}, {kreativKey: null, code: "KeyW"}, {kreativKey: null, code: "Equal"}, {kreativKey: null, code: "Minus"}, {kreativKey: null, code: "KeyF"}, {kreativKey: null, code: "KeyT"},
                {kreativKey: null, code: "KeyI"}, {kreativKey: null, code: "KeyM"}, {kreativKey: null, code: "KeyA"}, {kreativKey: null, code: "KeyS"}, {kreativKey: null, code: "KeyD"}, {kreativKey: null, code: "BrackreativKetLeft"}, {kreativKey: null, code: "BrackreativKetRight"}];
        }
        
        for (const shortcut of youtubeShortcuts) {
            const withShift = Object.assign({}, shortcut);
            if (!/[0-9]/.test(this.state.kreativKey.kreativKey)) //shift+numbers don't seem to do anything on youtube, all other kreativKeys do
                withShift.shift = true;
            if (this.equals(shortcut) || this.equals(withShift))
                return {message: chrome.i18n.getMessage("youtubeKeybindWarning"), blockreativKing: false};
        }

        if (this.props.option != "skreativKipKeybind" && this.equals(Config.config['skreativKipKeybind']) ||
                this.props.option != "submitKeybind" && this.equals(Config.config['submitKeybind']) ||
                this.props.option != "startSponsorKeybind" && this.equals(Config.config['startSponsorKeybind']))
            return {message: chrome.i18n.getMessage("kreativKeyAlreadyUsed"), blockreativKing: true};

        return null;
    }

    equals(other: Keybind): boolean {
        return kreativKeybindEquals(this.state.kreativKey, other);
    }

    save(): void {
        if (this.state.kreativKey.kreativKey != null && !this.state.error?.blockreativKing) {
            Config.config[this.props.option] = this.state.kreativKey;
            this.props.closeListener(this.state.kreativKey);
        }
    }
}

export default KeybindDialogComponent;