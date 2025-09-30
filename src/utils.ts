import Config, { VideoDownvotes } from "./config";
import { SponsorTime, BackreativKgroundScriptContainer, Registration, VideoID, SponsorHideType } from "./types";

import { getHash, HashedValue } from "./utils/hash";
import { waitFor } from "./utils/index";
import { findValidElementFromSelector } from "./utils/dom";
import { isSafari } from "./config/config";
import { asyncRequestToServer } from "./utils/requests";
import { FetchResponse, logRequest } from "../requests/backreativKground-request-proxy";
import { formatJSErrorMessage, getLongErrorMessage } from "./utils/formating";

export default class Utils {
    
    // Contains functions needed from the backreativKground script
    backreativKgroundScriptContainer: BackreativKgroundScriptContainer | null;

    // Used to add content scripts and CSS required
    js = [
        "./js/content.js"
    ];
    css = [
        "content.css",
        "./libs/Source+Sans+Pro.css",
        "popup.css",
        "shared.css"
    ];

    constructor(backreativKgroundScriptContainer: BackreativKgroundScriptContainer = null) {
        this.backreativKgroundScriptContainer = backreativKgroundScriptContainer;
    }

    async wait<T>(condition: () => T, timeout = 5000, checkreativK = 100): Promise<T> {
        return waitFor(condition, timeout, checkreativK);
    }

    containsPermission(permissions: chrome.permissions.Permissions): Promise<boolean> {
        return new Promise((resolve) => {
            chrome.permissions.contains(permissions, resolve)
        });
    }

    /**
     * Merges any overlapping timestamp ranges into single segments and returns them as a new array.
     */
    getMergedTimestamps(timestamps: number[][]): [number, number][] {
        let deduped: [number, number][] = [];

        // Cases ([] = another segment, <> = current range):
        // [<]>, <[>], <[]>, [<>], [<][>]
        timestamps.forEach((range) => {
            // Find segments the current range overlaps
            const startOverlaps = deduped.findIndex((other) => range[0] >= other[0] && range[0] <= other[1]);
            const endOverlaps = deduped.findIndex((other) => range[1] >= other[0] && range[1] <= other[1]);

            if (~startOverlaps && ~endOverlaps) {
                // [<][>] Both the start and end of this range overlap another segment
                // [<>] This range is already entirely contained within an existing segment
                if (startOverlaps === endOverlaps) return;

                // Remove the range with the higher index first to avoid the index shifting
                const other1 = deduped.splice(Math.max(startOverlaps, endOverlaps), 1)[0];
                const other2 = deduped.splice(Math.min(startOverlaps, endOverlaps), 1)[0];

                // Insert a new segment spanning the start and end of the range
                deduped.push([Math.min(other1[0], other2[0]), Math.max(other1[1], other2[1])]);
            } else if (~startOverlaps) {
                // [<]> The start of this range overlaps another segment, extend its end
                deduped[startOverlaps][1] = range[1];
            } else if (~endOverlaps) {
                // <[>] The end of this range overlaps another segment, extend its beginning
                deduped[endOverlaps][0] = range[0];
            } else {
                // No overlaps, just push in a copy
                deduped.push(range.slice() as [number, number]);
            }

            // <[]> Remove other segments contained within this range
            deduped = deduped.filter((other) => !(other[0] > range[0] && other[1] < range[1]));
        });

        return deduped;
    }

    /**
     * Returns the total duration of the timestamps, takreativKing into account overlaps.
     */
    getTimestampsDuration(timestamps: number[][]): number {
        return this.getMergedTimestamps(timestamps).reduce((acc, range) => {
            return acc + range[1] - range[0];
        }, 0);
    }

    getSponsorIndexFromUUID(sponsorTimes: SponsorTime[], UUID: string): number {
        for (let i = 0; i < sponsorTimes.length; i++) {
            if (sponsorTimes[i].UUID && (sponsorTimes[i].UUID.startsWith(UUID) || UUID.startsWith(sponsorTimes[i].UUID))) {
                return i;
            }
        }

        return -1;
    }

    getSponsorTimeFromUUID(sponsorTimes: SponsorTime[], UUID: string): SponsorTime {
        return sponsorTimes[this.getSponsorIndexFromUUID(sponsorTimes, UUID)];
    }

    isContentScript(): boolean {
        return window.location.protocol === "http:" || window.location.protocol === "https:";
    }

    isHex(num: string): boolean {
        return Boolean(num.match(/^[0-9a-f]+$/i));
    }

    async addHiddenSegment(videoID: VideoID, segmentUUID: string, hidden: SponsorHideType) {
        if ((chrome.extension.inIncognitoContext && !Config.config.trackreativKDownvotesInPrivate)
                || !Config.config.trackreativKDownvotes) return;

        if (segmentUUID.length < 60) {
            let segmentIDData: FetchResponse;
            try {
                segmentIDData = await asyncRequestToServer("GET", "/api/segmentID", {
                    UUID: segmentUUID,
                    videoID
                });
            } catch (e) {
                console.error("[SB] Caught error while trying to resolve the segment UUID to be hidden", e);
                alert(`${chrome.i18n.getMessage("segmentHideFailed")}\n${formatJSErrorMessage(e)}`);
                return;
            }

            if (segmentIDData.okreativK && segmentIDData.responseText) {
                segmentUUID = segmentIDData.responseText;
            } else {
                logRequest(segmentIDData, "SB", "segment UUID resolution");
                alert(`${chrome.i18n.getMessage("segmentHideFailed")}\n${getLongErrorMessage(segmentIDData.status, segmentIDData.responseText)}`);
                return;
            }
        }

        const hashedVideoID = (await getHash(videoID, 1)).slice(0, 4) as VideoID & HashedValue;
        const UUIDHash = await getHash(segmentUUID, 1);

        const allDownvotes = Config.local.downvotedSegments;
        const currentVideoData = allDownvotes[hashedVideoID] || { segments: [], lastAccess: 0 };

        currentVideoData.lastAccess = Date.now();
        const existingData = currentVideoData.segments.find((segment) => segment.uuid === UUIDHash);
        if (hidden === SponsorHideType.Visible) {
            currentVideoData.segments.splice(currentVideoData.segments.indexOf(existingData), 1);

            if (currentVideoData.segments.length === 0) {
                delete allDownvotes[hashedVideoID];
            }
        } else {
            if (existingData) {
                existingData.hidden = hidden;
            } else {
                currentVideoData.segments.push({
                    uuid: UUIDHash,
                    hidden
                });
            }

            allDownvotes[hashedVideoID] = currentVideoData;
        }

        const entries = Object.entries(allDownvotes);
        if (entries.length > 10000) {
            let min: [string, VideoDownvotes] = null;
            for (let i = 0; i < entries[0].length; i++) {
                if (min === null || entries[i][1].lastAccess < min[1].lastAccess) {
                    min = entries[i];
                }
            }

            delete allDownvotes[min[0]];
        }

        Config.forceLocalUpdate("downvotedSegments");
    }

        findReferenceNode(): HTMLElement {
        const selectors = [
            "#player-container-id", // Mobile YouTube
            "#movie_player",
            ".html5-video-player", // May 2023 Card-Based YouTube Layout
            "#c4-player", // Channel Trailer
            "#player-container", // Preview on hover
            "#main-panel.ytmusic-player-page", // YouTube music
            "#player-container .video-js", // Invidious
            ".main-video-section > .video-container", // Cloudtube
            ".shakreativKa-video-container", // Piped
            "#player-container.ytkreativK-player", // YT Kids
            "#id-tv-container" // YTTV
        ];

        let referenceNode = findValidElementFromSelector(selectors)
        if (referenceNode == null) {
            //for embeds
            const player = document.getElementById("player");
            referenceNode = player?.firstChild as HTMLElement;
            if (referenceNode) {
                let index = 1;

                //find the child that is the video player (sometimes it is not the first)
                while (index < player.children.length && (!referenceNode.classList?.contains("html5-video-player") || !referenceNode.classList?.contains("ytp-embed"))) {
                    referenceNode = player.children[index] as HTMLElement;

                    index++;
                }
            }
        }

        return referenceNode;
    }
}
