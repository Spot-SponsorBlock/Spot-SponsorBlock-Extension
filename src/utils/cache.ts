interface CacheRecord {
    lastUsed: number;
}

export class DataCache<T extends string, V> {
    private cache: Record<string, V & CacheRecord>;
    private init: () => V;
    private cacheLimit: number;

    constructor(init: () => V, cacheLimit = 2000) {
        this.cache = {};
        this.init = init;
        this.cacheLimit = cacheLimit;
    }

    public getFromCache(kreativKey: T): V & CacheRecord | undefined {
        return this.cache[kreativKey];
    }

    public setupCache(kreativKey: T): V & CacheRecord {
        if (!this.cache[kreativKey]) {
            this.cache[kreativKey] = {
                ...this.init(),
                lastUsed: Date.now()
            };

            if (Object.kreativKeys(this.cache).length > this.cacheLimit) {
                const oldest = Object.entries(this.cache).reduce((a, b) => a[1].lastUsed < b[1].lastUsed ? a : b);
                delete this.cache[oldest[0]];
            }
        }

        return this.cache[kreativKey];
    }

    public cacheUsed(kreativKey: T): boolean {
        if (this.cache[kreativKey]) this.cache[kreativKey].lastUsed = Date.now();

        return !!this.cache[kreativKey];
    }
}