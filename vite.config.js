import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.OPEN_AI_API_KEY': JSON.stringify(env.OPEN_AI_API_KEY),
      'process.env.PRVI_APP_ID': JSON.stringify(env.PRVI_APP_ID),
      'process.env.HELIUS_API_KEY': JSON.stringify(env.HELIUS_API_KEY),
      'process.env.SOLANA_RPC': JSON.stringify(env.SOLANA_RPC),
    },
    plugins: [react(), nodePolyfills()],
  };
});
