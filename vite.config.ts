import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        workbox: {
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
        },
        manifest: {
          name: 'Rk Tournament',
          short_name: 'Rk Tournament',
          description: 'The Ultimate Free Fire Tournament Platform.',
          theme_color: '#f97316',
          background_color: '#050505',
          display: 'standalone',
          orientation: 'portrait',
          icons: [
            {
              src: 'https://image2url.com/r2/default/images/1775320935204-a92f1b2a-bae3-48a4-96e3-efe7eae485fa.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://image2url.com/r2/default/images/1775320935204-a92f1b2a-bae3-48a4-96e3-efe7eae485fa.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'https://image2url.com/r2/default/images/1775320935204-a92f1b2a-bae3-48a4-96e3-efe7eae485fa.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
