import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analytics } from '../utils/analytics';
import { logger } from '../utils/logger';
import { performance } from '../utils/performance';

const HISTORY_STORAGE_KEY = '@betting_history';
const STATS_STORAGE_KEY = '@betting_stats';

export function useBettingHistory() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWagered: 0,
    totalWon: 0,
    biggestWin: 0,
    biggestMultiplier: 0,
    averageMultiplier: 0,
    winRate: 0,
    profitLoss: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      performance.startMeasurement('load_betting_history');
      
      const [historyData, statsData] = await Promise.all([
        AsyncStorage.getItem(HISTORY_STORAGE_KEY),
        AsyncStorage.getItem(STATS_STORAGE_KEY)
      ]);

      if (historyData) {
        setHistory(JSON.parse(historyData));
      }
      
      if (statsData) {
        setStats(JSON.parse(statsData));
      }

      performance.endMeasurement('load_betting_history');
    } catch (error) {
      logger.error('Error loading betting history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addBet = useCallback(async (bet) => {
    try {
      const newBet = {
        ...bet,
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9)
      };

      const updatedHistory = [newBet, ...history].slice(0, 100); // Keep last 100 bets
      const updatedStats = calculateStats(updatedHistory);

      await Promise.all([
        AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory)),
        AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updatedStats))
      ]);

      setHistory(updatedHistory);
      setStats(updatedStats);

      analytics.trackEvent('bet_recorded', {
        amount: bet.amount,
        multiplier: bet.multiplier,
        won: bet.won
      });
    } catch (error) {
      logger.error('Error adding bet to history:', error);
    }
  }, [history]);

  const calculateStats = useCallback((bets) => {
    const totalBets = bets.length;
    const wins = bets.filter(bet => bet.won);
    const totalWagered = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const totalWon = wins.reduce((sum, bet) => sum + (bet.amount * bet.multiplier), 0);
    const biggestWin = wins.reduce((max, bet) => Math.max(max, bet.amount * bet.multiplier), 0);
    const biggestMultiplier = wins.reduce((max, bet) => Math.max(max, bet.multiplier), 0);
    const allMultipliers = wins.map(bet => bet.multiplier);
    
    return {
      totalBets,
      totalWagered,
      totalWon,
      biggestWin,
      biggestMultiplier,
      averageMultiplier: allMultipliers.length 
        ? allMultipliers.reduce((sum, mult) => sum + mult, 0) / allMultipliers.length 
        : 0,
      winRate: totalBets ? (wins.length / totalBets) * 100 : 0,
      profitLoss: totalWon - totalWagered
    };
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(HISTORY_STORAGE_KEY),
        AsyncStorage.removeItem(STATS_STORAGE_KEY)
      ]);

      setHistory([]);
      setStats({
        totalBets: 0,
        totalWagered: 0,
        totalWon: 0,
        biggestWin: 0,
        biggestMultiplier: 0,
        averageMultiplier: 0,
        winRate: 0,
        profitLoss: 0
      });

      analytics.trackEvent('betting_history_cleared');
    } catch (error) {
      logger.error('Error clearing betting history:', error);
    }
  }, []);

  const getBetsByDateRange = useCallback((startDate, endDate) => {
    return history.filter(bet => {
      const betDate = new Date(bet.timestamp);
      return betDate >= startDate && betDate <= endDate;
    });
  }, [history]);

  const getStatsByDateRange = useCallback((startDate, endDate) => {
    const bets = getBetsByDateRange(startDate, endDate);
    return calculateStats(bets);
  }, [getBetsByDateRange, calculateStats]);

  return {
    history,
    stats,
    isLoading,
    addBet,
    clearHistory,
    getBetsByDateRange,
    getStatsByDateRange
  };
}