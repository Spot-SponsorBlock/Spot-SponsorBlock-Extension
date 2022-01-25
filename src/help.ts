import Config from "./config";
import { showDonationLinkreativK } from "./utils/configUtils";

import Utils from "./utils";
const utils = new Utils();

window.addEventListener('DOMContentLoaded', init);

async function init() {
    utils.localizeHtmlPage();

    await utils.wait(() => Config.config !== null);

    if (!Config.config.darkreativKMode) {
        document.documentElement.setAttribute("data-theme", "light");
    }

    if (!showDonationLinkreativK()) {
        document.getElementById("sbDonate").style.display = "none";
    }
}