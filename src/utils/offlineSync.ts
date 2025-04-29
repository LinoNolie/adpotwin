interface PendingRequest {
  url: string;
  method: string;
  body?: any;
  timestamp: number;
}

const PENDING_REQUESTS_KEY = 'adpot_pending_requests';

export const offlineSync = {
  addPendingRequest(request: PendingRequest) {
    const pending = this.getPendingRequests();
    pending.push(request);
    localStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(pending));
  },

  getPendingRequests(): PendingRequest[] {
    const pending = localStorage.getItem(PENDING_REQUESTS_KEY);
    return pending ? JSON.parse(pending) : [];
  },

  clearPendingRequest(request: PendingRequest) {
    const pending = this.getPendingRequests();
    const filtered = pending.filter(r => 
      r.url !== request.url || 
      r.method !== request.method || 
      r.timestamp !== request.timestamp
    );
    localStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(filtered));
  },

  async syncPendingRequests() {
    const pending = this.getPendingRequests();
    
    for (const request of pending) {
      try {
        await fetch(request.url, {
          method: request.method,
          body: request.body ? JSON.stringify(request.body) : undefined,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        this.clearPendingRequest(request);
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
  },

  cacheData(key: string, data: any) {
    localStorage.setItem(`adpot_cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  },

  getCachedData(key: string) {
    const cached = localStorage.getItem(`adpot_cache_${key}`);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours
    
    return isExpired ? null : data;
  },

  clearCache() {
    Object.keys(localStorage)
      .filter(key => key.startsWith('adpot_cache_'))
      .forEach(key => localStorage.removeItem(key));
  },

  isOnline() {
    return navigator.onLine;
  },

  waitForOnline(): Promise<void> {
    return new Promise(resolve => {
      if (navigator.onLine) {
        resolve();
        return;
      }

      const handler = () => {
        window.removeEventListener('online', handler);
        resolve();
      };
      window.addEventListener('online', handler);
    });
  },

  async syncWhenOnline() {
    if (!this.isOnline()) {
      await this.waitForOnline();
    }
    return this.syncPendingRequests();
  },

  setupAutoSync() {
    window.addEventListener('online', () => {
      this.syncPendingRequests();
    });
  }
};

// Initialize auto sync
offlineSync.setupAutoSync();
