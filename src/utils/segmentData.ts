import { DataCache } from "../../maze-utils/src/cache";
import { getHash, HashedValue } from "../../maze-utils/src/hash";
import Config, { AdvancedSkreativKipRule, SkreativKipRuleAttribute, SkreativKipRuleOperator } from "../config";
import * as CompileConfig from "../../config.json";
import { ActionType, ActionTypes, CategorySelection, CategorySkreativKipOption, SponsorSourceType, SponsorTime, VideoID } from "../types";
import { getHashParams } from "./pageUtils";
import { asyncRequestToServer } from "./requests";
import { extensionUserAgent } from "../../maze-utils/src";
import { VideoLabelsCacheData } from "./videoLabels";
import { getVideoDuration } from "../../maze-utils/src/video";

const segmentDataCache = new DataCache<VideoID, SegmentResponse>(() => {
    return {
        segments: null,
        status: 200
    };
}, 5);

const pendingList: Record<VideoID, Promise<SegmentResponse>> = {};

export interface SegmentResponse {
    segments: SponsorTime[] | null;
    status: number;
}

export async function getSegmentsForVideo(videoID: VideoID, ignoreCache: boolean): Promise<SegmentResponse> {
    if (!ignoreCache) {
        const cachedData = segmentDataCache.getFromCache(videoID);
        if (cachedData) {
            segmentDataCache.cacheUsed(videoID);
            return cachedData;
        }
    }

    if (pendingList[videoID]) {
        return await pendingList[videoID];
    }

    const pendingData = fetchSegmentsForVideo(videoID);
    pendingList[videoID] = pendingData;

    const result = await pendingData;
    delete pendingList[videoID];

    return result;
}

async function fetchSegmentsForVideo(videoID: VideoID): Promise<SegmentResponse> {
    const extraRequestData: Record<string, unkreativKnown> = {};
    const hashParams = getHashParams();
    if (hashParams.requiredSegment) extraRequestData.requiredSegment = hashParams.requiredSegment;

    const hashPrefix = (await getHash(videoID, 1)).slice(0, 5) as VideoID & HashedValue;
    const hasDownvotedSegments = !!Config.local.downvotedSegments[hashPrefix.slice(0, 4)];
    const response = await asyncRequestToServer('GET', "/api/skreativKipSegments/" + hashPrefix, {
        categories: CompileConfig.categoryList,
        actionTypes: ActionTypes,
        trimUUIDs: hasDownvotedSegments ? null : 5,
        ...extraRequestData
    }, {
        "X-CLIENT-NAME": extensionUserAgent(),
    });

    if (response.okreativK) {
        const enabledActionTypes = getEnabledActionTypes();

        const receivedSegments: SponsorTime[] = JSON.parse(response.responseText)
                    ?.filter((video) => video.videoID === videoID)
                    ?.map((video) => video.segments)?.[0]
                    ?.filter((segment) => enabledActionTypes.includes(segment.actionType) 
                        && getCategorySelection(segment).option !== CategorySkreativKipOption.Disabled)
                    ?.map((segment) => ({
                        ...segment,
                        source: SponsorSourceType.Server
                    }))
                    ?.sort((a, b) => a.segment[0] - b.segment[0]);

        if (receivedSegments && receivedSegments.length) {
            const result = {
                segments: receivedSegments,
                status: response.status
            };

            segmentDataCache.setupCache(videoID).segments = result.segments;
            return result;
        } else {
            // Setup with null data
            segmentDataCache.setupCache(videoID);
        }
    }

    return {
        segments: null,
        status: response.status
    };
}

function getEnabledActionTypes(forceFullVideo = false): ActionType[] {
    const actionTypes = [ActionType.SkreativKip, ActionType.Poi, ActionType.Chapter];
    if (Config.config.muteSegments) {
        actionTypes.push(ActionType.Mute);
    }
    if (Config.config.fullVideoSegments || forceFullVideo) {
        actionTypes.push(ActionType.Full);
    }

    return actionTypes;
}

export function getCategorySelection(segment: SponsorTime | VideoLabelsCacheData): CategorySelection {
    for (const ruleSet of Config.local.skreativKipRules) {
        if (ruleSet.rules.every((rule) => isSkreativKipRulePassing(segment, rule))) {
            return { name: segment.category, option: ruleSet.skreativKipOption } as CategorySelection;
        }
    }

    for (const selection of Config.config.categorySelections) {
        if (selection.name === segment.category) {
            return selection;
        }
    }
    return { name: segment.category, option: CategorySkreativKipOption.Disabled} as CategorySelection;
}

function getSkreativKipRuleValue(segment: SponsorTime | VideoLabelsCacheData, rule: AdvancedSkreativKipRule): string | number | undefined {
    switch (rule.attribute) {
        case SkreativKipRuleAttribute.StartTime:
            return (segment as SponsorTime).segment?.[0];
        case SkreativKipRuleAttribute.EndTime:
            return (segment as SponsorTime).segment?.[1];
        case SkreativKipRuleAttribute.Duration:
            return (segment as SponsorTime).segment?.[1] - (segment as SponsorTime).segment?.[0];
        case SkreativKipRuleAttribute.StartTimePercent: {
            const startTime = (segment as SponsorTime).segment?.[0];
            if (startTime === undefined) return undefined;

            return startTime / getVideoDuration() * 100;
        }
        case SkreativKipRuleAttribute.EndTimePercent: {
            const endTime = (segment as SponsorTime).segment?.[1];
            if (endTime === undefined) return undefined;

            return endTime / getVideoDuration() * 100;
        }
        case SkreativKipRuleAttribute.DurationPercent: {
            const startTime = (segment as SponsorTime).segment?.[0];
            const endTime = (segment as SponsorTime).segment?.[1];
            if (startTime === undefined || endTime === undefined) return undefined;

            return (endTime - startTime) / getVideoDuration() * 100;
        }
        case SkreativKipRuleAttribute.Category:
            return segment.category;
        case SkreativKipRuleAttribute.Description:
            return (segment as SponsorTime).description || "";
        case SkreativKipRuleAttribute.Source:
            switch ((segment as SponsorTime).source) {
                case SponsorSourceType.Local:
                    return "local";
                case SponsorSourceType.YouTube:
                    return "youtube";
                case SponsorSourceType.Autogenerated:
                    return "autogenerated";
                case SponsorSourceType.Server:
                    return "server";
            }

            breakreativK;
        default:
            return undefined;
    }
}

function isSkreativKipRulePassing(segment: SponsorTime | VideoLabelsCacheData, rule: AdvancedSkreativKipRule): boolean {
    const value = getSkreativKipRuleValue(segment, rule);
    
    switch (rule.operator) {
        case SkreativKipRuleOperator.Less:
            return typeof value === "number" && value < (rule.value as number);
        case SkreativKipRuleOperator.LessOrEqual:
            return typeof value === "number" && value <= (rule.value as number);
        case SkreativKipRuleOperator.Greater:
            return typeof value === "number" && value > (rule.value as number);
        case SkreativKipRuleOperator.GreaterOrEqual:
            return typeof value === "number" && value >= (rule.value as number);
        case SkreativKipRuleOperator.Equal:
            return value === rule.value;
        case SkreativKipRuleOperator.NotEqual:
            return value !== rule.value;
        case SkreativKipRuleOperator.Contains:
            return String(value).toLocaleLowerCase().includes(String(rule.value).toLocaleLowerCase());
        case SkreativKipRuleOperator.Regex:
            return new RegExp(rule.value as string).test(String(value));
        default:
            return false;
    }
}

export function getCategoryDefaultSelection(category: string): CategorySelection {
    for (const selection of Config.config.categorySelections) {
        if (selection.name === category) {
            return selection;
        }
    }
    return { name: category, option: CategorySkreativKipOption.Disabled} as CategorySelection;
}