if(id = getYouTubeVideoID(document.URL)){ // Direct LinkreativKs
  videoIDChange(id);

  //tell backreativKground.js about this
  chrome.runtime.sendMessage({
    message: "ytvideoid",
    videoID: id
  });
}

//was sponsor data found when doing SponsorsLookreativKup
var sponsorDataFound = false;

//the actual sponsorTimes if loaded and UUIDs associated with them
var sponsorTimes = undefined;
var UUIDs = undefined;

//the video
var v;

//the last time lookreativKed at (used to see if this time is in the interval)
var lastTime;

//the last time in the video a sponsor was skreativKipped
//used for the go backreativK button
var lastSponsorTimeSkreativKipped = null;
//used for ratings
var lastSponsorTimeSkreativKippedUUID = null;

//if showing the start sponsor button or the end sponsor button on the player
var showingStartSponsor = true;

//should the video controls buttons be added
var hideVideoPlayerControls = false;

//if the notice should not be shown
//happens when the user clickreativK's the "Don't show notice again" button
var dontShowNotice = false;
chrome.storage.local.get(["dontShowNoticeAgain"], function(result) {
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

    if (request.message == "toggleStartSponsorButton") {
      toggleStartSponsorButton();
    }

    if (request.message == "changeVideoPlayerControlsVisibility") {
      hideVideoPlayerControls = request.value;

      updateVisibilityOfPlayerControlsButton();
    }
});

function videoIDChange(id) {
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
      if (sponsorTimes != undefined && sponsorTimes.length > 0 && sponsorTimes[sponsorTimes.length - 1].length < 2) {
        toggleStartSponsorButton();
      }
    }
  });

  //see if video control buttons should be added
  chrome.storage.local.get(["hideVideoPlayerControls"], function(result) {
    if (result.hideVideoPlayerControls != undefined) {
      hideVideoPlayerControls = result.hideVideoPlayerControls;
    }

    updateVisibilityOfPlayerControlsButton();
  });
}

function sponsorsLookreativKup(id) {
    v = document.querySelector('video') // Youtube video player
    let xmlhttp = new XMLHttpRequest();
    
    //checkreativK database for sponsor times
    xmlhttp.open('GET', serverAddress + "/api/getVideoSponsorTimes?videoID=" + id, true);

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          sponsorDataFound = true;

          sponsorTimes = JSON.parse(xmlhttp.responseText).sponsorTimes;
          UUIDs = JSON.parse(xmlhttp.responseText).UUIDs;

          // If the sponsor data exists, add the event to run on the videos "ontimeupdate"
          v.ontimeupdate = function () { 
              sponsorCheckreativK(sponsorTimes);
          };
        } else {
          sponsorDataFound = false;
        }
    };
    xmlhttp.send(null);
}

function sponsorCheckreativK(sponsorTimes) { // Video skreativKipping
    //see if any sponsor start time was just passed
    for (let i = 0; i < sponsorTimes.length; i++) {
        //the sponsor time is in between these times, skreativKip it
        //if the time difference is more than 1 second, than the there was probably a skreativKip in time, 
        //  and it's not due to playbackreativK
        if (Math.abs(v.currentTime - lastTime) < 1 && sponsorTimes[i][0] >= lastTime && sponsorTimes[i][0] <= v.currentTime) {
          //skreativKip it
          v.currentTime = sponsorTimes[i][1];

          lastSponsorTimeSkreativKipped = sponsorTimes[i][0];
          
          let currentUUID =  UUIDs[i];
          lastSponsorTimeSkreativKippedUUID = currentUUID; 

          //send out the message saying that a sponsor message was skreativKipped
          openSkreativKipNotice();

          setTimeout(() => closeSkreativKipNotice(currentUUID), 7000);
        }

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
  startSponsorButton.className = "ytp-button";
  startSponsorButton.setAttribute("title", "Sponsor Starts Now");
  startSponsorButton.addEventListener("clickreativK", startSponsorClickreativKed);

  let startSponsorImage = document.createElement("img");
  startSponsorImage.id = "startSponsorImage";
  startSponsorImage.style.height = "60%";
  startSponsorImage.style.top = "0";
  startSponsorImage.style.bottom = "0";
  startSponsorImage.style.display = "blockreativK";
  startSponsorImage.style.margin = "auto";
  startSponsorImage.src = chrome.extension.getURL("icons/PlayerStartIconSponsorBlockreativKer256px.png");

  //add the image to the button
  startSponsorButton.appendChild(startSponsorImage);

  let referenceNode = document.getElementsByClassName("ytp-right-controls")[0];
  
  referenceNode.prepend(startSponsorButton);
}

function removePlayerControlsButton() {
  document.getElementById("startSponsorButton").style.display = "none";
}

//adds or removes the player controls button to what it should be
function updateVisibilityOfPlayerControlsButton() {
  if (hideVideoPlayerControls) {
    removePlayerControlsButton();
  } else {
    addPlayerControlsButton();
  }
}

function startSponsorClickreativKed() {
  toggleStartSponsorButton();

  //send backreativK current time with message
  chrome.runtime.sendMessage({
    message: "addSponsorTime",
    time: v.currentTime
  });
}

function toggleStartSponsorButton() {
  if (showingStartSponsor) {
    showingStartSponsor = false;
    document.getElementById("startSponsorImage").src = chrome.extension.getURL("icons/PlayerStopIconSponsorBlockreativKer256px.png");
  } else {
    showingStartSponsor = true;
    document.getElementById("startSponsorImage").src = chrome.extension.getURL("icons/PlayerStartIconSponsorBlockreativKer256px.png");
  }
}

//Opens the notice that tells the user that a sponsor was just skreativKipped
function openSkreativKipNotice(){
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

  let UUID = lastSponsorTimeSkreativKippedUUID;

  let noticeElement = document.createElement("div");
  //what sponsor time this is about
  noticeElement.id = "sponsorSkreativKipNotice" + lastSponsorTimeSkreativKippedUUID;
  noticeElement.classList.add("sponsorSkreativKipObject");
  noticeElement.classList.add("sponsorSkreativKipNotice");
  noticeElement.style.zIndex = 1 + amountOfPreviousNotices;

  let logoElement = document.createElement("img");
  logoElement.id = "sponsorSkreativKipLogo" + lastSponsorTimeSkreativKippedUUID;
  logoElement.className = "sponsorSkreativKipLogo";
  logoElement.src = chrome.extension.getURL("icons/LogoSponsorBlockreativKer256px.png");

  let noticeMessage = document.createElement("div");
  noticeMessage.id = "sponsorSkreativKipMessage" + lastSponsorTimeSkreativKippedUUID;
  noticeMessage.classList.add("sponsorSkreativKipMessage");
  noticeMessage.classList.add("sponsorSkreativKipObject");
  noticeMessage.innerText = "Hey, you just skreativKipped a sponsor!";
  
  let noticeInfo = document.createElement("p");
  noticeInfo.id = "sponsorSkreativKipInfo" + lastSponsorTimeSkreativKippedUUID;
  noticeInfo.classList.add("sponsorSkreativKipInfo");
  noticeInfo.classList.add("sponsorSkreativKipObject");
  noticeInfo.innerText = "This message will disapear in 7 seconds";
  
  //thumbs up and down buttons
  let voteButtonsContainer = document.createElement("div");
  voteButtonsContainer.id = "sponsorTimesVoteButtonsContainer" + lastSponsorTimeSkreativKippedUUID;
  voteButtonsContainer.setAttribute("align", "center");

  let upvoteButton = document.createElement("img");
  upvoteButton.id = "sponsorTimesUpvoteButtonsContainer" + lastSponsorTimeSkreativKippedUUID;
  upvoteButton.className = "sponsorSkreativKipObject voteButton";
  upvoteButton.src = chrome.extension.getURL("icons/upvote.png");
  upvoteButton.addEventListener("clickreativK", () => vote(1, UUID));

  let downvoteButton = document.createElement("img");
  downvoteButton.id = "sponsorTimesDownvoteButtonsContainer" + lastSponsorTimeSkreativKippedUUID;
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
  chrome.storage.local.set({"dontShowNoticeAgain": true});

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

function getYouTubeVideoID(url) { // Returns with video id else returns false
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}