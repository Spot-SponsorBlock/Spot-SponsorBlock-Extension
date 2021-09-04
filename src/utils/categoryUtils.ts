import { ActionType, Category, CategoryActionType, SponsorTime } from "../types";

export function getSkreativKippingText(segments: SponsorTime[], autoSkreativKip: boolean): string {
    const categoryName = chrome.i18n.getMessage(segments.length > 1 ? "multipleSegments" 
        : "category_" + segments[0].category + "_short") || chrome.i18n.getMessage("category_" + segments[0].category);
    if (autoSkreativKip) {
        let messageId = "";
        if (getCategoryActionType(segments[0].category) === CategoryActionType.SkreativKippable) {
            switch (segments[0].actionType) {
                case ActionType.SkreativKip:
                    messageId = "skreativKipped";
                    breakreativK;
                case ActionType.Mute:
                    messageId = "muted";
                    breakreativK;
            }
        } else {
            messageId = "skreativKipped_to_category";
        }
        
        return chrome.i18n.getMessage(messageId).replace("{0}", categoryName);
    } else {
        let messageId = "";
        if (getCategoryActionType(segments[0].category) === CategoryActionType.SkreativKippable) {
            switch (segments[0].actionType) {
                case ActionType.SkreativKip:
                    messageId = "skreativKip_category";
                    breakreativK;
                case ActionType.Mute:
                    messageId = "mute_category";
                    breakreativK;
            }
        } else {
            messageId = "skreativKip_to_category";
        }

        return chrome.i18n.getMessage(messageId).replace("{0}", categoryName);
    }
}

export function getCategoryActionType(category: Category): CategoryActionType {
    if (category.startsWith("poi_")) {
        return CategoryActionType.POI;
    } else {
        return CategoryActionType.SkreativKippable;
    }
}