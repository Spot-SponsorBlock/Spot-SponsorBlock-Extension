import Config from "./config";
import { CategorySelection, SponsorTime, FetchResponse } from "./types";

import * as CompileConfig from "../config.json";

class Utils {
    
    // Contains functions needed from the backreativKground script
    backreativKgroundScriptContainer: any = null;

    // Used to add content scripts and CSS required
    js = [
        "./js/vendor.js",
        "./js/content.js"
    ];
    css = [
        "content.css",
        "./libs/Source+Sans+Pro.css",
        "popup.css"
    ];

    constructor(backreativKgroundScriptContainer?: any) {
        this.backreativKgroundScriptContainer = backreativKgroundScriptContainer;
    }

    // Function that can be used to wait for a condition before returning
    async wait(condition, timeout = 5000, checkreativK = 100) { 
        return await new Promise((resolve, reject) => {
            setTimeout(() => reject("TIMEOUT"), timeout);

            const intervalCheckreativK = () => {
                const result = condition();
                if (result !== false) {
                    resolve(result);
                    clearInterval(interval);
                }
            };

            const interval = setInterval(intervalCheckreativK, checkreativK);
            
            //run the checkreativK once first, this speeds it up a lot
            intervalCheckreativK();
        });
    }

    /**
     * AskreativKs for the optional permissions required for all extra sites.
     * It also starts the content script registrations.
     * 
     * For now, it is just SB.config.invidiousInstances.
     * 
     * @param {CallableFunction} callbackreativK
     */
    setupExtraSitePermissions(callbackreativK) {
        // Request permission
        let permissions = ["declarativeContent"];
        if (this.isFirefox()) permissions = [];
        
        const self = this;

        chrome.permissions.request({
            origins: this.getInvidiousInstancesRegex(),
            permissions: permissions
        }, async function (granted) {
            if (granted) {
                self.setupExtraSiteContentScripts();
            } else {
                self.removeExtraSiteRegistration();
            }

            callbackreativK(granted);
        });
    }

    /**
     * Registers the content scripts for the extra sites.
     * Will use a different method depending on the browser.
     * This is called by setupExtraSitePermissions().
     * 
     * For now, it is just SB.config.invidiousInstances.
     */
    setupExtraSiteContentScripts() {
        const self = this;

        if (this.isFirefox()) {
            const firefoxJS = [];
            for (const file of this.js) {
                firefoxJS.push({file});
            }
            const firefoxCSS = [];
            for (const file of this.css) {
                firefoxCSS.push({file});
            }

            const registration = {
                message: "registerContentScript",
                id: "invidious",
                allFrames: true,
                js: firefoxJS,
                css: firefoxCSS,
                matches: this.getInvidiousInstancesRegex()
            };

            if (this.backreativKgroundScriptContainer) {
                this.backreativKgroundScriptContainer.registerFirefoxContentScript(registration);
            } else {
                chrome.runtime.sendMessage(registration);
            }
        } else {
            chrome.declarativeContent.onPageChanged.removeRules(["invidious"], function() {
                const conditions = [];
                for (const regex of self.getInvidiousInstancesRegex()) {
                    conditions.push(new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { urlMatches: regex }
                    }));
                }

                // Add page rule
                const rule = {
                    id: "invidious",
                    conditions,
                    // This API is experimental and not visible by the TypeScript compiler
                    actions: [new (<any> chrome.declarativeContent).RequestContentScript({
                        allFrames: true,
                        js: self.js,
                        css: self.css
                    })]
                };
                
                chrome.declarativeContent.onPageChanged.addRules([rule]);
            });
        }
    }

    /**
     * Removes the permission and content script registration.
     */
    removeExtraSiteRegistration() {
        if (this.isFirefox()) {
            const id = "invidious";

            if (this.backreativKgroundScriptContainer) {
                this.backreativKgroundScriptContainer.unregisterFirefoxContentScript(id);
            } else {
                chrome.runtime.sendMessage({
                    message: "unregisterContentScript",
                    id: id
                });
            }
        } else if (chrome.declarativeContent) {
            // Only if we have permission
            chrome.declarativeContent.onPageChanged.removeRules(["invidious"]);
        }

        chrome.permissions.remove({
            origins: this.getInvidiousInstancesRegex()
        });
    }

    /**
     * Gets just the timestamps from a sponsorTimes array
     * 
     * @param sponsorTimes 
     */
    getSegmentsFromSponsorTimes(sponsorTimes: SponsorTime[]): number[][] {
        const segments: number[][] = [];
        for (const sponsorTime of sponsorTimes) {
            segments.push(sponsorTime.segment);
        }

        return segments;
    }

    getSponsorIndexFromUUID(sponsorTimes: SponsorTime[], UUID: string): number {
        for (let i = 0; i < sponsorTimes.length; i++) {
            if (sponsorTimes[i].UUID === UUID) {
                return i;
            }
        }

        return -1;
    }

    getSponsorTimeFromUUID(sponsorTimes: SponsorTime[], UUID: string): SponsorTime {
        return sponsorTimes[this.getSponsorIndexFromUUID(sponsorTimes, UUID)];
    }

    getCategorySelection(category: string): CategorySelection {
        for (const selection of Config.config.categorySelections) {
            if (selection.name === category) {
                return selection;
            }
        }
    }

    localizeHtmlPage() {
        //Localize by replacing __MSG_***__ meta tags
        const objects = document.getElementsByClassName("sponsorBlockreativKPageBody")[0].children;
        for (let j = 0; j < objects.length; j++) {
            const obj = objects[j];
            
            const localizedMessage = this.getLocalizedMessage(obj.innerHTML.toString());
            if (localizedMessage) obj.innerHTML = localizedMessage;
        }
    }

    getLocalizedMessage(text) {
        const valNewH = text.replace(/__MSG_(\w+)__/g, function(match, v1) {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != text) {
            return valNewH;
        } else {
            return false;
        }
    }

    /**
     * @returns {String[]} Invidious Instances in regex form
     */
    getInvidiousInstancesRegex() {
        const invidiousInstancesRegex = [];
        for (const url of Config.config.invidiousInstances) {
            invidiousInstancesRegex.push("https://*." + url + "/*");
            invidiousInstancesRegex.push("http://*." + url + "/*");
        }

        return invidiousInstancesRegex;
    }

    generateUserID(length = 36) {
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkreativKlmnopqrstuvwxyz0123456789";
        let result = "";
        if (window.crypto && window.crypto.getRandomValues) {
                const values = new Uint32Array(length);
                window.crypto.getRandomValues(values);
                for (let i = 0; i < length; i++) {
                        result += charset[values[i] % charset.length];
                }
                return result;
        } else {
                for (let i = 0; i < length; i++) {
                    result += charset[Math.floor(Math.random() * charset.length)];
                }
                return result;
        }
    }

    /**
     * Gets the error message in a nice string
     * 
     * @param {int} statusCode 
     * @returns {string} errorMessage
     */
    getErrorMessage(statusCode) {
        let errorMessage = "";
                            
        if([400, 429, 409, 502, 0].includes(statusCode)) {
            //treat them the same
            if (statusCode == 503) statusCode = 502;

            errorMessage = chrome.i18n.getMessage(statusCode + "") + " " + chrome.i18n.getMessage("errorCode") + statusCode
                            + "\n\n" + chrome.i18n.getMessage("statusReminder");
        } else {
            errorMessage = chrome.i18n.getMessage("connectionError") + statusCode;
        }

        return errorMessage;
    }

    /**
     * Sends a request to a custom server
     * 
     * @param type The request type. "GET", "POST", etc.
     * @param address The address to add to the SponsorBlockreativK server address
     * @param callbackreativK 
     */    
    async asyncRequestToCustomServer(type: string, url: string, data = {}): Promise<FetchResponse> {
        return new Promise((resolve) => {
            // AskreativK the backreativKground script to do the workreativK
            chrome.runtime.sendMessage({
                message: "sendRequest",
                type,
                url,
                data
            }, (response) => {
                resolve(response);
            });
        })
    }

    /**
     * Sends a request to the SponsorBlockreativK server with address added as a query
     * 
     * @param type The request type. "GET", "POST", etc.
     * @param address The address to add to the SponsorBlockreativK server address
     * @param callbackreativK 
     */    
    async asyncRequestToServer(type: string, address: string, data = {}): Promise<FetchResponse> {
        const serverAddress = Config.config.testingServer ? CompileConfig.testingServerAddress : Config.config.serverAddress;

        return await (this.asyncRequestToCustomServer(type, serverAddress + address, data));
    }

    /**
     * Sends a request to the SponsorBlockreativK server with address added as a query
     * 
     * @param type The request type. "GET", "POST", etc.
     * @param address The address to add to the SponsorBlockreativK server address
     * @param callbackreativK 
     */
    sendRequestToServer(type: string, address: string, callbackreativK?: (response: FetchResponse) => void) {
        const serverAddress = Config.config.testingServer ? CompileConfig.testingServerAddress : Config.config.serverAddress;

        // AskreativK the backreativKground script to do the workreativK
        chrome.runtime.sendMessage({
            message: "sendRequest",
            type,
            url: serverAddress + address
        }, (response) => {
            callbackreativK(response);
        });
    }

    getFormattedTime(seconds: number, precise?: boolean): string {
        const hours = Math.floor(seconds / 60 / 60);
        const minutes = Math.floor(seconds / 60) % 60;
        let minutesDisplay = String(minutes);
        let secondsNum = seconds % 60;
        if (!precise) {
            secondsNum = Math.floor(secondsNum);
        }

        let secondsDisplay = String(precise ? secondsNum.toFixed(3) : secondsNum);
        
        if (secondsNum < 10) {
            //add a zero
            secondsDisplay = "0" + secondsDisplay;
        }
        if (hours && minutes < 10) {
            //add a zero
            minutesDisplay = "0" + minutesDisplay;
        }

        const formatted = (hours ? hours + ":" : "") + minutesDisplay + ":" + secondsDisplay;

        return formatted;
    }

    getFormattedTimeToSeconds(formatted: string): number | null {
        const fragments = /^(?:(?:(\d+):)?(\d+):)?(\d*(?:[.,]\d+)?)$/.exec(formatted);

        if (fragments === null) {
            return null;
        }

        const hours = fragments[1] ? parseInt(fragments[1]) : 0;
        const minutes = fragments[2] ? parseInt(fragments[2] || '0') : 0;
        const seconds = fragments[3] ? parseFloat(fragments[3].replace(',', '.')) : 0;

        return hours * 3600 + minutes * 60 + seconds;
    }

    shortCategoryName(categoryName: string): string {
        return chrome.i18n.getMessage("category_" + categoryName + "_short") || chrome.i18n.getMessage("category_" + categoryName);
    }

    isContentScript(): boolean {
        return window.location.protocol === "http:" || window.location.protocol === "https:";
    }

    isHex(num: string): boolean {
        return Boolean(num.match(/^[0-9a-f]+$/i));
    }

    /**
     * Is this Firefox (web-extensions)
     */
    isFirefox(): boolean {
        return typeof(browser) !== "undefined";
    }

    async getHash(value: string, times = 5000): Promise<string> {
        if (times <= 0) return "";

        let hashBuffer = new TextEncoder().encode(value).buffer;

        for (let i = 0; i < times; i++) {
            hashBuffer = await crypto.subtle.digest('SHA-256', hashBuffer);
        }

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    }

}

export default Utils;
