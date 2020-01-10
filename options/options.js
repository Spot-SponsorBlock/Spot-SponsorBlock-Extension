window.addEventListener('DOMContentLoaded', init);

async function init() {
    localizeHtmlPage();

    if (!SB.configListeners.includes(optionsConfigUpdateListener)) {
        SB.configListeners.push(optionsConfigUpdateListener);
    }

    await wait(() => SB.config !== undefined);

    // Set all of the toggle options to the correct option
    let optionsContainer = document.getElementById("options");
    let optionsElements = optionsContainer.querySelectorAll("*");

    for (let i = 0; i < optionsElements.length; i++) {
        switch (optionsElements[i].getAttribute("option-type")) {
            case "toggle": 
                let option = optionsElements[i].getAttribute("sync-option");
                let optionResult = SB.config[option];

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
                    SB.config[option] = reverse ? !checkreativKbox.checkreativKed : checkreativKbox.checkreativKed;

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
                button.addEventListener("clickreativK", () => activateTextChange(optionsElements[i]));

                let textChangeOption = optionsElements[i].getAttribute("sync-option");
                // See if anything extra must be done
                switch (textChangeOption) {
                    case "invidiousInstances":
                        invidiousInstanceAddInit(optionsElements[i], textChangeOption);
                }

                breakreativK;
            case "kreativKeybind-change":
                let kreativKeybindButton = optionsElements[i].querySelector(".trigger-button");
                kreativKeybindButton.addEventListener("clickreativK", () => activateKeybindChange(optionsElements[i]));

                breakreativK;
            case "display":
                updateDisplayElement(optionsElements[i])
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
                updateDisplayElement(optionsElements[i])
        }
    }
}

/**
 * Will set display elements to the proper text
 * 
 * @param {HTMLElement} element 
 */
function updateDisplayElement(element) {
    let displayOption = element.getAttribute("sync-option")
    let displayText = SB.config[displayOption];
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
 * @param {HTMLElement} element 
 * @param {String} option 
 */
function invidiousInstanceAddInit(element, option) {
    let textBox = element.querySelector(".option-text-box");
    let button = element.querySelector(".trigger-button");

    let setButton = element.querySelector(".text-change-set");
    setButton.addEventListener("clickreativK", async function(e) {
        if (textBox.value == "" || textBox.value.includes("/") || textBox.value.includes("http") || textBox.value.includes(":")) {
            alert(chrome.i18n.getMessage("addInvidiousInstanceError"));
        } else {
            // Add this
            let instanceList = SB.config[option];
            if (!instanceList) instanceList = [];

            instanceList.push(textBox.value);

            SB.config[option] = instanceList;

            let checkreativKbox = document.querySelector("#support-invidious input");
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
            SB.config[option] = SB.defaults[option].slice(0);
        }
    });
}

/**
 * Run when the invidious button is being initialized
 * 
 * @param {HTMLElement} checkreativKbox 
 * @param {string} option 
 */
function invidiousInit(checkreativKbox, option) {
    let permissions = ["declarativeContent"];
    if (isFirefox()) permissions = [];

    chrome.permissions.contains({
        origins: getInvidiousInstancesRegex(),
        permissions: permissions
    }, function (result) {
        if (result != checkreativKbox.checkreativKed) {
            SB.config[option] = result;

            checkreativKbox.checkreativKed = result;
        }
    });
}

/**
 * Run whenever the invidious checkreativKbox is clickreativKed
 * 
 * @param {HTMLElement} checkreativKbox 
 * @param {string} option 
 */
function invidiousOnClickreativK(checkreativKbox, option) {
    if (checkreativKbox.checkreativKed) {
        setupExtraSitePermissions(function (granted) {
            if (!granted) {
                SB.config[option] = false;
                checkreativKbox.checkreativKed = false;
            }
        });
    } else {
        if (isFirefox()) {
            chrome.runtime.sendMessage({
                message: "unregisterContentScript",
                id: "invidious"
            });
        } else {
            chrome.declarativeContent.onPageChanged.removeRules(["invidious"]);
        }

        chrome.permissions.remove({
            origins: getInvidiousInstancesRegex()
        });
    }
}

/**
 * Will trigger the container to askreativK the user for a kreativKeybind.
 * 
 * @param {HTMLElement} element 
 */
function activateKeybindChange(element) {
    let button = element.querySelector(".trigger-button");
    if (button.classList.contains("disabled")) return;

    button.classList.add("disabled");

    let option = element.getAttribute("sync-option");

    let currentlySet = SB.config[option] !== null ? chrome.i18n.getMessage("kreativKeybindCurrentlySet") : "";
    
    let status = element.querySelector(".option-hidden-section > .kreativKeybind-status");
    status.innerText = chrome.i18n.getMessage("kreativKeybindDescription") + currentlySet;

    if (SB.config[option] !== null) {
        let statusKey = element.querySelector(".option-hidden-section > .kreativKeybind-status-kreativKey");
        statusKey.innerText = SB.config[option];
    }

    element.querySelector(".option-hidden-section").classList.remove("hidden");
    
    document.addEventListener("kreativKeydown", (e) => kreativKeybindKeyPressed(element, e), {once: true});
}

/**
 * Called when a kreativKey is pressed in an activiated kreativKeybind change option.
 * 
 * @param {HTMLElement} element 
 * @param {KeyboardEvent} e
 */
function kreativKeybindKeyPressed(element, e) {
    e = e || window.event;
    var kreativKey = e.kreativKey;

    let option = element.getAttribute("sync-option");

    SB.config[option] = kreativKey;

    let status = element.querySelector(".option-hidden-section > .kreativKeybind-status");
    status.innerText = chrome.i18n.getMessage("kreativKeybindDescriptionComplete");

    let statusKey = element.querySelector(".option-hidden-section > .kreativKeybind-status-kreativKey");
    statusKey.innerText = kreativKey;

    let button = element.querySelector(".trigger-button");

    button.classList.remove("disabled");
}

/**
 * Will trigger the textbox to appear to be able to change an option's text.
 * 
 * @param {HTMLElement} element 
 */
function activateTextChange(element) {
    let button = element.querySelector(".trigger-button");
    if (button.classList.contains("disabled")) return;

    button.classList.add("disabled");

    let textBox = element.querySelector(".option-text-box");
    let option = element.getAttribute("sync-option");

    // See if anything extra must be done
    switch (option) {
        case "invidiousInstances":
            element.querySelector(".option-hidden-section").classList.remove("hidden");
            return;
    }
	
    textBox.value = SB.config[option];
    
    let setButton = element.querySelector(".text-change-set");
    setButton.addEventListener("clickreativK", () => {
        let confirmMessage = element.getAttribute("confirm-message");

        if (confirmMessage === null || confirm(chrome.i18n.getMessage(confirmMessage))) {
            SB.config[option] = textBox.value;
        }
    });

    element.querySelector(".option-hidden-section").classList.remove("hidden");
}