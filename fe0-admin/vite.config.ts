import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Production (behind www.ump-khcn.com/admin): set VITE_BASE_PATH=/admin/
  // Local Vite dev stays at http://localhost:5174/
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
