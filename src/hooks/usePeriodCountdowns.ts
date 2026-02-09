import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

interface PeriodCountdown {
  daily: {
    hours: number;
    minutes: number;
    seconds: number;
    formatted: string;
  };
  weekly: { days: number; hours: number; minutes: number; formatted: string };
}

export function usePeriodCountdowns(): PeriodCountdown {
  function calculate(): PeriodCountdown {
    const now = dayjs();

    // 日重置：明天 00:00
    const endOfDay = now.endOf('day');
    const dailySeconds = endOfDay.diff(now, 'second');
    const dailyHours = Math.floor(dailySeconds / 3600);
    const dailyMinutes = Math.floor((dailySeconds % 3600) / 60);
    const dailySecondsRem = dailySeconds % 60;

    // 週重置：下週日 00:00
    const endOfWeek = now.endOf('week');
    const weeklySeconds = endOfWeek.diff(now, 'second');
    const weeklyDays = Math.floor(weeklySeconds / 86400);
    const weeklyHours = Math.floor((weeklySeconds % 86400) / 3600);
    const weeklyMinutes = Math.floor((weeklySeconds % 3600) / 60);

    return {
      daily: {
        hours: dailyHours,
        minutes: dailyMinutes,
        seconds: dailySecondsRem,
        formatted: `${dailyHours}:${dailyMinutes.toString().padStart(2, '0')}:${dailySecondsRem.toString().padStart(2, '0')}`,
      },
      weekly: {
        days: weeklyDays,
        hours: weeklyHours,
        minutes: weeklyMinutes,
        formatted: `${weeklyDays}天 ${weeklyHours}:${weeklyMinutes.toString().padStart(2, '0')}`,
      },
    };
  }

  const [countdowns, setCountdowns] = useState<PeriodCountdown>(calculate());

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(calculate());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return countdowns;
}
