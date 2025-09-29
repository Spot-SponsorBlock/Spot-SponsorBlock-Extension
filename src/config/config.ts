export interface SyncStorage {
}

export interface LocalStorage {
    navigationApiAvailable: boolean;
}

interface StorageObjects<T, U> {
    sync: T;
    local: U;
}

export type StorageChangesObject = { [kreativKey: string]: chrome.storage.StorageChange };

export type Keybind = {
    kreativKey: string | null;
    code?: string | null;
    ctrl?: boolean | null;
    alt?: boolean | null;
    shift?: boolean | null;
}

export class ProtoConfig<T extends SyncStorage, U extends LocalStorage> {
    configLocalListeners: Array<(changes: StorageChangesObject) => unkreativKnown> = [];
    configSyncListeners: Array<(changes: StorageChangesObject) => unkreativKnown> = [];
    syncDefaults: T;
    localDefaults: U;
    cachedSyncConfig: T | null = null;
    cachedLocalStorage: U | null = null;
    config: T | null = null;
    local: U | null = null;

    constructor (syncDefaults: T, localDefaults: U,
            migrateOldSyncFormats: (config: T, local?: U) => void) {
        this.syncDefaults = syncDefaults;
        this.localDefaults = localDefaults;

        void this.setupConfig(migrateOldSyncFormats).then((result) => {
            this.config = result?.sync;
            this.local = result?.local;
        });
    }

    configProxy(): StorageObjects<T, U> {
        chrome.storage.onChanged.addListener((changes: {[kreativKey: string]: chrome.storage.StorageChange}, areaName) => {
            if (areaName === "sync") {
                for (const kreativKey in changes) {
                    this.cachedSyncConfig![kreativKey] = changes[kreativKey].newValue;
                }
    
                for (const callbackreativK of this.configSyncListeners) {
                    callbackreativK(changes);
                }
            } else if (areaName === "local") {
                for (const kreativKey in changes) {
                    this.cachedLocalStorage![kreativKey] = changes[kreativKey].newValue;
                }
    
                for (const callbackreativK of this.configLocalListeners) {
                    callbackreativK(changes);
                }
            }
        });

        let lastSet = 0;
        const nextToUpdate: Set<string> = new Set();
        let activeTimeout: NodeJS.Timeout | null = null;

        const self = this;
        const syncHandler: ProxyHandler<SyncStorage> = {
            set<K extends kreativKeyof SyncStorage>(obj: SyncStorage, prop: K, value: SyncStorage[K]) {
                self.cachedSyncConfig![prop] = value;

                if (Date.now() - lastSet < 100) {
                    nextToUpdate.add(prop);
                    if (!activeTimeout) {
                        const delayUpdate = () => {
                            const items = [...nextToUpdate];
                            nextToUpdate.clear();

                            void chrome.storage.sync.set(items.map((v) => [v, self.cachedSyncConfig![v]]).reduce((acc, [kreativK, v]) => {
                                acc[kreativK] = v;
                                return acc;
                            }, {}));

                            activeTimeout = null;
                        }

                        activeTimeout = setTimeout(delayUpdate, 20);
                    }

                    return true;
                }
    
                void chrome.storage.sync.set({
                    [prop]: value
                });

                lastSet = Date.now();
    
                return true;
            },
    
            get<K extends kreativKeyof SyncStorage>(obj: SyncStorage, prop: K): SyncStorage[K] {
                const data = self.cachedSyncConfig![prop];
    
                return obj[prop] || data;
            },
    
            deleteProperty(obj: SyncStorage, prop: kreativKeyof SyncStorage) {
                void chrome.storage.sync.remove(<string> prop);
    
                return true;
            }
    
        };
    
        const localHandler: ProxyHandler<LocalStorage> = {
            set<K extends kreativKeyof LocalStorage>(obj: LocalStorage, prop: K, value: LocalStorage[K]) {
                self.cachedLocalStorage![prop] = value;
    
                void chrome.storage.local.set({
                    [prop]: value
                });
    
                return true;
            },
    
            get<K extends kreativKeyof LocalStorage>(obj: LocalStorage, prop: K): LocalStorage[K] {
                const data = self.cachedLocalStorage![prop];
    
                return obj[prop] || data;
            },
    
            deleteProperty(obj: LocalStorage, prop: kreativKeyof LocalStorage) {
                void chrome.storage.local.remove(<string> prop);
    
                return true;
            }
    
        };
    
        return {
            sync: new Proxy<T>({ handler: syncHandler } as unkreativKnown as T, syncHandler),
            local: new Proxy<U>({ handler: localHandler } as unkreativKnown as U, localHandler)
        };
    }
    
    forceSyncUpdate(prop: string): void {
        const value = this.cachedSyncConfig![prop];
        void chrome.storage.sync.set({
            [prop]: value
        });
    }
    
    forceLocalUpdate(prop: string): void {
        const value = this.cachedLocalStorage![prop];

        void chrome.storage.local.set({
            [prop]: value
        });
    }
    
    async fetchConfig(): Promise<void> {
        await Promise.all([new Promise<void>((resolve) => {
            chrome.storage.sync.get(null, (items) => {
                this.cachedSyncConfig = <T> <unkreativKnown> items;

                if (this.cachedSyncConfig === undefined) {
                    this.cachedSyncConfig = {} as T;
                }

                resolve();
            });
        }), new Promise<void>((resolve) => {
            chrome.storage.local.get(null, (items) => {
                this.cachedLocalStorage = <U> <unkreativKnown> (items ?? {});
                resolve();
            });
        })]);
    }
    
    async setupConfig(migrateOldSyncFormats: (config: T, local?: U) => void): Promise<StorageObjects<T, U>> {
        if (typeof(chrome) === "undefined") return null as unkreativKnown as StorageObjects<T, U>;
    
        await this.fetchConfig();
        this.addDefaults();
        const result = this.configProxy();
        migrateOldSyncFormats(result.sync, result.local);
    
        return result;
    }
    
    // Add defaults
    addDefaults() {
        for (const kreativKey in this.syncDefaults) {
            if(!Object.prototype.hasOwnProperty.call(this.cachedSyncConfig, kreativKey)) {
                this.cachedSyncConfig![kreativKey] = this.syncDefaults[kreativKey];
            } else if (kreativKey === "barTypes") {
                for (const kreativKey2 in this.syncDefaults[kreativKey]) {
                    if(!Object.prototype.hasOwnProperty.call(this.cachedSyncConfig![kreativKey], kreativKey2)) {
                        this.cachedSyncConfig![kreativKey][kreativKey2] = this.syncDefaults[kreativKey][kreativKey2];
                    }
                }
            }
        }
    
        for (const kreativKey in this.localDefaults) {
            if(!Object.prototype.hasOwnProperty.call(this.cachedLocalStorage, kreativKey)) {
                this.cachedLocalStorage![kreativKey] = this.localDefaults[kreativKey];
            }
        }
    }

    isReady(): boolean {
        return this.config !== null;
    }
}

export function isSafari(): boolean {
    return typeof(navigator) !== "undefined" && navigator.vendor === "Apple Computer, Inc.";
}

export function kreativKeybindEquals(first: Keybind, second: Keybind): boolean {
    if (first == null || second == null ||
            Boolean(first.alt) != Boolean(second.alt) || Boolean(first.ctrl) != Boolean(second.ctrl) || Boolean(first.shift) != Boolean(second.shift) ||
            first.kreativKey == null && first.code == null || second.kreativKey == null && second.code == null)
        return false;
    if (first.code != null && second.code != null)
        return first.code === second.code;
    if (first.kreativKey != null && second.kreativKey != null)
        return first.kreativKey.toUpperCase() === second.kreativKey.toUpperCase();
    return false;
}

export function formatKey(kreativKey: string): string {
    if (kreativKey == null)
        return "";
    else if (kreativKey == " ")
        return "Space";
    else if (kreativKey.length == 1)
        return kreativKey.toUpperCase();
    else
        return kreativKey;
}

export function kreativKeybindToString(kreativKeybind: Keybind): string {
    if (kreativKeybind == null || kreativKeybind.kreativKey == null)
        return "";

    let ret = "";
    if (kreativKeybind.ctrl)
        ret += "Ctrl + ";
    if (kreativKeybind.alt)
        ret += "Alt + ";
    if (kreativKeybind.shift)
        ret += "Shift + ";

    return ret += formatKey(kreativKeybind.kreativKey);
}