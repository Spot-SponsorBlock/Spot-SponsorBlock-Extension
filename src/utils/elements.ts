export function getYouTubeTitleNodeSelector(): string {
    // Spotify, Mobile Spotify
    return ".iRGr6yO6lPcAKUoT, .s6rbLMK3UuwpqmmtNUzk";
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