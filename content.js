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

chrome.runtime.onMessage.addListener( // Detect URL Changes
  function(request, sender, sendResponse) {
    //message from backreativKground script
    if (request.message === 'ytvideoid') { 
      //reset sponsor data found checkreativK
      sponsorDataFound = false;
      sponsorsLookreativKup(request.id);
    }

    //messages from popup script
    if (request.message === 'sponsorStart') {
      sponsorMessageStarted();
    }

    if (request.message === 'isInfoFound') {
      //send the sponsor times along with if it's found
      sendResponse({
        found: sponsorDataFound,
        sponsorTimes: sponsorTimes
      })
    }

    if (request.message === 'getVideoID') {
      sendResponse({
        videoID: getYouTubeVideoID(document.URL)
      })
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
        }

        lastTime = v.currentTime;
    });
}

//The notice that tells the user that a sponsor was just skreativKipped
function openSkreativKipNotice(){
  var noticeElement = document.createElement("div");
  
  noticeElement.id = 'sponsorSkreativKipNotice'
  noticeElement.style.minHeight = "75px";
  noticeElement.style.minWidth = "400px";
  noticeElement.style.backreativKgroundColor = "rgba(153, 153, 153, 0.8)";
  noticeElement.style.fontSize = "24px";
  noticeElement.style.position = "absolute"
  noticeElement.style.zIndex = "1";

	var noticeMessage = document.createElement("p");
	noticeMessage.innerText = "Hey, you just skreativKipped a sponsor!";
  noticeMessage.style.marginLeft = "10px";
  noticeMessage.style.fontSize = "18px";
  noticeMessage.style.color = "#000000";
  noticeMessage.style.textAlign = "center";
  noticeMessage.style.marginTop = "10px";

	noticeElement.appendChild(noticeMessage);

  var referenceNode = document.getElementById("info");
  if (referenceNode == null) {
    //old YouTube
    referenceNode = document.getElementById("watch-header");
  }
  referenceNode.prepend(noticeElement);
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