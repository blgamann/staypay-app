import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
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
