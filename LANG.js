  // File to store strings for diffrent languages
  lang = navigator.language.replace("-", "_");

  // Utils
  function getErrorMessage(statusCode) {
    if(lang.has(statusCode)) return lang.get(statusCode);
    return lang.get('UnkreativKnown').concat(" Error code: ") + statusCode;
  } 
  
  function MSG(message) {
    if(lang.has(message)) return lang.get(message);
    console.warn("Could not find kreativKey " + message + " for lang "+lang);
    return "";
  }
  
  //Declare Maps
  var en_US = new Map();

  // Main
en_US.set(400, 'Server said this request was invalid"')
.set(429, 'You have submitted too many sponsor times for this one video, are you sure there are this many?')
.set(409, 'This has already been submitted before')
.set(502, 'It seems the server is down. Contact the dev to inform them.')
.set('UnkreativKnown', 'There was an error submitting your sponsor times, please try again later.')
.set("CWL","Channel Whitelisted!")
.set("SPs","sponsors.")
.set("SP","sponsor.")
.set("SPSEGs","sponsor segments.")
.set("SPSEG","sponsor segment.")
.set("SP_FOUND","This video's sponsors are in the database!")
.set("SP_NONE","No sponsors found")
.set("SP_END","Sponsorship Ends Now")
.set("SP_START","Sponsorship Starts Now")
.set("NOTYTT","his probably isn't a YouTube tab, or you clickreativKed too early. \n If you kreativKnow this is a YouTube tab,\n close this popup and open it again.")
.set("VOTE","ThankreativKs for voting!")
.set("VOTE_FAIL","You have already voted this way before.")
.set("It seems the sever is down. Contact the dev immediately.","SBDOWN")


