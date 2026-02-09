import { useState } from 'react';
import { Card, Space, DatePicker, Row, Col, Tabs } from 'antd';
import { Column, Pie, Line } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import { useFilteredTokenUsage, useTokenStatsByModel } from '@/hooks/useFilteredTokenUsage';
import type { TokenUsage } from '@/types';

const { RangePicker } = DatePicker;

export default function UsageChart() {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ]);

  const data = useFilteredTokenUsage({
    start: dateRange[0].toDate(),
    end: dateRange[1].toDate(),
  });

  const modelStats = useTokenStatsByModel(data);

  // 準備時間序列資料（按日聚合）
  const timeSeriesData = prepareTimeSeriesData(data);

  // 準備堆疊圖資料
  const stackedData = prepareStackedData(data);

  // 準備圓餅圖資料
  const pieData = modelStats.map((item) => ({
    type: item.model,
    value: item.usage.totalTokens,
    cost: item.usage.totalCost,
  }));

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 日期範圍選擇器 */}
      <Card size="small">
        <Space>
          <span>日期範圍:</span>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates) {
                setDateRange([dates[0]!, dates[1]!]);
              }
            }}
            format="YYYY-MM-DD"
          />
        </Space>
      </Card>

      {/* 圖表 Tabs */}
      <Tabs
        items={[
          {
            key: 'timeseries',
            label: '時間序列',
            children: (
              <Card title="每日 Token 使用量">
                <Line
                  data={timeSeriesData}
                  xField="date"
                  yField="tokens"
                  seriesField="type"
                  smooth
                  animation={{
                    appear: {
                      animation: 'wave-in',
                      duration: 1000,
                    },
                  }}
                  tooltip={{
                    formatter: (datum: any) => ({
                      name: datum.type,
                      value: `${datum.tokens.toLocaleString()} tokens`,
                    }),
                  }}
                />
              </Card>
            ),
          },
          {
            key: 'stacked',
            label: 'Input vs Output',
            children: (
              <Card title="Input/Output Token 分佈">
                <Column
                  data={stackedData}
                  xField="date"
                  yField="tokens"
                  seriesField="type"
                  isStack
                  color={['#1890ff', '#52c41a']}
                  animation={{
                    appear: {
                      animation: 'scale-in-y',
                      duration: 800,
                    },
                  }}
                  tooltip={{
                    formatter: (datum: any) => ({
                      name: datum.type,
                      value: `${datum.tokens.toLocaleString()} tokens`,
                    }),
                  }}
                />
              </Card>
            ),
          },
          {
            key: 'model',
            label: '模型使用佔比',
            children: (
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="按 Token 數量">
                    <Pie
                      data={pieData}
                      angleField="value"
                      colorField="type"
                      radius={0.8}
                      label={{
                        type: 'outer',
                        content: '{name} {percentage}',
                      }}
                      interactions={[
                        {
                          type: 'element-active',
                        },
                      ]}
                      tooltip={{
                        formatter: (datum: any) => ({
                          name: datum.type,
                          value: `${datum.value.toLocaleString()} tokens`,
                        }),
                      }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="按成本">
                    <Pie
                      data={pieData}
                      angleField="cost"
                      colorField="type"
                      radius={0.8}
                      label={{
                        type: 'outer',
                        content: '{name} {percentage}',
                      }}
                      interactions={[
                        {
                          type: 'element-active',
                        },
                      ]}
                      tooltip={{
                        formatter: (datum: any) => ({
                          name: datum.type,
                          value: `$${datum.cost.toFixed(4)} USD`,
                        }),
                      }}
                    />
                  </Card>
                </Col>
              </Row>
            ),
          },
        ]}
      />
    </Space>
  );
}

// 準備時間序列資料（每日總量）
function prepareTimeSeriesData(data: TokenUsage[]) {
  const dailyMap = new Map<string, number>();

  data.forEach((item) => {
    const date = dayjs(item.created_at).format('YYYY-MM-DD');
    dailyMap.set(date, (dailyMap.get(date) || 0) + item.total_tokens);
  });

  return Array.from(dailyMap.entries())
    .map(([date, tokens]) => ({
      date,
      tokens,
      type: 'Total',
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// 準備堆疊圖資料（Input vs Output）
function prepareStackedData(data: TokenUsage[]) {
  const dailyMap = new Map<
    string,
    { input: number; output: number }
  >();

  data.forEach((item) => {
    const date = dayjs(item.created_at).format('YYYY-MM-DD');
    const existing = dailyMap.get(date) || { input: 0, output: 0 };
    dailyMap.set(date, {
      input: existing.input + item.input_tokens,
      output: existing.output + item.output_tokens,
    });
  });

  const result: Array<{ date: string; tokens: number; type: string }> = [];

  dailyMap.forEach((value, date) => {
    result.push(
      { date, tokens: value.input, type: 'Input' },
      { date, tokens: value.output, type: 'Output' }
    );
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}
