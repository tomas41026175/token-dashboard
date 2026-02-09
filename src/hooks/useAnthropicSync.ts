import { useEffect, useState } from 'react';
import { syncAnthropicUsage } from '@/services/anthropic';
import { useQueryClient } from '@tanstack/react-query';

export function useAnthropicSync(enableAutoSync = false) {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // 手動同步
  const manualSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const count = await syncAnthropicUsage();
      setLastSyncTime(new Date());

      // 刷新 React Query cache
      queryClient.invalidateQueries({ queryKey: ['tokenUsage'] });
      queryClient.invalidateQueries({ queryKey: ['sources'] });

      console.log(`✅ Synced ${count} records from Anthropic API`);
      return count;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown sync error';
      setError(errorMessage);
      console.error('Sync failed:', err);
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  // 自動同步（每小時一次）
  useEffect(() => {
    if (!enableAutoSync) return;

    // 初次載入時同步一次
    manualSync();

    const interval = setInterval(() => {
      manualSync();
    }, 60 * 60 * 1000); // 1 小時

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableAutoSync]);

  return { syncing, lastSyncTime, error, manualSync };
}
