import { Layout, Menu, Typography, Space, Tabs, Button, Dropdown } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  DollarOutlined,
  SettingOutlined,
  HistoryOutlined,
  BellOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  UserOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SourceSelector from './SourceSelector';
import RealTimeMonitor from './RealTimeMonitor';
import UsageChart from '../UsageChart';
import HistoryTable from '../HistoryTable';
import CostAnalysis from '../CostAnalysis';
import AlertSettings from '../AlertSettings';
import SourceManagement from '../SourceManagement';
import ApiKeySettings from '../Settings/ApiKeySettings';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState('realtime');
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
          padding: '0 24px',
        }}
      >
        <Space>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            Token Dashboard
          </Title>
        </Space>
        <Space size="large">
          <SourceSelector />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'email',
                  label: user?.email,
                  disabled: true,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'signout',
                  label: '登出',
                  icon: <LogoutOutlined />,
                  onClick: handleSignOut,
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<UserOutlined />}
              style={{ color: 'white' }}
            >
              {user?.email}
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            onClick={({ key }) => setSelectedMenu(key)}
            style={{ height: '100%', borderRight: 0 }}
            items={[
              {
                key: 'realtime',
                icon: <DashboardOutlined />,
                label: '即時監控',
              },
              {
                key: 'charts',
                icon: <LineChartOutlined />,
                label: '使用量圖表',
              },
              {
                key: 'history',
                icon: <HistoryOutlined />,
                label: '歷史記錄',
              },
              {
                key: 'cost',
                icon: <DollarOutlined />,
                label: '成本分析',
              },
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: '設定',
              },
            ]}
          />
        </Sider>

        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            {selectedMenu === 'realtime' && <RealTimeMonitor />}
            {selectedMenu === 'charts' && <UsageChart />}
            {selectedMenu === 'history' && <HistoryTable />}
            {selectedMenu === 'cost' && <CostAnalysis />}
            {selectedMenu === 'settings' && (
              <Tabs
                defaultActiveKey="alerts"
                items={[
                  {
                    key: 'alerts',
                    label: (
                      <span>
                        <BellOutlined /> 警示設定
                      </span>
                    ),
                    children: <AlertSettings />,
                  },
                  {
                    key: 'sources',
                    label: (
                      <span>
                        <DatabaseOutlined /> 來源管理
                      </span>
                    ),
                    children: <SourceManagement />,
                  },
                  {
                    key: 'apikey',
                    label: (
                      <span>
                        <KeyOutlined /> API Key
                      </span>
                    ),
                    children: <ApiKeySettings />,
                  },
                ]}
              />
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
