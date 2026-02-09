# Token Dashboard

Claude API Token 使用監控 Dashboard

## 功能特色

- 🔐 **使用者認證** — Email/Password + Magic Link 登入（Supabase Auth）
- 🔑 **Anthropic API 整合** — 自動同步真實用量記錄
- 🎯 **多來源切換** — 監測不同專案（MAYOForm-Web、Claude Code、Personal 等）
- 📊 **即時監控** — 今日/本週/本月使用量與成本
- 📈 **歷史分析** — 時間序列圖表、模型使用佔比
- 💰 **成本分析** — 各來源成本統計與趨勢預測
- 🔔 **警示通知** — 超過閾值時自動提醒
- 📤 **資料匯出** — CSV/JSON/Markdown 格式匯出

## 技術棧

- **框架**: Vite + React 18 + TypeScript
- **UI**: Ant Design + @ant-design/charts
- **狀態管理**: Zustand (持久化)
- **資料庫**: Supabase (PostgreSQL + Realtime)

## 開發指令

```bash
# 安裝依賴
pnpm install

# 開發模式
pnpm dev

# 建置
pnpm build

# 型別檢查
pnpm tsc --noEmit
```

## Supabase 設定（可選）

專案已整合 Supabase，但**即使不設定也能正常運行**（會使用模擬資料）。

### 設定步驟

1. **建立 Supabase 專案**
   - 前往 https://app.supabase.com
   - 建立新專案

2. **執行資料庫 Migration**
   - 複製 `supabase/migrations/001_initial_schema.sql` 的內容
   - 在 Supabase Dashboard → SQL Editor 執行
   - 複製 `supabase/migrations/002_add_auth.sql` 的內容並執行（啟用認證功能）

3. **設定環境變數**
   ```bash
   cp .env.example .env
   ```

   編輯 `.env` 檔案，填入您的 Supabase 憑證：
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   憑證可在 Supabase Dashboard → Settings → API 找到

4. **重新啟動開發伺服器**
   ```bash
   pnpm dev
   ```

### 模擬資料 vs 真實資料

- **未設定 Supabase**：自動使用模擬資料（30 天歷史記錄）
- **已設定 Supabase**：從資料庫讀取真實資料，並支援 Realtime 即時更新

## 使用者認證

專案已整合 Supabase Auth，支援以下登入方式：

- **Email + Password** — 傳統帳號密碼登入
- **Magic Link** — 無密碼登入（Email 驗證連結）
- **Session 持久化** — 自動保持登入狀態

### 註冊新使用者

1. 啟動應用程式並前往登入頁面
2. 切換到「註冊」標籤
3. 輸入顯示名稱、Email 和密碼
4. 點擊「註冊」按鈕
5. 系統會自動建立 profile 並登入

## Anthropic API 整合

專案支援自動同步 Anthropic API 真實用量記錄。

### 設定步驟

1. **取得 Anthropic API Key**
   - 前往 https://console.anthropic.com/settings/keys
   - 建立新的 API Key

2. **在 Dashboard 中設定**
   - 登入應用程式
   - 前往「設定」→「API Key」
   - 輸入您的 Anthropic API Key（格式：`sk-ant-...`）
   - 點擊「儲存 API Key」

3. **手動同步用量**
   - 前往「即時監控」頁面
   - 點擊「同步 Anthropic 用量」按鈕
   - 系統會自動同步最近 7 天的用量記錄

### 重要注意事項

⚠️ **目前 Anthropic 可能沒有公開的 Usage API**

替代方案：
1. **手動匯出** — 從 Console 下載 CSV 後上傳
2. **Webhook** — 如果 Anthropic 支援即時通知
3. **Browser Extension** — 自動抓取 Console 資料

詳細設定請參考 `DEPLOYMENT.md`。

## 專案結構

```
src/
├── components/          # React 元件
│   ├── Dashboard/       # 主 Dashboard + 來源選擇器
│   ├── UsageChart/      # 使用量圖表
│   ├── CostAnalysis/    # 成本分析
│   ├── AlertSettings/   # 警示設定
│   ├── HistoryTable/    # 歷史記錄
│   └── SourceManagement/ # 來源管理
├── hooks/               # Custom hooks
├── services/            # API 服務 (Supabase)
├── types/               # TypeScript 型別
├── utils/               # 工具函式（含模擬資料生成器）
└── store/               # Zustand stores
```

## 目前進度

### ✅ Phase 1: 專案初始化與 UI 骨架（已完成）

- [x] 建立 Vite + React + TypeScript 專案
- [x] 安裝核心依賴（antd, zustand, dayjs）
- [x] 建立專案目錄結構
- [x] 實作模擬資料生成器
- [x] 建立 TypeScript 型別定義
- [x] 設定 Zustand stores (source, settings)
- [x] 建立基礎 Layout（Header + Sider + Content）
- [x] 實作 SourceSelector 元件

### ✅ Phase 2: 核心元件開發（已完成）

- [x] RealTimeMonitor 元件
- [x] UsageChart 元件（折線圖、堆疊圖、圓餅圖）
- [x] HistoryTable 元件
- [x] CostAnalysis 元件

### ✅ Phase 3: 資料庫整合（已完成）

- [x] Supabase client 設定
- [x] 資料庫 migration SQL
- [x] React Query 整合
- [x] API hooks (useSources, useTokenUsageFromDB)
- [x] Realtime 訂閱功能
- [x] 自動 fallback 到模擬資料

### ✅ Phase 4: 進階功能（已完成）

- [x] AlertSettings 元件（警示設定頁面）
- [x] 警示邏輯與通知（雙閾值 + 瀏覽器通知）
- [x] 資料匯出功能（CSV/JSON/Markdown）
- [x] SourceManagement 元件（來源管理介面）
- [x] Dashboard 整合（Tabs 設定頁 + 匯出按鈕）

### 🚀 Phase 5: 部署與優化（待開始）

- [ ] Supabase Auth 設定
- [ ] 環境變數設定與部署指南
- [ ] 部署到 Vercel/Netlify
- [ ] 響應式設計優化（手機/平板）
- [ ] 效能優化（code splitting、lazy loading）

## 模擬資料

目前使用 `src/utils/mock-data.ts` 生成模擬資料：

- 3 個來源：MAYOForm-Web (50%)、Claude Code (30%)、Personal (20%)
- 過去 30 天的使用記錄
- 每天約 50 筆記錄（有波動）
- 包含 3 種模型：Opus 4.6、Sonnet 4.5、Haiku 4.5
- 自動計算成本（根據 Anthropic 2026-02 定價）

## 下一步

1. 實作 RealTimeMonitor 元件（顯示今日/本週/本月使用量）
2. 實作 UsageChart 元件（時間序列圖表）
3. 實作 HistoryTable 元件（使用記錄表格）
4. 整合 Supabase 資料庫

## 作者

Tomas Chang (@tomas_chang)
