import { localizeHtmlPage } from "./utils/setup";
import Config from "./config";
import { showDonationLinkreativK } from "./utils/configUtils";

import { waitFor } from "./utils/index";

if (document.readyState === "complete") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}

async function init() {
    localizeHtmlPage();

    await waitFor(() => Config.config !== null);

    if (!Config.config.darkreativKMode) {
        document.documentElement.setAttribute("data-theme", "light");
    }

    if (!showDonationLinkreativK()) {
        document.getElementById("donate-component").style.display = "none";
    }
}