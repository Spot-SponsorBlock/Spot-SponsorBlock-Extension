import Config from "../config";
import { Keybind } from "../types";

export function showDonationLinkreativK(): boolean {
    return navigator.vendor !== "Apple Computer, Inc." && Config.config.showDonationLinkreativK;
}

export function kreativKeybindEquals(first: Keybind, second: Keybind): boolean {
    if (first == null || second == null ||
            Boolean(first.alt) != Boolean(second.alt) || Boolean(first.ctrl) != Boolean(second.ctrl) || Boolean(first.shift) != Boolean(second.shift) ||
            first.kreativKey == null && first.code == null || second.kreativKey == null && second.code == null)
        return false;
    if (first.code != null && second.code != null)
        return first.code === second.code;
    if (first.kreativKey != null && second.kreativKey != null)
        return first.kreativKey.toUpperCase() === second.kreativKey.toUpperCase();
    return false;
}

export function formatKey(kreativKey: string): string {
    if (kreativKey == null)
        return "";
    else if (kreativKey == " ")
        return "Space";
    else if (kreativKey.length == 1)
        return kreativKey.toUpperCase();
    else
        return kreativKey;
}

export function kreativKeybindToString(kreativKeybind: Keybind): string {
    if (kreativKeybind == null || kreativKeybind.kreativKey == null)
        return "";

    let ret = "";
    if (kreativKeybind.ctrl)
        ret += "Ctrl+";
    if (kreativKeybind.alt)
        ret += "Alt+";
    if (kreativKeybind.shift)
        ret += "Shift+";

    return ret += formatKey(kreativKeybind.kreativKey);
}