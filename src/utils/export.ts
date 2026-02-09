import dayjs from 'dayjs';
import type { TokenUsage } from '@/types';
import { MOCK_SOURCES } from './mock-data';

/**
 * 匯出資料為 CSV
 */
export function exportToCSV(data: TokenUsage[], filename?: string) {
  if (data.length === 0) {
    alert('沒有資料可匯出');
    return;
  }

  // CSV 標題
  const headers = [
    'Time',
    'Source',
    'Model',
    'Input Tokens',
    'Output Tokens',
    'Total Tokens',
    'Cost (USD)',
    'Request Type',
  ];

  // CSV 內容
  const rows = data.map((item) => {
    const source = MOCK_SOURCES.find((s) => s.id === item.source_id);
    return [
      dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
      source?.name || item.source_id,
      item.model,
      item.input_tokens,
      item.output_tokens,
      item.total_tokens,
      item.cost_usd.toFixed(6),
      item.request_type || '',
    ];
  });

  // 組合 CSV
  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // 下載
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename || `token-usage-${dayjs().format('YYYY-MM-DD')}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 匯出資料為 JSON
 */
export function exportToJSON(data: TokenUsage[], filename?: string) {
  if (data.length === 0) {
    alert('沒有資料可匯出');
    return;
  }

  // 格式化資料（加入來源名稱）
  const formattedData = data.map((item) => {
    const source = MOCK_SOURCES.find((s) => s.id === item.source_id);
    return {
      ...item,
      source_name: source?.name || item.source_id,
      created_at_formatted: dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
    };
  });

  // 下載
  const json = JSON.stringify(formattedData, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename || `token-usage-${dayjs().format('YYYY-MM-DD')}.json`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 計算統計資訊並匯出為 Markdown
 */
export function exportSummaryToMarkdown(data: TokenUsage[], filename?: string) {
  if (data.length === 0) {
    alert('沒有資料可匯出');
    return;
  }

  // 計算統計
  const totalTokens = data.reduce((sum, item) => sum + item.total_tokens, 0);
  const totalCost = data.reduce((sum, item) => sum + item.cost_usd, 0);
  const inputTokens = data.reduce((sum, item) => sum + item.input_tokens, 0);
  const outputTokens = data.reduce((sum, item) => sum + item.output_tokens, 0);

  // 按來源統計
  const sourceStats = new Map<string, { tokens: number; cost: number; count: number }>();
  data.forEach((item) => {
    const source = MOCK_SOURCES.find((s) => s.id === item.source_id);
    const sourceName = source?.name || item.source_id;
    const existing = sourceStats.get(sourceName) || { tokens: 0, cost: 0, count: 0 };
    sourceStats.set(sourceName, {
      tokens: existing.tokens + item.total_tokens,
      cost: existing.cost + item.cost_usd,
      count: existing.count + 1,
    });
  });

  // 按模型統計
  const modelStats = new Map<string, { tokens: number; cost: number; count: number }>();
  data.forEach((item) => {
    const existing = modelStats.get(item.model) || { tokens: 0, cost: 0, count: 0 };
    modelStats.set(item.model, {
      tokens: existing.tokens + item.total_tokens,
      cost: existing.cost + item.cost_usd,
      count: existing.count + 1,
    });
  });

  // 生成 Markdown
  const markdown = `# Token Usage Report

**Generated:** ${dayjs().format('YYYY-MM-DD HH:mm:ss')}
**Period:** ${dayjs(data[data.length - 1].created_at).format('YYYY-MM-DD')} to ${dayjs(data[0].created_at).format('YYYY-MM-DD')}

## Summary

- **Total Requests:** ${data.length.toLocaleString()}
- **Total Tokens:** ${totalTokens.toLocaleString()}
  - Input: ${inputTokens.toLocaleString()}
  - Output: ${outputTokens.toLocaleString()}
- **Total Cost:** $${totalCost.toFixed(4)} USD
- **Average Cost per Request:** $${(totalCost / data.length).toFixed(6)} USD

## By Source

| Source | Requests | Tokens | Cost (USD) |
|--------|----------|--------|------------|
${Array.from(sourceStats.entries())
  .map(
    ([name, stats]) =>
      `| ${name} | ${stats.count} | ${stats.tokens.toLocaleString()} | $${stats.cost.toFixed(4)} |`
  )
  .join('\n')}

## By Model

| Model | Requests | Tokens | Cost (USD) |
|-------|----------|--------|------------|
${Array.from(modelStats.entries())
  .map(
    ([name, stats]) =>
      `| ${name} | ${stats.count} | ${stats.tokens.toLocaleString()} | $${stats.cost.toFixed(4)} |`
  )
  .join('\n')}
`;

  // 下載
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename || `token-usage-summary-${dayjs().format('YYYY-MM-DD')}.md`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
