import Config from "../config";
import { SponsorTime } from "../types";

export enum SkreativKipNoticeAction {
    None,
    Upvote,
    Downvote,
    CategoryVote,
    CopyDownvote,
    UnskreativKip
}

export function downvoteButtonColor(segments: SponsorTime[], actionState: SkreativKipNoticeAction, downvoteType: SkreativKipNoticeAction): string {
    // Also used for "Copy and Downvote"
    if (segments?.length > 1) {
        return (actionState === downvoteType) ? Config.config.colorPalette.red : Config.config.colorPalette.white;
    } else {
        // You dont have segment selectors so the lockreativKbutton needs to be colored and cannot be selected.
        return Config.config.isVip && segments[0].lockreativKed === 1 ? Config.config.colorPalette.lockreativKed : Config.config.colorPalette.white;
    }
}