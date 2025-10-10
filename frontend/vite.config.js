// vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_URL,  // ejemplo: http://localhost:3000
        changeOrigin: true
      }
    }
  }
})
