interface CacheRecord {
    lastUsed: number;
}

export class DataCache<T extends string, V> {
    public cache: Record<string, V & CacheRecord>;
    private init: () => V;
    private onDelete?: (e: V) => void;
    private cacheLimit: number;

    constructor(init: () => V, onDelete?: (e: V) => void, cacheLimit = 2000) {
        this.cache = {};
        this.init = init;
        this.onDelete = onDelete;
        this.cacheLimit = cacheLimit;
    }

    public getFromCache(key: T): V & CacheRecord | undefined {
        return this.cache[key];
    }

    public setupCache(key: T): V & CacheRecord {
        if (!this.cache[key]) {
            this.cache[key] = {
                ...this.init(),
                lastUsed: Date.now()
            };

            if (Object.keys(this.cache).length > this.cacheLimit) {
                const oldest = Object.entries(this.cache).reduce((a, b) => a[1].lastUsed < b[1].lastUsed ? a : b);
                if (this.onDelete) this.onDelete(oldest[1]);
                delete this.cache[oldest[0]];
            }
        }

        return this.cache[key];
    }

    public cacheUsed(key: T): boolean {
        if (this.cache[key]) this.cache[key].lastUsed = Date.now();

        return !!this.cache[key];
    }
}

/**
 * acts like a promise, but the result can be checked without using async, if it's ready
 */
export class PeekPromise<T> implements Promise<T> {
    private ready: boolean;
    private value: T | null;
    private inner: Promise<T>;

    constructor(inner: Promise<T>) {
        this.inner = inner.then((res) => {
            this.value = res;
            this.ready = true;
            return res;
        });
        this.value = null;
        this.ready = false;
    }

    /**
     * Return the resolve value of the promise, if it has been resolved
     * Returns null otherwise
     */
    peek(): T | null {
        return this.value;
    }

    /**
     * Check whether the promise has resolved.
     * A rejected promise is not considered resolved.
     */
    isReady(): boolean {
        return this.ready;
    }

    // pass through methods to inner promise
    then<TResult1 = T, TResult2 = never>(
        onfulfilled?:
            | ((value: T) => TResult1 | PromiseLike<TResult1>)
            | null
            | undefined,
        onrejected?:
            | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
            | null
            | undefined,
    ): Promise<TResult1 | TResult2> {
        return this.inner.then(onfulfilled, onrejected);
    }

    catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult> {
        return this.inner.catch(onrejected);
    }

    finally(onfinally?: (() => void) | null | undefined): Promise<T> {
        return this.inner.finally(onfinally);
    }

    get [Symbol.toStringTag]() {
        return this.inner[Symbol.toStringTag];
    }
}