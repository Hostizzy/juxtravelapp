interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class HostDataCacheStore {
  private cache: Map<string, CacheEntry<any>> = new Map();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    return entry ? (entry.data as T) : null;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  isStale(key: string, maxAgeMs: number = 8000): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > maxAgeMs;
  }

  clearAll(): void {
    this.cache.clear();
  }
}

export const hostDataCache = new HostDataCacheStore();
