import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 提高 chunk size 警告閾值
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 手動分割 chunks
        manualChunks: {
          // React 相關
          'react-vendor': ['react', 'react-dom'],
          // Ant Design 相關
          'antd-vendor': ['antd', '@ant-design/icons', '@ant-design/charts'],
          // 圖表庫
          'charts-vendor': ['dayjs'],
          // 狀態管理與查詢
          'state-vendor': ['zustand', '@tanstack/react-query'],
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
  },
});
