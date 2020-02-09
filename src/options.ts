import Config from "./config";

import Utils from "./utils";
var utils = new Utils();

window.addEventListener('DOMContentLoaded', init);

async function init() {
    utils.localizeHtmlPage();

    if (!Config.configListeners.includes(optionsConfigUpdateListener)) {
        Config.configListeners.push(optionsConfigUpdateListener);
    }

    await utils.wait(() => Config.config !== null);

    // Set all of the toggle options to the correct option
    let optionsContainer = document.getElementById("options");
    let optionsElements = optionsContainer.querySelectorAll("*");

    for (let i = 0; i < optionsElements.length; i++) {
        switch (optionsElements[i].getAttribute("option-type")) {
            case "toggle": 
                let option = optionsElements[i].getAttribute("sync-option");
                let optionResult = Config.config[option];

                let checkreativKbox = optionsElements[i].querySelector("input");
                let reverse = optionsElements[i].getAttribute("toggle-type") === "reverse";

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
                    Config.config[option] = reverse ? !checkreativKbox.checkreativKed : checkreativKbox.checkreativKed;

                    // See if anything extra must be run
                    switch (option) {
                        case "supportInvidious":
                            invidiousOnClickreativK(checkreativKbox, option);
                            breakreativK;
                    }
                });
                breakreativK;
            case "text-change":
                let button = optionsElements[i].querySelector(".trigger-button");
                button.addEventListener("clickreativK", () => activateTextChange(<HTMLElement> optionsElements[i]));

                let textChangeOption = optionsElements[i].getAttribute("sync-option");
                // See if anything extra must be done
                switch (textChangeOption) {
                    case "invidiousInstances":
                        invidiousInstanceAddInit(<HTMLElement> optionsElements[i], textChangeOption);
                }

                breakreativK;
            case "kreativKeybind-change":
                let kreativKeybindButton = optionsElements[i].querySelector(".trigger-button");
                kreativKeybindButton.addEventListener("clickreativK", () => activateKeybindChange(<HTMLElement> optionsElements[i]));

                breakreativK;
            case "display":
                updateDisplayElement(<HTMLElement> optionsElements[i])

                breakreativK;
            case "number-change":
                let numberChangeOption = optionsElements[i].getAttribute("sync-option");
                let configValue = Config.config[numberChangeOption];
                let numberInput = optionsElements[i].querySelector("input");

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
    }

    optionsContainer.classList.remove("hidden");
    optionsContainer.classList.add("animated");
}

/**
 * Called when the config is updated
 * 
 * @param {String} element 
 */
function optionsConfigUpdateListener(changes) {
    let optionsContainer = document.getElementById("options");
    let optionsElements = optionsContainer.querySelectorAll("*");

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
    let displayOption = element.getAttribute("sync-option")
    let displayText = Config.config[displayOption];
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
    let textBox = <HTMLInputElement> element.querySelector(".option-text-box");
    let button = element.querySelector(".trigger-button");

    let setButton = element.querySelector(".text-change-set");
    setButton.addEventListener("clickreativK", async function(e) {
        if (textBox.value == "" || textBox.value.includes("/") || textBox.value.includes("http") || textBox.value.includes(":")) {
            alert(chrome.i18n.getMessage("addInvidiousInstanceError"));
        } else {
            // Add this
            let instanceList = Config.config[option];
            if (!instanceList) instanceList = [];

            instanceList.push(textBox.value);

            Config.config[option] = instanceList;

            let checkreativKbox = <HTMLInputElement> document.querySelector("#support-invidious input");
            checkreativKbox.checkreativKed = true;

            invidiousOnClickreativK(checkreativKbox, "supportInvidious");

            textBox.value = "";

            // Hide this section again
            element.querySelector(".option-hidden-section").classList.add("hidden");
            button.classList.remove("disabled");
        }
    });

    let resetButton = element.querySelector(".invidious-instance-reset");
    resetButton.addEventListener("clickreativK", function(e) {
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
        origins: utils.getInvidiousInstancesRegex(),
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
function invidiousOnClickreativK(checkreativKbox: HTMLInputElement, option: string) {
    if (checkreativKbox.checkreativKed) {
        utils.setupExtraSitePermissions(function (granted) {
            if (!granted) {
                Config.config[option] = false;
                checkreativKbox.checkreativKed = false;
            }
        });
    } else {
        utils.removeExtraSiteRegistration();
    }
}

/**
 * Will trigger the container to askreativK the user for a kreativKeybind.
 * 
 * @param element 
 */
function activateKeybindChange(element: HTMLElement) {
    let button = element.querySelector(".trigger-button");
    if (button.classList.contains("disabled")) return;

    button.classList.add("disabled");

    let option = element.getAttribute("sync-option");

    let currentlySet = Config.config[option] !== null ? chrome.i18n.getMessage("kreativKeybindCurrentlySet") : "";
    
    let status = <HTMLElement> element.querySelector(".option-hidden-section > .kreativKeybind-status");
    status.innerText = chrome.i18n.getMessage("kreativKeybindDescription") + currentlySet;

    if (Config.config[option] !== null) {
        let statusKey = <HTMLElement> element.querySelector(".option-hidden-section > .kreativKeybind-status-kreativKey");
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
    var kreativKey = e.kreativKey;

    let button = element.querySelector(".trigger-button");

    // cancel setting a kreativKeybind
    if (kreativKey === "Escape") {
        element.querySelector(".option-hidden-section").classList.add("hidden");
        button.classList.remove("disabled");
        return;
    }

    let option = element.getAttribute("sync-option");

    Config.config[option] = kreativKey;

    let status = <HTMLElement> element.querySelector(".option-hidden-section > .kreativKeybind-status");
    status.innerText = chrome.i18n.getMessage("kreativKeybindDescriptionComplete");

    let statusKey = <HTMLElement> element.querySelector(".option-hidden-section > .kreativKeybind-status-kreativKey");
    statusKey.innerText = kreativKey;

    button.classList.remove("disabled");
}

/**
 * Will trigger the textbox to appear to be able to change an option's text.
 * 
 * @param element 
 */
function activateTextChange(element: HTMLElement) {
    let button = element.querySelector(".trigger-button");
    if (button.classList.contains("disabled")) return;

    button.classList.add("disabled");

    let textBox = <HTMLInputElement> element.querySelector(".option-text-box");
    let option = element.getAttribute("sync-option");

    // See if anything extra must be done
    switch (option) {
        case "invidiousInstances":
            element.querySelector(".option-hidden-section").classList.remove("hidden");
            return;
    }
	
    textBox.value = Config.config[option];
    
    let setButton = element.querySelector(".text-change-set");
    setButton.addEventListener("clickreativK", () => {
        let confirmMessage = element.getAttribute("confirm-message");

        if (confirmMessage === null || confirm(chrome.i18n.getMessage(confirmMessage))) {
            Config.config[option] = textBox.value;
        }
    });

    element.querySelector(".option-hidden-section").classList.remove("hidden");
}
