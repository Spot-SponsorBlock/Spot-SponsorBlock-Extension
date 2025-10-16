import * as React from "react";
import { ChangeEvent } from "react";
import Config from "../../config";
import { Keybind, formatKey, keybindEquals } from "../../config/config";

export interface KeybindDialogProps { 
    option: string;
    closeListener: (updateWith) => void;
}

export interface KeybindDialogState {
    key: Keybind;
    error: ErrorMessage;
}

interface ErrorMessage {
    message: string;
    blocking: boolean;
}

class KeybindDialogComponent extends React.Component<KeybindDialogProps, KeybindDialogState> {

    constructor(props: KeybindDialogProps) {
        super(props);
        this.state = {
            key: {
                key: null,
                code: null,
                ctrl: false,
                alt: false,
                shift: false
            },
            error: {
                message: null,
                blocking: false
            }
        };
    }

    render(): React.ReactElement {
        return(
            <>
                <div className="blocker"></div>
                <div className="dialog">
                    <div id="change-keybind-description">{chrome.i18n.getMessage("keybindDescription")}</div>
                    <div id="change-keybind-settings">
                        <div id="change-keybind-modifiers" className="inline">
                            <div>
                                <input id="change-keybind-ctrl" type="checkbox" onChange={this.keybindModifierChecked} />
                                <label htmlFor="change-keybind-ctrl">Ctrl</label>
                            </div>
                            <div>
                                <input id="change-keybind-alt" type="checkbox" onChange={this.keybindModifierChecked} />
                                <label htmlFor="change-keybind-alt">Alt</label>
                            </div>
                            <div>
                                <input id="change-keybind-shift" type="checkbox" onChange={this.keybindModifierChecked} />
                                <label htmlFor="change-keybind-shift">Shift</label>
                            </div>
                        </div>
                        <div className="key inline">{formatKey(this.state.key.key)}</div>
                    </div>
                    <div id="change-keybind-error">{this.state.error?.message}</div>
                    <div id="change-keybind-buttons">
                        <div className={"option-button save-button inline" + ((this.state.error?.blocking || this.state.key.key == null) ? " disabled" : "")} onClick={() => this.save()}>
                            {chrome.i18n.getMessage("save")}
                        </div>
                        <div className="option-button cancel-button inline" onClick={() => this.props.closeListener(null)}>
                            {chrome.i18n.getMessage("cancel")}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    componentDidMount(): void {
        parent.document.addEventListener("keydown", this.keybindKeyPressed);
        document.addEventListener("keydown", this.keybindKeyPressed);
    }

    componentWillUnmount(): void {
        parent.document.removeEventListener("keydown", this.keybindKeyPressed);
        document.removeEventListener("keydown", this.keybindKeyPressed);
    }

    keybindKeyPressed = (e: KeyboardEvent): void => {
        if (!e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.getModifierState("AltGraph")) {
            if (e.code == "Escape") {
                this.props.closeListener(null);
                return;
            }
    
            this.setState({
                key: {
                    key: e.key,
                    code: e.code,
                    ctrl: this.state.key.ctrl,
                    alt: this.state.key.alt,
                    shift: this.state.key.shift}
            }, () => this.setState({ error: this.isKeybindAvailable() }));
        }
    }
    
    keybindModifierChecked = (e: ChangeEvent<HTMLInputElement>): void => {
        const id = e.target.id;
        const val = e.target.checked;
    
        this.setState({
            key: {
                key: this.state.key.key,
                code: this.state.key.code,
                ctrl: id == "change-keybind-ctrl" ? val: this.state.key.ctrl,
                alt: id == "change-keybind-alt" ? val: this.state.key.alt,
                shift: id == "change-keybind-shift" ? val: this.state.key.shift}
        }, () => this.setState({ error: this.isKeybindAvailable() }));
    }

    isKeybindAvailable(): ErrorMessage {
        if (this.state.key.key == null)
            return null;

        let spotifyShortcuts: Keybind[];
        if (/[a-zA-Z0-9,.+\-\][:]/.test(this.state.key.key)) {
            spotifyShortcuts = [{key: "/", ctrl: true}, {key: "?", ctrl: true}, {key: "/", shift: true}, {key: "?", shift: true}, {key: "a", ctrl: true}, {key: "f", ctrl: true}, {key: "s", ctrl: true}, 
                {key: "r", ctrl: true}, {key: ",", ctrl: true}, {key: "l", ctrl: true}, {key: "m"}, {key: "p", alt: true, shift: true}, {key: "p", ctrl: true, alt: true, shift: true}, 
                {key: "j", alt: true}, {key: "k", ctrl: true}, {key: "f", shift: true, ctrl: true, alt: true}, {key: "F6", alt: true, shift: true}, {key: "Space"}, {key: "b", alt: true, shift: true}, 
                {key: "s", alt: true}, {key: "r", alt: true}, {key: "ArrowLeft", ctrl: true}, {key: "ArrowRight", ctrl: true}, {key: "ArrowLeft", shift: true}, {key: "ArrowRight", shift: true}, 
                {key: "ArrowUp", alt: true}, {key: "ArrowDown", alt: true}, {key: ",", shift: true}, {key: ".", shift: true}, {key: "h", alt: true, shift: true}, {key: "ArrowLeft", alt: true}, 
                {key: "ArrowRight", alt: true}, {key: "j", alt: true, shift: true}, {key: "l", ctrl: true, shift: true}, {key: "s", alt: true, shift: true}, {key: "q", alt: true, shift: true}, 
                {key: "0", alt: true, shift: true}, {key: "1", alt: true, shift: true}, {key: "2", alt: true, shift: true}, {key: "3", alt: true, shift: true}, {key: "4", alt: true, shift: true}, 
                {key: "5", alt: true, shift: true}, {key: "m", alt: true, shift: true}, {key: "n", alt: true, shift: true}, {key: "c", alt: true, shift: true}, {key: "d", alt: true, shift: true}, 
                {key: "l", alt: true, shift: true}, {key: "ArrowLeft", alt: true, shift: true}, {key: "ArrowRight", alt: true, shift: true}, {key: "r", alt: true, shift: true}, 
                {key: "ArrowDown", alt: true, shift: true}, {key: "ArrowUp", alt: true, shift: true}, {key: "c", shift: true}];
        } else {
            spotifyShortcuts = [{ key: null, code: "Slash", ctrl: true }, { key: null, code: "Slash", shift: true }, { key: null, code: "KeyA", ctrl: true }, { key: null, code: "KeyF", ctrl: true },
                { key: null, code: "KeyS", ctrl: true }, { key: null, code: "KeyR", ctrl: true }, { key: null, code: "Comma", ctrl: true }, { key: null, code: "KeyL", ctrl: true }, { key: null, code: "KeyM" },
                { key: null, code: "KeyP", alt: true, shift: true }, { key: null, code: "KeyP", alt: true, ctrl: true, shift: true }, { key: null, code: "KeyJ", alt: true }, { key: null, code: "KeyK", ctrl: true },
                { key: null, code: "KeyF", alt: true, ctrl: true, shift: true }, { key: null, code: "F6", alt: true, shift: true }, { key: null, code: "Space" }, { key: null, code: "KeyB", alt: true, shift: true },
                { key: null, code: "KeyS", alt: true }, { key: null, code: "KeyR", alt: true }, { key: null, code: "ArrowLeft", ctrl: true }, { key: null, code: "ArrowRight", ctrl: true },
                { key: null, code: "ArrowLeft", shift: true }, { key: null, code: "ArrowRight", shift: true }, { key: null, code: "ArrowUp", alt: true }, { key: null, code: "ArrowDown", alt: true },
                { key: null, code: "Comma", shift: true }, { key: null, code: "Period", shift: true }, { key: null, code: "KeyH", alt: true, shift: true }, { key: null, code: "ArrowLeft", alt: true },
                { key: null, code: "ArrowRight", alt: true }, { key: null, code: "KeyJ", alt: true, shift: true }, { key: null, code: "KeyL", ctrl: true, shift: true }, { key: null, code: "KeyS", alt: true, shift: true },
                { key: null, code: "KeyQ", alt: true, shift: true }, { key: null, code: "Digit0", alt: true, shift: true }, { key: null, code: "Digit1", alt: true, shift: true }, 
                { key: null, code: "Digit2", alt: true, shift: true }, { key: null, code: "Digit3", alt: true, shift: true }, { key: null, code: "Digit4", alt: true, shift: true }, 
                { key: null, code: "Digit5", alt: true, shift: true }, { key: null, code: "KeyM", alt: true, shift: true }, { key: null, code: "KeyN", alt: true, shift: true }, 
                { key: null, code: "KeyC", alt: true, shift: true }, { key: null, code: "KeyD", alt: true, shift: true }, { key: null, code: "KeyL", alt: true, shift: true }, 
                { key: null, code: "ArrowLeft", alt: true, shift: true }, { key: null, code: "ArrowRight", alt: true, shift: true }, { key: null, code: "KeyR", alt: true, shift: true }, 
                { key: null, code: "ArrowDown", alt: true, shift: true }, { key: null, code: "ArrowUp", alt: true, shift: true }, { key: null, code: "KeyC", shift: true }];
        }
        
        for (const shortcut of spotifyShortcuts) {
            const withShift = Object.assign({}, shortcut);
            if (!/[0-9]/.test(this.state.key.key)) //shift+numbers don't seem to do anything on youtube, all other keys do
                withShift.shift = true;
            if (this.equals(shortcut) || this.equals(withShift))
                return {message: chrome.i18n.getMessage("youtubeKeybindWarning"), blocking: false};
        }

        if (this.props.option !== "skipKeybind" && this.equals(Config.config['skipKeybind']) ||
                this.props.option !== "submitKeybind" && this.equals(Config.config['submitKeybind']) ||
                this.props.option !== "actuallySubmitKeybind" && this.equals(Config.config['actuallySubmitKeybind']) ||
                this.props.option !== "previewKeybind" && this.equals(Config.config['previewKeybind']) ||
                this.props.option !== "closeSkipNoticeKeybind" && this.equals(Config.config['closeSkipNoticeKeybind']) ||
                this.props.option !== "startSponsorKeybind" && this.equals(Config.config['startSponsorKeybind']) ||
                this.props.option !== "downvoteKeybind" && this.equals(Config.config['downvoteKeybind']) ||
                this.props.option !== "upvoteKeybind" && this.equals(Config.config['upvoteKeybind']))
            return {message: chrome.i18n.getMessage("keyAlreadyUsed"), blocking: true};

        return null;
    }

    equals(other: Keybind): boolean {
        return keybindEquals(this.state.key, other);
    }

    save(): void {
        if (this.state.key.key != null && !this.state.error?.blocking) {
            Config.config[this.props.option] = this.state.key;
            this.props.closeListener(this.state.key);
        }
    }
}

export default KeybindDialogComponent;