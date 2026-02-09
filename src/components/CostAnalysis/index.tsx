import { Card, Row, Col, Statistic, Space } from 'antd';
import { DollarOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';
import dayjs from 'dayjs';
import { useFilteredTokenUsage } from '@/hooks/useFilteredTokenUsage';
import { MOCK_SOURCES } from '@/utils/mock-data';
import type { TokenUsage } from '@/types';

export default function CostAnalysis() {
  const last30Days = useFilteredTokenUsage({
    start: dayjs().subtract(30, 'day').toDate(),
    end: dayjs().toDate(),
  });

  const thisMonth = useFilteredTokenUsage({
    start: dayjs().startOf('month').toDate(),
    end: dayjs().endOf('month').toDate(),
  });

  const lastMonth = useFilteredTokenUsage({
    start: dayjs().subtract(1, 'month').startOf('month').toDate(),
    end: dayjs().subtract(1, 'month').endOf('month').toDate(),
  });

  // 計算本月總成本
  const thisMonthCost = thisMonth.reduce((sum, item) => sum + item.cost_usd, 0);
  const lastMonthCost = lastMonth.reduce((sum, item) => sum + item.cost_usd, 0);

  // 計算成本變化
  const costChange =
    lastMonthCost > 0
      ? ((thisMonthCost - lastMonthCost) / lastMonthCost) * 100
      : 0;

  // 準備每日成本趨勢資料
  const dailyCostData = prepareDailyCostData(last30Days);

  // 準備按來源的成本資料
  const sourceCostData = prepareSourceCostData(thisMonth);

  // 準備按模型的成本資料
  const modelCostData = prepareModelCostData(thisMonth);

  // 預測下月成本（簡單線性預測）
  const avgDailyCost = thisMonthCost / dayjs().date();
  const daysInNextMonth = dayjs().add(1, 'month').daysInMonth();
  const predictedCost = avgDailyCost * daysInNextMonth;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 成本統計卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月總成本"
              value={thisMonthCost}
              precision={2}
              valueStyle={{ color: '#faad14' }}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="上月總成本"
              value={lastMonthCost}
              precision={2}
              valueStyle={{ color: '#8c8c8c' }}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="成本變化"
              value={Math.abs(costChange)}
              precision={1}
              valueStyle={{ color: costChange > 0 ? '#ff4d4f' : '#52c41a' }}
              prefix={costChange > 0 ? <RiseOutlined /> : <FallOutlined />}
              suffix="%"
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="預測下月成本"
              value={predictedCost}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
      </Row>

      {/* 成本趨勢圖 */}
      <Card title="過去 30 天成本趨勢">
        <Line
          data={dailyCostData}
          xField="date"
          yField="cost"
          smooth
          color="#faad14"
          point={{
            size: 3,
            shape: 'circle',
          }}
          animation={{
            appear: {
              animation: 'wave-in',
              duration: 1000,
            },
          }}
          tooltip={{
            formatter: (datum: any) => ({
              name: '成本',
              value: `$${datum.cost.toFixed(4)} USD`,
            }),
          }}
          yAxis={{
            label: {
              formatter: (v: any) => `$${v}`,
            },
          }}
        />
      </Card>

      {/* 成本佔比 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="各來源成本佔比">
            <Pie
              data={sourceCostData}
              angleField="cost"
              colorField="source"
              radius={0.8}
              label={{
                type: 'outer',
                content: '{name} ${percentage}',
              }}
              interactions={[
                {
                  type: 'element-active',
                },
              ]}
              tooltip={{
                formatter: (datum: any) => ({
                  name: datum.source,
                  value: `$${datum.cost.toFixed(4)} USD`,
                }),
              }}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="各模型成本佔比">
            <Column
              data={modelCostData}
              xField="model"
              yField="cost"
              seriesField="model"
              colorField="model"
              animation={{
                appear: {
                  animation: 'scale-in-y',
                  duration: 800,
                },
              }}
              tooltip={{
                formatter: (datum: any) => ({
                  name: datum.model,
                  value: `$${datum.cost.toFixed(4)} USD`,
                }),
              }}
              yAxis={{
                label: {
                  formatter: (v: any) => `$${v}`,
                },
              }}
              xAxis={{
                label: {
                  formatter: (v: any) => v.replace('claude-', '').toUpperCase(),
                },
              }}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

// 準備每日成本資料
function prepareDailyCostData(data: TokenUsage[]) {
  const dailyMap = new Map<string, number>();

  data.forEach((item) => {
    const date = dayjs(item.created_at).format('YYYY-MM-DD');
    dailyMap.set(date, (dailyMap.get(date) || 0) + item.cost_usd);
  });

  return Array.from(dailyMap.entries())
    .map(([date, cost]) => ({ date, cost }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// 準備按來源的成本資料
function prepareSourceCostData(data: TokenUsage[]) {
  const sourceMap = new Map<string, number>();

  data.forEach((item) => {
    const source = MOCK_SOURCES.find((s) => s.id === item.source_id);
    const sourceName = source?.name || item.source_id;
    sourceMap.set(sourceName, (sourceMap.get(sourceName) || 0) + item.cost_usd);
  });

  return Array.from(sourceMap.entries()).map(([source, cost]) => ({
    source,
    cost,
  }));
}

// 準備按模型的成本資料
function prepareModelCostData(data: TokenUsage[]) {
  const modelMap = new Map<string, number>();

  data.forEach((item) => {
    modelMap.set(item.model, (modelMap.get(item.model) || 0) + item.cost_usd);
  });

  return Array.from(modelMap.entries()).map(([model, cost]) => ({
    model,
    cost,
  }));
}
