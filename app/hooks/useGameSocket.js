import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { websocket } from '../utils/websocket';
import { notifications } from '../utils/notifications';
import { analytics } from '../utils/analytics';
import { performance } from '../utils/performance';

export function useGameSocket(potId) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const lastMessageRef = useRef(null);

  const handleGameUpdate = useCallback((data) => {
    performance.startMeasurement('game_state_update');
    
    setGameState(prevState => ({
      ...prevState,
      ...data,
      lastUpdate: Date.now()
    }));

    if (data.type === 'game_end') {
      notifications.showGameNotification({
        title: 'Game Ended',
        message: `Pot ${potId} has ended!`,
        gameId: potId
      });
    }

    performance.endMeasurement('game_state_update');
  }, [potId]);

  const handlePlayerUpdate = useCallback((data) => {
    setPlayers(prevPlayers => {
      const playerIndex = prevPlayers.findIndex(p => p.id === data.playerId);
      
      if (playerIndex === -1) {
        return [...prevPlayers, data];
      }

      const newPlayers = [...prevPlayers];
      newPlayers[playerIndex] = {
        ...newPlayers[playerIndex],
        ...data
      };
      return newPlayers;
    });
  }, []);

  useEffect(() => {
    if (!user || !potId) return;

    const connectToGame = async () => {
      try {
        websocket.subscribe('connection', ({ status }) => {
          setIsConnected(status === 'connected');
        });

        websocket.subscribe('game_update', handleGameUpdate);
        websocket.subscribe('player_update', handlePlayerUpdate);
        websocket.subscribe('error', (error) => {
          setError(error);
          analytics.trackError('game_socket', error.message);
        });

        await websocket.connect(user.token);
        
        // Join specific game room
        websocket.sendMessage('join_game', { potId });
      } catch (error) {
        console.error('Game socket connection error:', error);
        setError(error);
      }
    };

    connectToGame();

    return () => {
      websocket.sendMessage('leave_game', { potId });
      websocket.disconnect();
    };
  }, [user, potId, handleGameUpdate, handlePlayerUpdate]);

  const placeBet = useCallback(async (amount) => {
    if (!isConnected) {
      throw new Error('Not connected to game server');
    }

    try {
      websocket.sendMessage('place_bet', {
        potId,
        amount,
        timestamp: Date.now()
      });

      analytics.trackEvent('bet_placed', {
        potId,
        amount,
      });
    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  }, [isConnected, potId]);

  const cashout = useCallback(async (multiplier) => {
    if (!isConnected) {
      throw new Error('Not connected to game server');
    }

    try {
      websocket.sendMessage('cashout', {
        potId,
        multiplier,
        timestamp: Date.now()
      });

      analytics.trackEvent('cashout_requested', {
        potId,
        multiplier,
      });
    } catch (error) {
      console.error('Error cashing out:', error);
      throw error;
    }
  }, [isConnected, potId]);

  return {
    isConnected,
    gameState,
    players,
    error,
    placeBet,
    cashout
  };
}