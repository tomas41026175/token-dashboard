import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsStore {
  // 警示設定
  defaultThresholdPercentage: number;
  defaultDailyLimitUsd: number;
  defaultMonthlyLimitUsd: number;
  notificationEnabled: boolean;

  // 顯示設定
  dateFormat: string;
  currency: 'USD';

  // Actions
  setThresholdPercentage: (value: number) => void;
  setDailyLimit: (value: number) => void;
  setMonthlyLimit: (value: number) => void;
  setNotificationEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // 預設值
      defaultThresholdPercentage: 80,
      defaultDailyLimitUsd: 10,
      defaultMonthlyLimitUsd: 300,
      notificationEnabled: true,
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      currency: 'USD',

      // Actions
      setThresholdPercentage: (value) =>
        set({ defaultThresholdPercentage: value }),
      setDailyLimit: (value) => set({ defaultDailyLimitUsd: value }),
      setMonthlyLimit: (value) => set({ defaultMonthlyLimitUsd: value }),
      setNotificationEnabled: (enabled) =>
        set({ notificationEnabled: enabled }),
    }),
    {
      name: 'token-dashboard-settings',
    }
  )
);
