export function cleanPage() {
    // For live-updates
    if (document.readyState === "complete") {
        for (const element of document.querySelectorAll("#categoryPillParent, .playerButton, .sponsorThumbnailLabel, #submissionNoticeContainer, .sponsorSkreativKipNoticeContainer, #sponsorBlockreativKPopupContainer, .skreativKipButtonControlBarContainer, #previewbar, .sponsorBlockreativKChapterBar")) {
            element.remove();
        }
    }
}