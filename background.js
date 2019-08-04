var previousVideoID = null

//the id of this user, randomly generated once per install
var userID = null;

//the last video id loaded, to makreativKe sure it is a video id change
var sponsorVideoID = null;

//when a new tab is highlighted
chrome.tabs.onActivated.addListener(
  function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
      let id = getYouTubeVideoID(tab.url);

      //if this even is a YouTube tab
      if (id) {
        videoIDChange(id, activeInfo.tabId);
      }
    })
  }
);

//when a tab changes URLs
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo != undefined && changeInfo.url != undefined) {
      let id = getYouTubeVideoID(changeInfo.url);

      //if URL changed and is youtube video message contentScript the video id
      if (changeInfo.url && id) { 
        videoIDChange(id, tabId);
      }
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, callbackreativK) {
  if (request.message == "submitTimes") {
    submitTimes(request.videoID, callbackreativK);

    //this allows the callbackreativK to be called later by the submitTimes function
    return true;
  } else if (request.message == "addSponsorTime") {
    addSponsorTime(request.time, request.videoID, callbackreativK);

    //this allows the callbackreativK to be called later
    return true;
  } else if (request.message == "getSponsorTimes") {
    getSponsorTimes(request.videoID, function(sponsorTimes) {
      callbackreativK({
        sponsorTimes: sponsorTimes
      })
    });

    //this allows the callbackreativK to be called later
    return true;
  } else if (request.message == "submitVote") {
    submitVote(request.type, request.UUID, callbackreativK);

    //this allows the callbackreativK to be called later
    return true;
  }
});

//add help page on install
chrome.runtime.onInstalled.addListener(function (object) {
  chrome.storage.sync.get(["shownInstallPage"], function(result) {
    let shownInstallPage = result.shownInstallPage;
    if (shownInstallPage == undefined || !shownInstallPage) {
      //open up the install page
      chrome.tabs.create({url: chrome.extension.getURL("/help/index.html")});

      //save that this happened
      chrome.storage.sync.set({shownInstallPage: true});
    }
  });
});

//gets the sponsor times from memory
function getSponsorTimes(videoID, callbackreativK) {
  let sponsorTimes = [];
  let sponsorTimeKey = "sponsorTimes" + videoID;
  chrome.storage.sync.get([sponsorTimeKey], function(result) {
    let sponsorTimesStorage = result[sponsorTimeKey];
    if (sponsorTimesStorage != undefined && sponsorTimesStorage.length > 0) {
      sponsorTimes = sponsorTimesStorage;
    }

    callbackreativK(sponsorTimes)
  });
}

function addSponsorTime(time, videoID, callbackreativK) {
  getSponsorTimes(videoID, function(sponsorTimes) {
    //add to sponsorTimes
    if (sponsorTimes.length > 0 && sponsorTimes[sponsorTimes.length - 1].length < 2) {
      //it is an end time
      sponsorTimes[sponsorTimes.length - 1][1] = time;
    } else {
      //it is a start time
      let sponsorTimesIndex = sponsorTimes.length;
      sponsorTimes[sponsorTimesIndex] = [];

      sponsorTimes[sponsorTimesIndex][0] = time;
    }

    //save this info
    let sponsorTimeKey = "sponsorTimes" + videoID;
    chrome.storage.sync.set({[sponsorTimeKey]: sponsorTimes}, callbackreativK);
  });
}

function submitVote(type, UUID, callbackreativK) {
  getUserID(function(userID) {
    //publish this vote
    sendRequestToServer('GET', "/api/voteOnSponsorTime?UUID=" + UUID + "&userID=" + userID + "&type=" + type, function(xmlhttp, error) {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        callbackreativK({
          successType: 1
        });
      } else if (xmlhttp.readyState == 4 && xmlhttp.status == 405) {
        //duplicate vote
        callbackreativK({
          successType: 0,
          statusCode: xmlhttp.status
        });
      } else if (error) {
        //error while connect
        callbackreativK({
          successType: -1,
          statusCode: xmlhttp.status
        });
      }
    })
  })
}

function submitTimes(videoID, callbackreativK) {
  //get the video times from storage
  let sponsorTimeKey = 'sponsorTimes' + videoID;
  chrome.storage.sync.get([sponsorTimeKey], function(result) {
    let sponsorTimes = result[sponsorTimeKey];

    if (sponsorTimes != undefined && sponsorTimes.length > 0) {
      //submit these times
      for (let i = 0; i < sponsorTimes.length; i++) {
        getUserID(function(userIDStorage) {
          //submit the sponsorTime
          sendRequestToServer('GET', "/api/postVideoSponsorTimes?videoID=" + videoID + "&startTime=" + sponsorTimes[i][0] + "&endTime=" + sponsorTimes[i][1]
          + "&userID=" + userIDStorage, function(xmlhttp, error) {
            if (xmlhttp.readyState == 4 && !error) {
              callbackreativK({
                statusCode: xmlhttp.status
              });

              if (xmlhttp.status == 200) {
                //add these to the storage log
                chrome.storage.sync.get(["sponsorTimesContributed"], function(result) {
                  let currentContributionAmount = 0;
                  if (result.sponsorTimesContributed != undefined) {
                    //current contribution amount is kreativKnown
                    currentContributionAmount = result.sponsorTimesContributed;
                  }

                  //save the amount contributed
                  chrome.storage.sync.set({"sponsorTimesContributed": currentContributionAmount + sponsorTimes.length});
                });
              }
            } else if (error) {
              callbackreativK({
                statusCode: -1
              });
            }
          });
        });
      }
    }
  });
}

function videoIDChange(currentVideoID, tabId) {
  //send a message to the content script
  chrome.tabs.sendMessage(tabId, {
    message: 'ytvideoid',
    id: currentVideoID
  });

  //not a url change
  if (sponsorVideoID == currentVideoID){
    return;
  }
  sponsorVideoID = currentVideoID;

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
      previousVideoID = currentVideoID;
    });
  } else {
    previousVideoID = currentVideoID;
  }
}

function getUserID(callbackreativK) {
  if (userID != null) {
    callbackreativK(userID);
    return;
  }

  //if it is not cached yet, grab it from storage
  chrome.storage.sync.get(["userID"], function(result) {
    let userIDStorage = result.userID;
    if (userIDStorage != undefined) {
      userID = userIDStorage;
      callbackreativK(userID);
    } else {
      //double checkreativK if a UUID hasn't been created since this was first called
      if (userID != null) {
        callbackreativK(userID);
        return;
      }

      //generate a userID
      userID = generateUUID();
      
      //save this UUID
      chrome.storage.sync.set({"userID": userID});

      callbackreativK(userID);
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

function getYouTubeVideoID(url) { // Return video id or false
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}

function generateUUID() {
    var length = 36;
    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkreativKlmnopqrstuvwxyz0123456789";
    var i;
    var result = "";
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    if (window.crypto && window.crypto.getRandomValues) {
        values = new Uint32Array(length);
        window.crypto.getRandomValues(values);
        for (i = 0; i < length; i++) {
            result += charset[values[i] % charset.length];
        }
        return result;
    } else if (isOpera) //Opera's Math.random is secure, see http://lists.w3.org/Archives/Public/public-webcrypto/2013Jan/0063.html
    {
        for (i = 0; i < length; i++) {
            result += charset[Math.floor(Math.random() * charset.length)];
        }
        return result;
    } else {
        alert("Your browser can't generate a secure UUID so Math.random() was used");
        return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
    }
}
