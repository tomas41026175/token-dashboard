import { useState } from 'react';
import { Card, Form, Input, Button, Tabs, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { signIn, signUp, sendMagicLink } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSignIn = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      await signIn(values.email, values.password);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登入失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (values: {
    email: string;
    password: string;
    displayName?: string;
  }) => {
    setLoading(true);
    setError('');
    try {
      await signUp(values.email, values.password, values.displayName);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '註冊失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (values: { email: string }) => {
    setLoading(true);
    setError('');
    try {
      await sendMagicLink(values.email);
      setMagicLinkSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '發送失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
          Token Dashboard
        </h2>

        {error && (
          <Alert
            message="錯誤"
            description={error}
            type="error"
            closable
            onClose={() => setError('')}
            style={{ marginBottom: 16 }}
          />
        )}

        {magicLinkSent && (
          <Alert
            message="Magic Link 已發送"
            description="請檢查您的信箱，點擊連結登入。"
            type="success"
            style={{ marginBottom: 16 }}
          />
        )}

        <Tabs
          items={[
            {
              key: 'signin',
              label: '登入',
              children: (
                <Form onFinish={handleSignIn} layout="vertical">
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

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '請輸入密碼' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="密碼"
                      size="large"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                  >
                    登入
                  </Button>
                </Form>
              ),
            },
            {
              key: 'signup',
              label: '註冊',
              children: (
                <Form onFinish={handleSignUp} layout="vertical">
                  <Form.Item
                    name="displayName"
                    rules={[{ required: true, message: '請輸入顯示名稱' }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="顯示名稱"
                      size="large"
                    />
                  </Form.Item>

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

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: '請輸入密碼' },
                      { min: 6, message: '密碼至少 6 個字元' },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="密碼"
                      size="large"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                  >
                    註冊
                  </Button>
                </Form>
              ),
            },
            {
              key: 'magiclink',
              label: 'Magic Link',
              children: (
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
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                  >
                    發送 Magic Link
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
