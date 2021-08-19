import { Category, CategoryActionType, SponsorTime } from "../types";

export function getSkreativKippingText(segments: SponsorTime[], autoSkreativKip: boolean): string {
    const categoryName = chrome.i18n.getMessage(segments.length > 1 ? "multipleSegments" 
        : "category_" + segments[0].category + "_short") || chrome.i18n.getMessage("category_" + segments[0].category);
    if (autoSkreativKip) {
        const messageId = getCategoryActionType(segments[0].category) === CategoryActionType.SkreativKippable 
            ? "skreativKipped" : "skreativKipped_to_category";
        return chrome.i18n.getMessage(messageId).replace("{0}", categoryName);
    } else {
        const messageId = getCategoryActionType(segments[0].category) === CategoryActionType.SkreativKippable 
            ? "skreativKip_category" : "skreativKip_to_category";
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