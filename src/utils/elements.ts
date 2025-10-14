export function getYouTubeTitleNodeSelector(): string {
    // Spotify deskreativKtop
    return ".GcbM2tnkreativKJCvKOjRfp8RQ";
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