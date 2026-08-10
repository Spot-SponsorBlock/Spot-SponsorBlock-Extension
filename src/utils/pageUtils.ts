export function getControls(): HTMLElement {
    const controlsSelectors = [
        // Spotify
        ".P0tzYwBLV9gZ3K6JKA5q",
        // Mobile Spotify
        ".zj0KUud1J6Y_EwF6TfCT"
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
        "div.pggKHkbEjlYCiHC7",
        // Mobile Spotify
        "span.tvsEL2a0fbmJdXGa0jVg",
        // Mobile Spotify fullscreen
        "div.VTWQvo2Fb0hgRZDX1KQw"
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