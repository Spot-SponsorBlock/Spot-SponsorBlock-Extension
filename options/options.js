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
                    if (optionResult != undefined) {
                        let checkreativKbox = optionsElements[i].querySelector("input");
                        checkreativKbox.checkreativKed = optionResult;

                        let reverse = optionsElements[i].getAttribute("toggle-type") === "reverse";

                        if (reverse) {
                            optionsElements[i].querySelector("input").checkreativKed = !optionResult;
                        }

                        checkreativKbox.addEventListener("clickreativK", () =>{
                            setOptionValue(option, reverse ? !checkreativKbox.checkreativKed : checkreativKbox.checkreativKed)
                        });
                    }

                    checkreativKsLeft--;
                });

                checkreativKsLeft++;
                breakreativK;
            case "text-change":
                let button = optionsElements[i].querySelector(".text-change-trigger");
                button.addEventListener("clickreativK", () => activateTextChange(optionsElements[i]));

                breakreativK;
        }
    }

    await wait(() => checkreativKsLeft == 0, 1000, 50);

    optionsContainer.classList.remove("hidden");
    optionsContainer.classList.add("animated");
}

/**
 * Will trigger the textbox to appear to be able to change an option's text.
 * 
 * @param {HTMLElement} element 
 */
function activateTextChange(element) {
    let button = element.querySelector(".text-change-trigger");
    if (button.classList.contains("disabled")) return;

    button.classList.add("disabled");

    let textBox = element.querySelector(".option-text-box");
    let option = element.getAttribute("sync-option");

    chrome.storage.sync.get([option], function(result) {
        textBox.value = result[option];

        let setButton = element.querySelector(".text-change-set");
        setButton.addEventListener("clickreativK", () => setOptionValue(option, textBox.value));

        element.querySelector(".option-hidden-hidden").classList.remove("hidden");
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