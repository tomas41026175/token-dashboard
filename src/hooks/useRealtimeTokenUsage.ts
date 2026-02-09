import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import type { TokenUsage } from '@/types';

/**
 * Supabase Realtime 訂閱 token_usage 新增事件
 * 當有新記錄時自動重新取得資料
 */
export function useRealtimeTokenUsage() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 建立 Realtime 訂閱
    const channel = supabase
      .channel('token-usage-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'token_usage',
        },
        (payload) => {
          console.log('New token usage received:', payload.new);

          // 重新取得所有 tokenUsage 查詢
          queryClient.invalidateQueries({ queryKey: ['tokenUsage'] });

          // 可選：直接將新資料加入 cache（樂觀更新）
          const newUsage = payload.new as TokenUsage;
          queryClient.setQueriesData<TokenUsage[]>(
            { queryKey: ['tokenUsage'] },
            (old) => {
              if (!old) return [newUsage];
              return [newUsage, ...old];
            }
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime subscription active');
        }
      });

    // 清理訂閱
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
