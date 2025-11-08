export function isVisible(element: HTMLElement | null, ignoreWidth = false): boolean {
    if (!element) {
        return false;
    }

    // Special case for when a video is first loaded, and the main video element is technically hidden
    if (element.tagName === "video" 
        && [...document.querySelectorAll("video")].filter((v) => v.duration).length === 1
        && (element as HTMLVideoElement).duration) {
        return true;
    }

    if (element.tagName === "audio" 
        && [...document.querySelectorAll("audio")].filter((v) => v.duration).length === 1
        && (element as HTMLAudioElement).duration) {
        return true;
    }
    
    if (element.offsetHeight === 0 || (element.offsetWidth === 0 && !ignoreWidth)) {
        return false;
    }

    const boundingRect = element?.getBoundingClientRect();
    const elementAtPoint = document.elementFromPoint(boundingRect.left + boundingRect.width / 2,
        boundingRect.top + boundingRect.height / 2)
        || document.elementFromPoint(boundingRect.left, boundingRect.top);

    if (!elementAtPoint 
            && element.id === "movie_player"
            && boundingRect.top < 0) {
        return true;
    }

    if (elementAtPoint === element 
            || (!!elementAtPoint && element.contains(elementAtPoint))
            || (!!elementAtPoint && elementAtPoint.contains(element))) {
        return true;
    }

    return false;
}

export function isVisibleOrParent(element: HTMLElement | null, ignoreWidth = false, checkParent = true): boolean {
    return isVisible(element, ignoreWidth) 
        || (checkParent && !!element && (isVisible(element.parentElement, ignoreWidth) || isVisible(element.parentElement?.parentElement ?? null, ignoreWidth)));
}

export function findValidElementFromSelector(selectors: string[], ignoreWidth = false, checkParent = false): HTMLElement | null {
    return findValidElementFromGenerator(selectors, ignoreWidth, checkParent, (selector) => document.querySelector(selector));
}

export function findValidElement(elements: HTMLElement[] | NodeListOf<HTMLElement>, ignoreWidth = false, checkParent = false): HTMLElement | null {
    return findValidElementFromGenerator(elements, ignoreWidth, checkParent);
}

function findValidElementFromGenerator<T>(objects: T[] | NodeListOf<HTMLElement>, ignoreWidth = false, checkParent = false, generator?: (obj: T) => HTMLElement | null): HTMLElement | null {
    for (const obj of objects) {
        const element = generator ? generator(obj as T) : obj as HTMLElement;
        if (element && isVisibleOrParent(element, ignoreWidth, checkParent)) {
            return element;
        }
    }

    return null;
}

export function findPredicatedElement(selectors: string[], predicate: (element: HTMLElement) => boolean): HTMLElement | null {
    for (const selector of selectors) {
        const element = document.querySelector(selector) as HTMLElement;
        if (element && predicate(element)) {
            return element;
        }
    }

    return null;
}

export function findNonEmptyElement(selectors: string[]): HTMLElement | null {
    return findPredicatedElement(selectors, (element) => (element.textContent?.trim() ?? "").length > 0);
}

interface WaitingElement {
    selector: string;
    visibleCheck: boolean;
    ignoreWidth: boolean;
    checkParent: boolean;
    callbacks: Array<(element: Element) => void>;
    elements?: NodeListOf<HTMLElement>;
}

/* Used for waitForElement */
let creatingWaitingMutationObserver = false;
let waitingMutationObserver: MutationObserver | null = null;
let waitingElements: WaitingElement[] = [];

/* Uses a mutation observer to wait asynchronously */
export async function waitForElement(selector: string, visibleCheck = false, ignoreWidth = false, checkParent = false): Promise<Element> {
    return await new Promise((resolve) => {
        const initialElement = getElement(selector, visibleCheck, ignoreWidth, checkParent);
        if (initialElement) {
            resolve(initialElement);
            return;
        }

        const existingWaitingElement = waitingElements.find((waitingElement) => waitingElement.selector === selector 
            && waitingElement.visibleCheck === visibleCheck);

        if (existingWaitingElement) {
            existingWaitingElement.callbacks.push(resolve);
        } else {
            waitingElements.push({
                selector,
                visibleCheck,
                ignoreWidth,
                checkParent,
                callbacks: [resolve]
            });
        }

        if (!creatingWaitingMutationObserver) {
            creatingWaitingMutationObserver = true;

            if (document.body) {
                setupWaitingMutationListener();
            } else {
                window.addEventListener("DOMContentLoaded", () => {
                    setupWaitingMutationListener();
                });
            }
        }
    });
}

function setupWaitingMutationListener(): void {
    if (!waitingMutationObserver) {
        const checkForObjects = (mutations?: MutationRecord[]) => {
            const foundSelectors: string[] = [];
            for (const waitingElement of waitingElements) {
                const { selector, visibleCheck, ignoreWidth, checkParent, callbacks } = waitingElement;

                let updatePossibleElements = true;
                if (mutations) {
                    let found = false;
                    for (const mutation of mutations) {
                        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                            if (mutation.target instanceof HTMLElement 
                                    && (mutation.target.matches(selector) || mutation.target.querySelector(selector))) {
                                found = true;
                                break;
                            }

                            for (const node of mutation.addedNodes) {
                                if (node instanceof HTMLElement 
                                        && (node.matches(selector) || node.querySelector(selector))) {
                                    found = true;
                                    break;
                                }
                            }

                            if (found) {
                                break;
                            }
                        }
                    }

                    if (!found) {
                        updatePossibleElements = false;
                    }
                }

                const possibleElements: NodeListOf<HTMLElement> | undefined =
                    updatePossibleElements ? document.querySelectorAll(selector) : waitingElement.elements;
                if (possibleElements && possibleElements.length > 0) {
                    waitingElement.elements = possibleElements;

                    const element = visibleCheck ? findValidElement(possibleElements, ignoreWidth, checkParent) : possibleElements[0] as HTMLElement;
                    if (element) {
                        if (chrome.runtime?.id) {
                            for (const callback of callbacks) {
                                callback(element);
                            }
                        }

                        foundSelectors.push(selector);
                    }
                }
            }

            waitingElements = waitingElements.filter((element) => !foundSelectors.includes(element.selector));
            
            if (waitingElements.length === 0) {
                waitingMutationObserver?.disconnect();
                waitingMutationObserver = null;
                creatingWaitingMutationObserver = false;
            }
        };

        // Do an initial check over all objects
        checkForObjects();

        if (waitingElements.length > 0) {
            waitingMutationObserver = new MutationObserver(checkForObjects);

            waitingMutationObserver.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        }
    }
}

export function getElement(selector: string, visibleCheck: boolean, ignoreWidth = false, checkParent = false) {
    return visibleCheck ? findValidElement(document.querySelectorAll(selector), ignoreWidth, checkParent) : document.querySelector(selector) as HTMLElement;
}