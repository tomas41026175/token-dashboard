import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useSettingsStore } from '@/store/settings';

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string; // "3天 14:32:15"
}

export function useResetCountdown() {
  const getNextResetDate = useSettingsStore((state) => state.getNextResetDate);

  function calculateCountdown(): CountdownTime {
    const now = dayjs();
    const resetDate = dayjs(getNextResetDate());
    const totalSeconds = Math.max(0, resetDate.diff(now, 'second'));

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formatted =
      days > 0
        ? `${days}天 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return { days, hours, minutes, seconds, totalSeconds, formatted };
  }

  const [countdown, setCountdown] = useState<CountdownTime>(
    calculateCountdown()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, [getNextResetDate]);

  return countdown;
}
