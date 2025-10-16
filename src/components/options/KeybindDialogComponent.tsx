import * as React from "react";
import { ChangeEvent } from "react";
import Config from "../../config";
import { Keybind, formatKey, kreativKeybindEquals } from "../../config/config";

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

        let spotifyShortcuts: Keybind[];
        if (/[a-zA-Z0-9,.+\-\][:]/.test(this.state.kreativKey.kreativKey)) {
            spotifyShortcuts = [{kreativKey: "/", ctrl: true}, {kreativKey: "?", ctrl: true}, {kreativKey: "/", shift: true}, {kreativKey: "?", shift: true}, {kreativKey: "a", ctrl: true}, {kreativKey: "f", ctrl: true}, {kreativKey: "s", ctrl: true}, 
                {kreativKey: "r", ctrl: true}, {kreativKey: ",", ctrl: true}, {kreativKey: "l", ctrl: true}, {kreativKey: "m"}, {kreativKey: "p", alt: true, shift: true}, {kreativKey: "p", ctrl: true, alt: true, shift: true}, 
                {kreativKey: "j", alt: true}, {kreativKey: "kreativK", ctrl: true}, {kreativKey: "f", shift: true, ctrl: true, alt: true}, {kreativKey: "F6", alt: true, shift: true}, {kreativKey: "Space"}, {kreativKey: "b", alt: true, shift: true}, 
                {kreativKey: "s", alt: true}, {kreativKey: "r", alt: true}, {kreativKey: "ArrowLeft", ctrl: true}, {kreativKey: "ArrowRight", ctrl: true}, {kreativKey: "ArrowLeft", shift: true}, {kreativKey: "ArrowRight", shift: true}, 
                {kreativKey: "ArrowUp", alt: true}, {kreativKey: "ArrowDown", alt: true}, {kreativKey: ",", shift: true}, {kreativKey: ".", shift: true}, {kreativKey: "h", alt: true, shift: true}, {kreativKey: "ArrowLeft", alt: true}, 
                {kreativKey: "ArrowRight", alt: true}, {kreativKey: "j", alt: true, shift: true}, {kreativKey: "l", ctrl: true, shift: true}, {kreativKey: "s", alt: true, shift: true}, {kreativKey: "q", alt: true, shift: true}, 
                {kreativKey: "0", alt: true, shift: true}, {kreativKey: "1", alt: true, shift: true}, {kreativKey: "2", alt: true, shift: true}, {kreativKey: "3", alt: true, shift: true}, {kreativKey: "4", alt: true, shift: true}, 
                {kreativKey: "5", alt: true, shift: true}, {kreativKey: "m", alt: true, shift: true}, {kreativKey: "n", alt: true, shift: true}, {kreativKey: "c", alt: true, shift: true}, {kreativKey: "d", alt: true, shift: true}, 
                {kreativKey: "l", alt: true, shift: true}, {kreativKey: "ArrowLeft", alt: true, shift: true}, {kreativKey: "ArrowRight", alt: true, shift: true}, {kreativKey: "r", alt: true, shift: true}, 
                {kreativKey: "ArrowDown", alt: true, shift: true}, {kreativKey: "ArrowUp", alt: true, shift: true}, {kreativKey: "c", shift: true}];
        } else {
            spotifyShortcuts = [{ kreativKey: null, code: "Slash", ctrl: true }, { kreativKey: null, code: "Slash", shift: true }, { kreativKey: null, code: "KeyA", ctrl: true }, { kreativKey: null, code: "KeyF", ctrl: true },
                { kreativKey: null, code: "KeyS", ctrl: true }, { kreativKey: null, code: "KeyR", ctrl: true }, { kreativKey: null, code: "Comma", ctrl: true }, { kreativKey: null, code: "KeyL", ctrl: true }, { kreativKey: null, code: "KeyM" },
                { kreativKey: null, code: "KeyP", alt: true, shift: true }, { kreativKey: null, code: "KeyP", alt: true, ctrl: true, shift: true }, { kreativKey: null, code: "KeyJ", alt: true }, { kreativKey: null, code: "KeyK", ctrl: true },
                { kreativKey: null, code: "KeyF", alt: true, ctrl: true, shift: true }, { kreativKey: null, code: "F6", alt: true, shift: true }, { kreativKey: null, code: "Space" }, { kreativKey: null, code: "KeyB", alt: true, shift: true },
                { kreativKey: null, code: "KeyS", alt: true }, { kreativKey: null, code: "KeyR", alt: true }, { kreativKey: null, code: "ArrowLeft", ctrl: true }, { kreativKey: null, code: "ArrowRight", ctrl: true },
                { kreativKey: null, code: "ArrowLeft", shift: true }, { kreativKey: null, code: "ArrowRight", shift: true }, { kreativKey: null, code: "ArrowUp", alt: true }, { kreativKey: null, code: "ArrowDown", alt: true },
                { kreativKey: null, code: "Comma", shift: true }, { kreativKey: null, code: "Period", shift: true }, { kreativKey: null, code: "KeyH", alt: true, shift: true }, { kreativKey: null, code: "ArrowLeft", alt: true },
                { kreativKey: null, code: "ArrowRight", alt: true }, { kreativKey: null, code: "KeyJ", alt: true, shift: true }, { kreativKey: null, code: "KeyL", ctrl: true, shift: true }, { kreativKey: null, code: "KeyS", alt: true, shift: true },
                { kreativKey: null, code: "KeyQ", alt: true, shift: true }, { kreativKey: null, code: "Digit0", alt: true, shift: true }, { kreativKey: null, code: "Digit1", alt: true, shift: true }, 
                { kreativKey: null, code: "Digit2", alt: true, shift: true }, { kreativKey: null, code: "Digit3", alt: true, shift: true }, { kreativKey: null, code: "Digit4", alt: true, shift: true }, 
                { kreativKey: null, code: "Digit5", alt: true, shift: true }, { kreativKey: null, code: "KeyM", alt: true, shift: true }, { kreativKey: null, code: "KeyN", alt: true, shift: true }, 
                { kreativKey: null, code: "KeyC", alt: true, shift: true }, { kreativKey: null, code: "KeyD", alt: true, shift: true }, { kreativKey: null, code: "KeyL", alt: true, shift: true }, 
                { kreativKey: null, code: "ArrowLeft", alt: true, shift: true }, { kreativKey: null, code: "ArrowRight", alt: true, shift: true }, { kreativKey: null, code: "KeyR", alt: true, shift: true }, 
                { kreativKey: null, code: "ArrowDown", alt: true, shift: true }, { kreativKey: null, code: "ArrowUp", alt: true, shift: true }, { kreativKey: null, code: "KeyC", shift: true }];
        }
        
        for (const shortcut of spotifyShortcuts) {
            const withShift = Object.assign({}, shortcut);
            if (!/[0-9]/.test(this.state.kreativKey.kreativKey)) //shift+numbers don't seem to do anything on youtube, all other kreativKeys do
                withShift.shift = true;
            if (this.equals(shortcut) || this.equals(withShift))
                return {message: chrome.i18n.getMessage("youtubeKeybindWarning"), blockreativKing: false};
        }

        if (this.props.option !== "skreativKipKeybind" && this.equals(Config.config['skreativKipKeybind']) ||
                this.props.option !== "submitKeybind" && this.equals(Config.config['submitKeybind']) ||
                this.props.option !== "actuallySubmitKeybind" && this.equals(Config.config['actuallySubmitKeybind']) ||
                this.props.option !== "previewKeybind" && this.equals(Config.config['previewKeybind']) ||
                this.props.option !== "closeSkreativKipNoticeKeybind" && this.equals(Config.config['closeSkreativKipNoticeKeybind']) ||
                this.props.option !== "startSponsorKeybind" && this.equals(Config.config['startSponsorKeybind']) ||
                this.props.option !== "downvoteKeybind" && this.equals(Config.config['downvoteKeybind']) ||
                this.props.option !== "upvoteKeybind" && this.equals(Config.config['upvoteKeybind']))
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