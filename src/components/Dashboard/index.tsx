import { Layout, Menu, Typography, Space } from 'antd';
import {
  DashboardOutlined,
  LineChartOutlined,
  DollarOutlined,
  SettingOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import SourceSelector from './SourceSelector';
import RealTimeMonitor from './RealTimeMonitor';
import UsageChart from '../UsageChart';
import HistoryTable from '../HistoryTable';
import CostAnalysis from '../CostAnalysis';

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
              <div>設定頁面（待實作）</div>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
