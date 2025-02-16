import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import viteCompression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    define: {
      __APP_VERSION__: JSON.stringify(require('./package.json').version),
    },
    build: {
      sourcemap: true,
      minify: 'esbuild',
    },
    plugins: [
      react(),
      VitePWA({
        manifest: {
          name: 'SolaAI',
          short_name: 'SolaAI',
          description: 'Sola Voice Assistant',
          theme_color: '#000000',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        registerType: 'autoUpdate',
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 50000000,
          runtimeCaching: [],
        },
        devOptions: {
          enabled: true,
        },
      }),
      nodePolyfills(),
      viteCompression({
        algorithm: 'brotliCompress',
      }),
      viteCompression({
        algorithm: 'gzip',
      }),
      // visualizer({
      //   open: true, // Open visual report in the browser
      // }),
      sentryVitePlugin({
        authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
        org: 'solaai',
        project: 'sola-application-frontend',
      }),
    ],
    server: {
      proxy: {
        '/api': {
          target: 'https://api-mainnet.magiceden.dev',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/apq': {
          target: 'https://api-mainnet.magiceden.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/apq/, ''),
        },
      },
    },
  };
});
