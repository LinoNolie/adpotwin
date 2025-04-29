import { useState, useEffect, useRef } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const useCountdown = (
  initialTimeString: string,
  onComplete?: () => void,
  autoReset?: boolean,
  resetValue?: string
) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const timerRef = useRef<NodeJS.Timeout>();
  const initialSecondsRef = useRef<number>(0);

  const parseTimeString = (timeStr: string): number => {
    if (timeStr.includes('d')) {
      const [days, time] = timeStr.split('d ');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      return (parseInt(days) * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
    } else {
      const [minutes, seconds] = timeStr.split(':').map(Number);
      return (minutes * 60) + seconds;
    }
  };

  const startTimer = (seconds: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    initialSecondsRef.current = seconds;

    const updateTimer = () => {
      if (initialSecondsRef.current > 0) {
        initialSecondsRef.current -= 1;
        const days = Math.floor(initialSecondsRef.current / (24 * 60 * 60));
        const hours = Math.floor((initialSecondsRef.current % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((initialSecondsRef.current % (60 * 60)) / 60);
        const seconds = initialSecondsRef.current % 60;
        
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        if (onComplete) {
          onComplete();
        }
        if (autoReset && resetValue) {
          initialSecondsRef.current = parseTimeString(resetValue);
          setTimeLeft({
            days: 0,
            hours: 0,
            minutes: Math.floor(initialSecondsRef.current / 60),
            seconds: initialSecondsRef.current % 60
          });
        }
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
  };

  useEffect(() => {
    startTimer(parseTimeString(initialTimeString));
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initialTimeString]);

  const formatTime = () => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
    }
    return `${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
  };

  return formatTime();
};
