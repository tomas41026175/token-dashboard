import dayjs from 'dayjs';
import type { Source, TokenUsage, ClaudeModel } from '@/types';

// 預設資料來源
export const MOCK_SOURCES: Source[] = [
  {
    id: 'mayo-form-web',
    name: 'MAYOForm-Web',
    description: 'Mayo 表單系統 Web 前端',
    color: '#1890ff',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description: 'Claude Code CLI 使用',
    color: '#52c41a',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'personal',
    name: 'Personal Projects',
    description: '個人開發專案',
    color: '#faad14',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
];

const MODELS: ClaudeModel[] = [
  'claude-opus-4-6',
  'claude-sonnet-4-5',
  'claude-haiku-4-5',
];

const REQUEST_TYPES = ['chat', 'completion', 'function_call'];

// Token 使用量範圍（根據模型調整）
const TOKEN_RANGES: Record<ClaudeModel, { min: number; max: number }> = {
  'claude-opus-4-6': { min: 500, max: 5000 },
  'claude-sonnet-4-5': { min: 300, max: 3000 },
  'claude-haiku-4-5': { min: 100, max: 1000 },
};

// Anthropic 定價 (2026-02)
const PRICING: Record<
  ClaudeModel,
  { input: number; output: number }
> = {
  'claude-opus-4-6': {
    input: 0.015 / 1000, // $15 per million tokens
    output: 0.075 / 1000, // $75 per million tokens
  },
  'claude-sonnet-4-5': {
    input: 0.003 / 1000, // $3 per million tokens
    output: 0.015 / 1000, // $15 per million tokens
  },
  'claude-haiku-4-5': {
    input: 0.0008 / 1000, // $0.80 per million tokens
    output: 0.004 / 1000, // $4 per million tokens
  },
};

/**
 * 計算成本
 */
function calculateCost(
  model: ClaudeModel,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model];
  return inputTokens * pricing.input + outputTokens * pricing.output;
}

/**
 * 隨機選擇陣列元素
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 隨機整數
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成單筆 token 使用記錄
 */
function generateTokenUsage(
  sourceId: string,
  timestamp: Date
): TokenUsage {
  const model = randomChoice(MODELS);
  const range = TOKEN_RANGES[model];

  // 生成 input/output tokens (輸出通常是輸入的 0.5-1.5 倍)
  const inputTokens = randomInt(range.min, range.max);
  const outputRatio = 0.5 + Math.random();
  const outputTokens = Math.floor(inputTokens * outputRatio);
  const totalTokens = inputTokens + outputTokens;

  const cost = calculateCost(model, inputTokens, outputTokens);

  return {
    id: `${sourceId}-${timestamp.getTime()}-${Math.random()}`,
    created_at: timestamp.toISOString(),
    source_id: sourceId,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: totalTokens,
    cost_usd: Number(cost.toFixed(6)),
    request_type: randomChoice(REQUEST_TYPES),
  };
}

/**
 * 生成過去 N 天的模擬資料
 * @param days 天數
 * @param recordsPerDay 每天平均記錄數
 */
export function generateMockTokenUsage(
  days = 30,
  recordsPerDay = 50
): TokenUsage[] {
  const records: TokenUsage[] = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    // 每天的記錄數有波動 (±30%)
    const todayRecords = Math.floor(
      recordsPerDay * (0.7 + Math.random() * 0.6)
    );

    for (let r = 0; r < todayRecords; r++) {
      // 隨機時間點（均勻分佈在當天）
      const timestamp = dayjs(now)
        .subtract(d, 'day')
        .startOf('day')
        .add(randomInt(0, 86400), 'second')
        .toDate();

      // 隨機選擇來源（權重：MAYOForm-Web 50%, Claude Code 30%, Personal 20%）
      const rand = Math.random();
      let sourceId: string;
      if (rand < 0.5) {
        sourceId = 'mayo-form-web';
      } else if (rand < 0.8) {
        sourceId = 'claude-code';
      } else {
        sourceId = 'personal';
      }

      records.push(generateTokenUsage(sourceId, timestamp));
    }
  }

  // 按時間倒序排列（最新在前）
  return records.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * 生成即時模擬資料（用於測試 Realtime 功能）
 */
export function generateRealtimeTokenUsage(): TokenUsage {
  const sourceId = randomChoice(MOCK_SOURCES).id;
  return generateTokenUsage(sourceId, new Date());
}
