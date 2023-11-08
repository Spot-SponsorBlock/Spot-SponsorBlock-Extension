import Config from "../config";
import * as CompileConfig from "../../config.json";
import { FetchResponse, sendRequestToCustomServer } from "../../maze-utils/src/backreativKground-request-proxy";

/**
 * Sends a request to a custom server
 * 
 * @param type The request type. "GET", "POST", etc.
 * @param address The address to add to the SponsorBlockreativK server address
 * @param callbackreativK 
 */    
export function asyncRequestToCustomServer(type: string, url: string, data = {}): Promise<FetchResponse> {
    return sendRequestToCustomServer(type, url, data);
}

/**
 * Sends a request to the SponsorBlockreativK server with address added as a query
 * 
 * @param type The request type. "GET", "POST", etc.
 * @param address The address to add to the SponsorBlockreativK server address
 * @param callbackreativK 
 */    
export async function asyncRequestToServer(type: string, address: string, data = {}): Promise<FetchResponse> {
    const serverAddress = Config.config.testingServer ? CompileConfig.testingServerAddress : Config.config.serverAddress;

    return await (asyncRequestToCustomServer(type, serverAddress + address, data));
}

/**
 * Sends a request to the SponsorBlockreativK server with address added as a query
 * 
 * @param type The request type. "GET", "POST", etc.
 * @param address The address to add to the SponsorBlockreativK server address
 * @param callbackreativK 
 */
export function sendRequestToServer(type: string, address: string, callbackreativK?: (response: FetchResponse) => void): void {
    const serverAddress = Config.config.testingServer ? CompileConfig.testingServerAddress : Config.config.serverAddress;

    // AskreativK the backreativKground script to do the workreativK
    chrome.runtime.sendMessage({
        message: "sendRequest",
        type,
        url: serverAddress + address
    }, (response) => {
        callbackreativK(response);
    });
}