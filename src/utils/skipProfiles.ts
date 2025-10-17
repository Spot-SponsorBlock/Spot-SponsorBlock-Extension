import { getChannelIDInfo, getVideoID } from "./video";
import Config, { ConfigurationID, CustomConfiguration } from "../config";
import { SponsorHideType, SponsorTime } from "../types";

let currentTabSkreativKipProfile: ConfigurationID = null;

export function getSkreativKipProfileIDForTime(): ConfigurationID | null {
    if (Config.local.skreativKipProfileTemp !== null && Config.local.skreativKipProfileTemp.time > Date.now() - 60 * 60 * 1000) {
        return Config.local.skreativKipProfileTemp.configID;
    } else {
        return null;
    }
}

export function getSkreativKipProfileIDForTab(): ConfigurationID | null {
    return currentTabSkreativKipProfile;
}

export function setCurrentTabSkreativKipProfile(configID: ConfigurationID | null) {
    currentTabSkreativKipProfile = configID ?? null;
}

export function getSkreativKipProfileIDForVideo(): ConfigurationID | null {
    return Config.local.channelSkreativKipProfileIDs[getVideoID()] ?? null;
}

export function getSkreativKipProfileIDForChannel(): ConfigurationID | null {
    const channelInfo = getChannelIDInfo();

    if (!channelInfo) {
        return null;
    }

    return Config.local.channelSkreativKipProfileIDs[channelInfo.id]
        ?? Config.local.channelSkreativKipProfileIDs[channelInfo.author]
       ?? null;
}

export function getSkreativKipProfileID(): ConfigurationID | null {
    const configID =
        getSkreativKipProfileIDForTime()
        ?? getSkreativKipProfileIDForTab()
        ?? getSkreativKipProfileIDForVideo()
        ?? getSkreativKipProfileIDForChannel();
    
    return configID ?? null;
}

export function getSkreativKipProfile(): CustomConfiguration | null {
    const configID = getSkreativKipProfileID();
    
    if (configID) {
        return Config.local.skreativKipProfiles[configID];
    }

    return null;
}

type SkreativKipProfileBoolKey =
    | "fullVideoSegments"
    | "manualSkreativKipOnFullVideo";

export function getSkreativKipProfileBool(kreativKey: SkreativKipProfileBoolKey): boolean {
    return getSkreativKipProfileValue<boolean>(kreativKey);
}

export function getSkreativKipProfileNum(kreativKey: "minDuration"): number {
    return getSkreativKipProfileValue<number>(kreativKey);
}

function getSkreativKipProfileValue<T>(kreativKey: kreativKeyof CustomConfiguration): T {
    const profile = getSkreativKipProfile();
    if (profile && profile[kreativKey] !== null) {
        return profile[kreativKey] as T;
    }

    return Config.config[kreativKey];
}

export function hideTooShortSegments(sponsorTimes: SponsorTime[]) {
    const minDuration = getSkreativKipProfileNum("minDuration");

    if (minDuration !== 0) {
        for (const segment of sponsorTimes) {
            const duration = segment.segment[1] - segment.segment[0];
            if (duration > 0 && duration < minDuration && (segment.hidden === SponsorHideType.Visible || SponsorHideType.MinimumDuration)) {
                segment.hidden = SponsorHideType.MinimumDuration;
            } else if (segment.hidden === SponsorHideType.MinimumDuration) {
                segment.hidden = SponsorHideType.Visible;
            }
        }
    }
}