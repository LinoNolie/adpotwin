import React, { createContext, useContext, useState, useEffect } from 'react';
import { APP_CONFIG } from '../config';

const GameContext = createContext({});

export function GameProvider({ children }) {
  const [activePots, setActivePots] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePots();
    const interval = setInterval(fetchActivePots, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchActivePots = async () => {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.GAME_ENDPOINTS.GET_POTS}`);
      const data = await response.json();
      setActivePots(data.pots);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pots:', error);
    }
  };

  const joinGame = async (potId, amount) => {
    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.GAME_ENDPOINTS.PLACE_BET}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ potId, amount })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentGame({
          potId,
          betAmount: amount,
          startTime: Date.now()
        });
        return { success: true };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: 'Failed to join game' };
    }
  };

  const cashout = async (multiplier) => {
    if (!currentGame) return { success: false, error: 'No active game' };

    try {
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.GAME_ENDPOINTS.CASHOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          potId: currentGame.potId,
          multiplier
        })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentGame(null);
        return { success: true, winnings: data.winnings };
      }
      return { success: false, error: data.message };
    } catch (error) {
      return { success: false, error: 'Cashout failed' };
    }
  };

  return (
    <GameContext.Provider value={{
      activePots,
      currentGame,
      loading,
      joinGame,
      cashout
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);