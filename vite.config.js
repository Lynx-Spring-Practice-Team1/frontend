import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/portfolio': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
      '/api': {
        target: process.env.API_TARGET ?? 'http://localhost:3001',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
    },
  },
})
