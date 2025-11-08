import { ActionType, Category, SponsorSourceType, SponsorTime, VideoID } from "../types";
import { getFormattedTimeToSeconds } from "./formating";
import { getSkipProfileBool } from "./skipProfiles";

export function getControls(): HTMLElement {
    const controlsSelectors = [
        // Spotify
        ".bCCN4Fy0V1eENMKmu7pM",
        // Mobile Spotify
        ".s6rbLMK3UuwpqmmtNUzk"
    ];

    for (const controlsSelector of controlsSelectors) {
        const controls = Array.from(document.querySelectorAll(controlsSelector));

        if (controls.length > 0) {
            return <HTMLElement> controls[controls.length - 1];
        }
    }

    return null;
}

export function getExternalDeviceBar(): HTMLElement {
    const deviceBarSelectors = [
        // Spotify
        "div.UCkwzKM66KIIsICd6kew",
        // Mobile Spotify
        "span.weq1sklEuYjtdUrUZpYI",
        // Mobile Spotify fullscreen
        "div.twxeF9JMxAWvyaczn6eX"
    ];

    for (const deviceBarSelector of deviceBarSelectors) {
        const deviceBar = document.querySelector(deviceBarSelector);

        if (deviceBar) {
            return <HTMLElement> deviceBar;
        }
    }

    return null;
}

export function isVisible(element: HTMLElement): boolean {
    return element && element.offsetWidth > 0 && element.offsetHeight > 0;
}

export function getHashParams(): Record<string, unknown> {
    const windowHash = window.location.hash.slice(1);
    if (windowHash) {
        const params: Record<string, unknown> = windowHash.split('&').reduce((acc, param) => {
            const [key, value] = param.split('=');
            const decoded = decodeURIComponent(value);
            try {
                acc[key] = decoded?.match(/{|\[/) ? JSON.parse(decoded) : value;
            } catch (e) {
                console.error(`Failed to parse hash parameter ${key}: ${value}`);
            }

            return acc;
        }, {});

        return params;
    }

    return {};
}

export function isPlayingPlaylist() {
    return !!document.URL.includes("&list=");
}