import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Points at the local backend by default. For a deployed backend,
      // set VITE_API_URL in a .env file instead (see client/src/services/api.js).
      '/api': { target: 'https://store-os-backend.onrender.com', changeOrigin: true },
      '/uploads': { target: 'https://store-os-backend.onrender.com', changeOrigin: true }
    }
  }
})
