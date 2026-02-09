export type ClaudeModel =
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-5'
  | 'claude-haiku-4-5';

export interface TokenUsage {
  id: string;
  created_at: string;
  source_id: string;
  model: ClaudeModel;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  request_type?: string;
  metadata?: Record<string, unknown>;
}

export interface AlertSettings {
  id: string;
  source_id: string;
  threshold_percentage: number;
  daily_limit_usd?: number;
  monthly_limit_usd?: number;
  notification_enabled: boolean;
}

export interface UsageStats {
  totalTokens: number;
  totalCost: number;
  inputTokens: number;
  outputTokens: number;
  requestCount: number;
}

export interface UsageByModel {
  model: ClaudeModel;
  usage: UsageStats;
}

export interface DateRange {
  start: Date;
  end: Date;
}
