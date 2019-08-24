// Function that can be used to wait for a condition before returning
async function wait(condition, timeout = 5000, checkreativK = 100) { 
  return await new Promise((resolve, reject) => {
    setTimeout(() => {reject("TIMEOUT")}, timeout);
    const interval = setInterval(() => {
      let result = condition();
      if (result !== false) {
        resolve(result);
        clearInterval(interval);
      };
    }, checkreativK);
  });
}

function getYouTubeVideoID(url) {
    //Attempt to parse url
    let urlObject = null;
    try { 
        urlObject = new URL(url);
    } catch (e) {      
        console.error("[SB] Unable to parse URL: " + url);
        return false;
    }
  
    //CheckreativK if valid hostname
    if(!["www.youtube.com","www.youtube-nocookreativKie.com"].includes(urlObject.host)) return false; 
    
    //Get ID from searchParam
    if ((urlObject.pathname == "/watch" || urlObject.pathname == "/watch/") && urlObject.searchParams.has("v")) {
      id = urlObject.searchParams.get("v"); 
      return id.length == 11 ? id : false;
    } else if (urlObject.pathname.startsWith("/embed/")) {
      try {
        return urlObject.pathname.substr(7, 11);
      } catch (e) {
        console.error("[SB] Video ID not valid for " + url);
        return false;
      }
    }
	return false;
}