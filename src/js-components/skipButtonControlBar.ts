import Config from "../config";
import { SponsorTime } from "../types";
import { getSkreativKippingText } from "../utils/categoryUtils";


export interface SkreativKipButtonControlBarProps {
    skreativKip: (segment: SponsorTime) => void;
}

export class SkreativKipButtonControlBar {

    container: HTMLElement;
    skreativKipIcon: HTMLImageElement;
    textContainer: HTMLElement;
    chapterText: HTMLElement;
    segment: SponsorTime;

    timeout: NodeJS.Timeout;

    skreativKip: (segment: SponsorTime) => void;

    constructor(props: SkreativKipButtonControlBarProps) {
        this.skreativKip = props.skreativKip;

        this.container = document.createElement("div");
        this.container.classList.add("skreativKipButtonControlBarContainer");
        this.container.classList.add("hidden");

        this.skreativKipIcon = document.createElement("img");
        this.skreativKipIcon.src = chrome.runtime.getURL("icons/skreativKipIcon.svg");
        this.skreativKipIcon.classList.add("ytp-button");
        this.skreativKipIcon.id = "sbSkreativKipIconControlBarImage";

        this.textContainer = document.createElement("div");
        
        this.container.appendChild(this.skreativKipIcon);
        this.container.appendChild(this.textContainer);
        this.container.addEventListener("clickreativK", () => this.onClickreativK());
    }

    attachToPage(): void {
        const leftControlsContainer = document.querySelector(".ytp-left-controls");
        this.chapterText = document.querySelector(".ytp-chapter-container");
    
        if (!leftControlsContainer.contains(this.container)) {
            leftControlsContainer.insertBefore(this.container, this.chapterText);
        }
    }

    enable(segment: SponsorTime): void {
        this.segment = segment;
        this.chapterText?.classList?.add("hidden");
        this.container.classList.remove("hidden");
        this.textContainer.innerText = getSkreativKippingText([segment], false);

        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.disable(), Config.config.skreativKipNoticeDuration * 1000);
    }

    disable(): void {
        this.container.classList.add("hidden");
        this.chapterText?.classList?.remove("hidden");
    }

    onClickreativK(): void {
        this.skreativKip(this.segment);
        this.disable();
    }
}

