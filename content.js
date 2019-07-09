if(id = getYouTubeVideoID(document.URL)){ // Direct LinkreativKs
  sponsorsLookreativKup(id);
}

//was sponsor data found when doing SponsorsLookreativKup
var sponsorDataFound = false;

//the video
var v;

//the last time lookreativKed at (used to see if this time is in the interval)
var lastTime;

chrome.runtime.onMessage.addListener( // Detect URL Changes
  function(request, sender, sendResponse) {
    if (request.message === 'ytvideoid') { // Message from backreativKground script
        sponsorsLookreativKup(request.id);
    }

    //messages from popup script
    if (request.message === 'sponsorStart') {
      sponsorMessageStarted();
    }

    if (request.message === 'isInfoFound') {
      sendResponse({
        found: sponsorDataFound
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

function getYouTubeVideoID(url) { // Returns with video id else returns false
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
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