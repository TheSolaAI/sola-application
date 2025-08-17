export const API_URLS = {
  AUTH: {
    SETTINGS: {
      GET: 'auth/settings/',
      UPDATE: 'auth/settings/update/',
      UPDATE_CREDITS: 'auth/settings/charge_credits/',
    },
    WALLET: 'auth/wallet/',
  },
  CHAT_ROOMS: 'chatrooms/',
  SESSION: 'data/session/create',
  DATA: {
    NFT: {
      SYMBOL: 'data/nft/symbol',
      TOP_NFT: 'data/nft/top_nft',
    },
  },
  WALLET: {
    LIMIT_ORDER: {
      CREATE: 'api/wallet/jup/limit-order/create',
      SHOW: 'api/wallet/jup/limit-order/show',
    },
    BLOCKHASH: 'api/wallet/blockhash',
    LULO: {
      ASSETS: 'api/wallet/lulo/assets',
      DEPOSIT: 'api/wallet/lulo/deposit',
      WITHDRAW: 'api/wallet/lulo/withdraw',
    },
    JUPITER: {
      SWAP: 'api/wallet/jup/swap',
    },
  },
};

export const GOAT_INDEX_API_URL = 'https://loadbalance.goatindex.ai/';
