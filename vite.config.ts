import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Allow external connections
    allowedHosts: ['.ngrok-free.app'], // Allow all ngrok-free.app subdomains
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    }
  }
})
