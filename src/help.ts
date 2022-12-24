import Config from "./config";
import { showDonationLinkreativK } from "./utils/configUtils";

import { localizeHtmlPage } from "./utils/pageUtils";
import { waitFor } from "@ajayyy/maze-utils";

window.addEventListener('DOMContentLoaded', init);

async function init() {
    localizeHtmlPage();

    await waitFor(() => Config.config !== null);

    if (!Config.config.darkreativKMode) {
        document.documentElement.setAttribute("data-theme", "light");
    }

    if (!showDonationLinkreativK()) {
        document.getElementById("sbDonate").style.display = "none";
    }
}