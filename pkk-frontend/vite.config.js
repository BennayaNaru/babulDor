import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Arahkan ke Laravel lokal. Pakai 127.0.0.1 agar tidak bermasalah dengan IPv6 di Windows.
const backend = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 80,
    strictPort: true,
    proxy: {
      '/api': { target: backend, changeOrigin: true },
      '/storage': { target: backend, changeOrigin: true },
    },
  },
})
