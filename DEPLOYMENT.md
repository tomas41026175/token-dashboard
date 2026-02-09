# Token Dashboard 部署指南

本文件說明如何將 Token Dashboard 部署到各種平台。

---

## 📋 部署前檢查清單

- [ ] 確認所有功能在本地測試通過
- [ ] TypeScript 型別檢查通過 (`pnpm type-check`)
- [ ] Production build 成功 (`pnpm build`)
- [ ] 確認 `.gitignore` 包含 `.env` 和 `dist/`
- [ ] （可選）設定 Supabase 憑證

---

## 🚀 部署選項

### 選項 1：Vercel（推薦）⭐

Vercel 提供最佳的 Vite 專案支援和自動化部署。

#### 步驟：

1. **安裝 Vercel CLI**（可選）
   ```bash
   pnpm add -g vercel
   ```

2. **透過 GitHub 部署**（推薦）

   a. 將專案推送到 GitHub
   ```bash
   cd ~/Documents/Projects/token-dashboard
   git remote add origin https://github.com/YOUR_USERNAME/token-dashboard.git
   git push -u origin master
   ```

   b. 前往 [Vercel Dashboard](https://vercel.com/new)

   c. 點擊「Import Project」

   d. 選擇您的 GitHub repository

   e. **設定環境變數**（如果使用 Supabase）
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   f. 點擊「Deploy」

3. **透過 CLI 部署**

   ```bash
   cd ~/Documents/Projects/token-dashboard
   vercel login
   vercel
   ```

   CLI 會引導您完成部署設定。

#### 環境變數設定

在 Vercel Dashboard → Project Settings → Environment Variables 添加：

| Key | Value | Description |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 專案 URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase anon key |

**注意：** 如果不設定環境變數，Dashboard 會自動使用模擬資料模式。

---

### 選項 2：Netlify

#### 步驟：

1. **建立 `netlify.toml`**

   在專案根目錄建立檔案：
   ```toml
   [build]
     command = "pnpm build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **透過 GitHub 部署**

   a. 推送到 GitHub（同上）

   b. 前往 [Netlify Dashboard](https://app.netlify.com/start)

   c. 選擇「Import from Git」

   d. 選擇您的 repository

   e. Build settings：
   ```
   Build command: pnpm build
   Publish directory: dist
   ```

   f. 設定環境變數（同 Vercel）

   g. 點擊「Deploy site」

3. **透過 CLI 部署**

   ```bash
   pnpm add -g netlify-cli
   cd ~/Documents/Projects/token-dashboard
   netlify login
   netlify deploy --prod
   ```

---

### 選項 3：GitHub Pages

適合靜態展示，但不支援環境變數（僅能使用模擬資料模式）。

#### 步驟：

1. **修改 `vite.config.ts`**

   加入 base path：
   ```typescript
   export default defineConfig({
     base: '/token-dashboard/',  // 替換為您的 repo 名稱
     // ... 其他設定
   });
   ```

2. **建立部署腳本**

   在 `package.json` 加入：
   ```json
   "scripts": {
     "deploy": "pnpm build && gh-pages -d dist"
   }
   ```

3. **安裝 gh-pages**
   ```bash
   pnpm add -D gh-pages
   ```

4. **部署**
   ```bash
   pnpm deploy
   ```

5. **設定 GitHub Pages**
   - Repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`

---

### 選項 4：自架伺服器（Docker）

#### Dockerfile

建立 `Dockerfile`：
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

建立 `nginx.conf`：
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### 建置並執行

```bash
docker build -t token-dashboard .
docker run -p 8080:80 token-dashboard
```

存取 http://localhost:8080

---

## 🔐 環境變數設定

### Supabase 憑證取得

1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 選擇您的專案
3. 前往 Settings → API
4. 複製：
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`

### 本地開發

建立 `.env` 檔案：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**重要：** `.env` 已在 `.gitignore` 中，不會被提交。

---

## 🧪 部署後驗證

### 檢查清單

1. **基本功能**
   - [ ] 首頁正常載入
   - [ ] 所有頁面可正常切換
   - [ ] 圖表正確顯示

2. **Supabase 連線**（如已設定）
   - [ ] 開啟瀏覽器 Console
   - [ ] 檢查是否有「✅ Realtime subscription active」
   - [ ] 來源選擇器顯示資料庫中的來源

3. **模擬資料模式**（如未設定 Supabase）
   - [ ] Console 顯示「⚠️ Supabase credentials not found. Using mock data mode.」
   - [ ] 數據正常顯示（模擬資料）

4. **效能**
   - [ ] 首次載入 < 3 秒
   - [ ] Lighthouse Score > 80

---

## 🔄 自動部署設定

### Vercel（推薦）

自動設定，每次 push 到 `main` 分支會自動部署。

### GitHub Actions

建立 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build

      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 🐛 常見問題

### 1. **部署後頁面空白**

**原因：** Base path 設定錯誤或路由問題

**解決：**
- 檢查 `vite.config.ts` 的 `base` 設定
- 確認部署平台的 redirect 規則正確

### 2. **環境變數無效**

**原因：** Vite 需要 `VITE_` 前綴

**解決：**
- 確認環境變數名稱以 `VITE_` 開頭
- 重新建置專案（環境變數在建置時注入）

### 3. **Supabase 連線失敗**

**原因：** CORS 設定或憑證錯誤

**解決：**
- 檢查 Supabase Dashboard → API Settings
- 確認 URL 和 Key 正確無誤
- 檢查 Supabase 專案是否暫停（免費版會自動暫停）

### 4. **Bundle size 過大**

**原因：** 未優化的依賴

**解決：**
- 已在 `vite.config.ts` 設定 manual chunks
- 考慮使用 lazy loading：
  ```typescript
  const Dashboard = lazy(() => import('./components/Dashboard'));
  ```

---

## 📊 效能優化建議

### 1. **啟用 HTTPS**
所有主流部署平台預設啟用，確保瀏覽器通知功能正常。

### 2. **設定 CDN**
Vercel 和 Netlify 自動提供全球 CDN。

### 3. **啟用 Gzip/Brotli**
部署平台通常自動啟用，可在 Response Headers 中確認。

### 4. **監控效能**
使用 [Lighthouse](https://developers.google.com/web/tools/lighthouse) 或 [WebPageTest](https://www.webpagetest.org/) 測試。

---

## 🎯 推薦部署方案

| 使用情境 | 推薦平台 | 原因 |
|---------|---------|-----|
| 個人展示 | Vercel | 免費、自動化、效能佳 |
| 團隊使用 | Vercel / Netlify | 支援環境變數、Preview 部署 |
| 僅靜態展示 | GitHub Pages | 免費、簡單 |
| 企業自架 | Docker + Nginx | 完全控制、可整合內部系統 |

---

## 🆘 支援

部署遇到問題？
1. 檢查 Console 錯誤訊息
2. 參考本文件的「常見問題」章節
3. 查看部署平台的 build logs

---

**祝部署順利！** 🚀
