import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Space,
  Typography,
  Alert,
  Tag,
  Divider,
  Button,
} from 'antd';
import {
  RiseOutlined,
  DollarOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTimeRangeData } from '@/hooks/useFilteredTokenUsage';
import { useRealtimeTokenUsage } from '@/hooks/useRealtimeTokenUsage';
import { useAlertNotification } from '@/hooks/useAlertCheck';
import { useResetCountdown } from '@/hooks/useResetCountdown';
import { usePeriodCountdowns } from '@/hooks/usePeriodCountdowns';
import { useAnthropicSync } from '@/hooks/useAnthropicSync';
import { useSettingsStore } from '@/store';

const { Text } = Typography;

export default function RealTimeMonitor() {
  // 啟用 Realtime 訂閱
  useRealtimeTokenUsage();

  // 檢查警示狀態並發送通知
  const alertStatus = useAlertNotification();

  // Anthropic API 同步
  const { syncing, lastSyncTime, error: syncError, manualSync } = useAnthropicSync(false);

  const { today, week, month } = useTimeRangeData();
  const {
    defaultMonthlyLimitUsd,
    defaultWeeklyLimitUsd,
    defaultDailyLimitUsd,
    defaultThresholdPercentage,
    subscription,
  } = useSettingsStore();

  // 倒數計時
  const resetCountdown = useResetCountdown();
  const periodCountdowns = usePeriodCountdowns();

  // 計算各時段佔比
  const dailyPercentage = Math.min(
    (today.stats.totalCost / defaultDailyLimitUsd) * 100,
    100
  );
  const weeklyPercentage = Math.min(
    (week.stats.totalCost / defaultWeeklyLimitUsd) * 100,
    100
  );
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
      {/* 標題與同步按鈕 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>即時監控</h2>
        <Space>
          {lastSyncTime && (
            <Text type="secondary">
              最後同步：{lastSyncTime.toLocaleString('zh-TW')}
            </Text>
          )}
          <Button
            icon={<SyncOutlined spin={syncing} />}
            onClick={manualSync}
            loading={syncing}
          >
            同步 Anthropic 用量
          </Button>
        </Space>
      </div>

      {/* 同步錯誤提示 */}
      {syncError && (
        <Alert
          message="同步失敗"
          description={syncError}
          type="error"
          showIcon
          closable
        />
      )}

      {/* 警示橫幅 */}
      {(alertStatus.isWarning || alertStatus.isError) && (
        <Alert
          message={alertStatus.isError ? '⚠️ 超過警示閾值' : '⚠️ 接近警示閾值'}
          description={alertStatus.message}
          type={alertStatus.isError ? 'error' : 'warning'}
          showIcon
          closable
        />
      )}

      {/* 訂閱方案卡片 */}
      <Card title="訂閱方案" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>方案：</Text>
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {subscription.plan.name}
            </Tag>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          <div>
            <Text type="secondary">週期重置倒數：</Text>
            <Statistic
              value={resetCountdown.formatted}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ fontSize: 20, color: '#1890ff' }}
            />
          </div>

          <div>
            <Text type="secondary">下次重置時間：</Text>
            <br />
            <Text>
              {dayjs(subscription.nextResetDate).format('YYYY-MM-DD HH:mm')}
            </Text>
          </div>
        </Space>
      </Card>

      {/* 時段佔比卡片（進度環）*/}
      <Card title="時段用量佔比" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {/* 日佔比 */}
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={Number(dailyPercentage.toFixed(1))}
                format={(percent) => `${percent?.toFixed(1)}%`}
                status={dailyPercentage > 80 ? 'exception' : 'normal'}
              />
              <div style={{ marginTop: 8 }}>
                <Text strong>今日</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  重置：{periodCountdowns.daily.formatted}
                </Text>
              </div>
            </div>
          </Col>

          {/* 週佔比 */}
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={Number(weeklyPercentage.toFixed(1))}
                format={(percent) => `${percent?.toFixed(1)}%`}
                status={weeklyPercentage > 80 ? 'exception' : 'normal'}
              />
              <div style={{ marginTop: 8 }}>
                <Text strong>本週</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  重置：{periodCountdowns.weekly.formatted}
                </Text>
              </div>
            </div>
          </Col>

          {/* 月佔比 */}
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={Number(monthlyUsagePercentage.toFixed(1))}
                format={(percent) => `${percent?.toFixed(1)}%`}
                status={monthlyUsagePercentage > 80 ? 'exception' : 'normal'}
              />
              <div style={{ marginTop: 8 }}>
                <Text strong>本月</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  重置：{resetCountdown.days}天後
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 週統計詳細卡片 */}
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>週使用量統計</span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              (週日 ~ 週六)
            </Text>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="本週總使用"
              value={week.stats.totalTokens}
              suffix="tokens"
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="本週成本"
              value={week.stats.totalCost}
              prefix="$"
              precision={2}
            />
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        <div>
          <Text type="secondary">週限額進度</Text>
          <Progress
            percent={Number(weeklyPercentage.toFixed(1))}
            status={
              weeklyPercentage > 80
                ? 'exception'
                : weeklyPercentage > 70
                  ? 'active'
                  : 'normal'
            }
            strokeColor={
              weeklyPercentage > 80
                ? '#ff4d4f'
                : weeklyPercentage > 70
                  ? '#faad14'
                  : '#52c41a'
            }
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            剩餘 $
            {(defaultWeeklyLimitUsd - week.stats.totalCost).toFixed(2)} / $
            {defaultWeeklyLimitUsd}
          </Text>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div>
          <Text type="secondary">距離週重置：</Text>
          <Text strong style={{ marginLeft: 8, fontSize: 16, color: '#1890ff' }}>
            {periodCountdowns.weekly.formatted}
          </Text>
        </div>
      </Card>

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
