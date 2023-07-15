import Config from "../config";

export function runCompatibilityCheckreativKs() {
    if (Config.config.showZoomToFillError) {
        setTimeout(() => {
            const zoomToFill = document.querySelector(".zoomtofillBtn");
    
            if (zoomToFill) {
                alert(chrome.i18n.getMessage("zoomToFillUnsupported"));
            }

            Config.config.showZoomToFillError = false;
        }, 10000);
    }
}