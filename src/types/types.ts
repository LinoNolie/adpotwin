export type SocialProvider = 'google' | 'facebook' | 'twitter';

export type PoolType = 'hourly' | 'yearly' | 'random';

export interface JackpotState {
  hourly: { amount: number; timer: string; players?: number };
  yearly: { amount: number; timer: string; players?: number };
  random: { amount: number; players: number };
  history: JackpotWin[];
  jackpots?: any;
}

export interface JackpotWin {
  amount: number;
  winner: string;
  timestamp: number;
  type: PoolType;
}

export type JackpotAction =
  | { type: 'UPDATE_JACKPOT'; payload: Partial<JackpotState> }
  | { type: 'ADD_WIN'; payload: JackpotWin }
  | { type: 'RESET_JACKPOT'; potType: PoolType }
  | { type: 'INCREMENT_JACKPOT'; potType: PoolType; amount: number };

export interface User {
  id: string;
  username: string;
  email?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  socialLogin?: (provider: SocialProvider) => Promise<void>;
}

export interface PoolLabels {
  [key: string]: string;
  hourly: string;
  yearly: string;
  random: string;
}

export interface RequestOptions extends Omit<RequestInit, 'cache'> {
  cache?: RequestCache;
}

export interface ChatMessage {
  text: string;
  user?: string;
  type?: 'system' | 'user' | 'winner';
}

export interface UserStats {
  totalWatched: number;
  totalWinnings: number;
  entries: {
    hourly: number;
    yearly: number;
    random: number;
  };
}

export interface PaymentDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  swiftCode?: string;
}
