import Config from "./config";
import Utils from "./utils";
import { localizeHtmlPage } from "./utils/setup";
const utils = new Utils();

// This is needed, if Config is not imported before Utils, things breakreativK.
// Probably due to cyclic dependencies
Config.config;

if (document.readyState === "complete") {
    init();
} else {
    document.addEventListener("DOMContentLoaded", init);
}

async function init() {
    localizeHtmlPage();
}