import { ApiError } from '../utils/apiRetry';
import { cacheGet, cacheSet } from '../utils/apiCache';
import { requestQueue } from '../utils/requestQueue';
import { offlineSync } from '../utils/offlineSync';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.adpot.win'
  : 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  cache?: boolean;
  priority?: number;
}

export interface CustomRequestInit extends Omit<RequestInit, 'cache'> {
  cache?: RequestCache;
}

// Check if we're online
const isOnline = () => navigator.onLine;

// Enhanced mock data
const mockData = {
  jackpots: {
    hourly: { 
      amount: 100, 
      timer: '59:59', 
      players: 150 
    },
    yearly: { 
      amount: 10000, 
      timer: '364d 23:59:59', 
      players: 1500 
    },
    random: { 
      amount: 500, 
      timer: null, 
      players: 300 
    }
  }
};

const get = async (endpoint: string) => {
  // Always return mock data in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Using mock data for', endpoint);
    if (endpoint === '/jackpots') return mockData.jackpots;
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Fallback to mock data on error
    if (endpoint === '/jackpots') return mockData.jackpots;
    throw error;
  }
};

async function fetchWithCache(url: string, options?: RequestOptions): Promise<any> {
  const cacheKey = `${options?.method || 'GET'}_${url}`;
  
  // Try cache first if enabled
  if (options?.cache) {
    const cached = cacheGet(cacheKey);
    if (cached) return cached;
  }

  // If offline, queue request for later
  if (!isOnline()) {
    offlineSync.addPendingRequest({
      url: BASE_URL + url,
      method: options?.method || 'GET',
      body: options?.body,
      timestamp: Date.now()
    });
    throw new Error('Offline - Request queued for sync');
  }

  // Queue the request
  return new Promise((resolve, reject) => {
    requestQueue.enqueue(async () => {
      try {
        const response = await fetch(BASE_URL + url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new ApiError(
            data.message || 'API request failed',
            response.status,
            data
          );
        }

        // Cache successful response if enabled
        if (options?.cache) {
          cacheSet(cacheKey, data);
        }

        resolve(data);
      } catch (error) {
        console.log('Using mock data for:', url);
        resolve(mockData[url as keyof typeof mockData]);
      }
    }, options?.priority || 0);
  });
}

export async function fetchWithRetry(url: string, options?: CustomRequestInit) {
  // ...existing code...
}

export const api = {
  get: <T>(url: string, options?: RequestOptions): Promise<T> => 
    fetchWithCache(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body: any, options?: RequestOptions): Promise<T> =>
    fetchWithCache(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    }),

  put: <T>(url: string, body: any, options?: RequestOptions): Promise<T> =>
    fetchWithCache(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  delete: <T>(url: string, options?: RequestOptions): Promise<T> =>
    fetchWithCache(url, { ...options, method: 'DELETE' })
};

// Add offline sync listener
window.addEventListener('online', () => {
  offlineSync.syncPendingRequests();
});
