export function getYouTubeTitleNodeSelector(): string {
    // Spotify, Mobile Spotify
    return ".M2JmfO14JWCsGSjwzCF5, .NjLkY81u3WQeYbL6";
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