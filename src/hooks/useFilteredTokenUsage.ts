import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useSourceStore } from '@/store';
import { generateMockTokenUsage } from '@/utils/mock-data';
import type { TokenUsage, UsageStats, UsageByModel, ClaudeModel } from '@/types';

interface DateRange {
  start: Date;
  end: Date;
}

/**
 * 根據當前選擇的來源和日期範圍過濾 token 使用資料
 */
export function useFilteredTokenUsage(dateRange?: DateRange) {
  const { currentSourceId } = useSourceStore();

  // 生成模擬資料（實際應用中應從 API 取得）
  const allData = useMemo(() => generateMockTokenUsage(30, 50), []);

  // 過濾資料
  const filteredData = useMemo(() => {
    let data = allData;

    // 根據來源過濾
    if (currentSourceId) {
      data = data.filter((item) => item.source_id === currentSourceId);
    }

    // 根據日期範圍過濾
    if (dateRange) {
      data = data.filter((item) => {
        const itemDate = new Date(item.created_at);
        return itemDate >= dateRange.start && itemDate <= dateRange.end;
      });
    }

    return data;
  }, [allData, currentSourceId, dateRange]);

  return filteredData;
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
