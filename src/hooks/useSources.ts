import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { MOCK_SOURCES } from '@/utils/mock-data';
import type { Source } from '@/types';

/**
 * 取得所有資料來源
 */
export function useSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Failed to fetch sources from Supabase, using mock data');
        return MOCK_SOURCES;
      }

      return data as Source[];
    },
    initialData: MOCK_SOURCES,
  });
}

/**
 * 取得單一資料來源
 */
export function useSource(sourceId: string) {
  return useQuery({
    queryKey: ['sources', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('id', sourceId)
        .single();

      if (error) {
        return MOCK_SOURCES.find((s) => s.id === sourceId) || null;
      }

      return data as Source;
    },
    enabled: !!sourceId,
  });
}
