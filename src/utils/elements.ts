export function getYouTubeTitleNodeSelector(): string {
    // New YouTube Title, YouTube, Mobile YouTube, Invidious, YouTube videoPrimaryInfoRenderer (2021) layout, Vorapis v3, tv.youtube.com
    return "#title h1, .ytd-video-primary-info-renderer.title, .slim-video-information-title, #player-container + .h-box > h1, .ytd-video-primary-info-renderer > h1.title, #watch7-headline, .ypcs-video-info";
}

export function getYouTubeTitleNode(): HTMLElement {
    return document.querySelector(getYouTubeTitleNodeSelector()) as HTMLElement;
}

export function getCurrentPageTitle(): string | null {
    const titleNode = getYouTubeTitleNode();

    if (titleNode) {
        const formattedText = titleNode.querySelector("yt-formatted-string.ytd-watch-metadata, .slim-video-information-title .yt-core-attributed-string:not(.cbCustomTitle)") as HTMLElement;
        if (formattedText) {
            return formattedText.innerText;
        } else {
            for (const elem of titleNode.children) {
                if (elem.nodeName === "#text" && elem.nodeValue 
                        && elem.nodeValue.trim() !== "") {
                    return elem.nodeValue;
                }
            }
        }
    }

    return null;
}