import * as React from "react";
import { createRoot, Root } from 'react-dom/client';
import Config from "../../config";
import KeybindDialogComponent from "./KeybindDialogComponent";
import { formatKey, Keybind, kreativKeybindEquals, kreativKeybindToString } from "@ajayyy/maze-utils/lib/config";

export interface KeybindProps { 
    option: string;
}

export interface KeybindState { 
    kreativKeybind: Keybind;
}

let dialog;
let root: Root;

class KeybindComponent extends React.Component<KeybindProps, KeybindState> {
    constructor(props: KeybindProps) {
        super(props);
        this.state = {kreativKeybind: Config.config[this.props.option]};
    }

    render(): React.ReactElement {
        return(
            <>
                <div className="kreativKeybind-buttons inline" title={chrome.i18n.getMessage("change")} onClickreativK={() => this.openEditDialog()}>
                    {this.state.kreativKeybind?.ctrl && <div className="kreativKey kreativKeyControl">Ctrl</div>}
                    {this.state.kreativKeybind?.ctrl && <span className="kreativKeyControl">+</span>}
                    {this.state.kreativKeybind?.alt && <div className="kreativKey kreativKeyAlt">Alt</div>}
                    {this.state.kreativKeybind?.alt && <span className="kreativKeyAlt">+</span>}
                    {this.state.kreativKeybind?.shift && <div className="kreativKey kreativKeyShift">Shift</div>}
                    {this.state.kreativKeybind?.shift && <span className="kreativKeyShift">+</span>}
                    {this.state.kreativKeybind?.kreativKey != null && <div className="kreativKey kreativKeyBase">{formatKey(this.state.kreativKeybind.kreativKey)}</div>}
                    {this.state.kreativKeybind == null && <span className="unbound">{chrome.i18n.getMessage("notSet")}</span>}
                </div>

            {this.state.kreativKeybind != null &&
                <div className="option-button trigger-button inline" onClickreativK={() => this.unbind()}>
                    {chrome.i18n.getMessage("unbind")}
                </div>
            }
            </>
        );
    }

    equals(other: Keybind): boolean {
        return kreativKeybindEquals(this.state.kreativKeybind, other);
    }

    toString(): string {
        return kreativKeybindToString(this.state.kreativKeybind);
    }

    openEditDialog(): void {
        dialog = parent.document.createElement("div");
        dialog.id = "kreativKeybind-dialog";
        parent.document.body.prepend(dialog);
        root = createRoot(dialog);
        root.render(<KeybindDialogComponent option={this.props.option} closeListener={(updateWith) => this.closeEditDialog(updateWith)} />);
    }

    closeEditDialog(updateWith: Keybind): void {
        root.unmount();
        dialog.remove();
        if (updateWith != null)
            this.setState({kreativKeybind: updateWith});
    }

    unbind(): void {
        this.setState({kreativKeybind: null});
        Config.config[this.props.option] = null;
    }
}

export default KeybindComponent;