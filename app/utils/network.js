import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { performance } from './performance';
import { analytics } from './analytics';

class NetworkManager {
  constructor() {
    this.requestQueue = [];
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.isOnline = true;
    this.setupNetworkListener();
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;

      if (wasOffline && this.isOnline) {
        this.processQueue();
      }

      analytics.trackEvent('network_status', {
        isConnected: state.isConnected,
        type: state.type,
      });
    });
  }

  async request(config) {
    const cacheKey = this.getCacheKey(config);
    
    if (config.useCache) {
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    if (!this.isOnline) {
      if (config.queueOffline) {
        this.queueRequest(config);
        throw new Error('Device is offline. Request queued.');
      }
      throw new Error('Device is offline');
    }

    return performance.measureAsync(
      `api_${config.method}_${config.endpoint}`,
      'apiCall',
      () => this.makeRequest(config, cacheKey)
    );
  }

  async makeRequest(config, cacheKey, attempt = 1) {
    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      if (config.cache) {
        await this.cacheData(cacheKey, data);
      }

      return data;
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await new Promise(resolve => 
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt - 1))
        );
        return this.makeRequest(config, cacheKey, attempt + 1);
      }
      throw error;
    }
  }

  shouldRetry(error) {
    const retryableStatusCodes = [408, 500, 502, 503, 504];
    return error.status && retryableStatusCodes.includes(error.status);
  }

  async getCachedData(key) {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const { data, timestamp, expiry } = JSON.parse(cached);
        if (!expiry || Date.now() - timestamp < expiry) {
          return data;
        }
      }
    } catch (error) {
      console.error('Cache retrieval error:', error);
    }
    return null;
  }

  async cacheData(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  getCacheKey(config) {
    return `api_cache_${config.method}_${config.endpoint}_${
      JSON.stringify(config.body || {})
    }`;
  }

  queueRequest(config) {
    this.requestQueue.push({
      config,
      timestamp: Date.now(),
    });
  }

  async processQueue() {
    while (this.requestQueue.length > 0 && this.isOnline) {
      const { config } = this.requestQueue.shift();
      try {
        await this.request({ ...config, queueOffline: false });
      } catch (error) {
        console.error('Queued request error:', error);
      }
    }
  }

  clearCache() {
    AsyncStorage.getAllKeys().then(keys => {
      const cacheKeys = keys.filter(key => key.startsWith('api_cache_'));
      AsyncStorage.multiRemove(cacheKeys);
    });
  }
}

export const network = new NetworkManager();