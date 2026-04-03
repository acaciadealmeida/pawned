import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Loaded from .env / .env.production / Vercel env — public site origin for Open Graph image URLs (absolute URLs work best in chat apps).
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/$/, '')

  return {
    plugins: [
      react(),
      {
        name: 'html-replace-site-url',
        transformIndexHtml(html) {
          // Placeholder avoids Vite's %ENV% scanner warnings. Empty siteUrl → "/og-image.png" for relative previews.
          return html.replace(/___SITE_URL___/g, siteUrl)
        },
      },
    ],
  }
})
