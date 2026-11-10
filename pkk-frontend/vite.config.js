import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    host: true,
    port: 80,
    proxy: {
      '/api': 'https://pkk-marketplace.up.railway.app',
      '/storage': 'https://pkk-marketplace.up.railway.app',
    },
  },
})
