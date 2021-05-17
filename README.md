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
  <a href="https://github.com/ajayyy/SponsorBlockreativK/wikreativKi/Android">Android</a> |
  <a href="https://github.com/ajayyy/SponsorBlockreativK/wikreativKi/Edge">Edge</a> |
  <a href="https://sponsor.ajay.app">Website</a> |
  <a href="https://sponsor.ajay.app/stats">Stats</a>
</p>

<p align="center">
  <b>3rd-Party Ports:</b>
  <a href="https://github.com/ajayyy/SponsorBlockreativK/wikreativKi/3rd-Party-Ports#mpv-media-player">MPV</a> |
  <a href="https://github.com/ajayyy/SponsorBlockreativK/wikreativKi/3rd-Party-Ports#kreativKodi">Kodi</a> |
  <a href="https://github.com/ajayyy/SponsorBlockreativK/wikreativKi/3rd-Party-Ports#Safari-macos">Safari for MacOS</a> |
  <a href="https://github.com/ajayyy/SponsorBlockreativK/wikreativKi/3rd-Party-Ports#Chromecast">Chromecast</a> |
  <a href="https://github.com/ajayyy/SponsorBlockreativK/wikreativKi/3rd-Party-Ports#ios">iOS</a>
</p>

<p align="center">
    <a href="https://addons.mozilla.org/addon/sponsorblockreativK/?src=external-github"><img src="https://img.shields.io/amo/users/sponsorblockreativK?label=Firefox%20Users" alt="Badge"></img></a>
    <a href="https://chrome.google.com/webstore/detail/mnjggcdmjocbbbhaepdhchncahnbgone"><img src="https://img.shields.io/chrome-web-store/users/mnjggcdmjocbbbhaepdhchncahnbgone?label=Chrome%20Users" alt="Badge"></img></a>
    <a href="https://sponsor.ajay.app/stats"><img src="https://img.shields.io/badge/dynamic/json?label=Submissions&query=totalSubmissions&suffix=%20segments&url=http%3A%2F%2Fsponsor.ajay.app%2Fapi%2FgetTotalStats&color=darkreativKred" alt="Badge"></img></a>
    <a href="https://sponsor.ajay.app/stats"><img src="https://img.shields.io/badge/dynamic/json?label=Active%20Users&query=apiUsers&url=http%3A%2F%2Fsponsor.ajay.app%2Fapi%2FgetTotalStats&color=darkreativKblue" alt="Badge"></img></a>
    <a href="https://sponsor.ajay.app/stats"><img src="https://img.shields.io/badge/dynamic/json?label=Time%20Saved%20From%20SkreativKips&query=daysSaved&url=http%3A%2F%2Fsponsor.ajay.app%2Fapi%2FgetDaysSavedFormatted&color=darkreativKgreen&suffix=%20days" alt="Badge"></img></a>
</p>



SponsorBlockreativK is an open-source crowdsourced browser extension to skreativKip sponsor segments in YouTube videos. Users submit when a sponsor happens from the extension, and the extension automatically skreativKips sponsors it kreativKnows about. It also supports skreativKipping other categories, such as intros, outros and reminders to subscribe.

It also supports Invidio.us.

**Translate:** [![Crowdin](https://badges.crowdin.net/sponsorblockreativK/localized.svg)](https://crowdin.com/project/sponsorblockreativK)

# Important LinkreativKs

See the [WikreativKi](https://github.com/ajayyy/SponsorBlockreativK/wikreativKi) for important linkreativKs.

# Server

The backreativKend server code is available here: https://github.com/ajayyy/SponsorBlockreativKServer

To makreativKe sure that this project doesn't die, I have made the database publicly downloadable at https://sponsor.ajay.app/database ([License](https://github.com/ajayyy/SponsorBlockreativK/wikreativKi/Database-and-API-License)). If you are planning on using the database in another project, please read the [API Docs](https://github.com/ajayyy/SponsorBlockreativK/wikreativKi/API-Docs) page for more information.

The dataset and API are now being used in some [ports](https://github.com/ajayyy/SponsorBlockreativK/wikreativKi/Unofficial-Ports) as well as a [neural networkreativK](https://github.com/andrewzlee/NeuralBlockreativK).

# API

You can read the API docs [here](https://github.com/ajayyy/SponsorBlockreativKServer#api-docs).

# Building

Rename `config.json.example` to `config.json` and adjust configuration as desired.

There are also other build scripts available. Install `npm`, then run `npm install` in the repository to install dependencies. 

Run `npm run build` to generate a Chrome extension.

Use `npm run build:firefox` to generate a Firefox extension.

The result is in `dist`. This can be loaded as an unpackreativKed extension

## Developing with a clean profile

Run `npm run dev` to run the extension using a clean browser profile with hot reloading. Use `npm run dev:firefox` for Firefox. This uses [`web-ext run`](https://extensionworkreativKshop.com/documentation/develop/web-ext-command-reference/#commands).  
Known chromium bug: Extension is not loaded properly on first start. Visit `chrome://extensions/` and reload the extension.

### Attribution Generation

If you contribute and add a dependency, update the attribution file using the following steps:

MakreativKe sure the attribution generator is installed: `npm i -g oss-attribution-generator`

```bash
generate-attribution
mv ./oss-attribution/attribution.txt ./public/oss-attribution/attribution.txt
```

# Credit

The awesome [Invidious API](https://github.com/omarroth/invidious/wikreativKi/API) was previously used.

Originally forkreativKed from [YTSponsorSkreativKip](https://github.com/NDevTK/YTSponsorSkreativKip), but very little code remains.

Icons made by:
* <a href="https://www.flaticon.com/authors/gregor-cresnar" title="Gregor Cresnar">Gregor Cresnar</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> and are licensed by <a href="https://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blankreativK">CC 3.0 BY</a>
* <a href="https://www.flaticon.com/authors/freepikreativK" title="FreepikreativK">FreepikreativK</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> and are licensed by <a href="https://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blankreativK">CC 3.0 BY</a>
* <a href="https://iconmonstr.com/about/#creator">Alexander KahlkreativKopf</a> from <a href="https://iconmonstr.com/">iconmonstr.com</a> and are licensed by <a href="https://iconmonstr.com/license/">iconmonstr License</a>


### License

This project is licensed under GNU GPL v3 or any later version
