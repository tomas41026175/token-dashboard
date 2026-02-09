export type PlanTier = 'free' | 'pro' | 'enterprise';

export interface PlanLimits {
  dailyTokens: number;
  weeklyTokens: number;
  monthlyTokens: number;
  dailyUsd: number;
  weeklyUsd: number;
  monthlyUsd: number;
}

export interface PlanInfo {
  tier: PlanTier;
  name: string;
  limits: PlanLimits;
  features: string[];
}

export interface Subscription {
  plan: PlanInfo;
  startDate: string; // ISO date
  billingCycle: 'monthly' | 'annual';
  nextResetDate: string; // ISO date
  autoRenew: boolean;
}

// 預設方案配置
export const PLAN_CONFIGS: Record<PlanTier, PlanInfo> = {
  free: {
    tier: 'free',
    name: 'Free Plan',
    limits: {
      dailyTokens: 100000,
      weeklyTokens: 500000,
      monthlyTokens: 2000000,
      dailyUsd: 5,
      weeklyUsd: 30,
      monthlyUsd: 100,
    },
    features: ['基本監控', '30天歷史'],
  },
  pro: {
    tier: 'pro',
    name: 'Pro Plan',
    limits: {
      dailyTokens: 500000,
      weeklyTokens: 3000000,
      monthlyTokens: 10000000,
      dailyUsd: 30,
      weeklyUsd: 180,
      monthlyUsd: 600,
    },
    features: ['即時監控', '無限歷史', '資料匯出', '警示通知'],
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise Plan',
    limits: {
      dailyTokens: Infinity,
      weeklyTokens: Infinity,
      monthlyTokens: Infinity,
      dailyUsd: Infinity,
      weeklyUsd: Infinity,
      monthlyUsd: Infinity,
    },
    features: ['所有 Pro 功能', '無限用量', '專屬支援', 'API 整合'],
  },
};
