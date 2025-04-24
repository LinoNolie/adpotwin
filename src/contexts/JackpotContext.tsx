import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import { offlineSync } from '../utils/offlineSync';
import { JackpotState, JackpotWin } from '../types/types';

interface JackpotContextType {
  state: JackpotState;
  dispatch: React.Dispatch<JackpotAction>;
}

type JackpotAction = 
  | { type: 'UPDATE_JACKPOT'; payload: Partial<JackpotState> }
  | { type: 'ADD_WIN'; payload: JackpotWin }
  | { type: 'RESET_JACKPOT'; potType: 'hourly' | 'yearly' | 'random' };

const initialState: JackpotState = {
  hourly: {
    amount: 0,
    timer: '00:00',
    players: 0
  },
  yearly: {
    amount: 0,
    timer: '00:00',
    players: 0
  },
  random: {
    amount: 0,
    players: 0
  },
  history: []
};

const DEFAULT_STATE = {
  hourly: {
    amount: 100,
    timer: '59:59',
    players: 156
  },
  yearly: {
    amount: 10000,
    timer: '364d 23:59:59',
    players: 2341
  },
  random: {
    amount: 500,
    players: 423
  }
};

const JackpotContext = createContext<JackpotContextType | undefined>(undefined);

export const jackpotReducer = (state: typeof initialState, action: JackpotAction) => {
  switch (action.type) {
    case 'UPDATE_JACKPOT':
      return {
        ...state,
        jackpots: { ...state.jackpots, ...action.payload }
      };
    case 'ADD_WIN':
      return {
        ...state,
        history: [action.payload, ...state.history].slice(0, 50)
      };
    case 'RESET_JACKPOT':
      return {
        ...state,
        jackpots: {
          ...state.jackpots,
          [action.potType]: {
            ...state.jackpots[action.potType],
            amount: 0
          }
        }
      };
    default:
      return state;
  }
};

export const JackpotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(jackpotReducer, DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cachedData = offlineSync.getCachedData('jackpots');
    dispatch({ 
      type: 'UPDATE_JACKPOT', 
      payload: cachedData || DEFAULT_STATE 
    });
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <JackpotContext.Provider value={{ state, dispatch }}>
      {children}
    </JackpotContext.Provider>
  );
};

export const useJackpot = () => {
  const context = useContext(JackpotContext);
  if (!context) {
    throw new Error('useJackpot must be used within a JackpotProvider');
  }
  return context;
};
