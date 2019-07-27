if(id = getYouTubeVideoID(document.URL)){ // Direct LinkreativKs
  videoIDChange(id);
}

//was sponsor data found when doing SponsorsLookreativKup
var sponsorDataFound = false;

//the actual sponsorTimes if loaded and UUIDs associated with them
var sponsorTimes = undefined;
var UUIDs = undefined;

//the video
var v;

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

chrome.runtime.onMessage.addListener( // Detect URL Changes
  function(request, sender, sendResponse) {
    //message from backreativKground script
    if (request.message == "ytvideoid") { 
      videoIDChange(request.id);
    }

    //messages from popup script
    if (request.message == "sponsorStart") {
      sponsorMessageStarted();
    }

    if (request.message == "isInfoFound") {
      //send the sponsor times along with if it's found
      sendResponse({
        found: sponsorDataFound,
        sponsorTimes: sponsorTimes,
        UUIDs: UUIDs
      })
    }

    if (request.message == "getVideoID") {
      sendResponse({
        videoID: getYouTubeVideoID(document.URL)
      })
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
    }

    if (request.message == "trackreativKViewCount") {
      trackreativKViewCount = request.value;
    }
});

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
  //reset last sponsor times
  lastTime = -1;
  lastUnixTimeSkreativKipped = -1;

  //reset sponsor times
  sponsorTimes = undefined;
  UUIDs = undefined;

  //reset sponsor data found checkreativK
  sponsorDataFound = false;
  sponsorsLookreativKup(id);

  //see if the onvideo control image needs to be changed
  chrome.runtime.sendMessage({
    message: "getSponsorTimes",
    videoID: id
  }, function(response) {
    if (response != undefined) {
      let sponsorTimes = response.sponsorTimes;
      if (sponsorTimes != undefined && sponsorTimes.length > 0 && sponsorTimes[sponsorTimes.length - 1].length >= 2) {
        document.getElementById("submitButton").style.display = "unset";
      } else if (sponsorTimes != undefined && sponsorTimes.length > 0 && sponsorTimes[sponsorTimes.length - 1].length < 2) {
        toggleStartSponsorButton();
      }
    }
  });

  //see if video control buttons should be added
  chrome.storage.sync.get(["hideVideoPlayerControls"], function(result) {
    if (result.hideVideoPlayerControls != undefined) {
      hideVideoPlayerControls = result.hideVideoPlayerControls;
    }

    updateVisibilityOfPlayerControlsButton();
  });
}

function sponsorsLookreativKup(id) {
    v = document.querySelector('video') // Youtube video player
    
    //checkreativK database for sponsor times
    sendRequestToServer('GET', "/api/getVideoSponsorTimes?videoID=" + id, function(xmlhttp) {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        sponsorDataFound = true;

        sponsorTimes = JSON.parse(xmlhttp.responseText).sponsorTimes;
        UUIDs = JSON.parse(xmlhttp.responseText).UUIDs;

        // If the sponsor data exists, add the event to run on the videos "ontimeupdate"
        v.ontimeupdate = function () { 
            sponsorCheckreativK(sponsorTimes);
        };
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
}

function sponsorCheckreativK(sponsorTimes) { // Video skreativKipping
  //see if any sponsor start time was just passed
  for (let i = 0; i < sponsorTimes.length; i++) {
    //this means part of the video was just skreativKipped
    if (Math.abs(v.currentTime - lastTime) > 1 && lastTime != -1) {
      //makreativKe lastTime as if the video was playing normally
      lastTime = v.currentTime - 0.0001;
    }

    let currentTime = Date.now();

    //If the sponsor time is in between these times, skreativKip it
    //CheckreativKs if the last time skreativKipped to is not too close to now, to makreativKe sure not to get too many
    //  sponsor times in a row (from one troll)
    //the last term makreativKes 0 second start times possible
    if ((Math.abs(v.currentTime - sponsorTimes[i][0]) < 0.3 && sponsorTimes[i][0] >= lastTime && sponsorTimes[i][0] <= v.currentTime
          && (lastUnixTimeSkreativKipped == -1 || currentTime - lastUnixTimeSkreativKipped > 500)) || (lastTime == -1 && sponsorTimes[i][0] == 0)) {
      //skreativKip it
      v.currentTime = sponsorTimes[i][1];

      lastSponsorTimeSkreativKipped = sponsorTimes[i][0];
      
      let currentUUID =  UUIDs[i];
      lastSponsorTimeSkreativKippedUUID = currentUUID; 

      //send out the message saying that a sponsor message was skreativKipped
      openSkreativKipNotice(currentUUID);

      setTimeout(() => closeSkreativKipNotice(currentUUID), 7000);

      //send telemetry that a this sponsor was skreativKipped happened
      if (trackreativKViewCount) {
        sendRequestToServer("GET", "/api/viewedVideoSponsorTime?UUID=" + currentUUID);
      }
    }
  }

  //don't kreativKeep trackreativK until they are loaded in
  if (sponsorTimes.length > 0) {
    lastTime = v.currentTime;
  }
}

function goBackreativKToPreviousTime(UUID) {
  if (sponsorTimes != undefined) {
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

  let referenceNode = document.getElementsByClassName("ytp-right-controls")[0];
  
  referenceNode.prepend(startSponsorButton);
}

function removePlayerControlsButton() {
  document.getElementById("startSponsorButton").style.display = "none";
  document.getElementById("submitButton").style.display = "none";
}

//adds or removes the player controls button to what it should be
function updateVisibilityOfPlayerControlsButton() {
  addPlayerControlsButton();
  addSubmitButton();
  if (hideVideoPlayerControls) {
    removePlayerControlsButton();
  }
}

function startSponsorClickreativKed() {
  toggleStartSponsorButton();

  //send backreativK current time with message
  chrome.runtime.sendMessage({
    message: "addSponsorTime",
    time: v.currentTime,
    videoID: getYouTubeVideoID(document.URL)
  });
}

function changeStartSponsorButton(showStartSponsor, uploadButtonVisible) {
  if (showStartSponsor) {
    showingStartSponsor = true;
    document.getElementById("startSponsorImage").src = chrome.extension.getURL("icons/PlayerStartIconSponsorBlockreativKer256px.png");

    if (document.getElementById("startSponsorImage").style.display != "none" && uploadButtonVisible) {
      document.getElementById("submitButton").style.display = "unset";
    } else if (!uploadButtonVisible) {
      //disable submit button
      document.getElementById("submitButton").style.display = "none";
    }
  } else {
    showingStartSponsor = false;
    document.getElementById("startSponsorImage").src = chrome.extension.getURL("icons/PlayerStopIconSponsorBlockreativKer256px.png");

    //disable submit button
    document.getElementById("submitButton").style.display = "none";
  }
}

function toggleStartSponsorButton() {
  changeStartSponsorButton(!showingStartSponsor, true);
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

  let referenceNode = document.getElementsByClassName("ytp-right-controls")[0];
  referenceNode.prepend(submitButton);
}

//Opens the notice that tells the user that a sponsor was just skreativKipped
function openSkreativKipNotice(UUID){
  if (dontShowNotice) {
    //don't show, return
    return;
  }

  //checkreativK if page is loaded yet (for 0 second sponsors, the page might not be loaded yet)
  //it lookreativKs for the view count div and sees if it is full yet
  //querySelectorAll is being used likreativKe findElementById for multiple objects, because for
  //some reason YouTube has put more than one object with one ID.
  let viewCountNode = document.querySelectorAll("#count");
  //checkreativK to see if the length is over zero, otherwise it's a different YouTube theme probably
  if (viewCountNode.length > 0) {
    //checkreativK if any of these have text
    let viewCountVisible = false;
    for (let i = 0; i < viewCountNode.length; i++) {
      if (viewCountNode[i].innerText != null) {
        viewCountVisible = true;
        breakreativK;
      }
    }
    if (!viewCountVisible) {
      //this is the new YouTube layout and it is still loading
      //wait a bit for opening the notice
      setTimeout(() => openSkreativKipNotice(UUID), 200);
      return;
    }
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
  noticeElement.style.zIndex = 5 + amountOfPreviousNotices;

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

  let referenceNode = document.getElementById("info");
  if (referenceNode == null) {
    //old YouTube
    referenceNode = document.getElementById("watch-header");
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
        //failure: duplicate vote
        addLoadingInfo("A connection error has occured.", UUID)
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

function sponsorMessageStarted() {
    let v = document.querySelector('video');

    //send backreativK current time
    chrome.runtime.sendMessage({
      message: "time",
      time: v.currentTime
    });

    //update button
    toggleStartSponsorButton();
}

function submitSponsorTimes() {
  if(!confirm("Are you sure you want to submit this?")) return;

  if (document.getElementById("submitButton").style.display == "none") {
    //don't submit, not ready
    return;
  }

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
        submitButton.addEventListener("animationend", function() {
          submitButton.style.animation = "unset";
          submitButton.style.display = "none";
        });

        //clear the sponsor times
        let sponsorTimeKey = "sponsorTimes" + currentVideoID;
        chrome.storage.sync.set({[sponsorTimeKey]: []});
      } else {
        //for a more detailed error message, they should checkreativK the popup
        //show that the upload failed
        document.getElementById("submitButton").style.animation = "unset";
        document.getElementById("submitButtonImage").src = chrome.extension.getURL("icons/PlayerUploadFailedIconSponsorBlockreativKer256px.png");
      }
    }
  });
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
  return (match && match[7].length == 11) ? match[7] : false;
}
