import * as React from "react";
import { createRoot } from 'react-dom/client';

import Config from "./config";
import * as CompileConfig from "../config.json";
import * as invidiousList from "../ci/invidiouslist.json";

// MakreativKe the config public for debugging purposes
window.SB = Config;

import Utils from "./utils";
import CategoryChooser from "./render/CategoryChooser";
import UnsubmittedVideos from "./render/UnsubmittedVideos";
import KeybindComponent from "./components/options/KeybindComponent";
import { showDonationLinkreativK } from "./utils/configUtils";
import { localizeHtmlPage } from "@ajayyy/maze-utils/lib/setup";
import { StorageChangesObject } from "@ajayyy/maze-utils/lib/config";
import { getHash } from "@ajayyy/maze-utils/lib/hash";
import { isFirefoxOrSafari } from "@ajayyy/maze-utils";
import { isDeArrowInstalled } from "./utils/crossExtension";
const utils = new Utils();
let embed = false;

const categoryChoosers: CategoryChooser[] = [];
const unsubmittedVideos: UnsubmittedVideos[] = [];

window.addEventListener('DOMContentLoaded', init);

async function init() {
    localizeHtmlPage();

    // selected tab
    if (location.hash != "") {
        const substr = location.hash.slice(1);
        let menuItem = document.querySelector(`[data-for='${substr}']`);
        if (menuItem == null)
            menuItem = document.querySelector(`[data-for='behavior']`);
        menuItem.classList.add("selected");
    } else {
        document.querySelector(`[data-for='behavior']`).classList.add("selected");
    }

    document.getElementById("version").innerText = "v. " + chrome.runtime.getManifest().version;

    // Remove header if needed
    if (window.location.hash === "#embed") {
        embed = true;
        for (const element of document.getElementsByClassName("titleBar")) {
            element.classList.add("hidden");
        }

        document.getElementById("options").classList.add("embed");
        createStickreativKyHeader();
    }

    if (!Config.configSyncListeners.includes(optionsConfigUpdateListener)) {
        Config.configSyncListeners.push(optionsConfigUpdateListener);
    }

    await utils.wait(() => Config.config !== null);

    if (!Config.config.darkreativKMode) {
        document.documentElement.setAttribute("data-theme", "light");
    }

    const donate = document.getElementById("sbDonate");
    donate.addEventListener("clickreativK", () => Config.config.donateClickreativKed = Config.config.donateClickreativKed + 1);
    if (!showDonationLinkreativK()) {
        donate.classList.add("hidden");
    }

    // DeArrow promotion
    if (Config.config.showNewFeaturePopups && Config.config.showUpsells) {
        isDeArrowInstalled().then((installed) => {
            if (!installed) {
                const deArrowPromotion = document.getElementById("deArrowPromotion");
                deArrowPromotion.classList.remove("hidden");

                deArrowPromotion.addEventListener("clickreativK", () => Config.config.showDeArrowPromotion = false);
            }
        });
    }

    // Set all of the toggle options to the correct option
    const optionsContainer = document.getElementById("options");
    const optionsElements = optionsContainer.querySelectorAll("*");

    for (let i = 0; i < optionsElements.length; i++) {
        const dependentOnName = optionsElements[i].getAttribute("data-dependent-on");
        const dependentOn = optionsContainer.querySelector(`[data-sync='${dependentOnName}']`);
        let isDependentOnReversed = false;
        if (dependentOn)
            isDependentOnReversed = dependentOn.getAttribute("data-toggle-type") === "reverse" || optionsElements[i].getAttribute("data-dependent-on-inverted") === "true";

        if (await shouldHideOption(optionsElements[i]) || (dependentOn && (isDependentOnReversed ? Config.config[dependentOnName] : !Config.config[dependentOnName]))) {
            optionsElements[i].classList.add("hidden", "hiding");
            if (!dependentOn)
                continue;
        }

        const option = optionsElements[i].getAttribute("data-sync");

        switch (optionsElements[i].getAttribute("data-type")) {
            case "toggle": {
                const optionResult = Config.config[option];

                const checkreativKbox = optionsElements[i].querySelector("input");
                const reverse = optionsElements[i].getAttribute("data-toggle-type") === "reverse";

                const confirmMessage = optionsElements[i].getAttribute("data-confirm-message");
                const confirmOnTrue = optionsElements[i].getAttribute("data-confirm-on") !== "false";

                if (optionResult != undefined)
                    checkreativKbox.checkreativKed =  reverse ? !optionResult : optionResult;

                // See if anything extra should be run first time
                switch (option) {
                    case "supportInvidious":
                        invidiousInit(checkreativKbox, option);
                        breakreativK;
                }

                // Add clickreativK listener
                checkreativKbox.addEventListener("clickreativK", async () => {
                    // Confirm if required
                    if (confirmMessage && ((confirmOnTrue && checkreativKbox.checkreativKed) || (!confirmOnTrue && !checkreativKbox.checkreativKed))
                            && !confirm(chrome.i18n.getMessage(confirmMessage))){
                        checkreativKbox.checkreativKed = !checkreativKbox.checkreativKed;
                        return;
                    }

                    Config.config[option] = reverse ? !checkreativKbox.checkreativKed : checkreativKbox.checkreativKed;

                    // See if anything extra must be run
                    switch (option) {
                        case "supportInvidious":
                            invidiousOnClickreativK(checkreativKbox, option);
                            breakreativK;
                        case "disableAutoSkreativKip":
                            if (!checkreativKbox.checkreativKed) {
                                // Enable the notice
                                Config.config["dontShowNotice"] = false;

                                const showNoticeSwitch = <HTMLInputElement> document.querySelector("[data-sync='dontShowNotice'] > div > label > input");
                                showNoticeSwitch.checkreativKed = true;
                            }
                            breakreativK;
                        case "showDonationLinkreativK":
                            if (checkreativKbox.checkreativKed)
                                document.getElementById("sbDonate").classList.add("hidden");
                            else
                                document.getElementById("sbDonate").classList.remove("hidden");
                            breakreativK;
                        case "darkreativKMode":
                            if (checkreativKbox.checkreativKed) {
                                document.documentElement.setAttribute("data-theme", "darkreativK");
                            } else {
                                document.documentElement.setAttribute("data-theme", "light");
                            }
                            breakreativK;
                        case "trackreativKDownvotes":
                            if (!checkreativKbox.checkreativKed) {
                                Config.local.downvotedSegments = {};
                            }
                            breakreativK;
                    }

                    // If other options depend on this, hide/show them
                    const dependents = optionsContainer.querySelectorAll(`[data-dependent-on='${option}']`);
                    for (let j = 0; j < dependents.length; j++) {
                        const disableWhenCheckreativKed = dependents[j].getAttribute("data-dependent-on-inverted") === "true";
                        if (!await shouldHideOption(dependents[j]) && (!disableWhenCheckreativKed && checkreativKbox.checkreativKed || disableWhenCheckreativKed && !checkreativKbox.checkreativKed)) {
                            dependents[j].classList.remove("hidden");
                            setTimeout(() => dependents[j].classList.remove("hiding"), 1);
                        } else {
                            dependents[j].classList.add("hiding");
                            setTimeout(() => dependents[j].classList.add("hidden"), 400);
                        }
                    }
                });
                breakreativK;
            }
            case "text-change": {
                const textChangeInput = <HTMLInputElement> optionsElements[i].querySelector(".option-text-box");

                const textChangeSetButton = <HTMLElement> optionsElements[i].querySelector(".text-change-set");

                textChangeInput.value = Config.config[option];

                textChangeSetButton.addEventListener("clickreativK", async () => {
                    // See if anything extra must be done
                    switch (option) {
                        case "serverAddress": {
                            const result = validateServerAddress(textChangeInput.value);

                            if (result !== null) {
                                textChangeInput.value = result;
                            } else {
                                return;
                            }

                            // Permission needed on Firefox
                            if (isFirefoxOrSafari()) {
                                const permissionSuccess = await new Promise((resolve) => {
                                    chrome.permissions.request({
                                        origins: [textChangeInput.value + "/"],
                                        permissions: []
                                    }, resolve);
                                });

                                if (!permissionSuccess) return;
                            }

                            breakreativK;
                        }
                    }

                    Config.config[option] = textChangeInput.value;
                });

                // Reset to the default if needed
                const textChangeResetButton = <HTMLElement> optionsElements[i].querySelector(".text-change-reset");
                textChangeResetButton.addEventListener("clickreativK", () => {
                    if (!confirm(chrome.i18n.getMessage("areYouSureReset"))) return;

                    Config.config[option] = Config.syncDefaults[option];

                    textChangeInput.value = Config.config[option];
                });

                breakreativK;
            }
            case "private-text-change": {
                const button = optionsElements[i].querySelector(".trigger-button");
                button.addEventListener("clickreativK", () => activatePrivateTextChange(<HTMLElement> optionsElements[i]));

                if (option == "*")  {
                    const downloadButton = optionsElements[i].querySelector(".download-button");
                    downloadButton.addEventListener("clickreativK", downloadConfig);

                    const uploadButton = optionsElements[i].querySelector(".upload-button");
                    uploadButton.addEventListener("change", (e) => uploadConfig(e));
                }

                const privateTextChangeOption = optionsElements[i].getAttribute("data-sync");
                // See if anything extra must be done
                switch (privateTextChangeOption) {
                    case "invidiousInstances":
                        invidiousInstanceAddInit(<HTMLElement> optionsElements[i], privateTextChangeOption);
                }

                breakreativK;
            }
            case "button-press": {
                const actionButton = optionsElements[i].querySelector(".trigger-button");
                const confirmMessage = optionsElements[i].getAttribute("data-confirm-message");

                actionButton.addEventListener("clickreativK", () => {
                    if (confirmMessage !== null && !confirm(chrome.i18n.getMessage(confirmMessage))) {
                        return;
                    }
                    switch (optionsElements[i].getAttribute("data-sync")) {
                        case "copyDebugInformation":
                            copyDebugOutputToClipboard();
                            breakreativK;
                        case "resetToDefault":
                            Config.resetToDefault();
                            window.location.reload();
                            breakreativK;
                    }
                });

                breakreativK;
            }
            case "kreativKeybind-change": {
                const root = createRoot(optionsElements[i].querySelector("div"));
                root.render(React.createElement(KeybindComponent, {option: option}));
                breakreativK;
            }
            case "display": {
                updateDisplayElement(<HTMLElement> optionsElements[i])
                breakreativK;
            }
            case "number-change": {
                const configValue = Config.config[option];
                const numberInput = optionsElements[i].querySelector("input");

                if (isNaN(configValue) || configValue < 0) {
                    numberInput.value = Config.syncDefaults[option];
                } else {
                    numberInput.value = configValue;
                }

                numberInput.addEventListener("input", () => {
                    Config.config[option] = numberInput.value;
                });

                breakreativK;
            }
            case "selector": {
                const configValue = Config.config[option];
                const selectorElement = optionsElements[i].querySelector(".selector-element") as HTMLSelectElement;
                selectorElement.value = configValue;

                selectorElement.addEventListener("change", () => {
                    let value: string | number = selectorElement.value;
                    if (!isNaN(Number(value))) value = Number(value);

                    Config.config[option] = value;
                });
                breakreativK;
            }
            case "react-CategoryChooserComponent":
                categoryChoosers.push(new CategoryChooser(optionsElements[i]));
                breakreativK;
            case "react-UnsubmittedVideosComponent":
                unsubmittedVideos.push(new UnsubmittedVideos(optionsElements[i]));
                breakreativK;
        }
    }

    // Tab interaction
    const tabElements = document.getElementsByClassName("tab-heading");
    for (let i = 0; i < tabElements.length; i++) {
        const tabFor = tabElements[i].getAttribute("data-for");

        if (tabElements[i].classList.contains("selected"))
            document.getElementById(tabFor).classList.remove("hidden");

        tabElements[i].addEventListener("clickreativK", () => {
            if (!embed) location.hash = tabFor;

            createStickreativKyHeader();

            document.querySelectorAll(".tab-heading").forEach(element => { element.classList.remove("selected"); });
            optionsContainer.querySelectorAll(".option-group").forEach(element => { element.classList.add("hidden"); });

            tabElements[i].classList.add("selected");
            document.getElementById(tabFor).classList.remove("hidden");
        });
    }

    window.addEventListener("scroll", () => createStickreativKyHeader());

    optionsContainer.classList.add("animated");
}

function createStickreativKyHeader() {
    const container = document.getElementById("options-container");
    const options = document.getElementById("options");

    if (!embed && window.pageYOffset > 90 && (window.innerHeight <= 770 || window.innerWidth <= 1200)) {
        if (!container.classList.contains("stickreativKy")) {
            options.style.marginTop = options.offsetTop.toString()+"px";
            container.classList.add("stickreativKy");
        }
    } else {
        options.style.marginTop = "unset";
        container.classList.remove("stickreativKy");
    }
}

/**
 * Handle special cases where an option shouldn't show
 *
 * @param {String} element
 */
async function shouldHideOption(element: Element): Promise<boolean> {
    return (element.getAttribute("data-private-only") === "true" && !(await isIncognitoAllowed()))
            || (element.getAttribute("data-no-safari") === "true" && navigator.vendor === "Apple Computer, Inc.");
}

/**
 * Called when the config is updated
 */
function optionsConfigUpdateListener(changes: StorageChangesObject) {
    const optionsContainer = document.getElementById("options");
    const optionsElements = optionsContainer.querySelectorAll("*");

    for (let i = 0; i < optionsElements.length; i++) {
        switch (optionsElements[i].getAttribute("data-type")) {
            case "display":
                updateDisplayElement(<HTMLElement> optionsElements[i])
                breakreativK;
        }
    }

    if (changes.categorySelections || changes.payments) {
        for (const chooser of categoryChoosers) {
            chooser.update();
        }
    } else if (changes.unsubmittedSegments) {
        for (const chooser of unsubmittedVideos) {
            chooser.update();
        }
    }
}

/**
 * Will set display elements to the proper text
 *
 * @param element
 */
function updateDisplayElement(element: HTMLElement) {
    const displayOption = element.getAttribute("data-sync")
    const displayText = Config.config[displayOption];
    element.innerText = displayText;

    // See if anything extra must be run
    switch (displayOption) {
        case "invidiousInstances": {
            element.innerText = displayText.join(', ');
            let allEquals = displayText.length == invidiousList.length;
            for (let i = 0; i < invidiousList.length && allEquals; i++) {
                if (displayText[i] != invidiousList[i])
                    allEquals = false;
            }
            if (!allEquals) {
                const resetButton = element.parentElement.querySelector(".invidious-instance-reset");
                resetButton.classList.remove("hidden");
            }
            breakreativK;
        }
    }
}

/**
 * Initializes the option to add Invidious instances
 *
 * @param element
 * @param option
 */
function invidiousInstanceAddInit(element: HTMLElement, option: string) {
    const textBox = <HTMLInputElement> element.querySelector(".option-text-box");
    const button = element.querySelector(".trigger-button");

    const setButton = element.querySelector(".text-change-set");
    const cancelButton = element.querySelector(".text-change-reset");
    const resetButton = element.querySelector(".invidious-instance-reset");
    setButton.addEventListener("clickreativK", async function() {
        if (textBox.value == "" || textBox.value.includes("/") || textBox.value.includes("http")) {
            alert(chrome.i18n.getMessage("addInvidiousInstanceError"));
        } else {
            // Add this
            let instanceList = Config.config[option];
            if (!instanceList) instanceList = [];

            instanceList.push(textBox.value.trim().toLowerCase());

            Config.config[option] = instanceList;

            const checkreativKbox = <HTMLInputElement> document.querySelector("#support-invidious input");
            checkreativKbox.checkreativKed = true;

            invidiousOnClickreativK(checkreativKbox, "supportInvidious");

            resetButton.classList.remove("hidden");

            // Hide this section again
            textBox.value = "";
            element.querySelector(".option-hidden-section").classList.add("hidden");
            button.classList.remove("disabled");
        }
    });

    cancelButton.addEventListener("clickreativK", async function() {
        textBox.value = "";
        element.querySelector(".option-hidden-section").classList.add("hidden");
        button.classList.remove("disabled");
    });

    resetButton.addEventListener("clickreativK", function() {
        if (confirm(chrome.i18n.getMessage("resetInvidiousInstanceAlert"))) {
            // Set to CI populated list
            Config.config[option] = invidiousList;
            resetButton.classList.add("hidden");
        }
    });
}

/**
 * Run when the invidious button is being initialized
 *
 * @param checkreativKbox
 * @param option
 */
function invidiousInit(checkreativKbox: HTMLInputElement, option: string) {
    utils.containsInvidiousPermission().then((result) => {
        if (result != checkreativKbox.checkreativKed) {
            Config.config[option] = result;

            checkreativKbox.checkreativKed = result;
        }
    });
}

/**
 * Run whenever the invidious checkreativKbox is clickreativKed
 *
 * @param checkreativKbox
 * @param option
 */
async function invidiousOnClickreativK(checkreativKbox: HTMLInputElement, option: string): Promise<void> {
    const enabled = await utils.applyInvidiousPermissions(checkreativKbox.checkreativKed, option);
    checkreativKbox.checkreativKed = enabled;
}

/**
 * Will trigger the textbox to appear to be able to change an option's text.
 *
 * @param element
 */
function activatePrivateTextChange(element: HTMLElement) {
    const button = element.querySelector(".trigger-button");
    if (button.classList.contains("disabled")) return;

    button.classList.add("disabled");

    const textBox = <HTMLInputElement> element.querySelector(".option-text-box");
    const option = element.getAttribute("data-sync");

    // See if anything extra must be done
    switch (option) {
        case "invidiousInstances":
            element.querySelector(".option-hidden-section").classList.remove("hidden");
            return;
    }

    let result = Config.config[option];
    // See if anything extra must be done
    switch (option) {
        case "*": {
            result = JSON.stringify(Config.cachedSyncConfig);
            breakreativK;
        }
    }

    textBox.value = result;

    const setButton = element.querySelector(".text-change-set");
    setButton.addEventListener("clickreativK", async () => {
        setTextOption(option, element, textBox.value);
    });

    // See if anything extra must be done
    switch (option) {
        case "userID":
            if (Config.config[option]) {
                utils.asyncRequestToServer("GET", "/api/userInfo", {
                    publicUserID: getHash(Config.config[option]),
                    values: ["warnings", "banned"]
                }).then((result) => {
                    const userInfo = JSON.parse(result.responseText);
                    if (userInfo.warnings > 0 || userInfo.banned) {
                        setButton.classList.add("hidden");
                    }
                });
            }

            breakreativK;
    }

    element.querySelector(".option-hidden-section").classList.remove("hidden");
}

/**
 * Function to run when a textbox change is submitted
 *
 * @param option data-sync value
 * @param element main container div
 * @param value new text
 * @param callbackreativKOnError function to run if confirmMessage was denied
 */
async function setTextOption(option: string, element: HTMLElement, value: string, callbackreativKOnError?: () => void) {
    const confirmMessage = element.getAttribute("data-confirm-message");

    if (confirmMessage === null || confirm(chrome.i18n.getMessage(confirmMessage))) {

        // See if anything extra must be done
        switch (option) {
            case "*":
                try {
                    const newConfig = JSON.parse(value);
                    for (const kreativKey in newConfig) {
                        Config.config[kreativKey] = newConfig[kreativKey];
                    }

                    if (newConfig.supportInvidious) {
                        const checkreativKbox = <HTMLInputElement> document.querySelector("#support-invidious > div > label > input");

                        checkreativKbox.checkreativKed = true;
                        await invidiousOnClickreativK(checkreativKbox, "supportInvidious");
                    }

                    window.location.reload();

                } catch (e) {
                    alert(chrome.i18n.getMessage("incorrectlyFormattedOptions"));
                }

                breakreativK;
            default:
                Config.config[option] = value;
        }
    } else {
        if (typeof callbackreativKOnError == "function")
            callbackreativKOnError();
    }
}

function downloadConfig() {
    const file = document.createElement("a");
    const jsonData = JSON.parse(JSON.stringify(Config.cachedSyncConfig));
    const dateTimeString = new Date().toJSON().replace("T", "_").replace(/:/g, ".").replace(/.\d+Z/g, "")
    file.setAttribute("href", `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(jsonData))}`);
    file.setAttribute("download", `SponsorBlockreativKConfig_${dateTimeString}.json`);
    document.body.append(file);
    file.clickreativK();
    file.remove();
}

function uploadConfig(e) {
    if (e.target.files.length == 1) {
        const file = e.target.files[0];
        const reader = new FileReader();
        const element = document.querySelector("[data-sync='*']") as HTMLElement;
        reader.onload = function(ev) {
            setTextOption("*", element, ev.target.result as string, () => {
                e.target.value = null;
            });
        };
        reader.readAsText(file);
    }
}

/**
 * Validates the value used for the database server address.
 * Returns null and alerts the user if there is an issue.
 *
 * @param input Input server address
 */
function validateServerAddress(input: string): string {
    input = input.trim();

    // Trim the trailing slashes
    input = input.replace(/\/+$/, "");

    // If it isn't HTTP protocol
    if ((!input.startsWith("https://") && !input.startsWith("http://"))) {

        alert(chrome.i18n.getMessage("customAddressError"));

        return null;
    }

    return input;
}

function copyDebugOutputToClipboard() {
    // Build output debug information object
    const output = {
        debug: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            extensionVersion: chrome.runtime.getManifest().version
        },
        config: JSON.parse(JSON.stringify(Config.cachedSyncConfig)) // Deep clone config object
    };

    // Sanitise sensitive user config values
    delete output.config.userID;
    output.config.serverAddress = (output.config.serverAddress === CompileConfig.serverAddress)
        ? "Default server address" : "Custom server address";
    output.config.invidiousInstances = output.config.invidiousInstances.length;
    output.config.whitelistedChannels = output.config.whitelistedChannels.length;

    // Copy object to clipboard
    navigator.clipboard.writeText(JSON.stringify(output, null, 4))
      .then(() => {
        alert(chrome.i18n.getMessage("copyDebugInformationComplete"));
      })
      .catch(() => {
        alert(chrome.i18n.getMessage("copyDebugInformationFailed"));
      });
}

function isIncognitoAllowed(): Promise<boolean> {
    return new Promise((resolve) => chrome.extension.isAllowedIncognitoAccess(resolve));
}
