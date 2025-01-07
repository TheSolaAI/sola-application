import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.PRVI_APP_ID': JSON.stringify(env.PRVI_APP_ID),
      'process.env.HELIUS_API_KEY': JSON.stringify(env.HELIUS_API_KEY),
      'process.env.SOLANA_RPC': JSON.stringify(env.SOLANA_RPC),
      'process.env.WALLET_SERVICE_URL': JSON.stringify(env.WALLET_SERVICE_URL),
    },
    build: {
      sourcemap: true,
    },
    plugins: [
      react(),
      nodePolyfills(),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
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
      },
    },
  };
});
