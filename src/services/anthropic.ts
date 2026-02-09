import { supabase, getCurrentUserProfile } from './supabase';

interface AnthropicUsage {
  date: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

/**
 * 從 Anthropic API 取得用量記錄
 *
 * ⚠️ 重要注意事項：
 * 目前（2026-02）Anthropic 可能沒有公開的 Usage API
 * 這裡提供概念性實作，實際需根據 Anthropic 文件調整
 *
 * 替代方案：
 * 1. 手動匯出 - 從 Console 下載 CSV 後上傳
 * 2. Webhook - 如果 Anthropic 支援 real-time webhook
 * 3. Browser Extension - 自動抓取 Console 資料
 * 4. Email Parsing - 解析 Anthropic 的用量通知郵件
 */
export async function fetchAnthropicUsage(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<AnthropicUsage[]> {
  // ⚠️ 實際 API endpoint 需確認 Anthropic 官方文件
  // 目前 Anthropic 可能透過 Console 或其他方式提供用量數據

  try {
    const response = await fetch('https://api.anthropic.com/v1/usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.usage || [];
  } catch (error) {
    console.error('Failed to fetch Anthropic usage:', error);
    throw error;
  }
}

/**
 * 同步 Anthropic 用量到 Supabase
 */
export async function syncAnthropicUsage(): Promise<number> {
  const profile = await getCurrentUserProfile();
  if (!profile?.anthropic_api_key) {
    throw new Error('Anthropic API Key not configured');
  }

  // 取得最近 7 天的用量
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const usageData = await fetchAnthropicUsage(
    profile.anthropic_api_key,
    startDate,
    endDate
  );

  // 插入到 Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 取得或建立預設 source
  let defaultSource = await supabase
    .from('sources')
    .select('id')
    .eq('name', 'Anthropic API')
    .eq('user_id', user.id)
    .single();

  if (!defaultSource.data) {
    const newSource = await supabase
      .from('sources')
      .insert({
        name: 'Anthropic API',
        description: '從 Anthropic API 自動同步',
        color: '#1890ff',
        user_id: user.id,
      })
      .select()
      .single();

    if (newSource.error) throw newSource.error;
    defaultSource = newSource;
  }

  // 批量插入用量記錄
  const records = usageData.map((usage) => ({
    source_id: defaultSource.data!.id,
    user_id: user.id,
    model: usage.model,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    total_tokens: usage.total_tokens,
    cost_usd: usage.cost_usd,
    created_at: new Date(usage.date).toISOString(),
  }));

  if (records.length > 0) {
    const { error } = await supabase.from('token_usage').insert(records);
    if (error) throw error;
  }

  return records.length;
}
