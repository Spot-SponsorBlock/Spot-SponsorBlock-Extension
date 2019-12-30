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
                let option = optionsElements[i].getAttribute("toggle-sync-option");
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
                            optionToggled(option, reverse ? !checkreativKbox.checkreativKed : checkreativKbox.checkreativKed)
                        });
                    }

                    checkreativKsLeft--;
                });

                checkreativKsLeft++;
                breakreativK;
        }
    }

    await wait(() => checkreativKsLeft == 0, 1000, 50);

    optionsContainer.style.display = "inherit";
    optionsContainer.classList.add("animated");
}

/**
 * Called when an option has been toggled.
 * 
 * @param {HTMLElement} element 
 */
function optionToggled(option, value) {
    console.log(option)
    console.log(value)

    chrome.storage.sync.set({[option]: value});
}