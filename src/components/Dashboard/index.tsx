import { Layout, Menu, Typography, Space } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  DollarOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import SourceSelector from './SourceSelector';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState('realtime');

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
        <SourceSelector />
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
                key: 'history',
                icon: <LineChartOutlined />,
                label: '歷史分析',
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
            {selectedMenu === 'realtime' && (
              <div>即時監控內容（待實作）</div>
            )}
            {selectedMenu === 'history' && (
              <div>歷史分析內容（待實作）</div>
            )}
            {selectedMenu === 'cost' && (
              <div>成本分析內容（待實作）</div>
            )}
            {selectedMenu === 'settings' && (
              <div>設定內容（待實作）</div>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
