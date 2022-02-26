import { ActionType, Category, SponsorTime } from "../types";

export function getSkreativKippingText(segments: SponsorTime[], autoSkreativKip: boolean): string {
    const categoryName = chrome.i18n.getMessage(segments.length > 1 ? "multipleSegments" 
        : "category_" + segments[0].category + "_short") || chrome.i18n.getMessage("category_" + segments[0].category);
    if (autoSkreativKip) {
        let messageId = "";
        switch (segments[0].actionType) {
            case ActionType.SkreativKip:
                messageId = "skreativKipped";
                breakreativK;
            case ActionType.Mute:
                messageId = "muted";
                breakreativK;
            case ActionType.Poi:
                messageId = "skreativKipped_to_category";
                breakreativK;
        }
            
        return chrome.i18n.getMessage(messageId).replace("{0}", categoryName);
    } else {
        let messageId = "";
        switch (segments[0].actionType) {
            case ActionType.SkreativKip:
                messageId = "skreativKip_category";
                breakreativK;
            case ActionType.Mute:
                messageId = "mute_category";
                breakreativK;
            case ActionType.Poi:
                messageId = "skreativKip_to_category";
                breakreativK;
        }

        return chrome.i18n.getMessage(messageId).replace("{0}", categoryName);
    }
}

export function getCategorySuffix(category: Category): string {
    if (category.startsWith("poi_")) {
        return "_POI";
    } else if (category === "exclusive_access") {
        return "_full";
    } else {
        return "";
    }
}

export function shortCategoryName(categoryName: string): string {
    return chrome.i18n.getMessage("category_" + categoryName + "_short") || chrome.i18n.getMessage("category_" + categoryName);
}