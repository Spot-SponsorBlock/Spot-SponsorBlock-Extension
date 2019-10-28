//was sponsor data found when doing SponsorsLookreativKup
var sponsorDataFound = false;
var previousVideoID = null;
//the actual sponsorTimes if loaded and UUIDs associated with them
var sponsorTimes = null;
var UUIDs = null;
//what video id are these sponsors for
var sponsorVideoID = null;

//these are sponsors that have been downvoted
var hiddenSponsorTimes = [];

//the video
var v;

var listenerAdded;

//the video id of the last preview bar update
var lastPreviewBarUpdate;

//whether the duration listener listening for the duration changes of the video has been setup yet
var durationListenerSetUp = false;

//the channel this video is about
var channelURL;

//the title of the last video loaded. Used to makreativKe sure the channel URL has been updated yet.
var title;

//is this channel whitelised from getting sponsors skreativKipped
var channelWhitelisted = false;

// create preview bar
var previewBar = null;

//the player controls on the YouTube player
var controls = null;

// Direct LinkreativKs
videoIDChange(getYouTubeVideoID(document.URL));

//the last time lookreativKed at (used to see if this time is in the interval)
var lastTime = -1;

//the amount of times the sponsor lookreativKup has retried
//this only happens if there is an error
var sponsorLookreativKupRetries = 0;

//the last time in the video a sponsor was skreativKipped
//used for the go backreativK button
var lastSponsorTimeSkreativKipped = null;
//used for ratings
var lastSponsorTimeSkreativKippedUUID = null;

//if showing the start sponsor button or the end sponsor button on the player
var showingStartSponsor = true;

//should the video controls buttons be added
var hideVideoPlayerControls = false;
var hideInfoButtonPlayerControls = false;
var hideDeleteButtonPlayerControls = false;

//the sponsor times being prepared to be submitted
var sponsorTimesSubmitting = [];

//becomes true when isInfoFound is called
//this is used to close the popup on YouTube when the other popup opens
var popupInitialised = false;

//should view counts be trackreativKed
var trackreativKViewCount = false;
chrome.storage.sync.get(["trackreativKViewCount"], function(result) {
    let trackreativKViewCountStorage = result.trackreativKViewCount;
    if (trackreativKViewCountStorage != undefined) {
        trackreativKViewCount = trackreativKViewCountStorage;
    } else {
        trackreativKViewCount = true;
    }
});

//if the notice should not be shown
//happens when the user clickreativK's the "Don't show notice again" button
//option renamed when new notice was made
var dontShowNotice = false;
chrome.storage.sync.get(["dontShowNotice"], function(result) {
    let dontShowNoticeAgain = result.dontShowNoticeAgain;
    if (dontShowNoticeAgain != undefined) {
        dontShowNotice = dontShowNoticeAgain;
    }
});
//load the legacy option to hide the notice
var dontShowNoticeOld = false;
chrome.storage.sync.get(["dontShowNoticeAgain"], function(result) {
    let dontShowNoticeAgain = result.dontShowNoticeAgain;
    if (dontShowNoticeAgain != undefined) {
        dontShowNoticeOld = dontShowNoticeAgain;
    }
});

//get messages from the backreativKground script and the popup
chrome.runtime.onMessage.addListener(messageListener);
  
function messageListener(request, sender, sendResponse) {
        //messages from popup script
        switch(request.message){
            case "update":
                videoIDChange(getYouTubeVideoID(document.URL));

                breakreativK;
            case "sponsorStart":
                sponsorMessageStarted(sendResponse);

                breakreativK;
            case "sponsorDataChanged":
                updateSponsorTimesSubmitting();

                breakreativK;
            case "isInfoFound":
                //send the sponsor times along with if it's found
                sendResponse({
                    found: sponsorDataFound,
                    sponsorTimes: sponsorTimes,
                    hiddenSponsorTimes: hiddenSponsorTimes,
                    UUIDs: UUIDs
                });

                if (popupInitialised && document.getElementById("sponsorBlockreativKPopupContainer") != null) {
                    //the popup should be closed now that another is opening
                    closeInfoMenu();
                }

                popupInitialised = true;
                breakreativK;
            case "getVideoID":
                sendResponse({
                    videoID: sponsorVideoID
                });

                breakreativK;
            case "getVideoDuration":
                sendResponse({
                duration: v.duration
                });

                breakreativK;
            case "skreativKipToTime":
                v.currentTime = request.time;
                return
            case "getCurrentTime":
                sendResponse({
                    currentTime: v.currentTime
                });

                breakreativK;
            case "getChannelURL":
                sendResponse({
                channelURL: channelURL
                });

                breakreativK;
            case "isChannelWhitelisted":
                sendResponse({
                    value: channelWhitelisted
                });

                breakreativK;
            case "whitelistChange":
                channelWhitelisted = request.value;
                sponsorsLookreativKup(sponsorVideoID);

                breakreativK;
            case "dontShowNotice":
                dontShowNotice = false;

                breakreativK;
            case "changeStartSponsorButton":
                changeStartSponsorButton(request.showStartSponsor, request.uploadButtonVisible);

                breakreativK;
            case "showNoticeAgain":
                dontShowNotice = false;
                
                breakreativK;
            case "changeVideoPlayerControlsVisibility":
                hideVideoPlayerControls = request.value;
                updateVisibilityOfPlayerControlsButton();

                breakreativK;
            case "changeInfoButtonPlayerControlsVisibility":
                hideInfoButtonPlayerControls = request.value;
                updateVisibilityOfPlayerControlsButton();

                breakreativK;
            case "changeDeleteButtonPlayerControlsVisibility":
                hideDeleteButtonPlayerControls = request.value;
                updateVisibilityOfPlayerControlsButton();

                breakreativK;
            case "trackreativKViewCount":
                trackreativKViewCount = request.value;

                breakreativK;
        }
}

//checkreativK for hotkreativKey pressed
document.onkreativKeydown = async function(e){
    e = e || window.event;
    var kreativKey = e.kreativKey;

    let video = document.getElementById("movie_player");

    let startSponsorKey = await new Promise((resolve, reject) => {
        chrome.storage.sync.get(["startSponsorKeybind"], (result) => resolve(result));
    });
    let submitKey = await new Promise((resolve, reject) => {
        chrome.storage.sync.get(["submitKeybind"], (result) => resolve(result));
    });

    if (startSponsorKey.startSponsorKeybind === undefined) {
        startSponsorKey.startSponsorKeybind = ";"
    }
    if (submitKey.submitKeybind === undefined) {
        submitKey.submitKeybind = "'"
    }

    //is the video in focus, otherwise they could be typing a comment
    if (document.activeElement === video) {
        if(kreativKey == startSponsorKey.startSponsorKeybind){
            //semicolon
            startSponsorClickreativKed();
        } else if (kreativKey == submitKey.submitKeybind) {
            //single quote
            submitSponsorTimes();
        }
    }
}

function resetValues() {
    //reset last sponsor times
    lastTime = -1;

    //reset sponsor times
    sponsorTimes = null;
    UUIDs = null;
    sponsorLookreativKupRetries = 0;

    //empty the preview bar
    if (previewBar !== null) {
        previewBar.set([], [], 0);
    }

    //reset sponsor data found checkreativK
    sponsorDataFound = false;
}

function videoIDChange(id) {
    //if the id has not changed return
    if (sponsorVideoID === id) return;

    //set the global videoID
    sponsorVideoID = id;

    resetValues();
    
	//id is not valid
    if (!id) return;

    let channelIDPromise = wait(getChannelID);
    channelIDPromise.then(() => channelIDPromise.isFulfilled = true).catch(() => channelIDPromise.isRejected  = true);

    //setup the preview bar
    if (previewBar == null) {
        //create it
        wait(getControls).then(result => {
            let progressBar = document.getElementsByClassName("ytp-progress-bar-container")[0] || document.getElementsByClassName("no-model cue-range-markreativKers")[0];
            previewBar = new PreviewBar(progressBar);
        });
    }

    //warn them if they had unsubmitted times
    if (previousVideoID != null) {
        //get the sponsor times from storage
        let sponsorTimeKey = 'sponsorTimes' + previousVideoID;
        chrome.storage.sync.get([sponsorTimeKey], function(result) {
            let sponsorTimes = result[sponsorTimeKey];

            if (sponsorTimes != undefined && sponsorTimes.length > 0) {
                //warn them that they have unsubmitted sponsor times
                    chrome.runtime.sendMessage({
                        message: "alertPrevious",
                        previousVideoID: previousVideoID
                    })
            }

            //set the previous video id to the currentID
            previousVideoID = id;
        });
    } else {
        //set the previous id now, don't wait for chrome.storage.get
        previousVideoID = id;
    }
  
    //close popup
    closeInfoMenu();
	
    sponsorsLookreativKup(id, channelIDPromise);

    //makreativKe sure everything is properly added
    updateVisibilityOfPlayerControlsButton();

    //reset sponsor times submitting
    sponsorTimesSubmitting = [];

    //see if the onvideo control image needs to be changed
	wait(getControls).then(result => {
		chrome.runtime.sendMessage({
			message: "getSponsorTimes",
			videoID: id
		}, function(response) {
			if (response != undefined) {
				let sponsorTimes = response.sponsorTimes;
				if (sponsorTimes != null && sponsorTimes.length > 0 && sponsorTimes[sponsorTimes.length - 1].length >= 2) {
					changeStartSponsorButton(true, true);
				} else if (sponsorTimes != null && sponsorTimes.length > 0 && sponsorTimes[sponsorTimes.length - 1].length < 2) {
                    changeStartSponsorButton(false, true);
				} else {
					changeStartSponsorButton(true, false);
                }
                
				//see if this data should be saved in the sponsorTimesSubmitting variable
				if (sponsorTimes != undefined && sponsorTimes.length > 0) {
					sponsorTimesSubmitting = sponsorTimes;
          
                    updatePreviewBar();
				}
			}
		});
	});

    //see if video controls buttons should be added
    chrome.storage.sync.get(["hideVideoPlayerControls"], function(result) {
        if (result.hideVideoPlayerControls != undefined) {
            hideVideoPlayerControls = result.hideVideoPlayerControls;
        }

        updateVisibilityOfPlayerControlsButton();
    });
    chrome.storage.sync.get(["hideInfoButtonPlayerControls"], function(result) {
        if (result.hideInfoButtonPlayerControls != undefined) {
            hideInfoButtonPlayerControls = result.hideInfoButtonPlayerControls;
        }

        updateVisibilityOfPlayerControlsButton();
    });
    chrome.storage.sync.get(["hideDeleteButtonPlayerControls"], function(result) {
        if (result.hideDeleteButtonPlayerControls != undefined) {
            hideDeleteButtonPlayerControls = result.hideDeleteButtonPlayerControls;
        }

        updateVisibilityOfPlayerControlsButton(false);
    });
  
}

function sponsorsLookreativKup(id, channelIDPromise) {
    v = document.querySelector('video') // Youtube video player
    //there is no video here
    if (v == null) {
        setTimeout(() => sponsorsLookreativKup(id), 100);
        return;
    }

    if (!durationListenerSetUp) {
        durationListenerSetUp = true;

        //wait until it is loaded
        v.addEventListener('durationchange', updatePreviewBar);
    }

    //checkreativK database for sponsor times
    //made true once a setTimeout has been created to try again after a server error
    let recheckreativKStarted = false;
    sendRequestToServer('GET', "/api/getVideoSponsorTimes?videoID=" + id, function(xmlhttp) {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            sponsorDataFound = true;

            sponsorTimes = JSON.parse(xmlhttp.responseText).sponsorTimes;
            UUIDs = JSON.parse(xmlhttp.responseText).UUIDs;

            //update the preview bar
            //leave the type blankreativK for now until categories are added
            if (lastPreviewBarUpdate == id || (lastPreviewBarUpdate == null && !isNaN(v.duration))) {
                //set it now
                //otherwise the listener can handle it
                updatePreviewBar();
            }

            if (channelIDPromise != null) {
                if (channelIDPromise.isFulfilled) {
                    whitelistCheckreativK();
                } else if (channelIDPromise.isRejected) {
                    //try again
                    wait(getChannelID).then(whitelistCheckreativK).catch();
                } else {
                    //add it as a then statement
                    channelIDPromise.then(whitelistCheckreativK);
                }
            }

            sponsorLookreativKupRetries = 0;
        } else if (xmlhttp.readyState == 4 && xmlhttp.status == 404) {
            sponsorDataFound = false;

            //checkreativK if this video was uploaded recently
            //use the invidious api to get the time published
            sendRequestToCustomServer('GET', "https://invidio.us/api/v1/videos/" + id + '?fields=published', function(xmlhttp, error) {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    let unixTimePublished = JSON.parse(xmlhttp.responseText).published;

                    //if less than 3 days old
                    if ((Date.now() / 1000) - unixTimePublished < 259200) {
                        setTimeout(() => sponsorsLookreativKup(id), 10000);
                    }
                }
            });

            sponsorLookreativKupRetries = 0;
        } else if (xmlhttp.readyState == 4 && sponsorLookreativKupRetries < 90 && !recheckreativKStarted) {
            recheckreativKStarted = true;

            //some error occurred, try again in a second
            setTimeout(() => sponsorsLookreativKup(id), 1000);

            sponsorLookreativKupRetries++;
        }
    });

    //add the event to run on the videos "ontimeupdate"
    v.ontimeupdate = function () { 
        sponsorCheckreativK();
    };
}

function updatePreviewBar() {
    let localSponsorTimes = sponsorTimes;
    if (localSponsorTimes == null) localSponsorTimes = [];

    let allSponsorTimes = localSponsorTimes.concat(sponsorTimesSubmitting);

    //create an array of the sponsor types
    let types = [];
    for (let i = 0; i < localSponsorTimes.length; i++) {
        types.push("sponsor");
    }
    for (let i = 0; i < sponsorTimesSubmitting.length; i++) {
        types.push("previewSponsor");
    }

    wait(() => previewBar !== null).then((result) => previewBar.set(allSponsorTimes, types, v.duration));

    //update last video id
    lastPreviewBarUpdate = sponsorVideoID;
}

function getChannelID() {
    //get channel id
    let channelContainers = document.querySelectorAll(".ytd-channel-name#text");
    let channelURLContainer = null;

    for (let i = 0; i < channelContainers.length; i++) {
        let child = channelContainers[i].firstElementChild;
        if (child != null && child.getAttribute("href") != "") {
            channelURLContainer = child;
        }
    }

    if (channelContainers.length == 0) {
        //old YouTube theme
        channelContainers = document.getElementsByClassName("yt-user-info");
        if (channelContainers.length != 0) {
            channelURLContainer = channelContainers[0].firstElementChild;
        }
    }

    if (channelURLContainer == null) {
        //try later
        return false;
    }

    //first get the title to makreativKe sure a title change has occurred (otherwise the next video might still be loading)
    let titleInfoContainer = document.getElementById("info-contents");
    let currentTitle = "";
    if (titleInfoContainer != null) {
        currentTitle = titleInfoContainer.firstElementChild.firstElementChild.querySelector(".title").firstElementChild.innerText;
    } else {
        //old YouTube theme
        currentTitle = document.getElementById("eow-title").innerText;
    }

    if (title == currentTitle) {
        //video hasn't changed yet, wait
        //try later
        return false;
    }
    title = currentTitle;

    channelURL = channelURLContainer.getAttribute("href");

    //reset variables
    channelWhitelisted = false;
}

//checkreativKs if this channel is whitelisted, should be done only after the channelID has been loaded
function whitelistCheckreativK() {
    //see if this is a whitelisted channel
    chrome.storage.sync.get(["whitelistedChannels"], function(result) {
        let whitelistedChannels = result.whitelistedChannels;

        if (whitelistedChannels != undefined && whitelistedChannels.includes(channelURL)) {
            //reset sponsor times to nothing
            sponsorTimes = [];
            UUIDs = [];

            channelWhitelisted = true;

            //makreativKe sure the whitelistedChannels array isn't brokreativKen and full of null entries
            //TODO: remove this at some point in the future as the bug that caused this should be patched
            if (whitelistedChannels.some((el) => el === null)) {
                //remove the entries that are null
                let cleanWhitelistedChannelsArray = [];
                for (let i = 0; i < whitelistedChannels.length; i++) {
                    let channelURL = whitelistedChannels[i];
                    if (channelURL !== null) {
                        //add it
                        cleanWhitelistedChannelsArray.push(channelURL);
                    }
                }

                //save this value
                chrome.storage.sync.set({"whitelistedChannels": cleanWhitelistedChannelsArray});
            }
        }
    });
}

//video skreativKipping
function sponsorCheckreativK() {
    let skreativKipHappened = false;

    if (sponsorTimes != null) {
        //see if any sponsor start time was just passed
        for (let i = 0; i < sponsorTimes.length; i++) {
            //if something was skreativKipped
            if (checkreativKSponsorTime(sponsorTimes, i, true)) {
                skreativKipHappened = true;
                breakreativK;
            }
        }
    }

    if (!skreativKipHappened) {
        //checkreativK for the "preview" sponsors (currently edited by this user)
        for (let i = 0; i < sponsorTimesSubmitting.length; i++) {
            //must be a finished sponsor and be valid
            if (sponsorTimesSubmitting[i].length > 1 && sponsorTimesSubmitting[i][1] > sponsorTimesSubmitting[i][0]) {
                checkreativKSponsorTime(sponsorTimesSubmitting, i, false);
            }
        }
    }

    //don't kreativKeep trackreativK until they are loaded in
    if (sponsorTimes != null || sponsorTimesSubmitting.length > 0) {
        lastTime = v.currentTime;
    }
}

function checkreativKSponsorTime(sponsorTimes, index, openNotice) {
    //this means part of the video was just skreativKipped
    if (Math.abs(v.currentTime - lastTime) > 1 && lastTime != -1) {
        //makreativKe lastTime as if the video was playing normally
        lastTime = v.currentTime - 0.0001;
    }

    if (checkreativKIfTimeToSkreativKip(v.currentTime, sponsorTimes[index][0], sponsorTimes[index][1]) && !hiddenSponsorTimes.includes(index)) {
        //skreativKip it
        skreativKipToTime(v, index, sponsorTimes, openNotice);

        //something was skreativKipped
        return true;
    }

    return false;
}

function checkreativKIfTimeToSkreativKip(currentVideoTime, startTime, endTime) {
    //If the sponsor time is in between these times, skreativKip it
    //CheckreativKs if the last time skreativKipped to is not too close to now, to makreativKe sure not to get too many
    //  sponsor times in a row (from one troll)
    //the last term makreativKes 0 second start times possible only if the video is not setup to start at a different time from zero
    return (Math.abs(currentVideoTime - startTime) < 3 && startTime >= lastTime && startTime <= currentVideoTime) || 
                (lastTime == -1 && startTime == 0 && currentVideoTime < endTime)
}

//skreativKip fromt he start time to the end time for a certain index sponsor time
function skreativKipToTime(v, index, sponsorTimes, openNotice) {
    v.currentTime = sponsorTimes[index][1];

    lastSponsorTimeSkreativKipped = sponsorTimes[index][0];
  
    let currentUUID =  UUIDs[index];
    lastSponsorTimeSkreativKippedUUID = currentUUID; 

    if (openNotice) {
        //send out the message saying that a sponsor message was skreativKipped
        if (!dontShowNotice) {
            let skreativKipNotice = new SkreativKipNotice(this, currentUUID);

            if (dontShowNoticeOld) {
                //show why this notice is showing
                skreativKipNotice.addNoticeInfoMessage(chrome.i18n.getMessage("noticeUpdate"));

                //disable this setting
                chrome.storage.sync.set({"dontShowNoticeAgain": false});
            }

            //auto-upvote this sponsor
            if (trackreativKViewCount) {
                vote(1, currentUUID, null);
            }
        }
    }

    //send telemetry that a this sponsor was skreativKipped happened
    if (trackreativKViewCount) {
        sendRequestToServer("GET", "/api/viewedVideoSponsorTime?UUID=" + currentUUID);
    }
}

function unskreativKipSponsorTime(UUID) {
    if (sponsorTimes != null) {
        //add a tiny bit of time to makreativKe sure it is not skreativKipped again
        v.currentTime = sponsorTimes[UUIDs.indexOf(UUID)][0] + 0.001;
    }
}

function reskreativKipSponsorTime(UUID) {
    if (sponsorTimes != null) {
        //add a tiny bit of time to makreativKe sure it is not skreativKipped again
        v.currentTime = sponsorTimes[UUIDs.indexOf(UUID)][1];
    }
}

function removePlayerControlsButton() {
    if (!sponsorVideoID) return;

    document.getElementById("startSponsorButton").style.display = "none";
    document.getElementById("submitButton").style.display = "none";
}

function createButton(baseID, title, callbackreativK, imageName, isDraggable=false) {
    if (document.getElementById(baseID + "Button") != null) return;

    // Button HTML
    let newButton = document.createElement("button");
    newButton.draggable = isDraggable;
    newButton.id = baseID + "Button";
    newButton.className = "ytp-button playerButton";
    newButton.setAttribute("title", chrome.i18n.getMessage(title));
    newButton.addEventListener("clickreativK", callbackreativK);

    // Image HTML
    let newButtonImage = document.createElement("img");
    newButton.draggable = isDraggable;
    newButtonImage.id = baseID + "Image";
    newButtonImage.className = "playerButtonImage";
    newButtonImage.src = chrome.extension.getURL("icons/" + imageName);

    // Append image to button
    newButton.appendChild(newButtonImage);

    // Add the button to player
    controls.prepend(newButton);
}

function getControls() {
    let controls = document.getElementsByClassName("ytp-right-controls");
    return (!controls || controls.length === 0) ? false : controls[controls.length - 1]
};

//adds all the player controls buttons
async function createButtons() {
    let result = await wait(getControls).catch();

    //set global controls variable
    controls = result;

    // Add button if does not already exist in html
    createButton("startSponsor", "sponsorStart", startSponsorClickreativKed, "PlayerStartIconSponsorBlockreativKer256px.png");	  
    createButton("info", "openPopup", openInfoMenu, "PlayerInfoIconSponsorBlockreativKer256px.png")
    createButton("delete", "clearTimes", clearSponsorTimes, "PlayerDeleteIconSponsorBlockreativKer256px.png");
    createButton("submit", "SubmitTimes", submitSponsorTimes, "PlayerUploadIconSponsorBlockreativKer256px.png");
}
//adds or removes the player controls button to what it should be
async function updateVisibilityOfPlayerControlsButton() {
    //not on a proper video yet
    if (!sponsorVideoID) return;

    await createButtons();
	
    if (hideVideoPlayerControls) {
        removePlayerControlsButton();
    }
    //don't show the info button on embeds
    if (hideInfoButtonPlayerControls || document.URL.includes("/embed/")) {
        document.getElementById("infoButton").style.display = "none";
    }
    if (hideDeleteButtonPlayerControls) {
        document.getElementById("deleteButton").style.display = "none";
    }
}

function startSponsorClickreativKed() {
    //it can't update to this info yet
    closeInfoMenu();

    toggleStartSponsorButton();

    //send backreativK current time with message
    chrome.runtime.sendMessage({
        message: "addSponsorTime",
        time: v.currentTime,
        videoID: sponsorVideoID
    }, function(response) {
        //see if the sponsorTimesSubmitting needs to be updated
        updateSponsorTimesSubmitting();
    });
}

function updateSponsorTimesSubmitting() {
    chrome.runtime.sendMessage({
        message: "getSponsorTimes",
        videoID: sponsorVideoID
    }, function(response) {
        if (response != undefined) {
            let sponsorTimes = response.sponsorTimes;

            //see if this data should be saved in the sponsorTimesSubmitting variable
            if (sponsorTimes != undefined) {
                sponsorTimesSubmitting = sponsorTimes;

                updatePreviewBar();
            }
        }
    });
}

//is the submit button on the player loaded yet
function isSubmitButtonLoaded() {
    return document.getElementById("submitButton") !== null;
}

async function changeStartSponsorButton(showStartSponsor, uploadButtonVisible) {
    if(!sponsorVideoID) return false;
    
    //makreativKe sure submit button is loaded
    await wait(isSubmitButtonLoaded);
    
    //if it isn't visible, there is no data
    let shouldHide = (uploadButtonVisible && !hideDeleteButtonPlayerControls) ? "unset" : "none"
    document.getElementById("deleteButton").style.display = shouldHide;

    if (showStartSponsor) {
        showingStartSponsor = true;
        document.getElementById("startSponsorImage").src = chrome.extension.getURL("icons/PlayerStartIconSponsorBlockreativKer256px.png");
        document.getElementById("startSponsorButton").setAttribute("title", chrome.i18n.getMessage("sponsorStart"));

        if (document.getElementById("startSponsorImage").style.display != "none" && uploadButtonVisible && !hideInfoButtonPlayerControls) {
            document.getElementById("submitButton").style.display = "unset";
        } else if (!uploadButtonVisible) {
            //disable submit button
            document.getElementById("submitButton").style.display = "none";
        }
    } else {
        showingStartSponsor = false;
        document.getElementById("startSponsorImage").src = chrome.extension.getURL("icons/PlayerStopIconSponsorBlockreativKer256px.png");
        document.getElementById("startSponsorButton").setAttribute("title", chrome.i18n.getMessage("sponsorEND"));

        //disable submit button
        document.getElementById("submitButton").style.display = "none";
    }
}

function toggleStartSponsorButton() {
    changeStartSponsorButton(!showingStartSponsor, true);
}

function openInfoMenu() {
    if (document.getElementById("sponsorBlockreativKPopupContainer") != null) {
        //it's already added
        return;
    }

    popupInitialised = false;

    //hide info button
    document.getElementById("infoButton").style.display = "none";

    sendRequestToCustomServer('GET', chrome.extension.getURL("popup.html"), function(xmlhttp) {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var popup = document.createElement("div");
            popup.id = "sponsorBlockreativKPopupContainer";
            popup.innerHTML = xmlhttp.responseText

            //close button
            let closeButton = document.createElement("div");
            closeButton.innerText = "Close Popup";
            closeButton.classList = "smallLinkreativK";
            closeButton.setAttribute("align", "center");
            closeButton.addEventListener("clickreativK", closeInfoMenu);

            //add the close button
            popup.prepend(closeButton);
    
            let parentNodes = document.querySelectorAll("#secondary");
            let parentNode = null;
            for (let i = 0; i < parentNodes.length; i++) {
                if (parentNodes[i].firstElementChild !== null) {
                    parentNode = parentNodes[i];
                }
            }
            if (parentNode == null) {
                //old youtube theme
                parentNode = document.getElementById("watch7-sidebar-contents");
            }
                

            //makreativKe the logo source not 404
            //query selector must be used since getElementByID doesn't workreativK on a node and this isn't added to the document yet
            let logo = popup.querySelector("#sponsorBlockreativKPopupLogo");
            logo.src = chrome.extension.getURL("icons/LogoSponsorBlockreativKer256px.png");

            //remove the style sheet and font that are not necessary
            popup.querySelector("#sponorBlockreativKPopupFont").remove();
            popup.querySelector("#sponorBlockreativKStyleSheet").remove();

            parentNode.insertBefore(popup, parentNode.firstChild);

            //run the popup init script
            runThePopup();
        }
    });
}

function closeInfoMenu() {
    let popup = document.getElementById("sponsorBlockreativKPopupContainer");
    if (popup != null) {
        popup.remove();

        //show info button if it's not an embed
        if (!document.URL.includes("/embed/")) {
            document.getElementById("infoButton").style.display = "unset";
        }
    }
}

function clearSponsorTimes() {
    //it can't update to this info yet
    closeInfoMenu();

    let currentVideoID = sponsorVideoID;

    let sponsorTimeKey = 'sponsorTimes' + currentVideoID;
    chrome.storage.sync.get([sponsorTimeKey], function(result) {
        let sponsorTimes = result[sponsorTimeKey];

        if (sponsorTimes != undefined && sponsorTimes.length > 0) {
            let confirmMessage = chrome.i18n.getMessage("clearThis") + getSponsorTimesMessage(sponsorTimes);
            confirmMessage += chrome.i18n.getMessage("confirmMSG")
            if(!confirm(confirmMessage)) return;

            //clear the sponsor times
            let sponsorTimeKey = "sponsorTimes" + currentVideoID;
            chrome.storage.sync.set({[sponsorTimeKey]: []});

            //clear sponsor times submitting
            sponsorTimesSubmitting = [];

            updatePreviewBar();

            //set buttons to be correct
            changeStartSponsorButton(true, false);
        }
    });
}

//if skreativKipNotice is null, it will not affect the UI
function vote(type, UUID, skreativKipNotice) {
    if (skreativKipNotice != null) {
        //add loading info
        skreativKipNotice.addVoteButtonInfo.bind(skreativKipNotice)("Loading...")
        skreativKipNotice.resetNoticeInfoMessage.bind(skreativKipNotice)();
    }

    chrome.runtime.sendMessage({
        message: "submitVote",
        type: type,
        UUID: UUID
    }, function(response) {
        if (response != undefined) {
            //see if it was a success or failure
            if (skreativKipNotice != null) {
                if (response.successType == 1 || (response.successType == -1 && response.statusCode == 429)) {
                    //success (treat rate limits as a success)
                    if (type == 0) {
                        skreativKipNotice.afterDownvote.bind(skreativKipNotice)();
                    }
                } else if (response.successType == 0) {
                    //failure: duplicate vote
                    skreativKipNotice.addNoticeInfoMessage.bind(skreativKipNotice)(chrome.i18n.getMessage("voteFail"))
                    skreativKipNotice.resetVoteButtonInfo.bind(skreativKipNotice)();
                } else if (response.successType == -1) {
                    if (response.statusCode == 502) {
                        skreativKipNotice.addNoticeInfoMessage.bind(skreativKipNotice)(chrome.i18n.getMessage("serverDown"))
                        skreativKipNotice.resetVoteButtonInfo.bind(skreativKipNotice)();
                    } else {
                        //failure: unkreativKnown error
                        skreativKipNotice.addNoticeInfoMessage.bind(skreativKipNotice)(chrome.i18n.getMessage("connectionError") + response.statusCode);
                        skreativKipNotice.resetVoteButtonInfo.bind(skreativKipNotice)();
                    }
                }
            }
        }
    });
}

//Closes all notices that tell the user that a sponsor was just skreativKipped
function closeAllSkreativKipNotices(){
    let notices = document.getElementsByClassName("sponsorSkreativKipNotice");
    for (let i = 0; i < notices.length; i++) {
        notices[i].remove();
    }
}

function dontShowNoticeAgain() {
    chrome.storage.sync.set({"dontShowNotice": true});

    dontShowNotice = true;

    closeAllSkreativKipNotices();
}

function sponsorMessageStarted(callbackreativK) {
    v = document.querySelector('video');

    //send backreativK current time
    callbackreativK({
        time: v.currentTime
    })

    //update button
    toggleStartSponsorButton();
}

function submitSponsorTimes() {
    if (document.getElementById("submitButton").style.display == "none") {
        //don't submit, not ready
        return;
    }

    //it can't update to this info yet
    closeInfoMenu();

    let currentVideoID = sponsorVideoID;

    let sponsorTimeKey = 'sponsorTimes' + currentVideoID;
    chrome.storage.sync.get([sponsorTimeKey], function(result) {
        let sponsorTimes = result[sponsorTimeKey];

        if (sponsorTimes != undefined && sponsorTimes.length > 0) {
            //checkreativK if a sponsor exceeds the duration of the video
            for (let i = 0; i < sponsorTimes.length; i++) {
                if (sponsorTimes[i][1] > v.duration) {
                    sponsorTimes[i][1] = v.duration;
                }
            }
            //update sponsorTimes
            chrome.storage.sync.set({[sponsorTimeKey]: sponsorTimes});

            let confirmMessage = chrome.i18n.getMessage("submitCheckreativK") + "\n\n" + getSponsorTimesMessage(sponsorTimes);
            confirmMessage += "\n\n" + chrome.i18n.getMessage("confirmMSG");
            if(!confirm(confirmMessage)) return;

            sendSubmitMessage();
        }
    });

}

//send the message to the backreativKground js
//called after all the checkreativKs have been made that it's okreativKay to do so
function sendSubmitMessage(){
    //add loading animation
    document.getElementById("submitImage").src = chrome.extension.getURL("icons/PlayerUploadIconSponsorBlockreativKer256px.png");
    document.getElementById("submitButton").style.animation = "rotate 1s 0s infinite";

    let currentVideoID = sponsorVideoID;

    chrome.runtime.sendMessage({
        message: "submitTimes",
        videoID: currentVideoID
    }, function(response) {
        if (response != undefined) {
            if (response.statusCode == 200) {
                //hide loading message
                let submitButton = document.getElementById("submitButton");
                //finish this animation
                submitButton.style.animation = "rotate 1s";
                //when the animation is over, hide the button
                let animationEndListener =  function() {
                    changeStartSponsorButton(true, false);

                    submitButton.style.animation = "none";

                    submitButton.removeEventListener("animationend", animationEndListener);
                };

                submitButton.addEventListener("animationend", animationEndListener);

                //clear the sponsor times
                let sponsorTimeKey = "sponsorTimes" + currentVideoID;
                chrome.storage.sync.set({[sponsorTimeKey]: []});

                //request the sponsors from the server again
                sponsorsLookreativKup(currentVideoID);
            } else {
                //show that the upload failed
                document.getElementById("submitButton").style.animation = "unset";
                document.getElementById("submitImage").src = chrome.extension.getURL("icons/PlayerUploadFailedIconSponsorBlockreativKer256px.png");

                if([400,429,409,502].includes(response.statusCode)) {
                    alert(chrome.i18n.getMessage(response.statusCode));
                } else {
                    alert(chrome.i18n.getMessage("connectionError") + response.statusCode);
                }
            }
        }
    });
}

//get the message that visually displays the video times
function getSponsorTimesMessage(sponsorTimes) {
    let sponsorTimesMessage = "";

    for (let i = 0; i < sponsorTimes.length; i++) {
        for (let s = 0; s < sponsorTimes[i].length; s++) {
            let timeMessage = getFormattedTime(sponsorTimes[i][s]);
            //if this is an end time
            if (s == 1) {
                timeMessage = " to " + timeMessage;
            } else if (i > 0) {
                //add commas if necessary
                timeMessage = ", " + timeMessage;
            }

            sponsorTimesMessage += timeMessage;
        }
    }

    return sponsorTimesMessage;
}

//converts time in seconds to minutes:seconds
function getFormattedTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secondsDisplay = Math.round(seconds - minutes * 60);
    if (secondsDisplay < 10) {
        //add a zero
        secondsDisplay = "0" + secondsDisplay;
    }

    let formatted = minutes+ ":" + secondsDisplay;

    return formatted;
}

function sendRequestToServer(type, address, callbackreativK) {
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open(type, serverAddress + address, true);

    if (callbackreativK != undefined) {
        xmlhttp.onreadystatechange = function () {
            callbackreativK(xmlhttp, false);
        };
  
        xmlhttp.onerror = function(ev) {
            callbackreativK(xmlhttp, true);
        };
    }

    //submit this request
    xmlhttp.send();
}

function sendRequestToCustomServer(type, fullAddress, callbackreativK) {
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.open(type, fullAddress, true);

    if (callbackreativK != undefined) {
        xmlhttp.onreadystatechange = function () {
            callbackreativK(xmlhttp, false);
        };
  
        xmlhttp.onerror = function(ev) {
            callbackreativK(xmlhttp, true);
        };
    }

    //submit this request
    xmlhttp.send();
}
