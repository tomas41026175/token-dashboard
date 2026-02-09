import { Card, Row, Col, Statistic, Progress, Space, Typography } from 'antd';
import {
  RiseOutlined,
  DollarOutlined,
  ApiOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useTimeRangeData } from '@/hooks/useFilteredTokenUsage';
import { useRealtimeTokenUsage } from '@/hooks/useRealtimeTokenUsage';
import { useSettingsStore } from '@/store';

const { Text } = Typography;

export default function RealTimeMonitor() {
  // 啟用 Realtime 訂閱
  useRealtimeTokenUsage();

  const { today, week, month } = useTimeRangeData();
  const { defaultMonthlyLimitUsd, defaultThresholdPercentage } =
    useSettingsStore();

  // 計算使用率
  const monthlyUsagePercentage = Math.min(
    (month.stats.totalCost / defaultMonthlyLimitUsd) * 100,
    100
  );

  // 進度條顏色
  const getProgressColor = (percentage: number) => {
    if (percentage >= defaultThresholdPercentage) return '#ff4d4f';
    if (percentage >= defaultThresholdPercentage * 0.7) return '#faad14';
    return '#52c41a';
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 主要統計卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日使用量"
              value={today.stats.totalTokens}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ApiOutlined />}
              suffix="tokens"
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              ${today.stats.totalCost.toFixed(4)} USD
            </Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="本週使用量"
              value={week.stats.totalTokens}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ThunderboltOutlined />}
              suffix="tokens"
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              ${week.stats.totalCost.toFixed(4)} USD
            </Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="本月使用量"
              value={month.stats.totalTokens}
              precision={0}
              valueStyle={{ color: '#faad14' }}
              prefix={<RiseOutlined />}
              suffix="tokens"
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              ${month.stats.totalCost.toFixed(4)} USD
            </Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="本月成本"
              value={month.stats.totalCost}
              precision={2}
              valueStyle={{
                color:
                  monthlyUsagePercentage >= defaultThresholdPercentage
                    ? '#ff4d4f'
                    : '#3f8600',
              }}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              限額: ${defaultMonthlyLimitUsd} USD
            </Text>
          </Card>
        </Col>
      </Row>

      {/* 本月使用率進度條 */}
      <Card title="本月使用率">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Progress
            percent={Number(monthlyUsagePercentage.toFixed(1))}
            strokeColor={getProgressColor(monthlyUsagePercentage)}
            status={
              monthlyUsagePercentage >= defaultThresholdPercentage
                ? 'exception'
                : 'active'
            }
          />
          <Row justify="space-between">
            <Text type="secondary">
              已使用: {month.stats.requestCount} 次請求
            </Text>
            <Text type="secondary">
              剩餘額度: $
              {Math.max(
                defaultMonthlyLimitUsd - month.stats.totalCost,
                0
              ).toFixed(2)}{' '}
              USD
            </Text>
          </Row>
        </Space>
      </Card>

      {/* 詳細統計 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Token 使用明細" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row justify="space-between">
                <Text>Input Tokens:</Text>
                <Text strong>
                  {month.stats.inputTokens.toLocaleString()}
                </Text>
              </Row>
              <Row justify="space-between">
                <Text>Output Tokens:</Text>
                <Text strong>
                  {month.stats.outputTokens.toLocaleString()}
                </Text>
              </Row>
              <Row justify="space-between">
                <Text>總計:</Text>
                <Text strong>
                  {month.stats.totalTokens.toLocaleString()}
                </Text>
              </Row>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="平均統計" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row justify="space-between">
                <Text>每次請求平均 Tokens:</Text>
                <Text strong>
                  {month.stats.requestCount > 0
                    ? Math.round(
                        month.stats.totalTokens / month.stats.requestCount
                      ).toLocaleString()
                    : 0}
                </Text>
              </Row>
              <Row justify="space-between">
                <Text>每次請求平均成本:</Text>
                <Text strong>
                  $
                  {month.stats.requestCount > 0
                    ? (
                        month.stats.totalCost / month.stats.requestCount
                      ).toFixed(4)
                    : '0.0000'}
                </Text>
              </Row>
              <Row justify="space-between">
                <Text>Output/Input 比例:</Text>
                <Text strong>
                  {month.stats.inputTokens > 0
                    ? (
                        month.stats.outputTokens / month.stats.inputTokens
                      ).toFixed(2)
                    : '0.00'}
                </Text>
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
