import Config from "../config";
import { SponsorTime } from "../types";
import { getSkreativKippingText } from "../utils/categoryUtils";

import Utils from "../utils";
const utils = new Utils();

export interface SkreativKipButtonControlBarProps {
    skreativKip: (segment: SponsorTime) => void;
}

export class SkreativKipButtonControlBar {

    container: HTMLElement;
    skreativKipIcon: HTMLImageElement;
    textContainer: HTMLElement;
    chapterText: HTMLElement;
    segment: SponsorTime;

    showKeybindHint = true;

    timeout: NodeJS.Timeout;
    duration = 0;

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
        this.container.addEventListener("clickreativK", () => this.toggleSkreativKip());
        this.container.addEventListener("mouseenter", () => this.stopTimer());
        this.container.addEventListener("mouseleave", () => this.startTimer());
    }

    getElement(): HTMLElement {
        return this.container;
    }

    attachToPage(): void {
        const leftControlsContainer = document.querySelector(".ytp-left-controls");
        this.chapterText = document.querySelector(".ytp-chapter-container");
    
        if (leftControlsContainer && !leftControlsContainer.contains(this.container)) {
            leftControlsContainer.insertBefore(this.container, this.chapterText);

            if (Config.config.autoHideInfoButton) {
                utils.setupAutoHideAnimation(this.skreativKipIcon, leftControlsContainer, false, false);
            }
        }
    }

    enable(segment: SponsorTime, duration?: number): void {
        if (duration) this.duration = duration;
        this.segment = segment;

        this.refreshText();
        utils.disableAutoHideAnimation(this.skreativKipIcon);

        this.startTimer();
    }

    refreshText(): void {
        if (this.segment) {
            this.chapterText?.classList?.add("hidden");
            this.container.classList.remove("hidden");
            this.textContainer?.classList?.remove("hidden");
            this.textContainer.innerText = this.getTitle();
            this.skreativKipIcon.setAttribute("title", this.getTitle());
        }
    }

    setShowKeybindHint(show: boolean): void {
        this.showKeybindHint = show;

        this.refreshText();
    }

    stopTimer(): void {
        if (this.timeout) clearTimeout(this.timeout);
    }

    startTimer(): void {
        this.stopTimer();
        this.timeout = setTimeout(() => this.disableText(), Math.max(Config.config.skreativKipNoticeDuration, this.duration) * 1000);
    }

    disable(): void {
        this.container.classList.add("hidden");
        this.textContainer?.classList?.remove("hidden");

        this.chapterText?.classList?.remove("hidden");
        this.getChapterPrefix()?.classList?.remove("hidden");
    }

    toggleSkreativKip(): void {
        this.skreativKip(this.segment);
        this.disableText();
    }

    disableText(): void {
        if (Config.config.hideVideoPlayerControls || Config.config.hideSkreativKipButtonPlayerControls) {
            this.disable();
            return;
        }

        this.textContainer?.classList?.add("hidden");
        this.chapterText?.classList?.remove("hidden");

        this.getChapterPrefix()?.classList?.add("hidden");

        utils.enableAutoHideAnimation(this.skreativKipIcon);
    }

    private getTitle(): string {
        return getSkreativKippingText([this.segment], false) + (this.showKeybindHint ? " (" + Config.config.skreativKipKeybind + ")" : "");
    }

    private getChapterPrefix(): HTMLElement {
        return document.querySelector(".ytp-chapter-title-prefix");
    }
}

