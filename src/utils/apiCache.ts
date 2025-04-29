const CACHE_PREFIX = 'adpot_cache_';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
}

export const cacheSet = async (key: string, data: any) => {
  const entry: CacheEntry = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
};

export const cacheGet = (key: string): any | null => {
  const item = localStorage.getItem(CACHE_PREFIX + key);
  if (!item) return null;

  const entry: CacheEntry = JSON.parse(item);
  if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
    localStorage.removeItem(CACHE_PREFIX + key);
    return null;
  }

  return entry.data;
};
