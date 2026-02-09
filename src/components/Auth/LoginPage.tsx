import { useState } from 'react';
import { Card, Button, Alert, Space, Typography, Divider, Form, Input } from 'antd';
import { GoogleOutlined, GithubOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Paragraph } = Typography;

export default function LoginPage() {
  const { signInWithGoogle, signInWithGithub, sendMagicLink } = useAuth();
  const [loading, setLoading] = useState<'google' | 'github' | 'magic' | null>(null);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading('google');
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登入失敗');
    } finally {
      setLoading(null);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading('github');
    setError('');
    try {
      await signInWithGithub();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登入失敗');
    } finally {
      setLoading(null);
    }
  };

  const handleMagicLink = async (values: { email: string }) => {
    setLoading('magic');
    setError('');
    try {
      await sendMagicLink(values.email);
      setMagicLinkSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '發送失敗');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card style={{ width: 450, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Token Dashboard
          </Title>
          <Paragraph type="secondary">
            Claude API Token 使用監控平台
          </Paragraph>
        </div>

        {error && (
          <Alert
            message="錯誤"
            description={error}
            type="error"
            closable
            onClose={() => setError('')}
            style={{ marginBottom: 24 }}
          />
        )}

        {magicLinkSent && (
          <Alert
            message="Magic Link 已發送"
            description="請檢查您的信箱，點擊連結登入。"
            type="success"
            style={{ marginBottom: 24 }}
          />
        )}

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* OAuth 登入 */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<GoogleOutlined />}
              size="large"
              block
              loading={loading === 'google'}
              onClick={handleGoogleSignIn}
              style={{
                background: '#4285F4',
                borderColor: '#4285F4',
                height: 48,
              }}
            >
              使用 Google 登入
            </Button>

            <Button
              icon={<GithubOutlined />}
              size="large"
              block
              loading={loading === 'github'}
              onClick={handleGithubSignIn}
              style={{
                background: '#24292e',
                borderColor: '#24292e',
                color: 'white',
                height: 48,
              }}
            >
              使用 GitHub 登入
            </Button>
          </Space>

          <Divider>或</Divider>

          {/* Magic Link */}
          <Form onFinish={handleMagicLink} layout="vertical">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '請輸入 Email' },
                { type: 'email', message: '請輸入有效的 Email' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>

            <Button
              type="default"
              htmlType="submit"
              loading={loading === 'magic'}
              block
              size="large"
            >
              發送 Magic Link
            </Button>
          </Form>

          <Paragraph
            type="secondary"
            style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}
          >
            首次登入將自動建立帳號
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
}
