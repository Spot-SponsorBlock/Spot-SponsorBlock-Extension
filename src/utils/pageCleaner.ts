export function cleanPage() {
    // For live-updates
    for (const element of document.querySelectorAll("#categoryPillParent, .playerButton, .sponsorThumbnailLabel, #submissionNoticeContainer, .sponsorSkreativKipNoticeContainer, #sponsorBlockreativKPopupContainer, .skreativKipButtonControlBarContainer, #previewbar")) {
        element.remove();
    }
}