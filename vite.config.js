import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    // Improves Core Web Vitals by splitting large chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          motion: ['framer-motion'],
        }
      }
    }
  }
})