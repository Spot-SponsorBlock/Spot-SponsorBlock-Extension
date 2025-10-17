import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import CategoryPillComponent, { CategoryPillState } from "../components/CategoryPillComponent";
import Config from "../config";
import { VoteResponse } from "../messageTypes";
import { Category, SegmentUUID, SponsorTime } from "../types";
import { Tooltip } from "./Tooltip";
import { waitFor } from "../utils/index";
import { getYouTubeTitleNode } from "../utils/elements";
import { addCleanupListener } from "../utils/cleanup";

const id = "categoryPill";

export class CategoryPill {
    container: HTMLElement;
    ref: React.RefObject<CategoryPillComponent>;
    root: Root;

    lastState: CategoryPillState;

    mutationObserver?: MutationObserver;
    onMobileYouTube: boolean;
    vote: (type: number, UUID: SegmentUUID, category?: Category) => Promise<VoteResponse>;
    
    constructor() {
        this.ref = React.createRef();

        addCleanupListener(() => {
            if (this.mutationObserver) {
                this.mutationObserver.disconnect();
            }
        });
    }

    async attachToPage(vote: (type: number, UUID: SegmentUUID, category?: Category) => Promise<VoteResponse>): Promise<void> {
        this.vote = vote;

        this.attachToPageInternal();
    }

    private async attachToPageInternal(): Promise<void> {
        let referenceNode =
            await waitFor(() => getYouTubeTitleNode());

        if (referenceNode && !referenceNode.contains(this.container)) {
            if (!this.container) {
                this.container = document.createElement('span');
                this.container.id = id;
                this.container.style.display = "flex";
                this.container.style.alignItems = "center";

                this.root = createRoot(this.container);
                this.ref = React.createRef();
                this.root.render(<CategoryPillComponent 
                        ref={this.ref}
                        vote={this.vote} 
                        showTextByDefault={!this.onMobileYouTube}
                        showTooltipOnClick={this.onMobileYouTube} />);

                if (this.onMobileYouTube) {
                    if (this.mutationObserver) {
                        this.mutationObserver.disconnect();
                    }
                    
                    this.mutationObserver = new MutationObserver((changes) => {
                        if (changes.some((change) => change.removedNodes.length > 0)) {
                            this.attachToPageInternal();
                        }
                    });
    
                    this.mutationObserver.observe(referenceNode, { 
                        childList: true,
                        subtree: true
                    });
                }
            }

            if (this.lastState) {
                waitFor(() => this.ref.current).then(() => {
                    this.ref.current?.setState(this.lastState);
                });
            }
            
            referenceNode.prepend(this.container);
        }
    }

    close(): void {
        this.root.unmount();
        this.container.remove();
    }

    setVisibility(show: boolean): void {
        const newState = {
            show,
            open: show ? this.ref.current?.state.open : false
        };

        this.ref.current?.setState(newState);
        this.lastState = newState;
    }

    async setSegment(segment: SponsorTime): Promise<void> {
        await waitFor(() => this.ref.current);

        if (this.ref.current?.state?.segment !== segment || !this.ref.current?.state?.show) {
            const newState = {
                segment,
                show: true,
                open: false
            };

            this.ref.current?.setState(newState);
            this.lastState = newState;

            if (!Config.config.categoryPillUpdate) {
                Config.config.categoryPillUpdate = true;

                const watchDiv = await waitFor(() => document.querySelector(".E526E3G50lCRjDpGVG5B") as HTMLElement);
                if (watchDiv) {
                    new Tooltip({
                        text: chrome.i18n.getMessage("categoryPillNewFeature"),
                        link: "https://blog.ajay.app/full-video-sponsorblock",
                        referenceNode: watchDiv,
                        prependElement: watchDiv.firstChild as HTMLElement,
                        bottomOffset: "-10px",
                        opacity: 0.95,
                        timeout: 50000
                    });
                }
            }
        }

        if (this.onMobileYouTube && !document.contains(this.container)) {
            this.attachToPageInternal();
        }
    }
}