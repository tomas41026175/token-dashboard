import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import {
  Subscription,
  PlanLimits,
  PLAN_CONFIGS,
} from '@/types/subscription';

interface SettingsStore {
  // 警示設定
  defaultThresholdPercentage: number;
  defaultDailyLimitUsd: number;
  defaultWeeklyLimitUsd: number;
  defaultMonthlyLimitUsd: number;
  notificationEnabled: boolean;

  // 訂閱方案
  subscription: Subscription;

  // 顯示設定
  dateFormat: string;
  currency: 'USD';

  // Actions
  setThresholdPercentage: (value: number) => void;
  setDailyLimit: (value: number) => void;
  setWeeklyLimit: (value: number) => void;
  setMonthlyLimit: (value: number) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  updateSubscription: (subscription: Subscription) => void;

  // 計算方法
  getCurrentPlanLimits: () => PlanLimits;
  getNextResetDate: () => Date;
}

// 預設訂閱方案
const defaultSubscription: Subscription = {
  plan: PLAN_CONFIGS.free,
  startDate: new Date().toISOString(),
  billingCycle: 'monthly',
  nextResetDate: dayjs().add(1, 'month').startOf('month').toISOString(),
  autoRenew: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // 預設值
      defaultThresholdPercentage: 80,
      defaultDailyLimitUsd: 10,
      defaultWeeklyLimitUsd: 30,
      defaultMonthlyLimitUsd: 300,
      notificationEnabled: true,
      subscription: defaultSubscription,
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      currency: 'USD',

      // Actions
      setThresholdPercentage: (value) =>
        set({ defaultThresholdPercentage: value }),
      setDailyLimit: (value) => set({ defaultDailyLimitUsd: value }),
      setWeeklyLimit: (value) => set({ defaultWeeklyLimitUsd: value }),
      setMonthlyLimit: (value) => set({ defaultMonthlyLimitUsd: value }),
      setNotificationEnabled: (enabled) =>
        set({ notificationEnabled: enabled }),
      updateSubscription: (subscription) => set({ subscription }),

      // 計算方法
      getCurrentPlanLimits: () => {
        return get().subscription.plan.limits;
      },
      getNextResetDate: () => {
        const { subscription } = get();
        return dayjs(subscription.nextResetDate).toDate();
      },
    }),
    {
      name: 'token-dashboard-settings',
    }
  )
);
