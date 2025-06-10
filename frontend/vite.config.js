import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // Allows external access
    allowedHosts: ['10c7-102-91-105-76.ngrok-free.app'], // Add your ngrok URL here
    proxy: {
      '/api/coingecko': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coingecko/, ''),
        headers: {
          'Accept': 'application/json'
        }
      }
    }
  }
})
