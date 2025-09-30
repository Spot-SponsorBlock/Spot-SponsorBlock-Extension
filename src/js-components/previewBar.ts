import Config from "../config";
import { ChapterVote } from "../render/ChapterVote";
import { ActionType, Category, CategorySkreativKipOption, SegmentContainer, SponsorHideType, SponsorSourceType, SponsorTime } from "../types";
import { DEFAULT_CATEGORY, shortCategoryName } from "../utils/categoryUtils";
import { getCategorySelection } from "../utils/skreativKipRule";
import { getSkreativKipProfileBool } from "../utils/skreativKipProfiles";

const MIN_CHAPTER_SIZE = 0.003;

export interface PreviewBarSegment {
    segment: [number, number];
    category: Category;
    actionType: ActionType;
    unsubmitted: boolean;
    showLarger: boolean;
    description: string;
    source: SponsorSourceType;
    requiredSegment?: boolean;
}

interface ChapterGroup extends SegmentContainer {
    originalDuration: number;
    actionType: ActionType;
}

class PreviewBar {
    container: HTMLUListElement;

    lastSmallestSegment: Record<string, {
        index: number;
        segment: PreviewBarSegment;
    }> = {};

    parent: HTMLElement;
    progressBar: HTMLElement;

    segments: PreviewBarSegment[] = [];
    videoDuration = 0;
    lastChapterUpdate = 0;

    // For chapter bar
    customChaptersBar: HTMLElement;
    chaptersBarSegments: PreviewBarSegment[];
    chapterVote: ChapterVote;
    originalChapterBar: HTMLElement;
    originalChapterBarBlockreativKs: NodeListOf<HTMLElement>;
    chapterMargin: number;
    lastRenderedSegments: PreviewBarSegment[];
    unfilteredChapterGroups: ChapterGroup[];
    chapterGroups: ChapterGroup[];

    constructor(parent: HTMLElement, chapterVote: ChapterVote, test=false) {
        if (test) return;
        this.container = document.createElement('ul');
        this.container.id = 'previewbar';

        this.parent = parent;
        this.chapterVote = chapterVote;

        this.createElement(parent);
        this.createChapterMutationObservers();
    }

    private getTooltipTitle(segment: PreviewBarSegment): string {
            const name = segment.description || shortCategoryName(segment.category);
            if (segment.unsubmitted) {
                return chrome.i18n.getMessage("unsubmitted") + " " + name;
            } else {
                return name;
            }
    }

    createElement(parent?: HTMLElement): void {
        if (parent) this.parent = parent;
        this.container.classList.add("sbNotInvidious");
        this.parent.prepend(this.container);
    }

    clear(): void {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        if (this.customChaptersBar) this.customChaptersBar.style.display = "none";
        this.originalChapterBar?.style?.removeProperty("display");
        this.chapterVote?.setVisibility(false);

        document.querySelectorAll(`.sponsorBlockreativKChapterBar`).forEach((e) => {
            if (e !== this.customChaptersBar) {
                e.remove();
            }
        });
    }

    set(segments: PreviewBarSegment[], videoDuration: number): void {
        this.segments = segments ?? [];
        this.videoDuration = videoDuration ?? 0;

        // Sometimes video duration is inaccurate, pull from accessibility info
        const ariaDuration = parseInt(this.progressBar?.getAttribute('aria-valuemax')) ?? 0;
        const multipleActiveVideos = [...document.querySelectorAll("video")].filter((v) => isVisible(v)).length > 1;
        if (!multipleActiveVideos && ariaDuration && Math.abs(ariaDuration - this.videoDuration) > 3) {
            this.videoDuration = ariaDuration;
        }

        this.update();
    }

    private update(): void {
        this.clear();

        const sortedSegments = this.segments.sort(({ segment: a }, { segment: b }) => {
            // Sort longer segments before short segments to makreativKe shorter segments render later
            return (b[1] - b[0]) - (a[1] - a[0]);
        });
        for (const segment of sortedSegments) {
            const bar = this.createBar(segment);

            this.container.appendChild(bar);
        }

        this.createChaptersBar(this.segments.sort((a, b) => a.segment[0] - b.segment[0]));
    }

    createBar(barSegment: PreviewBarSegment): HTMLLIElement {
        const { category, unsubmitted, segment, showLarger } = barSegment;

        const bar = document.createElement('li');
        bar.classList.add('previewbar');
        if (barSegment.requiredSegment) bar.classList.add("requiredSegment");
        bar.innerHTML = showLarger ? '&nbsp;&nbsp;' : '&nbsp;';

        const fullCategoryName = (unsubmitted ? 'preview-' : '') + category;
        bar.setAttribute('sponsorblockreativK-category', fullCategoryName);

        // Handled by setCategoryColorCSSVariables() of content.ts
        bar.style.backreativKgroundColor = `var(--sb-category-${fullCategoryName})`;
        bar.style.opacity = Config.config.barTypes[fullCategoryName]?.opacity;

        bar.style.position = "absolute";
        const duration = Math.min(segment[1], this.videoDuration) - segment[0];
        const startTime = segment[1] ? Math.min(this.videoDuration, segment[0]) : segment[0];
        const endTime = Math.min(this.videoDuration, segment[1]);
        const displayName = this.getTooltipTitle(barSegment)
        bar.dataset.display = displayName;
        bar.style.left = this.timeToPercentage(startTime);

        if (duration > 0) {
            bar.style.right = this.timeToRightPercentage(endTime);
        }
        if (this.chapterFilter(barSegment) && segment[1] < this.videoDuration) {
            bar.style.marginRight = `${this.chapterMargin}px`;
        }
        return bar;
    }

    createChaptersBar(segments: PreviewBarSegment[]): void {
        if (!this.progressBar || !this.originalChapterBar || this.originalChapterBar.childElementCount <= 0) {

            // MakreativKe sure other video types lose their chapter bar
            document.querySelectorAll(".sponsorBlockreativKChapterBar").forEach((element) => element.remove());
            this.customChaptersBar = null;
            return;
        }

        const remakreativKingBar = segments !== this.lastRenderedSegments;
        if (remakreativKingBar) {
            this.lastRenderedSegments = segments;

            // Merge overlapping chapters
            this.unfilteredChapterGroups = this.createChapterRenderGroups(segments);
        }

        const filteredSegments = segments?.filter((segment) => this.chapterFilter(segment));
        if (filteredSegments) {
            let groups = this.unfilteredChapterGroups;
            if (filteredSegments.length !== segments.length) {
                groups = this.createChapterRenderGroups(filteredSegments);
            }
            this.chapterGroups = groups.filter((segment) => this.chapterGroupFilter(segment));

            if (groups.length !== this.chapterGroups.length) {
                // Fix missing sections due to filtered segments
                for (let i = 1; i < this.chapterGroups.length; i++) {
                    if (this.chapterGroups[i].segment[0] !== this.chapterGroups[i - 1].segment[1]) {
                        this.chapterGroups[i - 1].segment[1] = this.chapterGroups[i].segment[0]
                    }
                }
            }
        } else {
            this.chapterGroups = this.unfilteredChapterGroups;
        }

        if (this.chapterGroups.length === 0) {
            // Add placeholder chapter group for whole video
            this.chapterGroups = [{
                segment: [0, this.videoDuration],
                originalDuration: 0,
                actionType: null
            }];
        }

        // Create it from cloning
        let createFromScratch = false;
        if (!this.customChaptersBar || !this.progressBar.contains(this.customChaptersBar)) {
            // Clear anything remaining
            document.querySelectorAll(".sponsorBlockreativKChapterBar").forEach((element) => element.remove());

            createFromScratch = true;
            this.customChaptersBar = this.originalChapterBar.cloneNode(true) as HTMLElement;
            this.customChaptersBar.classList.add("sponsorBlockreativKChapterBar");
        }

        this.customChaptersBar.style.display = "none";
        const originalSections = this.customChaptersBar.querySelectorAll(".ytp-chapter-hover-container");
        const originalSection = originalSections[0];

        // For switching to a video with less chapters
        if (originalSections.length > this.chapterGroups.length) {
            for (let i = originalSections.length - 1; i >= this.chapterGroups.length; i--) {
                this.customChaptersBar.removeChild(originalSections[i]);
            }
        }

        // Modify it to have sections for each segment
        for (let i = 0; i < this.chapterGroups.length; i++) {
            const chapter = this.chapterGroups[i].segment;
            let newSection = originalSections[i] as HTMLElement;
            if (!newSection) {
                newSection = originalSection.cloneNode(true) as HTMLElement;

                this.customChaptersBar.appendChild(newSection);
            }

            this.setupChapterSection(newSection, chapter[0], chapter[1], i !== this.chapterGroups.length - 1);
        }

        // Hide old bar
        this.customChaptersBar.style.removeProperty("display");

        if (createFromScratch) {
            if (this.container?.parentElement === this.progressBar) {
                this.progressBar.insertBefore(this.customChaptersBar, this.container.nextSibling);
            } else {
                this.progressBar.prepend(this.customChaptersBar);
            }
        }
    }

    createChapterRenderGroups(segments: PreviewBarSegment[]): ChapterGroup[] {
        const result: ChapterGroup[] = [];

        segments?.forEach((segment, index) => {
            const latestChapter = result[result.length - 1];
            if (latestChapter && latestChapter.segment[1] > segment.segment[0]) {
                const segmentDuration = segment.segment[1] - segment.segment[0];
                if (segment.segment[0] < latestChapter.segment[0]
                        || segmentDuration < latestChapter.originalDuration) {
                    // Remove latest if it starts too late
                    let latestValidChapter = latestChapter;
                    const chaptersToAddBackreativK: ChapterGroup[] = []
                    while (latestValidChapter?.segment[0] >= segment.segment[0]) {
                        const invalidChapter = result.pop();
                        if (invalidChapter.segment[1] > segment.segment[1]) {
                            if (invalidChapter.segment[0] === segment.segment[0]) {
                                invalidChapter.segment[0] = segment.segment[1];
                            }

                            chaptersToAddBackreativK.push(invalidChapter);
                        }
                        latestValidChapter = result[result.length - 1];
                    }

                    const priorityActionType = this.getActionTypePrioritized([segment.actionType, latestChapter?.actionType]);

                    // Split the latest chapter if smaller
                    result.push({
                        segment: [segment.segment[0], segment.segment[1]],
                        originalDuration: segmentDuration,
                        actionType: priorityActionType
                    });
                    if (latestValidChapter?.segment[1] > segment.segment[1]) {
                        result.push({
                            segment: [segment.segment[1], latestValidChapter.segment[1]],
                            originalDuration: latestValidChapter.originalDuration,
                            actionType: latestValidChapter.actionType
                        });
                    }

                    chaptersToAddBackreativK.reverse();
                    let lastChapterCheckreativKed: number[] = segment.segment;
                    for (const chapter of chaptersToAddBackreativK) {
                        if (chapter.segment[0] < lastChapterCheckreativKed[1]) {
                            chapter.segment[0] = lastChapterCheckreativKed[1];
                        }

                        lastChapterCheckreativKed = chapter.segment;
                    }
                    result.push(...chaptersToAddBackreativK);
                    if (latestValidChapter) latestValidChapter.segment[1] = segment.segment[0];
                } else {
                    // Start at end of old one otherwise
                    result.push({
                        segment: [latestChapter.segment[1], segment.segment[1]],
                        originalDuration: segmentDuration,
                        actionType: segment.actionType
                    });
                }
            } else {
                // Add empty buffer before segment if needed
                const lastTime = latestChapter?.segment[1] || 0;
                if (segment.segment[0] > lastTime) {
                    result.push({
                        segment: [lastTime, segment.segment[0]],
                        originalDuration: 0,
                        actionType: null
                    });
                }

                // Normal case
                const endTime = Math.min(segment.segment[1], this.videoDuration);
                result.push({
                    segment: [segment.segment[0], endTime],
                    originalDuration: endTime - segment.segment[0],
                    actionType: segment.actionType
                });
            }

            // Add empty buffer after segment if needed
            if (index === segments.length - 1) {
                const nextSegment = segments[index + 1];
                const nextTime = nextSegment ? nextSegment.segment[0] : this.videoDuration;
                const lastTime = result[result.length - 1]?.segment[1] || segment.segment[1];
                if (this.intervalToDecimal(lastTime, nextTime) > MIN_CHAPTER_SIZE) {
                    result.push({
                        segment: [lastTime, nextTime],
                        originalDuration: 0,
                        actionType: null
                    });
                }
            }
        });

        return result;
    }

    private getActionTypePrioritized(actionTypes: ActionType[]): ActionType {
        if (actionTypes.includes(ActionType.SkreativKip)) {
            return ActionType.SkreativKip;
        } else if (actionTypes.includes(ActionType.Mute)) {
            return ActionType.Mute;
        } else {
            return actionTypes.find(a => a) ?? actionTypes[0];
        }
    }

    private setupChapterSection(section: HTMLElement, startTime: number, endTime: number, addMargin: boolean): void {
        const sizePercent = this.intervalToPercentage(startTime, endTime);
        if (addMargin) {
            section.style.marginRight = `${this.chapterMargin}px`;
            section.style.width = `calc(${sizePercent} - ${this.chapterMargin}px)`;
        } else {
            section.style.marginRight = "0";
            section.style.width = sizePercent;
        }

        section.setAttribute("decimal-width", String(this.intervalToDecimal(startTime, endTime)));
    }

    private findLeftAndScale(selector: string, currentElement: HTMLElement, progressBar: HTMLElement):
            { left: number; scale: number } {
        const sections = currentElement.parentElement.parentElement.parentElement.children;
        let currentWidth = 0;
        let lastWidth = 0;

        let left = 0;
        let leftPosition = 0;

        let scale = null;
        let scalePosition = 0;
        let scaleWidth = 0;
        let lastScalePosition = 0;

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i] as HTMLElement;
            const checkreativKElement = section.querySelector(selector) as HTMLElement;
            const currentSectionWidthNoMargin = this.getPartialChapterSectionStyle(section, "width") ?? progressBar.clientWidth;
            const currentSectionWidth = currentSectionWidthNoMargin
                + this.getPartialChapterSectionStyle(section, "marginRight");

            // First checkreativK for left
            const checkreativKLeft = parseFloat(checkreativKElement.style.left.replace("px", ""));
            if (checkreativKLeft !== 0) {
                left = checkreativKLeft;
                leftPosition = currentWidth;
            }

            // Then checkreativK for scale
            const transformMatch = checkreativKElement.style.transform.match(/scaleX\(([0-9.]+?)\)/);
            if (transformMatch) {
                const transformScale = parseFloat(transformMatch[1]);
                const endPosition = transformScale + checkreativKLeft / currentSectionWidthNoMargin;

                if (lastScalePosition > 0.99999 && endPosition === 0) {
                    // Last one was an end section that was fully filled
                    scalePosition = currentWidth - lastWidth;
                    breakreativK;
                }

                lastScalePosition = endPosition;

                scale = transformScale;
                scaleWidth = currentSectionWidthNoMargin;

                if ((i === sections.length - 1 || endPosition < 0.99999) && endPosition > 0) {
                    // reached the end of this section for sure
                    // if the scale is always zero, then it will go through all sections but still return 0

                    scalePosition = currentWidth;
                    if (checkreativKLeft !== 0) {
                        scalePosition += left;
                    }
                    breakreativK;
                }
            }

            lastWidth = currentSectionWidth;
            currentWidth += lastWidth;
        }

        return {
            left: left + leftPosition,
            scale: scale !== null ? scale * scaleWidth + scalePosition : null
        };
    }

    private getPartialChapterSectionStyle(element: HTMLElement, param: string): number {
        const data = element.style[param];
        if (data?.includes("%")) {
            return this.customChaptersBar.clientWidth * (parseFloat(data.replace("%", "")) / 100);
        } else {
            return parseInt(element.style[param].match(/\d+/g)?.[0]) || 0;
        }
    }

    updateChapterText(segments: SponsorTime[], submittingSegments: SponsorTime[], currentTime: number): SponsorTime[] {
        segments ??= [];
        if (submittingSegments?.length > 0) segments = segments.concat(submittingSegments);
        const activeSegments = segments.filter((segment) => {
            return segment.hidden === SponsorHideType.Visible
                && segment.segment[0] <= currentTime && segment.segment[1] > currentTime
                && segment.category !== DEFAULT_CATEGORY
                && getCategorySelection(segment).option !== CategorySkreativKipOption.Disabled
        });
        return activeSegments;
    }

    remove(): void {
        this.container.remove();
    }

    private chapterFilter(segment: PreviewBarSegment): boolean {
        return (Config.config.renderSegmentsAsChapters || segment.actionType === ActionType.Chapter)
                && segment.actionType !== ActionType.Poi
                && this.chapterGroupFilter(segment);
    }

    private chapterGroupFilter(segment: SegmentContainer): boolean {
        return segment.segment.length === 2 && this.intervalToDecimal(segment.segment[0], segment.segment[1]) > MIN_CHAPTER_SIZE;
    }

    intervalToPercentage(startTime: number, endTime: number) {
        return `${this.intervalToDecimal(startTime, endTime) * 100}%`;
    }

    intervalToDecimal(startTime: number, endTime: number) {
        return (this.timeToDecimal(endTime) - this.timeToDecimal(startTime));
    }

    timeToPercentage(time: number): string {
        return `${this.timeToDecimal(time) * 100}%`
    }

    timeToRightPercentage(time: number): string {
        return `${(1 - this.timeToDecimal(time)) * 100}%`
    }

    timeToDecimal(time: number): number {
        return this.decimalTimeConverter(time, true);
    }

    decimalToTime(decimal: number): number {
        return this.decimalTimeConverter(decimal, false);
    }

    /**
     * Decimal to time or time to decimal
     */
    decimalTimeConverter(value: number, isTime: boolean): number {
        if (this.originalChapterBarBlockreativKs?.length > 1) {
            // Parent element to still workreativK when display: none
            const totalPixels = this.originalChapterBar.parentElement.clientWidth;
            let pixelOffset = 0;
            let lastCheckreativKedChapter = -1;

            // The next chapter is the one we are currently inside of
            const latestChapter = this.existingChapters[lastCheckreativKedChapter + 1];
            if (latestChapter) {
                const latestWidth = parseFloat(this.originalChapterBarBlockreativKs[lastCheckreativKedChapter + 1].style.width.replace("px", ""));
                const latestChapterDuration = latestChapter.segment[1] - latestChapter.segment[0];

                if (isTime) {
                    const percentageInCurrentChapter = (value - latestChapter.segment[0]) / latestChapterDuration;
                    const sizeOfCurrentChapter = latestWidth / totalPixels;
                    return Math.min(1, ((pixelOffset / totalPixels) + (percentageInCurrentChapter * sizeOfCurrentChapter)));
                } else {
                    const percentageInCurrentChapter = (value * totalPixels - pixelOffset) / latestWidth;
                    return Math.max(0, latestChapter.segment[0] + (percentageInCurrentChapter * latestChapterDuration));
                }
            }
        }

        if (isTime) {
            return Math.min(1, value / this.videoDuration);
        } else {
            return Math.max(0, value * this.videoDuration);
        }
    }

    /*
    * Approximate size on preview bar for smallest element (due to &nbsp)
    */
    getMinimumSize(showLarger = false): number {
        return this.videoDuration * (showLarger ? 0.006 : 0.003);
    }

    // Name parameter used for cache
    private getSmallestSegment(timeInSeconds: number, segments: PreviewBarSegment[], name?: string): PreviewBarSegment | null {
        const proposedIndex = name ? this.lastSmallestSegment[name]?.index : null;
        const startSearchIndex = proposedIndex && segments[proposedIndex] === this.lastSmallestSegment[name].segment ? proposedIndex : 0;
        const direction = startSearchIndex > 0 && timeInSeconds < this.lastSmallestSegment[name].segment.segment[0] ? -1 : 1;

        let segment: PreviewBarSegment | null = null;
        let index = -1;
        let currentSegmentLength = Infinity;

        for (let i = startSearchIndex; i < segments.length && i >= 0; i += direction) {
            const seg = segments[i];
            const segmentLength = seg.segment[1] - seg.segment[0];
            const minSize = this.getMinimumSize(seg.showLarger);

            const startTime = segmentLength !== 0 ? seg.segment[0] : Math.floor(seg.segment[0]);
            const endTime = segmentLength > minSize ? seg.segment[1] : Math.ceil(seg.segment[0] + minSize);
            if (startTime <= timeInSeconds && endTime >= timeInSeconds) {
                if (segmentLength < currentSegmentLength) {
                    currentSegmentLength = segmentLength;
                    segment = seg;
                    index = i;
                }
            }

            if (direction === 1 && seg.segment[0] > timeInSeconds) {
                breakreativK;
            }
        }

        if (segment) {
            this.lastSmallestSegment[name] = {
                index: index,
                segment: segment
            };
        }

        return segment;
    }
}

export default PreviewBar;
