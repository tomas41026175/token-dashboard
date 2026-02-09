# OAuth 設定指南

Token Dashboard 使用第三方 OAuth 登入（Google、GitHub），以下是完整設定步驟。

---

## 📋 Supabase OAuth 設定

### 1. 前往 Supabase Dashboard

前往您的 Supabase 專案：https://app.supabase.com

導航到：**Authentication** → **Providers**

---

## 🔵 Google OAuth 設定

### Step 1: 建立 Google OAuth 應用程式

1. **前往 Google Cloud Console**
   - https://console.cloud.google.com/apis/credentials

2. **建立 OAuth 2.0 Client ID**
   - 點擊「建立憑證」→「OAuth 用戶端 ID」
   - 應用程式類型：Web 應用程式
   - 名稱：Token Dashboard

3. **設定授權重新導向 URI**
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```

   替換 `[YOUR-PROJECT-REF]` 為您的 Supabase 專案參考 ID（可在 Settings → General 找到）

4. **取得憑證**
   - 複製「用戶端 ID」
   - 複製「用戶端密鑰」

### Step 2: 在 Supabase 啟用 Google Provider

1. 前往 Supabase Dashboard → **Authentication** → **Providers**
2. 找到「Google」，點擊「Edit」
3. 啟用「Google Enabled」
4. 填入：
   - **Client ID**：貼上 Google OAuth Client ID
   - **Client Secret**：貼上 Google OAuth Client Secret
5. 點擊「Save」

---

## ⚫ GitHub OAuth 設定

### Step 1: 建立 GitHub OAuth 應用程式

1. **前往 GitHub Settings**
   - https://github.com/settings/developers
   - 點擊「New OAuth App」

2. **填寫應用程式資訊**
   - **Application name**：Token Dashboard
   - **Homepage URL**：`http://localhost:5173`（開發環境）或您的生產網域
   - **Authorization callback URL**：
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```

3. **取得憑證**
   - 複製「Client ID」
   - 點擊「Generate a new client secret」並複製 Secret

### Step 2: 在 Supabase 啟用 GitHub Provider

1. 前往 Supabase Dashboard → **Authentication** → **Providers**
2. 找到「GitHub」，點擊「Edit」
3. 啟用「GitHub Enabled」
4. 填入：
   - **Client ID**：貼上 GitHub OAuth Client ID
   - **Client Secret**：貼上 GitHub OAuth Client Secret
5. 點擊「Save」

---

## 🧪 測試 OAuth 登入

### 1. 啟動應用程式

```bash
cd /Users/tomas_chang/Documents/Projects/token-dashboard
pnpm dev
```

應用程式會在 http://localhost:5173 啟動

### 2. 測試登入流程

1. 前往 http://localhost:5173/login
2. 點擊「使用 Google 登入」或「使用 GitHub 登入」
3. 完成授權流程
4. 您應該會被重新導向回應用程式並自動登入

### 3. 確認 Profile 建立

登入後，Supabase 會自動建立 `profiles` 表記錄：
- `id` — 與 auth.users.id 相同
- `email` — 從 OAuth provider 取得
- `display_name` — 從 OAuth provider 取得

---

## 🚨 常見問題

### Q: OAuth 登入後跳回錯誤頁面

**原因**：Redirect URL 設定錯誤

**解決方式**：
1. 確認 Supabase 專案的 Site URL 設定正確
2. 前往 Supabase Dashboard → **Authentication** → **URL Configuration**
3. 設定 **Site URL** 為：`http://localhost:5173`（開發環境）
4. 設定 **Redirect URLs** 為：`http://localhost:5173/**`

### Q: Google OAuth 顯示「redirect_uri_mismatch」

**原因**：Google Cloud Console 中的授權重新導向 URI 設定錯誤

**解決方式**：
1. 確認 Google Cloud Console 的授權重新導向 URI 為：
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
2. 確認沒有多餘的空格或字元
3. 儲存後等待幾分鐘讓 Google 更新設定

### Q: GitHub OAuth 顯示「The redirect_uri MUST match」

**原因**：GitHub OAuth App 的 Authorization callback URL 設定錯誤

**解決方式**：
1. 前往 GitHub Settings → Developer settings → OAuth Apps
2. 編輯您的應用程式
3. 確認 Authorization callback URL 為：
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```

### Q: 登入後無法存取資料

**原因**：RLS Policies 未正確設定

**解決方式**：
1. 確認已執行 `002_add_auth.sql` migration
2. 確認 RLS Policies 已啟用且正確設定
3. 檢查 Supabase Dashboard → Authentication → Policies

---

## 🌐 生產環境設定

部署到生產環境時，需要更新以下設定：

### 1. Google OAuth

前往 Google Cloud Console，在授權重新導向 URI 加入生產網域：
```
https://your-domain.com
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

### 2. GitHub OAuth

前往 GitHub OAuth App，更新：
- **Homepage URL**：`https://your-domain.com`
- **Authorization callback URL** 保持不變

### 3. Supabase

前往 Supabase Dashboard → **Authentication** → **URL Configuration**：
- **Site URL**：`https://your-domain.com`
- **Redirect URLs**：`https://your-domain.com/**`

---

## 📚 相關資源

- [Supabase Auth 文件](https://supabase.com/docs/guides/auth)
- [Google OAuth 文件](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth 文件](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

**設定完成後，您的 Token Dashboard 將支援完整的第三方 OAuth 登入！** 🎉
