interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID: string;
  readonly VITE_OPENAI_API_URL: string;
  readonly VITE_HELIUS_API_KEY: string;
  readonly VITE_SOLANA_RPC: string;
  readonly VITE_ATA_PRIV_KEY: string;
  readonly VITE_WALLET_SERVICE_URL: string;
  readonly VITE_DATA_SERVICE_URL: string;
  readonly VITE_AUTH_SERVICE_URL: string;
  readonly VITE_SENTRY_AUTH_TOKEN: string;
  readonly VITE_ENVIRONMENT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
