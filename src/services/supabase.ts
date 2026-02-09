import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase credentials not found. Using mock data mode.'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true, // ✅ 啟用 session 持久化
      autoRefreshToken: true, // ✅ 自動刷新 token
      detectSessionInUrl: true, // ✅ 支援 magic link
    },
  }
);

// 檢查 Supabase 連線狀態
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not found. Using mock data mode.');
    return false;
  }

  try {
    const { error } = await supabase.from('sources').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connected');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

// 🆕 取得當前使用者 profile
export async function getCurrentUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }

  return data;
}
