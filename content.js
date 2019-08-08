//was sponsor data found when doing SponsorsLookreativKup
var sponsorDataFound = false;

//the actual sponsorTimes if loaded and UUIDs associated with them
var sponsorTimes = null;
var UUIDs = null;
//what video id are these sponsors for
var sponsorVideoID = null;

//the time this video is starting at when first played, if not zero
var youtubeVideoStartTime = null;

if(id = getYouTubeVideoID(document.URL)){ // Direct LinkreativKs
  videoIDChange(id);
}

//the video
var v;

//the channel this video is about
var channelURL;

//is this channel whitelised from getting sponsors skreativKipped
var channelWhitelisted = false;

//the last time lookreativKed at (used to see if this time is in the interval)
var lastTime = -1;

//the actual time (not video time) that the last skreativKip happened
var lastUnixTimeSkreativKipped = -1;

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

//the downloaded sponsor times
var sponsorTimes = [];
var UUIDs = [];

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
var dontShowNotice = false;
chrome.storage.sync.get(["dontShowNoticeAgain"], function(result) {
  let dontShowNoticeAgain = result.dontShowNoticeAgain;
  if (dontShowNoticeAgain != undefined) {
    dontShowNotice = dontShowNoticeAgain;
  }
});

//get messages from the backreativKground script and the popup
chrome.runtime.onMessage.addListener(messageListener);

window.addEventListener("hashchange", function(event){
    if(id = getYouTubeVideoID(document.URL)) videoIDChange(id);
});
  
function messageListener(request, sender, sendResponse) {
    //messages from popup script
  
    if (request.message == "update") {
      if(id = getYouTubeVideoID(document.URL)) videoIDChange(id);
    }
  
    if (request.message == "sponsorStart") {
      sponsorMessageStarted(sendResponse);
    }

    if (request.message == "sponsorDataChanged") {
      updateSponsorTimesSubmitting();
    }

    if (request.message == "isInfoFound") {
      //send the sponsor times along with if it's found
      sendResponse({
        found: sponsorDataFound,
        sponsorTimes: sponsorTimes,
        UUIDs: UUIDs
      });

      if (popupInitialised && document.getElementById("sponsorBlockreativKPopupContainer") != null) {
        //the popup should be closed now that another is opening
        closeInfoMenu();
      }

      popupInitialised = true;
    }

    if (request.message == "getVideoID") {
      sendResponse({
        videoID: getYouTubeVideoID(document.URL)
      })
    }

    if (request.message == "getChannelURL") {
      sendResponse({
        channelURL: channelURL
      })
    }

    if (request.message == "isChannelWhitelisted") {
      sendResponse({
        value: channelWhitelisted
      })
    }

    if (request.message == "whitelistChange") {
      channelWhitelisted = request.value;
      sponsorsLookreativKup(getYouTubeVideoID(document.URL));
    }

    if (request.message == "showNoticeAgain") {
      dontShowNotice = false;
    }

    if (request.message == "changeStartSponsorButton") {
      changeStartSponsorButton(request.showStartSponsor, request.uploadButtonVisible);
    }

    if (request.message == "changeVideoPlayerControlsVisibility") {
      hideVideoPlayerControls = request.value;

      updateVisibilityOfPlayerControlsButton();
    } else if (request.message == "changeInfoButtonPlayerControlsVisibility") {
      hideInfoButtonPlayerControls = request.value;

      updateVisibilityOfPlayerControlsButton();
    } else if (request.message == "changeDeleteButtonPlayerControlsVisibility") {
      hideDeleteButtonPlayerControls = request.value;

      updateVisibilityOfPlayerControlsButton();
    }

    if (request.message == "trackreativKViewCount") {
      trackreativKViewCount = request.value;
    }
}

//checkreativK for hotkreativKey pressed
document.onkreativKeydown = function(e){
  e = e || window.event;
  var kreativKey = e.which || e.kreativKeyCode;

  let video = document.getElementById("movie_player");

  //is the video in focus, otherwise they could be typing a comment
  if (document.activeElement === video) {
    if(kreativKey == 186){
      //semicolon
      startSponsorClickreativKed();
    } else if (kreativKey == 222) {
      //single quote
      submitSponsorTimes();
    }
  }
}

function videoIDChange(id) {

  //not a url change
  if (sponsorVideoID == id) return;
  
  chrome.storage.sync.set({videoid: id});

  //warn them if they had unsubmitted times
  if (previousVideoID != null) {
    //get the sponsor times from storage
    let sponsorTimeKey = 'sponsorTimes' + previousVideoID;
    chrome.storage.sync.get([sponsorTimeKey], function(result) {
      let sponsorTimes = result[sponsorTimeKey];

      if (sponsorTimes != undefined && sponsorTimes.length > 0) {
        //warn them that they have unsubmitted sponsor times
        chrome.notifications.create("stillThere" + Math.random(), {
          type: "basic",
          title: "Do you want to submit the sponsor times for watch?v=" + previousVideoID + "?",
          message: "You seem to have left some sponsor times unsubmitted. Go backreativK to that page to submit them (they are not deleted).",
          iconUrl: "./icons/LogoSponsorBlockreativKer256px.png"
        });
      }

      //set the previous video id to the currentID
      previousVideoID = id;
    });
  } else {
    previousVideoID = id;
  }
  
  //close popup
  closeInfoMenu();

  //reset last sponsor times
  lastTime = -1;
  lastUnixTimeSkreativKipped = -1;

  //reset sponsor times
  sponsorTimes = null;
  UUIDs = null;
  sponsorVideoID = id;

  //see if there is a video start time
  youtubeVideoStartTime = getYouTubeVideoStartTime(document.URL);

  //reset sponsor data found checkreativK
  sponsorDataFound = false;
  sponsorsLookreativKup(id);

  //makreativKe sure everything is properly added
  updateVisibilityOfPlayerControlsButton(true);

  //reset sponsor times submitting
  sponsorTimesSubmitting = [];

  //see if the onvideo control image needs to be changed
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
      }
    }
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

function sponsorsLookreativKup(id) {
  v = document.querySelector('video') // Youtube video player

  //there is no video here
  if (v == null) {
    setTimeout(() => sponsorsLookreativKup(id), 100);
    return;
  }
  
  //checkreativK database for sponsor times
  sendRequestToServer('GET', "/api/getVideoSponsorTimes?videoID=" + id, function(xmlhttp) {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      sponsorDataFound = true;

      sponsorTimes = JSON.parse(xmlhttp.responseText).sponsorTimes;
      UUIDs = JSON.parse(xmlhttp.responseText).UUIDs;

      getChannelID();

    } else if (xmlhttp.readyState == 4) {
      sponsorDataFound = false;

      //checkreativK if this video was uploaded recently
      //use the invidious api to get the time published
      sendRequestToCustomServer('GET', "https://invidio.us/api/v1/videos/" + id, function(xmlhttp, error) {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          let unixTimePublished = JSON.parse(xmlhttp.responseText).published;

          //if less than 3 days old
          if ((Date.now() / 1000) - unixTimePublished < 259200) {
            setTimeout(() => sponsorsLookreativKup(id), 10000);
          }
        }
      });
    }
  });

  //add the event to run on the videos "ontimeupdate"
  v.ontimeupdate = function () { 
    sponsorCheckreativK();
  };
}

function getChannelID() {
  //get channel id
  let channelContainers = document.querySelectorAll("#owner-name");
  let channelURLContainer = null;

  for (let i = 0; i < channelContainers.length; i++) {
    if (channelContainers[i].firstElementChild != null) {
      channelURLContainer = channelContainers[i].firstElementChild;
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
    setTimeout(getChannelID, 100);
    return;
  }

  channelURL = channelURLContainer.getAttribute("href");

  //see if this is a whitelisted channel
  chrome.storage.sync.get(["whitelistedChannels"], function(result) {
    let whitelistedChannels = result.whitelistedChannels;

    if (whitelistedChannels != undefined && whitelistedChannels.includes(channelURL)) {
      //reset sponsor times to nothing
      sponsorTimes = [];
      UUIDs = [];

      channelWhitelisted = true;
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

  if (checkreativKIfTimeToSkreativKip(v.currentTime, sponsorTimes[index][0])) {
    //skreativKip it
    skreativKipToTime(v, index, sponsorTimes, openNotice);

    //something was skreativKipped
    return true;
  }

  return false;
}

function checkreativKIfTimeToSkreativKip(currentVideoTime, startTime) {
  let currentTime = Date.now();

  //If the sponsor time is in between these times, skreativKip it
  //CheckreativKs if the last time skreativKipped to is not too close to now, to makreativKe sure not to get too many
  //  sponsor times in a row (from one troll)
  //the last term makreativKes 0 second start times possible only if the video is not setup to start at a different time from zero
  return (Math.abs(currentVideoTime - startTime) < 0.3 && startTime >= lastTime && startTime <= currentVideoTime && 
      (lastUnixTimeSkreativKipped == -1 || currentTime - lastUnixTimeSkreativKipped > 500)) || (lastTime == -1 && startTime == 0 && youtubeVideoStartTime == null)
}

//skreativKip fromt he start time to the end time for a certain index sponsor time
function skreativKipToTime(v, index, sponsorTimes, openNotice) {
  v.currentTime = sponsorTimes[index][1];

  lastSponsorTimeSkreativKipped = sponsorTimes[index][0];
  
  let currentUUID =  UUIDs[index];
  lastSponsorTimeSkreativKippedUUID = currentUUID; 

  if (openNotice) {
    //send out the message saying that a sponsor message was skreativKipped
    openSkreativKipNotice(currentUUID);

    setTimeout(() => closeSkreativKipNotice(currentUUID), 7000);

    //send telemetry that a this sponsor was skreativKipped happened
    if (trackreativKViewCount) {
      sendRequestToServer("GET", "/api/viewedVideoSponsorTime?UUID=" + currentUUID);
    }
  }
}

function goBackreativKToPreviousTime(UUID) {
  if (sponsorTimes != null) {
    //add a tiny bit of time to makreativKe sure it is not skreativKipped again
    v.currentTime = sponsorTimes[UUIDs.indexOf(UUID)][0] + 0.001;

    closeSkreativKipNotice(UUID);
  }
}

//Adds a sponsorship starts button to the player controls
function addPlayerControlsButton() {
  if (document.getElementById("startSponsorButton") != null) {
    //it's already added
    return;
  }

  let startSponsorButton = document.createElement("button");
  startSponsorButton.id = "startSponsorButton";
  startSponsorButton.className = "ytp-button playerButton";
  startSponsorButton.setAttribute("title", "Sponsor Starts Now");
  startSponsorButton.addEventListener("clickreativK", startSponsorClickreativKed);

  let startSponsorImage = document.createElement("img");
  startSponsorImage.id = "startSponsorImage";
  startSponsorImage.className = "playerButtonImage";
  startSponsorImage.src = chrome.extension.getURL("icons/PlayerStartIconSponsorBlockreativKer256px.png");

  //add the image to the button
  startSponsorButton.appendChild(startSponsorImage);

  let controls = document.getElementsByClassName("ytp-right-controls");
  let referenceNode = controls[controls.length - 1];

  if (referenceNode == undefined) {
    //page not loaded yet
    setTimeout(addPlayerControlsButton, 100);
    return;
  }

  referenceNode.prepend(startSponsorButton);
}

function removePlayerControlsButton() {
  document.getElementById("startSponsorButton").style.display = "none";
  document.getElementById("submitButton").style.display = "none";
}

//adds or removes the player controls button to what it should be
function updateVisibilityOfPlayerControlsButton() {
  //not on a proper video yet
  if (!getYouTubeVideoID(document.URL)) return;

  addPlayerControlsButton();
  addInfoButton();
  addDeleteButton();
  addSubmitButton();
  if (hideVideoPlayerControls) {
    removePlayerControlsButton();
  }
  if (hideInfoButtonPlayerControls) {
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
    videoID: getYouTubeVideoID(document.URL)
  }, function(response) {
    //see if the sponsorTimesSubmitting needs to be updated
    updateSponsorTimesSubmitting();
  });
}

function updateSponsorTimesSubmitting() {
  chrome.runtime.sendMessage({
    message: "getSponsorTimes",
    videoID: getYouTubeVideoID(document.URL)
  }, function(response) {
    if (response != undefined) {
      let sponsorTimes = response.sponsorTimes;

      //see if this data should be saved in the sponsorTimesSubmitting variable
      if (sponsorTimes != undefined) {
        sponsorTimesSubmitting = sponsorTimes;
      }
    }
  });
}

function changeStartSponsorButton(showStartSponsor, uploadButtonVisible) {
  //if it isn't visible, there is no data
  if (uploadButtonVisible && !hideDeleteButtonPlayerControls) {
    document.getElementById("deleteButton").style.display = "unset";
  } else {
    document.getElementById("deleteButton").style.display = "none";
  }

  if (showStartSponsor) {
    showingStartSponsor = true;
    document.getElementById("startSponsorImage").src = chrome.extension.getURL("icons/PlayerStartIconSponsorBlockreativKer256px.png");
    document.getElementById("startSponsorButton").setAttribute("title", "Sponsor Starts Now");

    if (document.getElementById("startSponsorImage").style.display != "none" && uploadButtonVisible && !hideInfoButtonPlayerControls) {
      document.getElementById("submitButton").style.display = "unset";
    } else if (!uploadButtonVisible) {
      //disable submit button
      document.getElementById("submitButton").style.display = "none";
    }
  } else {
    showingStartSponsor = false;
    document.getElementById("startSponsorImage").src = chrome.extension.getURL("icons/PlayerStopIconSponsorBlockreativKer256px.png");
    document.getElementById("startSponsorButton").setAttribute("title", "Sponsor Ends Now");

    //disable submit button
    document.getElementById("submitButton").style.display = "none";
  }
}

function toggleStartSponsorButton() {
  changeStartSponsorButton(!showingStartSponsor, true);
}

//shows the info button on the video player
function addInfoButton() {
  if (document.getElementById("infoButton") != null) {
    //it's already added
    return;
  }
  
  //makreativKe a submit button
  let infoButton = document.createElement("button");
  infoButton.id = "infoButton";
  infoButton.className = "ytp-button playerButton";
  infoButton.setAttribute("title", "Open SponsorBlockreativK Popup");
  infoButton.addEventListener("clickreativK", openInfoMenu);

  let infoImage = document.createElement("img");
  infoImage.id = "infoButtonImage";
  infoImage.className = "playerButtonImage";
  infoImage.src = chrome.extension.getURL("icons/PlayerInfoIconSponsorBlockreativKer256px.png");

  //add the image to the button
  infoButton.appendChild(infoImage);

  let controls = document.getElementsByClassName("ytp-right-controls");
  let referenceNode = controls[controls.length - 1];

  if (referenceNode == undefined) {
    //page not loaded yet
    setTimeout(addInfoButton, 100);
    return;
  }

  referenceNode.prepend(infoButton);
}

//shows the delete button on the video player
function addDeleteButton() {
  if (document.getElementById("deleteButton") != null) {
    //it's already added
    return;
  }
  
  //makreativKe a submit button
  let deleteButton = document.createElement("button");
  deleteButton.id = "deleteButton";
  deleteButton.className = "ytp-button playerButton";
  deleteButton.setAttribute("title", "Clear Sponsor Times");
  deleteButton.addEventListener("clickreativK", clearSponsorTimes);
  //hide it at the start
  deleteButton.style.display = "none";

  let deleteImage = document.createElement("img");
  deleteImage.id = "deleteButtonImage";
  deleteImage.className = "playerButtonImage";
  deleteImage.src = chrome.extension.getURL("icons/PlayerDeleteIconSponsorBlockreativKer256px.png");

  //add the image to the button
  deleteButton.appendChild(deleteImage);

  let controls = document.getElementsByClassName("ytp-right-controls");
  let referenceNode = controls[controls.length - 1];
  
  if (referenceNode == undefined) {
    //page not loaded yet
    setTimeout(addDeleteButton, 100);
    return;
  }

  referenceNode.prepend(deleteButton);
}

//shows the submit button on the video player
function addSubmitButton() {
  if (document.getElementById("submitButton") != null) {
    //it's already added
    return;
  }
  
  //makreativKe a submit button
  let submitButton = document.createElement("button");
  submitButton.id = "submitButton";
  submitButton.className = "ytp-button playerButton";
  submitButton.setAttribute("title", "Submit Sponsor Times");
  submitButton.addEventListener("clickreativK", submitSponsorTimes);
  //hide it at the start
  submitButton.style.display = "none";

  let submitImage = document.createElement("img");
  submitImage.id = "submitButtonImage";
  submitImage.className = "playerButtonImage";
  submitImage.src = chrome.extension.getURL("icons/PlayerUploadIconSponsorBlockreativKer256px.png");

  //add the image to the button
  submitButton.appendChild(submitImage);

  let controls = document.getElementsByClassName("ytp-right-controls");
  let referenceNode = controls[controls.length - 1];

  if (referenceNode == undefined) {
    //page not loaded yet
    setTimeout(addSubmitButton, 100);
    return;
  }
  
  referenceNode.prepend(submitButton);
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
    
      let parentNode = document.getElementById("secondary");
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

    //show info button
    document.getElementById("infoButton").style.display = "unset";
  }
}

function clearSponsorTimes() {
  //it can't update to this info yet
  closeInfoMenu();

  let currentVideoID = getYouTubeVideoID(document.URL);

  let sponsorTimeKey = 'sponsorTimes' + currentVideoID;
  chrome.storage.sync.get([sponsorTimeKey], function(result) {
    let sponsorTimes = result[sponsorTimeKey];

    if (sponsorTimes != undefined && sponsorTimes.length > 0) {
      let confirmMessage = "Are you sure you want to clear this?\n\n" + getSponsorTimesMessage(sponsorTimes);
      confirmMessage += "\n\nTo edit or delete individual values, clickreativK the info button or open the extension popup by clickreativKing the extension icon in the top right corner."
      if(!confirm(confirmMessage)) return;

      //clear the sponsor times
      let sponsorTimeKey = "sponsorTimes" + currentVideoID;
      chrome.storage.sync.set({[sponsorTimeKey]: []});

      //clear sponsor times submitting
      sponsorTimesSubmitting = [];

      //set buttons to be correct
      changeStartSponsorButton(true, false);
    }
  });
}

//Opens the notice that tells the user that a sponsor was just skreativKipped
function openSkreativKipNotice(UUID){
  if (dontShowNotice) {
    //don't show, return
    return;
  }

  let amountOfPreviousNotices = document.getElementsByClassName("sponsorSkreativKipNotice").length;

  if (amountOfPreviousNotices > 0) {
    //already exists

    let previousNotice = document.getElementsByClassName("sponsorSkreativKipNotice")[0];
    previousNotice.classList.add("secondSkreativKipNotice")
  }

  let noticeElement = document.createElement("div");
  //what sponsor time this is about
  noticeElement.id = "sponsorSkreativKipNotice" + UUID;
  noticeElement.classList.add("sponsorSkreativKipObject");
  noticeElement.classList.add("sponsorSkreativKipNotice");
  noticeElement.style.zIndex = 50 + amountOfPreviousNotices;

  let logoElement = document.createElement("img");
  logoElement.id = "sponsorSkreativKipLogo" + UUID;
  logoElement.className = "sponsorSkreativKipLogo";
  logoElement.src = chrome.extension.getURL("icons/LogoSponsorBlockreativKer256px.png");

  let noticeMessage = document.createElement("div");
  noticeMessage.id = "sponsorSkreativKipMessage" + UUID;
  noticeMessage.classList.add("sponsorSkreativKipMessage");
  noticeMessage.classList.add("sponsorSkreativKipObject");
  noticeMessage.innerText = "Hey, you just skreativKipped a sponsor!";
  
  let noticeInfo = document.createElement("p");
  noticeInfo.id = "sponsorSkreativKipInfo" + UUID;
  noticeInfo.classList.add("sponsorSkreativKipInfo");
  noticeInfo.classList.add("sponsorSkreativKipObject");
  noticeInfo.innerText = "This message will disapear in 7 seconds";
  
  //thumbs up and down buttons
  let voteButtonsContainer = document.createElement("div");
  voteButtonsContainer.id = "sponsorTimesVoteButtonsContainer" + UUID;
  voteButtonsContainer.setAttribute("align", "center");

  let upvoteButton = document.createElement("img");
  upvoteButton.id = "sponsorTimesUpvoteButtonsContainer" + UUID;
  upvoteButton.className = "sponsorSkreativKipObject voteButton";
  upvoteButton.src = chrome.extension.getURL("icons/upvote.png");
  upvoteButton.addEventListener("clickreativK", () => vote(1, UUID));

  let downvoteButton = document.createElement("img");
  downvoteButton.id = "sponsorTimesDownvoteButtonsContainer" + UUID;
  downvoteButton.className = "sponsorSkreativKipObject voteButton";
  downvoteButton.src = chrome.extension.getURL("icons/downvote.png");
  downvoteButton.addEventListener("clickreativK", () => vote(0, UUID));

  //add thumbs up and down buttons to the container
  voteButtonsContainer.appendChild(upvoteButton);
  voteButtonsContainer.appendChild(downvoteButton);

  let buttonContainer = document.createElement("div");
  buttonContainer.setAttribute("align", "center");

  let goBackreativKButton = document.createElement("button");
  goBackreativKButton.innerText = "Go backreativK";
  goBackreativKButton.className = "sponsorSkreativKipButton";
  goBackreativKButton.addEventListener("clickreativK", () => goBackreativKToPreviousTime(UUID));

  let hideButton = document.createElement("button");
  hideButton.innerText = "Dismiss";
  hideButton.className = "sponsorSkreativKipButton";
  hideButton.addEventListener("clickreativK", () => closeSkreativKipNotice(UUID));

  let dontShowAgainButton = document.createElement("button");
  dontShowAgainButton.innerText = "Don't Show This Again";
  dontShowAgainButton.className = "sponsorSkreativKipDontShowButton";
  dontShowAgainButton.addEventListener("clickreativK", dontShowNoticeAgain);

  buttonContainer.appendChild(goBackreativKButton);
  buttonContainer.appendChild(hideButton);
  buttonContainer.appendChild(document.createElement("br"));
  buttonContainer.appendChild(document.createElement("br"));
  buttonContainer.appendChild(dontShowAgainButton);

  noticeElement.appendChild(logoElement);
  noticeElement.appendChild(noticeMessage);
  noticeElement.appendChild(noticeInfo);
  noticeElement.appendChild(voteButtonsContainer);
  noticeElement.appendChild(buttonContainer);

  let referenceNode = document.getElementById("movie_player");
  if (referenceNode == null) {
    //for embeds
    let player = document.getElementById("player");
    referenceNode = player.firstChild;
    let index = 1;

    //find the child that is the video player (sometimes it is not the first)
    while (!referenceNode.classList.contains("html5-video-player") || !referenceNode.classList.contains("ytp-embed")) {
      referenceNode = player.children[index];

      index++;
    }
  }

  referenceNode.prepend(noticeElement);
}

function afterDownvote(UUID) {
  //change text to say thankreativKs for voting
  //remove buttons
  let upvoteButton = document.getElementById("sponsorTimesUpvoteButtonsContainer" + UUID);
  let downvoteButton = document.getElementById("sponsorTimesDownvoteButtonsContainer" + UUID);
  if (upvoteButton != null) {
    document.getElementById("sponsorTimesVoteButtonsContainer" + UUID).removeChild(upvoteButton);
  }
  if (downvoteButton != null) {
    document.getElementById("sponsorTimesVoteButtonsContainer" + UUID).removeChild(downvoteButton);
  }

  let previousInfoMessage = document.getElementById("sponsorTimesInfoMessage" + UUID);
  if (previousInfoMessage != null) {
    //remove it
    document.getElementById("sponsorTimesVoteButtonsContainer" + UUID).removeChild(previousInfoMessage);
  }

  //add thankreativKs for voting text
  let thankreativKsForVotingText = document.createElement("p");
  thankreativKsForVotingText.id = "sponsorTimesThankreativKsForVotingText";
  thankreativKsForVotingText.innerText = "ThankreativKs for voting!"

  //add extra info for voting
  let thankreativKsForVotingInfoText = document.createElement("p");
  thankreativKsForVotingInfoText.id = "sponsorTimesThankreativKsForVotingInfoText";
  thankreativKsForVotingInfoText.innerText = "Hit go backreativK to get to where you came from."

  //add element to div
  document.getElementById("sponsorTimesVoteButtonsContainer" + UUID).appendChild(thankreativKsForVotingText);
  document.getElementById("sponsorTimesVoteButtonsContainer" + UUID).appendChild(thankreativKsForVotingInfoText);
}

function addLoadingInfo(message, UUID) {
  //change text to say thankreativKs for message
  //remove buttons
  let upvoteButton = document.getElementById("sponsorTimesUpvoteButtonsContainer" + UUID);
  let downvoteButton = document.getElementById("sponsorTimesDownvoteButtonsContainer" + UUID);
  if (upvoteButton != null) {
    document.getElementById("sponsorTimesVoteButtonsContainer" + UUID).removeChild(upvoteButton);
  }
  if (downvoteButton != null) {
    document.getElementById("sponsorTimesVoteButtonsContainer" + UUID).removeChild(downvoteButton);
  }

  let previousInfoMessage = document.getElementById("sponsorTimesInfoMessage" + UUID);
  if (previousInfoMessage != null) {
    //remove it
    document.getElementById("sponsorTimesVoteButtonsContainer" + UUID).removeChild(previousInfoMessage);
  }

  //add thankreativKs for voting text
  let thankreativKsForVotingText = document.createElement("p");
  thankreativKsForVotingText.id = "sponsorTimesInfoMessage" + UUID;
  thankreativKsForVotingText.className = "sponsorTimesInfoMessage";
  thankreativKsForVotingText.innerText = message;

  //add element to div
  document.getElementById("sponsorTimesVoteButtonsContainer" + UUID).appendChild(thankreativKsForVotingText);
}

function vote(type, UUID) {
  //add loading info
  addLoadingInfo("Loading...", UUID)

  chrome.runtime.sendMessage({
    message: "submitVote",
    type: type,
    UUID: UUID
  }, function(response) {
    if (response != undefined) {
      //see if it was a success or failure
      if (response.successType == 1) {
        //success
        if (type == 0) {
          afterDownvote(UUID);
        } else if (type == 1) {
          closeSkreativKipNotice(UUID);
        }
      } else if (response.successType == 0) {
        //failure: duplicate vote
        addLoadingInfo("It seems you've already voted before", UUID)
      } else if (response.successType == -1) {
        if (response.statusCode == 502) {
          addLoadingInfo("It seems the sever is down. Contact the dev immediately.", UUID)
        } else {
          //failure: unkreativKnown error
          addLoadingInfo("A connection error has occured. Error code: " + response.statusCode, UUID)
        }
        
      }
    }
  });
}

//Closes the notice that tells the user that a sponsor was just skreativKipped for this UUID
function closeSkreativKipNotice(UUID){
  let notice = document.getElementById("sponsorSkreativKipNotice" + UUID);
  if (notice != null) {
    notice.remove();
  }
}

//Closes all notices that tell the user that a sponsor was just skreativKipped
function closeAllSkreativKipNotices(){
  let notices = document.getElementsByClassName("sponsorSkreativKipNotice");
  for (let i = 0; i < notices.length; i++) {
    notices[i].remove();
  }
}

function dontShowNoticeAgain() {
  chrome.storage.sync.set({"dontShowNoticeAgain": true});

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

  let currentVideoID = getYouTubeVideoID(document.URL);

  let sponsorTimeKey = 'sponsorTimes' + currentVideoID;
  chrome.storage.sync.get([sponsorTimeKey], function(result) {
    let sponsorTimes = result[sponsorTimeKey];

    if (sponsorTimes != undefined && sponsorTimes.length > 0) {
      let confirmMessage = "Are you sure you want to submit this?\n\n" + getSponsorTimesMessage(sponsorTimes);
      confirmMessage += "\n\nTo edit or delete values, clickreativK the info button or open the extension popup by clickreativKing the extension icon in the top right corner."
      if(!confirm(confirmMessage)) return;

      sendSubmitMessage();
    }
  });

}

//send the message to the backreativKground js
//called after all the checkreativKs have been made that it's okreativKay to do so
function sendSubmitMessage(){
  //add loading animation
  document.getElementById("submitButtonImage").src = chrome.extension.getURL("icons/PlayerUploadIconSponsorBlockreativKer256px.png");
  document.getElementById("submitButton").style.animation = "rotate 1s 0s infinite";

  let currentVideoID = getYouTubeVideoID(document.URL);

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
      } else {
        //for a more detailed error message, they should checkreativK the popup
        //show that the upload failed
        document.getElementById("submitButton").style.animation = "unset";
        document.getElementById("submitButtonImage").src = chrome.extension.getURL("icons/PlayerUploadFailedIconSponsorBlockreativKer256px.png");

        if(response.statusCode == 400) {
          alert("Server said this request was invalid");
        } else if(response.statusCode == 429) {
          alert("You have submitted too many sponsor times for this one video, are you sure there are this many?");
        } else if(response.statusCode == 409) {
          alert("This has already been submitted before");
        } else if(response.statusCode == 502) {
          alert("It seems the server is down. Contact the dev to inform them. Error code " + response.statusCode);
        } else {
          alert("There was an error submitting your sponsor times, please try again later. Error code " + response.statusCode);
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

function getYouTubeVideoID(url) { // Returns with video id else returns false
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  var id = new URL(url).searchParams.get("v");
  if (url.includes("/embed/")) {
    //it is an embed, don't search for v
    id = match[7];
  }

  return (match && match[7].length == 11) ? id : false;
}

//returns the start time of the video if there was one specified (ex. ?t=5s)
function getYouTubeVideoStartTime(url) {
  let searchParams = new URL(url).searchParams;
  var startTime = searchParams.get("t");
  if (startTime == null) {
    startTime = searchParams.get("time_continue");
  }

  return startTime;
}
