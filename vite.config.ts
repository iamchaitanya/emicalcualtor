
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: cast process to any to access cwd() if global Process type definitions are missing or incomplete
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.GA_TRACKING_ID': JSON.stringify(env.GA_TRACKING_ID || '')
    },
    build: {
      outDir: 'dist',
    }
  }
})
