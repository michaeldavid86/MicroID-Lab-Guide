import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'MicroID Lab Guide',
        short_name: 'MicroID',
        description: 'USAFA Bio 431 — Unknown Bacterial Identification Tool',
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#003087',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Precache the app shell AND the reference images so the whole app
        // works offline after the first load (matches the "offline-capable" claim).
        globPatterns: ['**/*.{js,css,html,ico,svg,png,jpg,jpeg,webmanifest}'],
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
    }),
  ],
});
