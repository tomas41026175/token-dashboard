import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store';
import { useTimeRangeData } from './useFilteredTokenUsage';

export interface AlertStatus {
  isWarning: boolean;
  isError: boolean;
  message: string;
  percentage: number;
}

/**
 * 檢查是否超過警示閾值
 */
export function useAlertCheck(): AlertStatus {
  const { defaultMonthlyLimitUsd, defaultThresholdPercentage } =
    useSettingsStore();
  const { month } = useTimeRangeData();

  const [alertStatus, setAlertStatus] = useState<AlertStatus>({
    isWarning: false,
    isError: false,
    message: '',
    percentage: 0,
  });

  useEffect(() => {
    const percentage = (month.stats.totalCost / defaultMonthlyLimitUsd) * 100;
    const warningThreshold = defaultThresholdPercentage * 0.7; // 70% of threshold
    const errorThreshold = defaultThresholdPercentage; // 100% of threshold

    let status: AlertStatus = {
      isWarning: false,
      isError: false,
      message: '',
      percentage: Math.min(percentage, 100),
    };

    if (percentage >= errorThreshold) {
      status = {
        isWarning: false,
        isError: true,
        message: `⚠️ 警告：本月 token 使用已達 ${percentage.toFixed(1)}%，已超過設定閾值 ${errorThreshold}%！`,
        percentage: Math.min(percentage, 100),
      };
    } else if (percentage >= warningThreshold) {
      status = {
        isWarning: true,
        isError: false,
        message: `⚠️ 注意：本月 token 使用已達 ${percentage.toFixed(1)}%，接近警示閾值 ${errorThreshold}%`,
        percentage: Math.min(percentage, 100),
      };
    }

    setAlertStatus(status);
  }, [
    month.stats.totalCost,
    defaultMonthlyLimitUsd,
    defaultThresholdPercentage,
  ]);

  return alertStatus;
}

/**
 * 檢查並發送瀏覽器通知
 */
export function useAlertNotification() {
  const alertStatus = useAlertCheck();
  const { notificationEnabled } = useSettingsStore();
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    // 如果未啟用通知或尚未超過閾值，重置通知狀態
    if (!notificationEnabled || (!alertStatus.isError && !alertStatus.isWarning)) {
      setHasNotified(false);
      return;
    }

    // 如果已經通知過且狀態相同，不重複通知
    if (hasNotified) return;

    // 發送通知
    if (alertStatus.isError || alertStatus.isWarning) {
      sendNotification(alertStatus.message);
      setHasNotified(true);
    }
  }, [alertStatus, notificationEnabled, hasNotified]);

  return alertStatus;
}

/**
 * 發送瀏覽器通知
 */
function sendNotification(message: string) {
  // 檢查瀏覽器是否支援通知
  if (!('Notification' in window)) {
    console.warn('此瀏覽器不支援桌面通知');
    return;
  }

  // 檢查通知權限
  if (Notification.permission === 'granted') {
    new Notification('Token Dashboard 警示', {
      body: message,
      icon: '/vite.svg',
      tag: 'token-alert',
    });
  } else if (Notification.permission !== 'denied') {
    // 請求通知權限
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification('Token Dashboard 警示', {
          body: message,
          icon: '/vite.svg',
          tag: 'token-alert',
        });
      }
    });
  }
}

/**
 * 請求通知權限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}
