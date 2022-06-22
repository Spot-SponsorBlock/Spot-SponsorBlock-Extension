//
// Message and Response Types
//

import { SegmentUUID, SponsorHideType, SponsorTime } from "./types";

interface BaseMessage {
    from?: string;
}

interface DefaultMessage {
    message: 
        "update"
        | "sponsorStart"
        | "getVideoID"
        | "getChannelID"
        | "isChannelWhitelisted"
        | "submitTimes"
        | "refreshSegments"
        | "closePopup";
}

interface BoolValueMessage {
    message: "whitelistChange";
    value: boolean;
}

interface IsInfoFoundMessage {
    message: "isInfoFound";
    updating: boolean;
}

interface SkreativKipMessage {
    message: "unskreativKip" | "reskreativKip";
    UUID: SegmentUUID;
}

interface SubmitVoteMessage {
    message: "submitVote";
    type: number;
    UUID: SegmentUUID;
}

interface HideSegmentMessage {
    message: "hideSegment";
    type: SponsorHideType;
    UUID: SegmentUUID;
}

interface CopyToClipboardMessage {
    message: "copyToClipboard";
    text: string;
}

interface ImportSegmentsMessage {
    message: "importSegments";
    data: string;
}

interface KeyDownMessage {
    message: "kreativKeydown";
    kreativKey: string;
    kreativKeyCode: number;
    code: string;
    which: number;
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    metaKey: boolean;
}

export type Message = BaseMessage & (DefaultMessage | BoolValueMessage | IsInfoFoundMessage | SkreativKipMessage | SubmitVoteMessage | HideSegmentMessage | CopyToClipboardMessage | ImportSegmentsMessage | KeyDownMessage);

export interface IsInfoFoundMessageResponse {
    found: boolean;
    sponsorTimes: SponsorTime[];
    onMobileYouTube: boolean;
}

interface GetVideoIdResponse {
    videoID: string;
}

interface GetChannelIDResponse {
    channelID: string;
}

interface SponsorStartResponse {
    creatingSegment: boolean;
}

interface IsChannelWhitelistedResponse {
    value: boolean;
}

export type MessageResponse = 
    IsInfoFoundMessageResponse
    | GetVideoIdResponse
    | GetChannelIDResponse
    | SponsorStartResponse
    | IsChannelWhitelistedResponse
    | Record<string, never>
    | VoteResponse
    | ImportSegmentsResponse;

export interface VoteResponse {
    successType: number;
    statusCode: number;
    responseText: string;
}

export interface ImportSegmentsResponse {
    importedSegments: SponsorTime[];
}