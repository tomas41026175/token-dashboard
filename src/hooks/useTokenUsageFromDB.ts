import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, checkSupabaseConnection } from '@/services/supabase';
import { generateMockTokenUsage } from '@/utils/mock-data';
import type { TokenUsage } from '@/types';
import type { Database } from '@/types/database';

interface DateRange {
  start: Date;
  end: Date;
}

interface FetchTokenUsageParams {
  sourceId?: string | null;
  dateRange?: DateRange;
}

/**
 * 從 Supabase 取得 token 使用記錄
 * 如果 Supabase 未設定或連線失敗，使用模擬資料
 */
export function useTokenUsageFromDB(params?: FetchTokenUsageParams) {
  const { sourceId, dateRange } = params || {};

  return useQuery({
    queryKey: ['tokenUsage', sourceId, dateRange],
    queryFn: async () => {
      // 檢查 Supabase 連線
      const isConnected = await checkSupabaseConnection();

      if (!isConnected) {
        console.warn('Supabase not connected, using mock data');
        return filterMockData(generateMockTokenUsage(30, 50), params);
      }

      // 取得當前使用者
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 建立查詢
      let query = supabase
        .from('token_usage')
        .select('*')
        .order('created_at', { ascending: false });

      // 🆕 加入 user_id 過濾（方案 B：如果有 user 就過濾）
      if (user) {
        query = query.or(`user_id.eq.${user.id},user_id.is.null`);
      }

      // 依來源過濾
      if (sourceId) {
        query = query.eq('source_id', sourceId);
      }

      // 依日期範圍過濾
      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching token usage:', error);
        return filterMockData(generateMockTokenUsage(30, 50), params);
      }

      return data as TokenUsage[];
    },
    staleTime: 1000 * 60, // 1 分鐘
  });
}

/**
 * 新增 token 使用記錄
 */
export function useCreateTokenUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      usage: Database['public']['Tables']['token_usage']['Insert']
    ) => {
      const { data, error } = await supabase
        .from('token_usage')
        .insert(usage as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // 重新取得資料
      queryClient.invalidateQueries({ queryKey: ['tokenUsage'] });
    },
  });
}

/**
 * 批次新增 token 使用記錄
 */
export function useBatchCreateTokenUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      usages: Array<Database['public']['Tables']['token_usage']['Insert']>
    ) => {
      const { data, error} = await supabase
        .from('token_usage')
        .insert(usages as any)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokenUsage'] });
    },
  });
}

// 輔助函式：過濾模擬資料
function filterMockData(
  data: TokenUsage[],
  params?: FetchTokenUsageParams
): TokenUsage[] {
  let filtered = data;

  if (params?.sourceId) {
    filtered = filtered.filter((item) => item.source_id === params.sourceId);
  }

  if (params?.dateRange) {
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.created_at);
      return (
        itemDate >= params.dateRange!.start &&
        itemDate <= params.dateRange!.end
      );
    });
  }

  return filtered;
}
