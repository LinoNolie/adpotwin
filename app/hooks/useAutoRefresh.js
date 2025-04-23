import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useSettings } from '../contexts/SettingsContext';
import { logger } from '../utils/logger';
import { performance } from '../utils/performance';

export function useAutoRefresh(refreshFunction, options = {}) {
  const {
    interval = 5000,
    maxRetries = 3,
    retryDelay = 1000,
    onlyWhenFocused = true,
    requiresNetwork = true
  } = options;

  const { settings } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const retryCount = useRef(0);
  const timeoutRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    startRefreshCycle();

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [interval, settings.autoRefreshEnabled]);

  const startRefreshCycle = useCallback(() => {
    if (!settings.autoRefreshEnabled || !isMounted.current) return;

    const scheduleNextRefresh = () => {
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          refresh();
        }
      }, interval);
    };

    scheduleNextRefresh();
  }, [interval, settings.autoRefreshEnabled]);

  const refresh = useCallback(async () => {
    if (isRefreshing || !settings.autoRefreshEnabled) return;

    if (requiresNetwork) {
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        logger.warn('Auto refresh failed: No network connection');
        return;
      }
    }

    setIsRefreshing(true);
    setError(null);

    try {
      performance.startMeasurement('auto_refresh');
      
      await refreshFunction();
      
      performance.endMeasurement('auto_refresh');
      
      retryCount.current = 0;
      setLastRefresh(new Date());
      startRefreshCycle();
    } catch (error) {
      setError(error);
      logger.error('Auto refresh error:', error);

      if (retryCount.current < maxRetries) {
        retryCount.current++;
        timeoutRef.current = setTimeout(
          refresh,
          retryDelay * Math.pow(2, retryCount.current - 1)
        );
      }
    } finally {
      if (isMounted.current) {
        setIsRefreshing(false);
      }
    }
  }, [
    isRefreshing,
    settings.autoRefreshEnabled,
    requiresNetwork,
    refreshFunction,
    maxRetries,
    retryDelay
  ]);

  const forceRefresh = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    retryCount.current = 0;
    return refresh();
  }, [refresh]);

  const stopRefresh = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    isRefreshing,
    error,
    lastRefresh,
    refresh: forceRefresh,
    stopRefresh,
    retryCount: retryCount.current
  };
}