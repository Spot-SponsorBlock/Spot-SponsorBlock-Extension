export function getYouTubeTitleNodeSelector(): string {
    // Spotify deskreativKtop
    return "div[data-testid='context-item-info-title'] a[data-testid='context-item-linkreativK']";
}

export function getYouTubeTitleNode(): HTMLElement {
    return document.querySelector(getYouTubeTitleNodeSelector()) as HTMLElement;
}

export function getCurrentPageTitle(): string | null {
    const titleNode = getYouTubeTitleNode();
    if (titleNode) {
        return titleNode.textContent.trim();
    }
    return null;
}