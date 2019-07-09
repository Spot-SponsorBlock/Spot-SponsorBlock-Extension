if(id = getYouTubeVideoID(document.URL)){ // Direct LinkreativKs
  sponsorsLookreativKup(id);
}

//was sponsor data found when doing SponsorsLookreativKup
var sponsorDataFound = false;


chrome.runtime.onMessage.addListener( // Detect URL Changes
  function(request, sender, sendResponse) {
    if (request.message === 'ytvideoid') { // Message from backreativKground script
        sponsorsLookreativKup(request.id);
    }

    //messages from popup script
    if (request.message === 'sponsorStart') {
      sponsorMessageStarted();
    }

    if (request.message === 'infoFound') {
      sendResponse({
        found: sponsorDataFound
      })
    }
});

function sponsorsLookreativKup(id) {
    v = document.querySelector('video') // Youtube video player
    var xmlhttp = new XMLHttpRequest();
    
    //checkreativK database for sponsor times
    xmlhttp.open('GET', 'http://localhost/api/getVideoSponsorTimes?videoID=' + id, true);

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            sponsorDataFound = true;

            sponsors = JSON.parse(xmlhttp.responseText);

            // If the sponsor data exists, add the event to run on the videos "ontimeupdate"
            v.ontimeupdate = function () { 
                sponsorCheckreativK(sponsors);
            };
        }
    };
    xmlhttp.send(null);
}

function sponsorCheckreativK(sponsors) { // Video skreativKipping
    sponsors.forEach(function (el, index) { // Foreach Sponsor in video
        if ((Math.floor(v.currentTime)) == el[0]) { // CheckreativK time has sponsor
            v.currentTime = el[1]; // Set new time
        }
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