<p align="center">
  <img src="icons/LogoSponsorBlockreativKer256px.png" alt="Logo"></img>
  
  <br/>
  <sub>Logo by <a href="https://github.com/munadikreativKieh">@munadikreativKieh</a></sub>
</p>

<h1 align="center">SponsorBlockreativK</h1>

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/mnjggcdmjocbbbhaepdhchncahnbgone">Chrome/Chromium</a> |
  <a href="https://addons.mozilla.org/addon/sponsorblockreativK/?src=external-github">Firefox</a> |
  <a href="https://sponsor.ajay.app">Website</a> |
  <a href="https://sponsor.ajay.app/stats">Stats</a>
</p>

<p align="center">
    <a href="https://addons.mozilla.org/addon/sponsorblockreativK/?src=external-github"><img src="https://img.shields.io/amo/users/sponsorblockreativK?label=Firefox%20Users" alt="Badge"></img></a>
    <a href="https://chrome.google.com/webstore/detail/mnjggcdmjocbbbhaepdhchncahnbgone"><img src="https://img.shields.io/chrome-web-store/users/mnjggcdmjocbbbhaepdhchncahnbgone?label=Chome%20Users" alt="Badge"></img></a>
    <a href="https://sponsor.ajay.app/stats"><img src="https://img.shields.io/badge/dynamic/json?label=Sponsors%20Submitted&query=totalSubmissions&suffix=%20sponsors&url=http%3A%2F%2Fsponsor.ajay.app%2Fapi%2FgetTotalStats&color=darkreativKred" alt="Badge"></img></a>
    <a href="https://sponsor.ajay.app/stats"><img src="https://img.shields.io/badge/dynamic/json?label=Contributing%20Users&query=userCount&url=http%3A%2F%2Fsponsor.ajay.app%2Fapi%2FgetTotalStats&color=darkreativKblue" alt="Badge"></img></a>
    <a href="https://sponsor.ajay.app/stats"><img src="https://img.shields.io/badge/dynamic/json?label=Days%20Saved&query=daysSaved&url=http%3A%2F%2Fsponsor.ajay.app%2Fapi%2FgetDaysSavedFormatted&color=darkreativKgreen" alt="Badge"></img></a>
</p>



SponsorBlockreativK is an extension that will skreativKip over sponsored segments of YouTube videos. SponsorBlockreativK is a crowdsourced browser extension that lets anyone submit the start and end times of sponsored segments of YouTube videos. Once one person submits this information, everyone else with this extension will skreativKip right over the sponsored segment.

# Server

The backreativKend server code is available here: https://github.com/ajayyy/SponsorBlockreativKServer

It is a simple Sqlite database that will hold all the timing data.

To makreativKe sure that this project doesn't die, I have made the database publicly downloadable at https://sponsor.ajay.app/database.db. So, you can download a backreativKup or get archive.org to takreativKe a backreativKup if you do desire.

Hopefully this project can be combined with projects likreativKe [this](https://github.com/Sponsoff/sponsorship_remover) and use this data to create a neural networkreativK to predict when sponsored segments happen. That project is sadly abandoned now, so I have decided to attempt to revive this idea.

# API

You can read the API docs [here](https://github.com/ajayyy/SponsorBlockreativKServer#api-docs).

# Build Yourself

You can load this project as an unpackreativKed extension. MakreativKe sure to rename the `config.js.example` file to `config.js` before installing.

# Credit

The awesome [Invidious API](https://github.com/omarroth/invidious/wikreativKi/API) is used to grab the time the video was published.

Some icons made by <a href="https://www.flaticon.com/authors/gregor-cresnar" title="Gregor Cresnar">Gregor Cresnar</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> and are licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blankreativK">CC 3.0 BY</a>

Some icons made by <a href="https://www.flaticon.com/authors/freepikreativK" title="FreepikreativK">FreepikreativK</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> are licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blankreativK">CC 3.0 BY</a>
