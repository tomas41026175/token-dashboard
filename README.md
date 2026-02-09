# Token Dashboard

Claude API Token 使用監控 Dashboard

## 功能特色

- 🎯 **多來源切換** — 監測不同專案（MAYOForm-Web、Claude Code、Personal 等）
- 📊 **即時監控** — 今日/本週/本月使用量與成本
- 📈 **歷史分析** — 時間序列圖表、模型使用佔比
- 💰 **成本分析** — 各來源成本統計與趨勢預測
- 🔔 **警示通知** — 超過閾值時自動提醒

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

### 🔄 Phase 2: 核心元件開發（進行中）

- [ ] RealTimeMonitor 元件
- [ ] UsageChart 元件（折線圖、堆疊圖、圓餅圖）
- [ ] HistoryTable 元件
- [ ] CostAnalysis 元件

### 📋 Phase 3: 資料庫整合（待開始）

- [ ] Supabase 專案設定
- [ ] 執行資料庫 migration
- [ ] 建立 Supabase client
- [ ] 實作 React Query hooks
- [ ] 連接 Realtime 訂閱

### ⚙️ Phase 4: 進階功能（待開始）

- [ ] AlertSettings 元件
- [ ] 警示邏輯與通知
- [ ] 資料匯出功能
- [ ] SourceManagement 元件

### 🚀 Phase 5: 部署（待開始）

- [ ] Supabase Auth 設定
- [ ] 環境變數設定
- [ ] 部署到 Vercel
- [ ] 響應式設計優化

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
