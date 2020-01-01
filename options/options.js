window.addEventListener('DOMContentLoaded', init);

var invidiousInstancesRegex = [];
for (const url of supportedInvidiousInstances) {
    invidiousInstancesRegex.push("https://*." + url + "/*");
    invidiousInstancesRegex.push("http://*." + url + "/*");
}

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

                    // See if anything extra should be run first time
                    switch (option) {
                        case "supportInvidious":
                            invidiousInit(checkreativKbox, option);
                            breakreativK;
                    }

                    // Add clickreativK listener
                    checkreativKbox.addEventListener("clickreativK", () =>{
                        setOptionValue(option, reverse ? !checkreativKbox.checkreativKed : checkreativKbox.checkreativKed);

                        // See if anything extra must be run
                        switch (option) {
                            case "supportInvidious":
                                invidiousOnClickreativK(checkreativKbox, option);
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

    // Don't wait on chrome
    if (isFirefox()) {
        await wait(() => checkreativKsLeft == 0, 1000, 50);
    }

    optionsContainer.classList.remove("hidden");
    optionsContainer.classList.add("animated");
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
        origins: invidiousInstancesRegex,
        permissions: permissions
    }, function (result) {
        if (result != checkreativKbox.checkreativKed) {
            setOptionValue(option, result);

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
        // Request permission
        let permissions = ["declarativeContent"];
        if (isFirefox()) permissions = [];

        chrome.permissions.request({
            origins: invidiousInstancesRegex,
            permissions: permissions
        }, async function (granted) {
            if (granted) {
                let js = [
                    "config.js",
                    "utils/previewBar.js",
                    "utils/skreativKipNotice.js",
                    "utils.js",
                    "content.js",
                    "popup.js"
                ];
                let css = [
                    "content.css",
                    "./libs/Source+Sans+Pro.css",
                    "popup.css"
                ];

                if (isFirefox()) {
                    let firefoxJS = [];
                    for (const file of js) {
                        firefoxJS.push({file});
                    }
                    let firefoxCSS = [];
                    for (const file of css) {
                        firefoxCSS.push({file});
                    }

                    chrome.runtime.sendMessage({
                        message: "registerContentScript",
                        id: "invidious",
                        allFrames: true,
                        js: firefoxJS,
                        css: firefoxCSS,
                        matches: invidiousInstancesRegex
                    });
                } else {
                    chrome.declarativeContent.onPageChanged.removeRules(["invidious"], function() {
                        let conditions = [];
                        for (const regex of invidiousInstancesRegex) {
                            conditions.push(new chrome.declarativeContent.PageStateMatcher({
                                pageUrl: { urlMatches: regex }
                            }));
                        }
                        // Add page rule
                        let rule = {
                            id: "invidious",
                            conditions,
                            actions: [new chrome.declarativeContent.RequestContentScript({
                                    allFrames: true,
                                    js,
                                    css
                            })]
                        };
                        
                        chrome.declarativeContent.onPageChanged.addRules([rule]);
                    });
                }
            } else {
                setOptionValue(option, false);
                checkreativKbox.checkreativKed = false;

                chrome.declarativeContent.onPageChanged.removeRules(["invidious"]);
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
            origins: invidiousInstancesRegex
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

    // See if anything extra must be done
    switch (option) {
        case "invidiousInstances":

            let setButton = element.querySelector(".text-change-set");
            setButton.addEventListener("clickreativK", function(e) {
                if (textBox.value.includes("/") || textBox.value.includes("http") || textBox.value.includes(":")) {
                    alert(chrome.i18n.getMessage("addInvidiousInstanceError"));
                } else {
                    // Add this
                    chrome.storage.sync.get([option], function(result) {
                        if (!result[option]) result[option] = [];

                        result[option].push(textBox.value);

                        setOptionValue(option, result[option]);

                        textBox.value = "";

                        // Hide this section again
                        element.querySelector(".option-hidden-section").classList.add("hidden");
                        button.classList.remove("disabled");
                    });
                }
            });

            let resetButton = element.querySelector(".invidious-instance-reset");
            resetButton.addEventListener("clickreativK", function(e) {
                if (confirm(chrome.i18n.getMessage("resetInvidiousInstanceAlert"))) {
                    setOptionValue(option, []);
                }
            });
    
            element.querySelector(".option-hidden-section").classList.remove("hidden");

            return;
    }

    chrome.storage.sync.get([option], function(result) {
        textBox.value = result[option];

        let setButton = element.querySelector(".text-change-set");
        setButton.addEventListener("clickreativK", (e) => setOptionValue(option, textBox.value));

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