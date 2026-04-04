import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Обязательно для Docker
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:8000', // Имя сервиса из docker-compose
        changeOrigin: true
      }
    }
  }
})