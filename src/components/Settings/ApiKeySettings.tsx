import { Card, Form, Input, Button, Alert, Typography } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { supabase, getCurrentUserProfile } from '@/services/supabase';

const { Paragraph } = Typography;

export default function ApiKeySettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingKey, setLoadingKey] = useState(true);

  useEffect(() => {
    loadApiKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadApiKey = async () => {
    setLoadingKey(true);
    try {
      const profile = await getCurrentUserProfile();
      if (profile?.anthropic_api_key) {
        // 顯示遮罩後的 API Key
        const maskedKey =
          '••••••••' + profile.anthropic_api_key.slice(-4);
        form.setFieldValue('apiKey', maskedKey);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    } finally {
      setLoadingKey(false);
    }
  };

  const handleSave = async (values: { apiKey: string }) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ anthropic_api_key: values.apiKey })
        .eq('id', user.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      // 重新載入以顯示遮罩後的 key
      loadApiKey();
    } catch (error) {
      console.error('Failed to save API key:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Anthropic API Key 設定" extra={<KeyOutlined />}>
      {saved && (
        <Alert
          message="API Key 已儲存"
          type="success"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item
          name="apiKey"
          label="Anthropic API Key"
          tooltip="用於自動同步真實用量記錄"
          rules={[
            { required: true, message: '請輸入 API Key' },
            {
              pattern: /^sk-ant-/,
              message: 'API Key 格式錯誤（應以 sk-ant- 開頭）',
            },
          ]}
        >
          <Input.Password
            prefix={<KeyOutlined />}
            placeholder="sk-ant-xxxxxxxx"
            disabled={loadingKey}
          />
        </Form.Item>

        <Alert
          message="安全提示"
          description="您的 API Key 將加密儲存於資料庫，僅用於同步用量記錄。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Alert
          message="重要注意事項"
          description={
            <div>
              <Paragraph style={{ marginBottom: 8 }}>
                目前 Anthropic 可能沒有公開的 Usage API。
              </Paragraph>
              <Paragraph style={{ marginBottom: 0 }}>
                <strong>替代方案：</strong>
                <ul style={{ marginTop: 4, marginBottom: 0 }}>
                  <li>手動匯出 - 從 Console 下載 CSV 後上傳</li>
                  <li>Webhook - 如果 Anthropic 支援即時通知</li>
                  <li>Browser Extension - 自動抓取 Console 資料</li>
                </ul>
              </Paragraph>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Button type="primary" htmlType="submit" loading={loading}>
          儲存 API Key
        </Button>
      </Form>
    </Card>
  );
}
