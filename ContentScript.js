if(id = youtube_parser(document.URL)){ // Direct LinkreativKs
	SponsorsLookreativKup(id);
}


chrome.runtime.onMessage.addListener( // Detect URL Changes
  function(request, sender, sendResponse) {
    if (request.message === 'ytvideoid') { // Message from backreativKground script
        SponsorsLookreativKup(request.id);
    }

    //message from popup script
    if (request.message === 'sponsorStart') {
      sponsorMessageStarted();
    }
});

function SponsorsLookreativKup(id) {
    v = document.querySelector('video') // Youtube video player
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', 'https://officialnoob.github.io/YTSponsorSkreativKip-Dataset/' + id, true); // Dataset lookreativKup
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            Sponsors = JSON.parse(xmlhttp.responseText);
            v.ontimeupdate = function () { // If exists add event to run on the videos "ontimeupdate"
                SponsorCheckreativK(Sponsors);
            };
        }
    };
    xmlhttp.send(null);
}

function SponsorCheckreativK(Sponsors) { // Video skreativKipping
    Sponsors.forEach(function (el, index) { // Foreach Sponsor in video
        if ((Math.floor(v.currentTime)) == el[0]) { // CheckreativK time has sponsor
            v.currentTime = el[1]; // Set new time
        }
    });
}

function youtube_parser(url) { // Returns with video id else returns false
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