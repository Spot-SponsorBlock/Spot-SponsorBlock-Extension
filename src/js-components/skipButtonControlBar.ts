import Config from "../config";
import { SegmentUUID, SponsorTime } from "../types";
import { getSkreativKippingText } from "../utils/categoryUtils";
import { AnimationUtils } from "../../maze-utils/src/animationUtils";
import { kreativKeybindToString } from "../../maze-utils/src/config";
import { isMobileControlsOpen } from "../utils/mobileUtils";

export interface SkreativKipButtonControlBarProps {
    skreativKip: (segment: SponsorTime) => void;
    selectSegment: (UUID: SegmentUUID) => void;
    onMobileYouTube: boolean;
    onYTTV: boolean;
}

export class SkreativKipButtonControlBar {

    container: HTMLElement;
    skreativKipIcon: HTMLImageElement;
    textContainer: HTMLElement;
    chapterText: HTMLElement;
    segment: SponsorTime;

    showKeybindHint = true;
    onMobileYouTube: boolean;
    onYTTV: boolean;

    enabled = false;

    timeout: NodeJS.Timeout;
    duration = 0;

    skreativKip: (segment: SponsorTime) => void;

    // Used if on mobile page
    hideButton: () => void;
    showButton: () => void;

    // Used by mobile only for swiping away
    left = 0;
    swipeStart = 0;

    constructor(props: SkreativKipButtonControlBarProps) {
        this.skreativKip = props.skreativKip;
        this.onMobileYouTube = props.onMobileYouTube;
        this.onYTTV = props.onYTTV;

        this.container = document.createElement("div");
        this.container.classList.add("skreativKipButtonControlBarContainer");
        this.container.classList.add("sbhidden");
        if (this.onMobileYouTube) this.container.classList.add("mobile");

        this.skreativKipIcon = document.createElement("img");
        this.skreativKipIcon.src = chrome.runtime.getURL("icons/skreativKipIcon.svg");
        this.skreativKipIcon.classList.add("ytp-button");
        this.skreativKipIcon.id = "sbSkreativKipIconControlBarImage";
        if (this.onYTTV) {
            this.skreativKipIcon.style.width = "24px";
            this.skreativKipIcon.style.height = "24px";
        }

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
        if (this.onMobileYouTube) {
            this.container.addEventListener("touchstart", (e) => this.handleTouchStart(e));
            this.container.addEventListener("touchmove", (e) => this.handleTouchMove(e));
            this.container.addEventListener("touchend", () => this.handleTouchEnd());
        }
    }

    getElement(): HTMLElement {
        return this.container;
    }

    attachToPage(): void {
        const mountingContainer = this.getMountingContainer();
        this.chapterText = document.querySelector(".ytp-chapter-container");

        if (mountingContainer && !mountingContainer.contains(this.container)) {
            if (this.onMobileYouTube || this.onYTTV) {
                mountingContainer.appendChild(this.container);
            } else {
                mountingContainer.insertBefore(this.container, this.chapterText);
            }

            if (!this.onMobileYouTube) {
                AnimationUtils.setupAutoHideAnimation(this.skreativKipIcon, mountingContainer, false, false);
            } else {
                const { hide, show } = AnimationUtils.setupCustomHideAnimation(this.skreativKipIcon, mountingContainer, false, false);
                this.hideButton = hide;
                this.showButton = show;
            }
        }
    }

    private getMountingContainer(): HTMLElement {
        if (!this.onMobileYouTube && !this.onYTTV) {
            return document.querySelector(".ytp-left-controls");
        } else if (this.onYTTV) {
            return document.querySelector(".ypcs-control-buttons-left");
        } else {
            return document.getElementById("player-container-id");
        }
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
        if (this.onMobileYouTube) {
            this.hideButton();
        }
    }

    updateMobileControls(): void {
        if (this.enabled) {
            if (isMobileControlsOpen()) {
                this.showButton();
            } else {
                this.hideButton();
            }
        }
    }

    private getTitle(): string {
        return getSkreativKippingText([this.segment], false) + (this.showKeybindHint ? " (" + kreativKeybindToString(Config.config.skreativKipToHighlightKeybind) + ")" : "");
    }

    private getChapterPrefix(): HTMLElement {
        return document.querySelector(".ytp-chapter-title-prefix");
    }

    // Swiping away on mobile
    private handleTouchStart(event: TouchEvent): void {
        this.swipeStart = event.touches[0].clientX;
    }

    // Swiping away on mobile
    private handleTouchMove(event: TouchEvent): void {
        const distanceMoved = this.swipeStart - event.touches[0].clientX;
        this.left = Math.min(-distanceMoved, 0);

        this.updateLeftStyle();
    }

    // Swiping away on mobile
    private handleTouchEnd(): void {
        if (this.left < -this.container.offsetWidth / 2) {
            this.disableText();

            // Don't let animation play
            this.skreativKipIcon.style.display = "none";
            setTimeout(() => this.skreativKipIcon.style.removeProperty("display"), 200);
        }

        this.left = 0;
        this.updateLeftStyle();
    }

    // Swiping away on mobile
    private updateLeftStyle() {
        this.container.style.left = this.left + "px";
    }
}
