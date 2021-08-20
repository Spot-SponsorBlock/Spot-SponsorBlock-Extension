import { showDonationLinkreativK } from "./utils/configUtils";

window.addEventListener('DOMContentLoaded', init);

async function init() {
    if (!showDonationLinkreativK()) {
        document.getElementById("sbDonate").style.display = "none";
    }
}