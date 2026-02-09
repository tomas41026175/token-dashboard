import { Card, Form, InputNumber, Switch, Button, Space, Alert, Divider } from 'antd';
import { BellOutlined, DollarOutlined, PercentageOutlined } from '@ant-design/icons';
import { useSettingsStore } from '@/store';
import { useAlertCheck, requestNotificationPermission } from '@/hooks/useAlertCheck';
import { useState } from 'react';

export default function AlertSettings() {
  const {
    defaultThresholdPercentage,
    defaultDailyLimitUsd,
    defaultMonthlyLimitUsd,
    notificationEnabled,
    setThresholdPercentage,
    setDailyLimit,
    setMonthlyLimit,
    setNotificationEnabled,
  } = useSettingsStore();

  const alertStatus = useAlertCheck();
  const [form] = Form.useForm();
  const [hasRequested, setHasRequested] = useState(false);

  const handleSave = () => {
    form.validateFields().then((values) => {
      setThresholdPercentage(values.thresholdPercentage);
      setDailyLimit(values.dailyLimit);
      setMonthlyLimit(values.monthlyLimit);
      setNotificationEnabled(values.notificationEnabled);
    });
  };

  const handleReset = () => {
    form.setFieldsValue({
      thresholdPercentage: 80,
      dailyLimit: 10,
      monthlyLimit: 300,
      notificationEnabled: true,
    });
  };

  const handleRequestNotification = async () => {
    const granted = await requestNotificationPermission();
    setHasRequested(true);

    if (granted) {
      // 發送測試通知
      new Notification('Token Dashboard', {
        body: '✅ 通知權限已啟用！您將收到警示通知。',
        icon: '/vite.svg',
      });
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 當前警示狀態 */}
      {(alertStatus.isWarning || alertStatus.isError) && (
        <Alert
          message={alertStatus.isError ? '超過警示閾值' : '接近警示閾值'}
          description={alertStatus.message}
          type={alertStatus.isError ? 'error' : 'warning'}
          showIcon
          closable
        />
      )}

      <Card title="警示設定" extra={<BellOutlined />}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            thresholdPercentage: defaultThresholdPercentage,
            dailyLimit: defaultDailyLimitUsd,
            monthlyLimit: defaultMonthlyLimitUsd,
            notificationEnabled: notificationEnabled,
          }}
        >
          <Form.Item
            label="警示閾值百分比"
            name="thresholdPercentage"
            tooltip="當使用量達到此百分比時觸發警示"
            rules={[
              { required: true, message: '請輸入閾值百分比' },
              { type: 'number', min: 1, max: 100, message: '必須在 1-100 之間' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              max={100}
              addonAfter={<PercentageOutlined />}
              placeholder="例：80"
            />
          </Form.Item>

          <Form.Item
            label="每日成本限額 (USD)"
            name="dailyLimit"
            tooltip="每日 token 使用成本上限"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={1}
              precision={2}
              addonBefore={<DollarOutlined />}
              placeholder="例：10.00"
            />
          </Form.Item>

          <Form.Item
            label="每月成本限額 (USD)"
            name="monthlyLimit"
            tooltip="每月 token 使用成本上限"
            rules={[
              { required: true, message: '請輸入每月限額' },
              { type: 'number', min: 0, message: '必須大於 0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={10}
              precision={2}
              addonBefore={<DollarOutlined />}
              placeholder="例：300.00"
            />
          </Form.Item>

          <Divider />

          <Form.Item
            label="啟用桌面通知"
            name="notificationEnabled"
            valuePropName="checked"
            tooltip="超過閾值時發送瀏覽器通知"
          >
            <Switch />
          </Form.Item>

          {notificationEnabled && (
            <Alert
              message="通知權限"
              description={
                <Space direction="vertical">
                  <div>
                    您需要授予瀏覽器通知權限才能接收警示。
                  </div>
                  <Button
                    type="link"
                    size="small"
                    onClick={handleRequestNotification}
                  >
                    {hasRequested ? '重新請求通知權限' : '請求通知權限'}
                  </Button>
                </Space>
              }
              type="info"
              showIcon
              style={{ marginTop: 8 }}
            />
          )}

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" onClick={handleSave}>
                儲存設定
              </Button>
              <Button onClick={handleReset}>重置為預設值</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 使用說明 */}
      <Card title="使用說明" size="small">
        <Space direction="vertical">
          <div>
            <strong>警示閾值：</strong>當本月使用量達到設定百分比時，Dashboard
            會顯示警告訊息。
          </div>
          <div>
            <strong>成本限額：</strong>設定每日/每月的最大支出金額，用於計算使用率。
          </div>
          <div>
            <strong>桌面通知：</strong>啟用後，超過閾值時會發送瀏覽器通知提醒您。
          </div>
          <div>
            <strong>通知時機：</strong>
            <ul>
              <li>70% 閾值：黃色警告（提前提醒）</li>
              <li>100% 閾值：紅色錯誤（超過限額）</li>
            </ul>
          </div>
        </Space>
      </Card>
    </Space>
  );
}
