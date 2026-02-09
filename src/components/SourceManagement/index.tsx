import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  ColorPicker,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useSources } from '@/hooks/useSources';
import type { Source } from '@/types';

export default function SourceManagement() {
  const { data: sources = [], refetch } = useSources();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingSource(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (source: Source) => {
    setEditingSource(source);
    form.setFieldsValue({
      name: source.name,
      description: source.description,
      color: source.color,
      is_active: source.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (source: Source) => {
    Modal.confirm({
      title: '確認刪除',
      content: `確定要刪除來源「${source.name}」嗎？此操作無法復原。`,
      okText: '刪除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        // TODO: 實作刪除 API
        message.success(`已刪除來源「${source.name}」`);
        refetch();
      },
    });
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      // TODO: 實作新增/更新 API
      if (editingSource) {
        message.success(`已更新來源「${values.name}」`);
      } else {
        message.success(`已新增來源「${values.name}」`);
      }
      setIsModalOpen(false);
      refetch();
    });
  };

  const columns: ColumnsType<Source> = [
    {
      title: '名稱',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <Space>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: record.color,
            }}
          />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (desc?: string) => desc || '-',
    },
    {
      title: '顏色',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color: string) => (
        <div
          style={{
            width: 60,
            height: 24,
            backgroundColor: color,
            borderRadius: 4,
            border: '1px solid #d9d9d9',
          }}
        />
      ),
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? '#52c41a' : '#8c8c8c' }}>
          {isActive ? '啟用' : '停用'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            編輯
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card
        title="資料來源管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增來源
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={sources}
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* 新增/編輯對話框 */}
      <Modal
        title={editingSource ? '編輯來源' : '新增來源'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="儲存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="名稱"
            name="name"
            rules={[
              { required: true, message: '請輸入來源名稱' },
              { max: 50, message: '名稱不能超過 50 字元' },
            ]}
          >
            <Input placeholder="例：MAYOForm-Web" />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea
              rows={3}
              placeholder="例：Mayo 表單系統 Web 前端"
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            label="顏色"
            name="color"
            rules={[{ required: true, message: '請選擇顏色' }]}
            initialValue="#1890ff"
          >
            <ColorPicker showText />
          </Form.Item>

          <Form.Item
            label="啟用"
            name="is_active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 使用說明 */}
      <Card title="使用說明" size="small">
        <Space direction="vertical">
          <div>
            <strong>新增來源：</strong>點擊右上角「新增來源」按鈕，填寫來源資訊。
          </div>
          <div>
            <strong>編輯來源：</strong>點擊表格中的「編輯」按鈕修改來源資訊。
          </div>
          <div>
            <strong>刪除來源：</strong>刪除來源會同時刪除該來源的所有使用記錄，請謹慎操作。
          </div>
          <div>
            <strong>停用來源：</strong>停用的來源不會出現在來源選擇器中，但歷史資料仍會保留。
          </div>
        </Space>
      </Card>
    </Space>
  );
}
