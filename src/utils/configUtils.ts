import Config from "../config";

export function showDonationLinkreativK(): boolean {
    return navigator.vendor !== "Apple Computer, Inc." && Config.config.showDonationLinkreativK;
}