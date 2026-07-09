import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
  },

  build: {
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Core React runtime ──────────────────────────────────────────
          // Tiny, stable, loaded on every page — best cache candidate.
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'react-core'
          }

          // ── Routing ─────────────────────────────────────────────────────
          if (id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run/')) {
            return 'router'
          }

          // ── Stripe — only needed on payment/checkout pages ───────────────
          // Splitting this means every other page saves ~80 KiB.
          if (id.includes('@stripe/')) {
            return 'stripe'
          }

          // ── PayPal — same as Stripe, payment pages only ──────────────────
          if (id.includes('@paypal/')) {
            return 'paypal'
          }

          // ── Framer Motion — ~100 KiB, only on animated pages ────────────
          if (id.includes('framer-motion')) {
            return 'motion'
          }

          // ── TanStack Query ───────────────────────────────────────────────
          if (id.includes('@tanstack/')) {
            return 'query'
          }

          // ── Lucide icons ─────────────────────────────────────────────────
          if (id.includes('lucide-react')) {
            return 'icons'
          }

          // ── Moment.js — large (~67 KiB min+gz), isolate for caching ─────
          // Consider replacing with date-fns or dayjs in future to save ~60 KiB.
          if (id.includes('node_modules/moment')) {
            return 'dates'
          }

          // ── Carousel (react-slick + slick-carousel) ──────────────────────
          // Only used on pages with sliders — no need to load on Login/Orders.
          if (id.includes('react-slick') || id.includes('slick-carousel')) {
            return 'carousel'
          }

          // ── Axios ────────────────────────────────────────────────────────
          if (id.includes('node_modules/axios')) {
            return 'http'
          }

          // ── Everything else in node_modules → vendor ─────────────────────
          // Covers: react-helmet-async, payment-icons, tailwind-merge, etc.
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
        }
      }
    }
  }
})