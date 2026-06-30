import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves project sites from /<repo-name>/, not from the domain
// root, so every absolute URL (base, manifest, icons, shortcuts) needs that
// prefix when building for Pages. Local dev and other hosts keep using '/'.
const base = process.env.GITHUB_PAGES === 'true' ? '/NightAgent/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: false,
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2}'],
      },
      includeAssets: ['icons/*.png'],
      manifest: {
        id: base,
        name: 'NightNudge',
        short_name: 'NightNudge',
        description:
          'Dein ruhiger Begleiter für eine bessere Schlafenszeit – Erinnerungen, Streaks und wissenschaftliche Fakten.',
        lang: 'de',
        dir: 'ltr',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0A1F0F',
        theme_color: '#0A1F0F',
        categories: ['health', 'lifestyle', 'productivity'],
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: `${base}icons/icon-192-maskable.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: `${base}icons/icon-512-maskable.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Ich gehe jetzt schlafen',
            short_name: 'Bestätigen',
            description: 'Bestätigt direkt, dass du jetzt schlafen gehst',
            url: `${base}?action=confirm`,
            icons: [{ src: `${base}icons/icon-192.png`, sizes: '192x192' }],
          },
          {
            name: 'Widget-Vorschau',
            short_name: 'Widget',
            description: 'Zeigt die kompakte Countdown-Ansicht',
            url: `${base}widget`,
            icons: [{ src: `${base}icons/icon-192.png`, sizes: '192x192' }],
          },
        ],
      },
    }),
  ],
})
