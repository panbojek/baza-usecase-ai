import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { include: ['react-force-graph-2d'] },
  server: { host: '127.0.0.1', port: 5173, open: true },
})
