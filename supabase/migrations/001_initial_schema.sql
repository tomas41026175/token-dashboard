-- Token Dashboard 初始資料庫 Schema

-- 啟用 UUID 擴充功能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: sources (資料來源管理)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#1890ff',
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB
);

-- 建立索引
CREATE INDEX idx_sources_is_active ON sources(is_active);
CREATE INDEX idx_sources_name ON sources(name);

-- 插入預設資料來源
INSERT INTO sources (name, description, color) VALUES
  ('MAYOForm-Web', 'Mayo 表單系統 Web 前端', '#1890ff'),
  ('Claude Code', 'Claude Code CLI 使用', '#52c41a'),
  ('Personal Projects', '個人開發專案', '#faad14')
ON CONFLICT (name) DO NOTHING;

-- Table: token_usage (Token 使用記錄)
CREATE TABLE token_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL CHECK (output_tokens >= 0),
  total_tokens INTEGER NOT NULL CHECK (total_tokens >= 0),
  cost_usd NUMERIC(10, 6) NOT NULL CHECK (cost_usd >= 0),
  request_type TEXT,
  metadata JSONB
);

-- 建立索引以優化查詢效能
CREATE INDEX idx_token_usage_created_at ON token_usage(created_at DESC);
CREATE INDEX idx_token_usage_source_id ON token_usage(source_id);
CREATE INDEX idx_token_usage_model ON token_usage(model);
CREATE INDEX idx_token_usage_source_created ON token_usage(source_id, created_at DESC);

-- Table: alert_settings (警示設定)
CREATE TABLE alert_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  threshold_percentage INTEGER DEFAULT 80 CHECK (threshold_percentage >= 0 AND threshold_percentage <= 100),
  daily_limit_usd NUMERIC(10, 2) CHECK (daily_limit_usd >= 0),
  monthly_limit_usd NUMERIC(10, 2) CHECK (monthly_limit_usd >= 0),
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 每個來源只能有一個警示設定
CREATE UNIQUE INDEX idx_alert_settings_source ON alert_settings(source_id);

-- 插入預設警示設定
INSERT INTO alert_settings (source_id, threshold_percentage, monthly_limit_usd, notification_enabled)
SELECT id, 80, 300.00, TRUE
FROM sources
ON CONFLICT (source_id) DO NOTHING;

-- Function: 自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: alert_settings 更新時自動更新 updated_at
CREATE TRIGGER update_alert_settings_updated_at
  BEFORE UPDATE ON alert_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 啟用 Row Level Security (RLS)
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: 允許所有讀取（開發階段，生產環境需調整）
CREATE POLICY "Enable read access for all users" ON sources
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON token_usage
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON alert_settings
  FOR SELECT USING (true);

-- RLS Policy: 允許所有寫入（開發階段，生產環境需調整）
CREATE POLICY "Enable insert for all users" ON token_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON alert_settings
  FOR UPDATE USING (true);

-- 建立 View: 每日使用量統計
CREATE OR REPLACE VIEW daily_token_usage AS
SELECT
  date_trunc('day', created_at) AS date,
  source_id,
  model,
  COUNT(*) AS request_count,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  SUM(total_tokens) AS total_tokens,
  SUM(cost_usd) AS total_cost_usd
FROM token_usage
GROUP BY date, source_id, model
ORDER BY date DESC, source_id, model;

-- 建立 View: 每月使用量統計
CREATE OR REPLACE VIEW monthly_token_usage AS
SELECT
  date_trunc('month', created_at) AS month,
  source_id,
  COUNT(*) AS request_count,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  SUM(total_tokens) AS total_tokens,
  SUM(cost_usd) AS total_cost_usd
FROM token_usage
GROUP BY month, source_id
ORDER BY month DESC, source_id;

-- 註解
COMMENT ON TABLE sources IS '資料來源管理表';
COMMENT ON TABLE token_usage IS 'Token 使用記錄表';
COMMENT ON TABLE alert_settings IS '警示設定表';
COMMENT ON VIEW daily_token_usage IS '每日 Token 使用量統計 View';
COMMENT ON VIEW monthly_token_usage IS '每月 Token 使用量統計 View';
