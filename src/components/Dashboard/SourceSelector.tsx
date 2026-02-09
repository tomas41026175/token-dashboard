import { Select, Badge } from 'antd';
import { MOCK_SOURCES } from '@/utils/mock-data';
import { useSourceStore } from '@/store';

const { Option } = Select;

export default function SourceSelector() {
  const { currentSourceId, setCurrentSource } = useSourceStore();

  return (
    <Select
      value={currentSourceId}
      onChange={setCurrentSource}
      placeholder="選擇監測來源"
      style={{ width: 200 }}
    >
      <Option value={null}>
        <Badge color="#8c8c8c" text="全部來源" />
      </Option>
      {MOCK_SOURCES.filter((s) => s.is_active).map((source) => (
        <Option key={source.id} value={source.id}>
          <Badge color={source.color} text={source.name} />
        </Option>
      ))}
    </Select>
  );
}
