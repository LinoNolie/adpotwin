import { useState, useCallback } from 'react';
import { retryWithBackoff, ApiError } from '../utils/apiRetry';

interface UseApiOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  onError?: (error: any) => void;
}

export const useApi = <T>(options: UseApiOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await retryWithBackoff(apiCall, {
          maxAttempts: options.maxAttempts,
          baseDelay: options.baseDelay,
          maxDelay: options.maxDelay,
          shouldRetry: (error) => {
            // Don't retry on 4xx client errors
            if (error instanceof ApiError && error.status && error.status < 500) {
              return false;
            }
            return true;
          }
        });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return {
    execute,
    loading,
    error,
    reset: useCallback(() => setError(null), [])
  };
};
