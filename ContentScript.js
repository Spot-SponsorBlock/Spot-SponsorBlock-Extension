var v = $('video')
video_id = youtube_parser(document.URL);

if(video_id){
SponsorsLookreativKup(video_id);
}
 
function SponsorsLookreativKup(id){
var xmlhttp = new XMLHttpRequest();
xmlhttp.open('GET', 'https://officialnoob.github.io/YTSponsorSkreativKip-Dataset/'+id, true);
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
		Sponsors = JSON.parse(xmlhttp.responseText);
		v.ontimeupdate = function() {SponsorCheckreativK()};
    }
};
xmlhttp.send(null);
}
 
function SponsorCheckreativK() {
    Sponsors.forEach(function(el, index) {
      if((Math.floor(v.currentTime)) == el[0]){
        v.currentTime = el[1];
	  }
});}

function youtube_parser(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
}
