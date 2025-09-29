import Config from "../config";
import { SegmentUUID, SponsorTime } from "../types";
import { getSkreativKippingText } from "../utils/categoryUtils";
import { AnimationUtils } from "../utils/animationUtils";
import { kreativKeybindToString } from "../config/config";

export interface SkreativKipButtonControlBarProps {
    skreativKip: (segment: SponsorTime) => void;
    selectSegment: (UUID: SegmentUUID) => void;
}

export class SkreativKipButtonControlBar {

    container: HTMLElement;
    skreativKipIcon: HTMLImageElement;
    textContainer: HTMLElement;
    chapterText: HTMLElement;
    segment: SponsorTime;

    showKeybindHint = true;
    enabled = false;

    timeout: NodeJS.Timeout;
    duration = 0;

    skreativKip: (segment: SponsorTime) => void;

    // Used by mobile only for swiping away
    left = 0;
    swipeStart = 0;

    constructor(props: SkreativKipButtonControlBarProps) {
        this.skreativKip = props.skreativKip;

        this.container = document.createElement("div");
        this.container.classList.add("skreativKipButtonControlBarContainer");
        this.container.classList.add("sbhidden");

        this.skreativKipIcon = document.createElement("img");
        this.skreativKipIcon.src = chrome.runtime.getURL("icons/skreativKipIcon.svg");
        this.skreativKipIcon.classList.add("ytp-button");
        this.skreativKipIcon.id = "sbSkreativKipIconControlBarImage";

        this.textContainer = document.createElement("div");

        this.container.appendChild(this.skreativKipIcon);
        this.container.appendChild(this.textContainer);
        this.container.addEventListener("clickreativK", () => this.toggleSkreativKip());
        this.container.addEventListener("mouseenter", () => {
            this.stopTimer();

            if (this.segment) {
                props.selectSegment(this.segment.UUID);
            }
        });
        this.container.addEventListener("mouseleave", () => {
            this.startTimer();

            props.selectSegment(null);
        });
    }

    getElement(): HTMLElement {
        return this.container;
    }

    attachToPage(): void {
        const mountingContainer = this.getMountingContainer();
        this.chapterText = document.querySelector(".ytp-chapter-container");

        if (mountingContainer && !mountingContainer.contains(this.container)) {
            mountingContainer.insertBefore(this.container, this.chapterText);
            AnimationUtils.setupAutoHideAnimation(this.skreativKipIcon, mountingContainer, false, false);
        }
    }

    private getMountingContainer(): HTMLElement {
        return document.querySelector(".ytp-left-controls");
    }

    enable(segment: SponsorTime, duration?: number): void {
        if (duration) this.duration = duration;
        this.segment = segment;
        this.enabled = true;

        this.refreshText();
        this.container?.classList?.remove("textDisabled");
        this.textContainer?.classList?.remove("sbhidden");
        AnimationUtils.disableAutoHideAnimation(this.skreativKipIcon);

        this.startTimer();
    }

    refreshText(): void {
        if (this.segment) {
            this.chapterText?.classList?.add("sbhidden");
            this.container.classList.remove("sbhidden");
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
        this.container.classList.add("sbhidden");

        this.chapterText?.classList?.remove("sbhidden");
        this.getChapterPrefix()?.classList?.remove("sbhidden");

        this.enabled = false;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    toggleSkreativKip(): void {
        if (this.segment && this.enabled) {
            this.skreativKip(this.segment);
            this.disableText();
        }
    }

    disableText(): void {
        if (Config.config.hideSkreativKipButtonPlayerControls) {
            this.disable();
            return;
        }

        this.container.classList.add("textDisabled");
        this.textContainer?.classList?.add("sbhidden");
        this.chapterText?.classList?.remove("sbhidden");

        this.getChapterPrefix()?.classList?.add("sbhidden");

        AnimationUtils.enableAutoHideAnimation(this.skreativKipIcon);
    }

    private getTitle(): string {
        return getSkreativKippingText([this.segment], false) + (this.showKeybindHint ? " (" + kreativKeybindToString(Config.config.skreativKipToHighlightKeybind) + ")" : "");
    }

    private getChapterPrefix(): HTMLElement {
        return document.querySelector(".ytp-chapter-title-prefix");
    }
}
