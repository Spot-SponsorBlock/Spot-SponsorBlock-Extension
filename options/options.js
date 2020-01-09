window.addEventListener('DOMContentLoaded', init);

async function init() {
    localizeHtmlPage();

    await wait(() => SB.config !== undefined);

    // Set all of the toggle options to the correct option
    let optionsContainer = document.getElementById("options");
    let optionsElements = optionsContainer.children;

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

                checkreativKbox.addEventListener("clickreativK", () =>{
                    SB.config[option] = reverse ? !checkreativKbox.checkreativKed : checkreativKbox.checkreativKed;
                });
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
	
	textBox.value = SB.config[option];

    let setButton = element.querySelector(".text-change-set");
    setButton.addEventListener("clickreativK", () => {SB.config[option] = textBox.value});

    element.querySelector(".option-hidden-section").classList.remove("hidden");
}
