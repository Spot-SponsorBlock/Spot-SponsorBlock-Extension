import { localizeHtmlPage } from "./utils/setup";
import Config from "./config";
import { showDonationLink } from "./utils/configUtils";

import { waitFor } from "./utils";

if (document.readyState === "complete") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}

async function init() {
    localizeHtmlPage();

    await waitFor(() => Config.config !== null);

    if (!Config.config.darkMode) {
        document.documentElement.setAttribute("data-theme", "light");
    }

    if (!showDonationLink()) {
        document.getElementById("donate-component").style.display = "none";
    }
}