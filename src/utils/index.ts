/** Function that can be used to wait for a condition before returning. */
export async function waitFor<T>(condition: () => T, timeout = 5000, check = 100, predicate?: (obj: T) => boolean): Promise<T> {
    return await new Promise((resolve, reject) => {
        let interval: NodeJS.Timeout | null = null;

        const intervalCheck = () => {
            const result = condition();
            if (predicate ? predicate(result) : result) {
                resolve(result);
                if (interval) clearInterval(interval);
            }
        };

        if (timeout) {
            setTimeout(() => {
                clearInterval(interval!);
                reject(`TIMEOUT waiting for ${condition?.toString()}: ${Error().stack}`);
            }, timeout);

            interval = setInterval(intervalCheck, check);
        }
        
        // Run the check once first, this speeds it up a lot
        intervalCheck();
    });
}

export function objectToURI<T>(url: string, data: T, includeQuestionMark: boolean): string {
    let counter = 0;
    for (const key in data) {
        const seperator = (url.includes("?") || counter > 0) ? "&" : (includeQuestionMark ? "?" : "");
        const value = (typeof(data[key]) === "string") ? data[key] as unknown as string : JSON.stringify(data[key]);
        url += seperator + encodeURIComponent(key) + "=" + encodeURIComponent(value);

        counter++;
    }

    return url;
}

export class PromiseTimeoutError<T> extends Error {
    promise?: Promise<T>;

    constructor(promise?: Promise<T>) {
        super("Promise timed out");

        this.promise = promise;
    }
}

export function timeoutPomise<T>(timeout?: number): Promise<T> {
    return new Promise((resolve, reject) => {
        if (timeout) {
            setTimeout(() => {
                reject(new PromiseTimeoutError());
            }, timeout);
        }
    });
}

/**
* web-extensions
*/
export function isFirefoxOrSafari(): boolean {
    // @ts-ignore
    return typeof(browser) !== "undefined";
}

export function isOpera(): boolean {
    return document.querySelector("#operaUserStyle") !== null;
}

let cachedUserAgent: string;
export function extensionUserAgent(): string {
    cachedUserAgent ??= `${chrome.runtime.id}/v${chrome.runtime.getManifest().version}`;
    return cachedUserAgent;
}
