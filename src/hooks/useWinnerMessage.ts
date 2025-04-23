import { useState, useCallback } from 'react';

interface WinnerMessage {
  username: string;
  amount: number;
  potType: string;
}

export const useWinnerMessage = () => {
  const [winnerMessage, setWinnerMessage] = useState<WinnerMessage | null>(null);

  const showWinnerMessage = useCallback((message: WinnerMessage) => {
    setWinnerMessage(message);
    setTimeout(() => setWinnerMessage(null), 4000);
  }, []);

  return { winnerMessage, showWinnerMessage };
};
