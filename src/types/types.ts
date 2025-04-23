export interface JackpotState {
  hourly: { amount: number; timer: string };
  yearly: { amount: number; timer: string };
  random: { amount: number; players: number };
}

export interface JackpotWin {
  username: string;
  amount: number;
  timestamp: Date;
  potType: 'hourly' | 'yearly' | 'random';
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
