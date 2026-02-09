import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useSourceStore } from '@/store';
import { useTokenUsageFromDB } from './useTokenUsageFromDB';
import type { TokenUsage, UsageStats, UsageByModel, ClaudeModel } from '@/types';

interface DateRange {
  start: Date;
  end: Date;
}

/**
 * 根據當前選擇的來源和日期範圍過濾 token 使用資料
 * 自動從 Supabase 取得資料，如果未設定則使用模擬資料
 */
export function useFilteredTokenUsage(dateRange?: DateRange) {
  const { currentSourceId } = useSourceStore();

  // 從 Supabase 取得資料（如果未設定會自動 fallback 到模擬資料）
  const { data: allData = [] } = useTokenUsageFromDB({
    sourceId: currentSourceId,
    dateRange,
  });

  return allData;
}

/**
 * 計算 token 使用統計
 */
export function useTokenStats(data: TokenUsage[]): UsageStats {
  return useMemo(() => {
    if (data.length === 0) {
      return {
        totalTokens: 0,
        totalCost: 0,
        inputTokens: 0,
        outputTokens: 0,
        requestCount: 0,
      };
    }

    return data.reduce(
      (acc, item) => ({
        totalTokens: acc.totalTokens + item.total_tokens,
        totalCost: acc.totalCost + item.cost_usd,
        inputTokens: acc.inputTokens + item.input_tokens,
        outputTokens: acc.outputTokens + item.output_tokens,
        requestCount: acc.requestCount + 1,
      }),
      {
        totalTokens: 0,
        totalCost: 0,
        inputTokens: 0,
        outputTokens: 0,
        requestCount: 0,
      }
    );
  }, [data]);
}

/**
 * 按模型分組統計
 */
export function useTokenStatsByModel(data: TokenUsage[]): UsageByModel[] {
  return useMemo(() => {
    const modelMap = new Map<ClaudeModel, UsageStats>();

    data.forEach((item) => {
      const existing = modelMap.get(item.model) || {
        totalTokens: 0,
        totalCost: 0,
        inputTokens: 0,
        outputTokens: 0,
        requestCount: 0,
      };

      modelMap.set(item.model, {
        totalTokens: existing.totalTokens + item.total_tokens,
        totalCost: existing.totalCost + item.cost_usd,
        inputTokens: existing.inputTokens + item.input_tokens,
        outputTokens: existing.outputTokens + item.output_tokens,
        requestCount: existing.requestCount + 1,
      });
    });

    return Array.from(modelMap.entries()).map(([model, usage]) => ({
      model,
      usage,
    }));
  }, [data]);
}

/**
 * 取得今日/本週/本月的資料
 */
export function useTimeRangeData() {
  const now = dayjs();

  const todayData = useFilteredTokenUsage({
    start: now.startOf('day').toDate(),
    end: now.endOf('day').toDate(),
  });

  const weekData = useFilteredTokenUsage({
    start: now.startOf('week').toDate(),
    end: now.endOf('week').toDate(),
  });

  const monthData = useFilteredTokenUsage({
    start: now.startOf('month').toDate(),
    end: now.endOf('month').toDate(),
  });

  return {
    today: {
      data: todayData,
      stats: useTokenStats(todayData),
    },
    week: {
      data: weekData,
      stats: useTokenStats(weekData),
    },
    month: {
      data: monthData,
      stats: useTokenStats(monthData),
    },
  };
}
