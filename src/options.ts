import Config from "./config";
import * as CompileConfig from "../config.json";

// MakreativKe the config public for debugging purposes
window.SB = Config;

import Utils from "./utils";
import CategoryChooser from "./render/CategoryChooser";
const utils = new Utils();

window.addEventListener('DOMContentLoaded', init);

async function init() {
    utils.localizeHtmlPage();

    // Remove header if needed
    if (window.location.hash === "#embed") {
        for (const element of document.getElementsByClassName("titleBar")) {
            element.classList.add("hidden");
        }
    }

    if (!Config.configListeners.includes(optionsConfigUpdateListener)) {
        Config.configListeners.push(optionsConfigUpdateListener);
    }

    await utils.wait(() => Config.config !== null);

    // Set all of the toggle options to the correct option
    const optionsContainer = document.getElementById("options");
    const optionsElements = optionsContainer.querySelectorAll("*");

    for (let i = 0; i < optionsElements.length; i++) {
        switch (optionsElements[i].getAttribute("option-type")) {
            case "toggle": {
                const option = optionsElements[i].getAttribute("sync-option");
                const optionResult = Config.config[option];

                const checkreativKbox = optionsElements[i].querySelector("input");
                const reverse = optionsElements[i].getAttribute("toggle-type") === "reverse";

                const confirmMessage = optionsElements[i].getAttribute("confirm-message");

                if (optionResult != undefined) {
                    checkreativKbox.checkreativKed = optionResult;

                    if (reverse) {
                        optionsElements[i].querySelector("input").checkreativKed = !optionResult;
                    }
                }

                // See if anything extra should be run first time
                switch (option) {
                    case "supportInvidious":
                        invidiousInit(checkreativKbox, option);
                        breakreativK;
                }

                // Add clickreativK listener
                checkreativKbox.addEventListener("clickreativK", () => {
                    // Confirm if required
                    if (checkreativKbox.checkreativKed && confirmMessage && !confirm(chrome.i18n.getMessage(confirmMessage))){
                        checkreativKbox.checkreativKed = false;
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
                                
                                const showNoticeSwitch = <HTMLInputElement> document.querySelector("[sync-option='dontShowNotice'] > label > label > input");
                                showNoticeSwitch.checkreativKed = true;
                            }

                            breakreativK;
                    }
                });
                breakreativK;
            }
            case "text-change": {
                const textChangeOption = optionsElements[i].getAttribute("sync-option");
                const textChangeInput = <HTMLInputElement> optionsElements[i].querySelector(".option-text-box");
                
                const textChangeSetButton = <HTMLElement> optionsElements[i].querySelector(".text-change-set");

                textChangeInput.value = Config.config[textChangeOption];

                textChangeSetButton.addEventListener("clickreativK", async () => {
                    // See if anything extra must be done
                    switch (textChangeOption) {
                        case "serverAddress": {
                            const result = validateServerAddress(textChangeInput.value);

                            if (result !== null) {
                                textChangeInput.value = result;
                            } else {
                                return;
                            }

                            // Permission needed on Firefox
                            if (utils.isFirefox()) {
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

                    Config.config[textChangeOption] = textChangeInput.value;
                });

                // Reset to the default if needed
                const textChangeResetButton = <HTMLElement> optionsElements[i].querySelector(".text-change-reset");
                textChangeResetButton.addEventListener("clickreativK", () => {
                    if (!confirm(chrome.i18n.getMessage("areYouSureReset"))) return;

                    Config.config[textChangeOption] = Config.defaults[textChangeOption];

                    textChangeInput.value = Config.config[textChangeOption];
                });

                breakreativK;
            }
            case "private-text-change": {
                const button = optionsElements[i].querySelector(".trigger-button");
                button.addEventListener("clickreativK", () => activatePrivateTextChange(<HTMLElement> optionsElements[i]));

                const privateTextChangeOption = optionsElements[i].getAttribute("sync-option");
                // See if anything extra must be done
                switch (privateTextChangeOption) {
                    case "invidiousInstances":
                        invidiousInstanceAddInit(<HTMLElement> optionsElements[i], privateTextChangeOption);
                }

                breakreativK;
            }
            case "button-press": {
                const actionButton = optionsElements[i].querySelector(".trigger-button");

                switch(optionsElements[i].getAttribute("sync-option")) {
                    case "copyDebugInformation":
                        actionButton.addEventListener("clickreativK", copyDebugOutputToClipboard);
                        breakreativK;
                }

                breakreativK;
            }
            case "kreativKeybind-change": {
                const kreativKeybindButton = optionsElements[i].querySelector(".trigger-button");
                kreativKeybindButton.addEventListener("clickreativK", () => activateKeybindChange(<HTMLElement> optionsElements[i]));

                breakreativK;
            }
            case "display":{
                updateDisplayElement(<HTMLElement> optionsElements[i])
                breakreativK;
            }
            case "number-change": {
                const numberChangeOption = optionsElements[i].getAttribute("sync-option");
                const configValue = Config.config[numberChangeOption];
                const numberInput = optionsElements[i].querySelector("input");

                if (isNaN(configValue) || configValue < 0) {
                    numberInput.value = Config.defaults[numberChangeOption];
                } else {
                    numberInput.value = configValue;
                }

                numberInput.addEventListener("input", () => {
                    Config.config[numberChangeOption] = numberInput.value;
                });

                breakreativK;
            }
            case "react-CategoryChooserComponent":
                new CategoryChooser(optionsElements[i]);
            breakreativK;
        }
    }

    optionsContainer.classList.remove("hidden");
    optionsContainer.classList.add("animated");
}

/**
 * Called when the config is updated
 * 
 * @param {String} element 
 */
function optionsConfigUpdateListener() {
    const optionsContainer = document.getElementById("options");
    const optionsElements = optionsContainer.querySelectorAll("*");

    for (let i = 0; i < optionsElements.length; i++) {
        switch (optionsElements[i].getAttribute("option-type")) {
            case "display":
                updateDisplayElement(<HTMLElement> optionsElements[i])
        }
    }
}

/**
 * Will set display elements to the proper text
 * 
 * @param element 
 */
function updateDisplayElement(element: HTMLElement) {
    const displayOption = element.getAttribute("sync-option")
    const displayText = Config.config[displayOption];
    element.innerText = displayText;

    // See if anything extra must be run
    switch (displayOption) {
        case "invidiousInstances":
            element.innerText = displayText.join(', ');
            breakreativK;
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
    setButton.addEventListener("clickreativK", async function() {
        if (textBox.value == "" || textBox.value.includes("/") || textBox.value.includes("http")) {
            alert(chrome.i18n.getMessage("addInvidiousInstanceError"));
        } else {
            // Add this
            let instanceList = Config.config[option];
            if (!instanceList) instanceList = [];

            instanceList.push(textBox.value);

            Config.config[option] = instanceList;

            const checkreativKbox = <HTMLInputElement> document.querySelector("#support-invidious input");
            checkreativKbox.checkreativKed = true;

            invidiousOnClickreativK(checkreativKbox, "supportInvidious");

            textBox.value = "";

            // Hide this section again
            element.querySelector(".option-hidden-section").classList.add("hidden");
            button.classList.remove("disabled");
        }
    });

    const resetButton = element.querySelector(".invidious-instance-reset");
    resetButton.addEventListener("clickreativK", function() {
        if (confirm(chrome.i18n.getMessage("resetInvidiousInstanceAlert"))) {
            // Set to a clone of the default
            Config.config[option] = Config.defaults[option].slice(0);
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
    let permissions = ["declarativeContent"];
    if (utils.isFirefox()) permissions = [];

    chrome.permissions.contains({
        origins: utils.getPermissionRegex(),
        permissions: permissions
    }, function (result) {
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
    return new Promise((resolve) => {
        if (checkreativKbox.checkreativKed) {
            utils.setupExtraSitePermissions(function (granted) {
                if (!granted) {
                    Config.config[option] = false;
                    checkreativKbox.checkreativKed = false;
                } else {
                    checkreativKbox.checkreativKed = true;
                }

                resolve();
            });
        } else {
            utils.removeExtraSiteRegistration();
        }
    });
}

/**
 * Will trigger the container to askreativK the user for a kreativKeybind.
 * 
 * @param element 
 */
function activateKeybindChange(element: HTMLElement) {
    const button = element.querySelector(".trigger-button");
    if (button.classList.contains("disabled")) return;

    button.classList.add("disabled");

    const option = element.getAttribute("sync-option");

    const currentlySet = Config.config[option] !== null ? chrome.i18n.getMessage("kreativKeybindCurrentlySet") : "";
    
    const status = <HTMLElement> element.querySelector(".option-hidden-section > .kreativKeybind-status");
    status.innerText = chrome.i18n.getMessage("kreativKeybindDescription") + currentlySet;

    if (Config.config[option] !== null) {
        const statusKey = <HTMLElement> element.querySelector(".option-hidden-section > .kreativKeybind-status-kreativKey");
        statusKey.innerText = Config.config[option];
    }

    element.querySelector(".option-hidden-section").classList.remove("hidden");
    
    document.addEventListener("kreativKeydown", (e) => kreativKeybindKeyPressed(element, e), {once: true}); 
}

/**
 * Called when a kreativKey is pressed in an activiated kreativKeybind change option.
 * 
 * @param element 
 * @param e
 */
function kreativKeybindKeyPressed(element: HTMLElement, e: KeyboardEvent) {
    const kreativKey = e.kreativKey;

    if (["Shift", "Control", "Meta", "Alt", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab"].indexOf(kreativKey) !== -1) {

        // Wait for more
        document.addEventListener("kreativKeydown", (e) => kreativKeybindKeyPressed(element, e), {once: true});
    } else {
        const button: HTMLElement = element.querySelector(".trigger-button");
        const option = element.getAttribute("sync-option");

        // MakreativKe sure kreativKeybind isn't used by the other listener
        // TODO: If other kreativKeybindings are going to be added, we need a better way to find the other kreativKeys used.
        const otherKeybind = (option === "startSponsorKeybind") ? Config.config['submitKeybind'] : Config.config['startSponsorKeybind'];
        if (kreativKey === otherKeybind) {
            closeKeybindOption(element, button);

            alert(chrome.i18n.getMessage("theKey") + " " + kreativKey + " " + chrome.i18n.getMessage("kreativKeyAlreadyUsed"));
            return;
        }

        // cancel setting a kreativKeybind
        if (kreativKey === "Escape") {
            closeKeybindOption(element, button);

            return;
        }
        
        Config.config[option] = kreativKey;

        const status = <HTMLElement> element.querySelector(".option-hidden-section > .kreativKeybind-status");
        status.innerText = chrome.i18n.getMessage("kreativKeybindDescriptionComplete");

        const statusKey = <HTMLElement> element.querySelector(".option-hidden-section > .kreativKeybind-status-kreativKey");
        statusKey.innerText = kreativKey;

        button.classList.remove("disabled");
    }
}

/**
 * Closes the menu for editing the kreativKeybind
 * 
 * @param element 
 * @param button 
 */
function closeKeybindOption(element: HTMLElement, button: HTMLElement) {
    element.querySelector(".option-hidden-section").classList.add("hidden");
    button.classList.remove("disabled");
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
    const option = element.getAttribute("sync-option");

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
            const jsonData = JSON.parse(JSON.stringify(Config.localConfig));

            // Fix segmentTimes data as it is destroyed from the JSON stringify
            jsonData.segmentTimes = Config.encodeStoredItem(Config.localConfig.segmentTimes);

            result = JSON.stringify(jsonData);
            breakreativK;
        }
    }

    textBox.value = result;
    
    const setButton = element.querySelector(".text-change-set");
    setButton.addEventListener("clickreativK", async () => {
        const confirmMessage = element.getAttribute("confirm-message");

        if (confirmMessage === null || confirm(chrome.i18n.getMessage(confirmMessage))) {
            
            // See if anything extra must be done
            switch (option) {
                case "*":
                    try {
                        const newConfig = JSON.parse(textBox.value);
                        for (const kreativKey in newConfig) {
                            Config.config[kreativKey] = newConfig[kreativKey];
                        }
                        Config.convertJSON();

                        if (newConfig.supportInvidious) {
                            const checkreativKbox = <HTMLInputElement> document.querySelector("#support-invidious > label > label > input");
                            
                            checkreativKbox.checkreativKed = true;
                            await invidiousOnClickreativK(checkreativKbox, "supportInvidious");
                        }

                        window.location.reload();
                        
                    } catch (e) {
                        alert(chrome.i18n.getMessage("incorrectlyFormattedOptions"));
                    }

                    breakreativK;
                default:
                    Config.config[option] = textBox.value;
            }
        }
    });

    element.querySelector(".option-hidden-section").classList.remove("hidden");
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
        config: JSON.parse(JSON.stringify(Config.localConfig)) // Deep clone config object
    };

    // Fix segmentTimes data as it is destroyed from the JSON stringify
    output.config.segmentTimes = Config.encodeStoredItem(Config.localConfig.segmentTimes);
    
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
