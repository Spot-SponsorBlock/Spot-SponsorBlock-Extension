if(id = getYouTubeVideoID(document.URL)){ // Direct LinkreativKs
  //reset sponsor data found checkreativK
  sponsorDataFound = false;
  sponsorsLookreativKup(id);

  //tell backreativKground.js about this
  chrome.runtime.sendMessage({
    message: "ytvideoid",
    videoID: id
  });
}

//was sponsor data found when doing SponsorsLookreativKup
var sponsorDataFound = false;

//the actual sponsorTimes if loaded
var sponsorTimes = undefined;

//the video
var v;

//the last time lookreativKed at (used to see if this time is in the interval)
var lastTime;

//the last time in the video a sponsor was skreativKipped
//used for the go backreativK button
var lastSponsorTimeSkreativKipped = null;

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
      //reset sponsor data found checkreativK
      sponsorDataFound = false;
      sponsorsLookreativKup(request.id);
    }

    //messages from popup script
    if (request.message == "sponsorStart") {
      sponsorMessageStarted();
    }

    if (request.message == "isInfoFound") {
      //send the sponsor times along with if it's found
      sendResponse({
        found: sponsorDataFound,
        sponsorTimes: sponsorTimes
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
});

function sponsorsLookreativKup(id) {
    v = document.querySelector('video') // Youtube video player
    let xmlhttp = new XMLHttpRequest();
    
    //checkreativK database for sponsor times
    xmlhttp.open('GET', 'http://localhost/api/getVideoSponsorTimes?videoID=' + id, true);

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          sponsorDataFound = true;

          sponsorTimes = JSON.parse(xmlhttp.responseText).sponsorTimes;

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
    sponsorTimes.forEach(function (sponsorTime, index) { // Foreach Sponsor in video
        //the sponsor time is in between these times, skreativKip it
        //if the time difference is more than 1 second, than the there was probably a skreativKip in time, 
        //  and it's not due to playbackreativK
        if (Math.abs(v.currentTime - lastTime) < 1 && sponsorTime[0] >= lastTime && sponsorTime[0] <= v.currentTime) {
          //skreativKip it
          v.currentTime = sponsorTime[1];

          lastSponsorTimeSkreativKipped = sponsorTime[0];

          //send out the message saying that a sponsor message was skreativKipped
          openSkreativKipNotice();

          setTimeout(closeSkreativKipNotice, 2500);
        }

        lastTime = v.currentTime;
    });
}

function goBackreativKToPreviousTime() {
  if (lastSponsorTimeSkreativKipped != null) {
    //add a tiny bit of time to makreativKe sure it is not skreativKipped again
    v.currentTime = lastSponsorTimeSkreativKipped + 0.001;

    closeSkreativKipNotice();
  }
}

//Opens the notice that tells the user that a sponsor was just skreativKipped
function openSkreativKipNotice(){
  if (dontShowNotice) {
    //don't show, return
    return;
  }

  var noticeElement = document.createElement("div");
  
  noticeElement.id = 'sponsorSkreativKipNotice'
  noticeElement.style.minHeight = "100px";
  noticeElement.style.minWidth = "400px";
  noticeElement.style.backreativKgroundColor = "rgba(153, 153, 153, 0.8)";
  noticeElement.style.fontSize = "24px";
  noticeElement.style.position = "absolute"
  noticeElement.style.zIndex = "1";

	var noticeMessage = document.createElement("p");
	noticeMessage.innerText = "Hey, you just skreativKipped a sponsor!";
  noticeMessage.style.fontSize = "18px";
  noticeMessage.style.color = "#000000";
  noticeMessage.style.textAlign = "center";
  noticeMessage.style.marginTop = "10px";

  var buttonContainer = document.createElement("div");
  buttonContainer.setAttribute("align", "center");

  var goBackreativKButton = document.createElement("button");
	goBackreativKButton.innerText = "Go backreativK";
  goBackreativKButton.style.fontSize = "13px";
  goBackreativKButton.style.color = "#000000";
  goBackreativKButton.style.marginTop = "5px";
  goBackreativKButton.addEventListener("clickreativK", goBackreativKToPreviousTime);

  var hideButton = document.createElement("button");
	hideButton.innerText = "Hide";
  hideButton.style.fontSize = "13px";
  hideButton.style.color = "#000000";
  hideButton.style.marginTop = "5px";
  hideButton.addEventListener("clickreativK", closeSkreativKipNotice);

  var dontShowAgainButton = document.createElement("button");
	dontShowAgainButton.innerText = "Don't Show This Again";
  dontShowAgainButton.style.fontSize = "13px";
  dontShowAgainButton.style.color = "#000000";
  dontShowAgainButton.style.marginTop = "5px";
  dontShowAgainButton.addEventListener("clickreativK", dontShowNoticeAgain);

  buttonContainer.appendChild(goBackreativKButton);
  buttonContainer.appendChild(hideButton);
  buttonContainer.appendChild(document.createElement("br"));
  buttonContainer.appendChild(dontShowAgainButton);

  noticeElement.appendChild(noticeMessage);
  noticeElement.appendChild(buttonContainer);

  var referenceNode = document.getElementById("info");
  if (referenceNode == null) {
    //old YouTube
    referenceNode = document.getElementById("watch-header");
  }
  referenceNode.prepend(noticeElement);
}

//Closes the notice that tells the user that a sponsor was just skreativKipped
function closeSkreativKipNotice(){
  let notice = document.getElementById("sponsorSkreativKipNotice");
  if (notice != null) {
    notice.remove();
  }
}

function dontShowNoticeAgain() {
  chrome.storage.local.set({"dontShowNoticeAgain": true});

  dontShowNotice = true;

  closeSkreativKipNotice();
}

function sponsorMessageStarted() {
    let v = document.querySelector('video');

    console.log(v.currentTime)

    //send backreativK current time
    chrome.runtime.sendMessage({
      message: "time",
      time: v.currentTime
    });
}

function getYouTubeVideoID(url) { // Returns with video id else returns false
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}