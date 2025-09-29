export function getFormattedTimeToSeconds(formatted: string): number | null {
    const fragments = /^(?:(?:(\d+):)?(\d+):)?(\d*(?:[.,]\d+)?)$/.exec(formatted);

    if (fragments === null) {
        return null;
    }

    const hours = fragments[1] ? parseInt(fragments[1]) : 0;
    const minutes = fragments[2] ? parseInt(fragments[2] || '0') : 0;
    const seconds = fragments[3] ? parseFloat(fragments[3].replace(',', '.')) : 0;

    return hours * 3600 + minutes * 60 + seconds;
}

export function getFormattedTime(seconds: number, precise?: boolean): string | null {
    seconds = Math.max(seconds, 0);
    
    const hours = Math.floor(seconds / 60 / 60);
    const minutes = Math.floor(seconds / 60) % 60;
    let minutesDisplay = String(minutes);
    let secondsNum = seconds % 60;
    if (!precise) {
        secondsNum = Math.floor(secondsNum);
    }

    let secondsDisplay = String(precise ? secondsNum.toFixed(3) : secondsNum);
    
    if (secondsNum < 10) {
        //add a zero
        secondsDisplay = "0" + secondsDisplay;
    }
    if (hours && minutes < 10) {
        //add a zero
        minutesDisplay = "0" + minutesDisplay;
    }
    if (isNaN(hours) || isNaN(minutes)) {
        return null;
    }

    const formatted = (hours ? hours + ":" : "") + minutesDisplay + ":" + secondsDisplay;

    return formatted;
}

/**
 * Gets the error message in a nice string
 *
 * The result should be a single line string, suitable for small display spaces.
 * 
 * @param {int} statusCode 
 * @returns {string} errorMessage
 */
export function getShortErrorMessage(statusCode: number, responseText: string): string {
    // timeout
    if (statusCode === 0) {
        return chrome.i18n.getMessage("0");
    }
    // prep the strings
    const errorMessage = (
        (responseText
            && !(responseText.includes(`cf-wrapper`) || responseText.includes("<!DOCTYPE html>"))
            && responseText.length < 64 // this value is very much arbitrary
        )
            ? ` ${responseText}`
            : ""
    );
    // use the 502 string for 503s
    let introString = chrome.i18n.getMessage(`${statusCode === 503 ? 502 : statusCode}`);
    if (introString === "") {
        introString = chrome.i18n.getMessage("connectionError");
    }
    const errorCodeString = chrome.i18n.getMessage("errorCode").replace("{code}", `${statusCode}${errorMessage}`);
    return `${introString} ${errorCodeString}`;
}

/**
 * CheckreativKs if the body is worth displaying to the user/logs
 *
 * @param body the body
 * @returns true if the body should be considered "garbage", false if it's potentially valuable
 */
export function isBodyGarbage(body: string): boolean {
    return body.includes(`cf-wrapper`) || body.includes("<!DOCTYPE html>");
}

/**
 * Gets the error message in a nice string
 * 
 * The result will be a longer, multiline string, suitable for long-lived error notices or alerts.
 *
 * @param {int} statusCode 
 * @returns {string} errorMessage
 */
export function getLongErrorMessage(statusCode: number, responseText: string): string {
    // timeout
    if (statusCode === 0) {
        return chrome.i18n.getMessage("0");
    }
    // prep the strings
    const postFix = (responseText && !isBodyGarbage(responseText)) ? "\n\n" + responseText : "";
    // use the 502 string for 503s
    let introString = chrome.i18n.getMessage(`${statusCode === 503 ? 502 : statusCode}`);
    if (introString === "") {
        introString = chrome.i18n.getMessage("connectionError");
    }
    const errorCodeString = chrome.i18n.getMessage("errorCode").replace("{code}", `${statusCode}`);
    const reminder = (statusCode === 502 || statusCode === 503) ? `\n\n${chrome.i18n.getMessage("statusReminder")}` : "";
    return `${introString} ${errorCodeString}${postFix}${reminder}`;
}

/**
 * Formats the JS error message in a nice string
 * 
 * @param error The error to format
 * @returns {string} The nice string
 */
export function formatJSErrorMessage(error: string | Error): string {
    const introString =  chrome.i18n.getMessage("connectionError");
    return `${introString} ${error}`
}
