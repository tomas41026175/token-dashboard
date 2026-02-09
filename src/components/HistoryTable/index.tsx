import { useState } from 'react';
import { Table, Tag, Space, Input, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useFilteredTokenUsage } from '@/hooks/useFilteredTokenUsage';
import { MOCK_SOURCES } from '@/utils/mock-data';
import type { TokenUsage } from '@/types';

const { Search } = Input;

// 模型顏色映射
const MODEL_COLORS: Record<string, string> = {
  'claude-opus-4-6': 'purple',
  'claude-sonnet-4-5': 'blue',
  'claude-haiku-4-5': 'green',
};

export default function HistoryTable() {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const allData = useFilteredTokenUsage();

  // 搜尋過濾
  const filteredData = allData.filter((item) => {
    if (!searchText) return true;
    const source = MOCK_SOURCES.find((s) => s.id === item.source_id);
    return (
      source?.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.model.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const columns: ColumnsType<TokenUsage> = [
    {
      title: '時間',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      defaultSortOrder: 'descend',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '來源',
      dataIndex: 'source_id',
      key: 'source_id',
      width: 150,
      filters: MOCK_SOURCES.map((s) => ({ text: s.name, value: s.id })),
      onFilter: (value, record) => record.source_id === value,
      render: (sourceId: string) => {
        const source = MOCK_SOURCES.find((s) => s.id === sourceId);
        return source ? (
          <Badge color={source.color} text={source.name} />
        ) : (
          sourceId
        );
      },
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      width: 180,
      filters: [
        { text: 'Opus 4.6', value: 'claude-opus-4-6' },
        { text: 'Sonnet 4.5', value: 'claude-sonnet-4-5' },
        { text: 'Haiku 4.5', value: 'claude-haiku-4-5' },
      ],
      onFilter: (value, record) => record.model === value,
      render: (model: string) => (
        <Tag color={MODEL_COLORS[model] || 'default'}>
          {model.replace('claude-', '').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Input',
      dataIndex: 'input_tokens',
      key: 'input_tokens',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.input_tokens - b.input_tokens,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Output',
      dataIndex: 'output_tokens',
      key: 'output_tokens',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.output_tokens - b.output_tokens,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '總計',
      dataIndex: 'total_tokens',
      key: 'total_tokens',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.total_tokens - b.total_tokens,
      render: (value: number) => (
        <span style={{ fontWeight: 500 }}>{value.toLocaleString()}</span>
      ),
    },
    {
      title: '成本 (USD)',
      dataIndex: 'cost_usd',
      key: 'cost_usd',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.cost_usd - b.cost_usd,
      render: (value: number) => (
        <span style={{ color: '#faad14', fontWeight: 500 }}>
          ${value.toFixed(4)}
        </span>
      ),
    },
    {
      title: '請求類型',
      dataIndex: 'request_type',
      key: 'request_type',
      width: 100,
      filters: [
        { text: 'Chat', value: 'chat' },
        { text: 'Completion', value: 'completion' },
        { text: 'Function Call', value: 'function_call' },
      ],
      onFilter: (value, record) => record.request_type === value,
      render: (type?: string) => (type ? <Tag>{type}</Tag> : '-'),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 搜尋列 */}
      <Search
        placeholder="搜尋來源或模型..."
        allowClear
        onSearch={setSearchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 300 }}
      />

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 筆記錄`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
        scroll={{ x: 1200 }}
        size="small"
      />
    </Space>
  );
}
