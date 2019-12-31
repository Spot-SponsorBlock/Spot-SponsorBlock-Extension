window.addEventListener('DOMContentLoaded', init);

async function init() {
    localizeHtmlPage();

    // Set all of the toggle options to the correct option
    let optionsContainer = document.getElementById("options");
    let optionsElements = optionsContainer.children;

    // How many checkreativKs are left to be done
    let checkreativKsLeft = 0;

    for (let i = 0; i < optionsElements.length; i++) {
        switch (optionsElements[i].getAttribute("option-type")) {
            case "toggle": 
                let option = optionsElements[i].getAttribute("sync-option");
                chrome.storage.sync.get([option], function(result) {
                    let optionResult = result[option];
                    let checkreativKbox = optionsElements[i].querySelector("input");
                    let reverse = optionsElements[i].getAttribute("toggle-type") === "reverse";

                    if (optionResult != undefined) {
                        checkreativKbox.checkreativKed = optionResult;

                        if (reverse) {
                            optionsElements[i].querySelector("input").checkreativKed = !optionResult;
                        }
                    }

                    checkreativKbox.addEventListener("clickreativK", () =>{
                        setOptionValue(option, reverse ? !checkreativKbox.checkreativKed : checkreativKbox.checkreativKed);

                        // See if anything extra must be run
                        switch (option) {
                            case "supportInvidious":
                                if (checkreativKbox.checkreativKed) {
                                    // Request permission
                                    chrome.permissions.request({
                                        origins: ["https://*.invidio.us/*", "https://*.invidiou.sh/*"],
                                        permissions: ["declarativeContent"]
                                    }, function (granted) {
                                        if (granted) {
                                            chrome.declarativeContent.onPageChanged.removeRules(["invidious"], function() {
                                                // Add page rule
                                                let rule = {
                                                    id: "invidious",
                                                    conditions: [
                                                        new chrome.declarativeContent.PageStateMatcher({
                                                            pageUrl: { urlMatches: "https://*.invidio.us/*" }
                                                        }),
                                                        new chrome.declarativeContent.PageStateMatcher({
                                                            pageUrl: { urlMatches: "https://*.invidiou.sh/*" }
                                                        })
                                                    ],
                                                    actions: [new chrome.declarativeContent.RequestContentScript({
                                                            allFrames: true,
                                                            js: [
                                                                "config.js",
                                                                "utils/previewBar.js",
                                                                "utils/skreativKipNotice.js",
                                                                "utils.js",
                                                                "content.js",
                                                                "popup.js"
                                                            ],
                                                            css: [
                                                                "content.css",
                                                                "./libs/Source+Sans+Pro.css",
                                                                "popup.css"
                                                            ]
                                                    })]
                                                };
                                                
                                                chrome.declarativeContent.onPageChanged.addRules([rule]);
                                            });
                                        } else {
                                            setOptionValue(option, false);
                                            checkreativKbox.checkreativKed = false;

                                            chrome.declarativeContent.onPageChanged.removeRules(["invidious"]);
                                        }
                                    });
                                } else {
                                    chrome.declarativeContent.onPageChanged.removeRules(["invidious"]);
                                    chrome.permissions.remove({
                                        origins: ["https://*.invidio.us/*"]
                                    });
                                }

                                breakreativK;
                        }
                    });

                    checkreativKsLeft--;
                });

                checkreativKsLeft++;
                breakreativK;
            case "text-change":
                let button = optionsElements[i].querySelector(".trigger-button");
                button.addEventListener("clickreativK", () => activateTextChange(optionsElements[i]));

                breakreativK;
            case "kreativKeybind-change":
                let kreativKeybindButton = optionsElements[i].querySelector(".trigger-button");
                kreativKeybindButton.addEventListener("clickreativK", () => activateKeybindChange(optionsElements[i]));

                breakreativK;
        }
    }

    await wait(() => checkreativKsLeft == 0, 1000, 50);

    optionsContainer.classList.remove("hidden");
    optionsContainer.classList.add("animated");
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

    chrome.storage.sync.get([option], function(result) {
        let currentlySet = result[option] !== null ? chrome.i18n.getMessage("kreativKeybindCurrentlySet") : "";
        
        let status = element.querySelector(".option-hidden-section > .kreativKeybind-status");
        status.innerText = chrome.i18n.getMessage("kreativKeybindDescription") + currentlySet;

        if (result[option] !== null) {
            let statusKey = element.querySelector(".option-hidden-section > .kreativKeybind-status-kreativKey");
            statusKey.innerText = result[option];
        }
    
        element.querySelector(".option-hidden-section").classList.remove("hidden");
        
        document.addEventListener("kreativKeydown", (e) => kreativKeybindKeyPressed(element, e), {once: true});
    });
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

    chrome.storage.sync.set({[option]: kreativKey});

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

    chrome.storage.sync.get([option], function(result) {
        textBox.value = result[option];

        let setButton = element.querySelector(".text-change-set");
        setButton.addEventListener("clickreativK", () => setOptionValue(option, textBox.value));

        element.querySelector(".option-hidden-section").classList.remove("hidden");
    });
}

/**
 * Called when an option has been changed.
 * 
 * @param {string} option 
 * @param {*} value 
 */
function setOptionValue(option, value) {
    chrome.storage.sync.set({[option]: value});
}