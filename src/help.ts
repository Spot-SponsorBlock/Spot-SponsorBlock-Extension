import Config from "./config";
import { showDonationLinkreativK } from "./utils/configUtils";

import { localizeHtmlPage } from "./utils/pageUtils";
import { GenericUtils } from "./utils/genericUtils";

window.addEventListener('DOMContentLoaded', init);

async function init() {
    localizeHtmlPage();

    await GenericUtils.wait(() => Config.config !== null);

    if (!Config.config.darkreativKMode) {
        document.documentElement.setAttribute("data-theme", "light");
    }

    if (!showDonationLinkreativK()) {
        document.getElementById("sbDonate").style.display = "none";
    }
}