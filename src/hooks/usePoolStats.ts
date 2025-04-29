import { useState, useCallback } from 'react';

interface PoolStats {
  entries: number;
  totalEntries: number;
  registeredContributors: number;
  totalContributors: number;
}

interface PoolStatsState {
  hourly: PoolStats;
  yearly: PoolStats;
  random: PoolStats;
}

export const usePoolStats = () => {
  const [poolStats, setPoolStats] = useState<PoolStatsState>({
    hourly: {
      entries: 23,
      totalEntries: 1234,
      registeredContributors: 156,
      totalContributors: 891
    },
    yearly: {
      entries: 145,
      totalEntries: 12445,
      registeredContributors: 2341,
      totalContributors: 5167
    },
    random: {
      entries: 89,
      totalEntries: 423,
      registeredContributors: 423,
      totalContributors: 423
    }
  });

  const updatePoolStats = useCallback((type: keyof PoolStatsState, newStats: Partial<PoolStats>) => {
    setPoolStats(prev => ({
      ...prev,
      [type]: { ...prev[type], ...newStats }
    }));
  }, []);

  return { poolStats, updatePoolStats };
};
