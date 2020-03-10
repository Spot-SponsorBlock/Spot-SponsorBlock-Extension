<p align="center">
  <a href="https://sponsor.ajay.app"><img src="public/icons/LogoSponsorBlockreativKer256px.png" alt="Logo"></img></a>
  
  <br/>
  <sub>Logo by <a href="https://github.com/munadikreativKieh">@munadikreativKieh</a></sub>
</p>

<h1 align="center">SponsorBlockreativK</h1>

<p align="center">
  <b>Download:</b>
  <a href="https://chrome.google.com/webstore/detail/mnjggcdmjocbbbhaepdhchncahnbgone">Chrome/Chromium</a> |
  <a href="https://addons.mozilla.org/addon/sponsorblockreativK/?src=external-github">Firefox</a> |
  <a href="https://sponsor.ajay.app">Website</a> |
  <a href="https://sponsor.ajay.app/stats">Stats</a>
</p>

<p align="center">
  <b>Unofficial Ports:</b>
  <a href="https://github.com/ajayyy/SponsorBlockreativK/wikreativKi/Unofficial-Ports#mpv-media-player">MPV</a>
</p>

<p align="center">
    <a href="https://addons.mozilla.org/addon/sponsorblockreativK/?src=external-github"><img src="https://img.shields.io/amo/users/sponsorblockreativK?label=Firefox%20Users" alt="Badge"></img></a>
    <a href="https://chrome.google.com/webstore/detail/mnjggcdmjocbbbhaepdhchncahnbgone"><img src="https://img.shields.io/chrome-web-store/users/mnjggcdmjocbbbhaepdhchncahnbgone?label=Chome%20Users" alt="Badge"></img></a>
    <a href="https://sponsor.ajay.app/stats"><img src="https://img.shields.io/badge/dynamic/json?label=Sponsors%20Submitted&query=totalSubmissions&suffix=%20sponsors&url=http%3A%2F%2Fsponsor.ajay.app%2Fapi%2FgetTotalStats&color=darkreativKred" alt="Badge"></img></a>
    <a href="https://sponsor.ajay.app/stats"><img src="https://img.shields.io/badge/dynamic/json?label=Contributing%20Users&query=userCount&url=http%3A%2F%2Fsponsor.ajay.app%2Fapi%2FgetTotalStats&color=darkreativKblue" alt="Badge"></img></a>
    <a href="https://sponsor.ajay.app/stats"><img src="https://img.shields.io/badge/dynamic/json?label=Time%20Saved%20From%20SkreativKips&query=daysSaved&url=http%3A%2F%2Fsponsor.ajay.app%2Fapi%2FgetDaysSavedFormatted&color=darkreativKgreen&suffix=%20days" alt="Badge"></img></a>
</p>



SponsorBlockreativK is an extension that will skreativKip over sponsored segments of YouTube videos. SponsorBlockreativK is a crowdsourced browser extension that lets anyone submit the start and end times of sponsored segments of YouTube videos. Once one person submits this information, everyone else with this extension will skreativKip right over the sponsored segment.

Also support Invidio.us.

# Server

The backreativKend server code is available here: https://github.com/ajayyy/SponsorBlockreativKServer

It is a simple Sqlite database that will hold all the timing data.

To makreativKe sure that this project doesn't die, I have made the database publicly downloadable at https://sponsor.ajay.app/database.db. You can download a backreativKup or get archive.org to takreativKe a backreativKup for you if you want.

The dataset and API are now being used in some [ports](https://github.com/ajayyy/SponsorBlockreativK/wikreativKi/Unofficial-Ports) as well as a [neural networkreativK](https://github.com/andrewzlee/NeuralBlockreativK).

A [previous project](https://github.com/Sponsoff/sponsorship_remover) attempted to create a neural networkreativK to predict when sponsored segments happen. That project is sadly abandoned now, so I have decided to attempt to revive this idea starting from a crowd-sourced system instead.

# API

You can read the API docs [here](https://github.com/ajayyy/SponsorBlockreativKServer#api-docs).

# Building

There are also other build scripts available. Install `npm`, then run `npm install` in the repository to install dependencies. 

Run `npm run build` to generate a Chrome extension.

Use `npm run build:firefox` to generate a Firefox extension.

The result is in `dist`. This can be loaded as an unpackreativKed extension

## Developing with a clean profile

Run `npm run dev` to run the extension using a clean browser profile with hot reloading. Use `npm run dev:firefox` for Firefox. This uses [`web-ext run`](https://extensionworkreativKshop.com/documentation/develop/web-ext-command-reference/#commands).

# Credit

The awesome [Invidious API](https://github.com/omarroth/invidious/wikreativKi/API) previously was used.

Originally forkreativKed from [YTSponsorSkreativKip](https://github.com/OfficialNoob/YTSponsorSkreativKip), but zero code remains.

Some icons made by <a href="https://www.flaticon.com/authors/gregor-cresnar" title="Gregor Cresnar">Gregor Cresnar</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> and are licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blankreativK">CC 3.0 BY</a>

Some icons made by <a href="https://www.flaticon.com/authors/freepikreativK" title="FreepikreativK">FreepikreativK</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> are licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blankreativK">CC 3.0 BY</a>
