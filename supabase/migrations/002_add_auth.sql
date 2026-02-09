-- Token Dashboard Auth 功能擴充
-- 支援單使用者模式，預留多租戶升級空間

-- 1. 建立 profiles 表（綁定 Supabase Auth）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  anthropic_api_key TEXT, -- 🔑 儲存使用者的 Anthropic API Key（加密）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 為現有 tables 加入 user_id（nullable，預留升級空間）
ALTER TABLE sources ADD COLUMN user_id UUID REFERENCES profiles(id);
ALTER TABLE token_usage ADD COLUMN user_id UUID REFERENCES profiles(id);
ALTER TABLE alert_settings ADD COLUMN user_id UUID REFERENCES profiles(id);

-- 3. 建立 index 提升查詢效能
CREATE INDEX idx_sources_user_id ON sources(user_id);
CREATE INDEX idx_token_usage_user_id ON token_usage(user_id);
CREATE INDEX idx_alert_settings_user_id ON alert_settings(user_id);

-- 4. RLS Policies（方案 B：寬鬆模式）
-- 移除舊的開發階段 policies
DROP POLICY IF EXISTS "Enable read access for all users" ON sources;
DROP POLICY IF EXISTS "Enable read access for all users" ON token_usage;
DROP POLICY IF EXISTS "Enable read access for all users" ON alert_settings;
DROP POLICY IF EXISTS "Enable insert for all users" ON token_usage;
DROP POLICY IF EXISTS "Enable update for all users" ON alert_settings;

-- Sources policies
CREATE POLICY "Authenticated users can read all sources"
  ON sources FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert sources"
  ON sources FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Authenticated users can update their sources"
  ON sources FOR UPDATE
  USING (auth.role() = 'authenticated' AND (user_id = auth.uid() OR user_id IS NULL));

CREATE POLICY "Authenticated users can delete their sources"
  ON sources FOR DELETE
  USING (auth.role() = 'authenticated' AND (user_id = auth.uid() OR user_id IS NULL));

-- Token usage policies
CREATE POLICY "Authenticated users can read all token_usage"
  ON token_usage FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert token_usage"
  ON token_usage FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Alert settings policies
CREATE POLICY "Authenticated users can read all alert_settings"
  ON alert_settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage alert_settings"
  ON alert_settings FOR ALL
  USING (auth.role() = 'authenticated');

-- 5. Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 6. 自動更新 profiles.updated_at 的 trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. 自動建立 profile（當新使用者註冊時）
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 註解
COMMENT ON TABLE profiles IS '使用者 Profile 表（綁定 Supabase Auth）';
COMMENT ON COLUMN profiles.anthropic_api_key IS 'Anthropic API Key（加密儲存）';
COMMENT ON COLUMN sources.user_id IS '資料擁有者（nullable 以支援平滑升級）';
COMMENT ON COLUMN token_usage.user_id IS '記錄擁有者（nullable 以支援平滑升級）';
COMMENT ON COLUMN alert_settings.user_id IS '設定擁有者（nullable 以支援平滑升級）';

-- 升級指引（註解）
-- 未來升級到方案 A（嚴格多租戶）時：
-- 1. ALTER TABLE sources ALTER COLUMN user_id SET NOT NULL;
-- 2. ALTER TABLE token_usage ALTER COLUMN user_id SET NOT NULL;
-- 3. 更新 RLS policies 為嚴格模式（僅能存取自己的資料）
