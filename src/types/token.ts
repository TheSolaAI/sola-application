export type TokenGate = {
  status: string;
  data: TokenAmount;
  message: string;
};

interface TokenAmount {
  amount: number;
  tier: number;
}

export interface TokenAddressResult {
  type: 'token_address_result';
  symbol: string;
  tokenAddress: string;
  success: boolean;
  source?: string;
  errorMessage?: string;
}

export interface TopHolder {
  amount: number;
  insider: boolean;
  owner: string;
}
export interface TokenDataResponse {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  marketCap: number;
  fdv: number;
  extensions: TokenExtensions;
  logoURI: string;
  liquidity: number;
  price: number;
  priceChange30mPercent: number;
  priceChange1hPercent: number;
  priceChange4hPercent: number;
  priceChange24hPercent: number;
  uniqueWallet30m: number;
  uniqueWallet1h: number;
  uniqueWallet4h: number;
  uniqueWallet24h: number;
  holder: number;
  sell30m: number;
  buy30m: number;
  vBuy30mUSD: number;
  vSell30mUSD: number;
  sell1h: number;
  buy1h: number;
  vBuy1hUSD: number;
  vSell1hUSD: number;
  sell4h: number;
  buy4h: number;
  vBuy4hUSD: number;
  vSell4hUSD: number;
  sell24h: number;
  buy24h: number;
  vBuy24hUSD: number;
  vSell24hUSD: number;
}
export interface TokenExtensions {
  coingeckoId: string;
  website: string;
  telegram: string | null;
  twitter: string;
  description: string;
  discord: string;
}

export interface TokenSwapData {
  transactionHash: string;
  details: {
    input_mint: string;
    output_mint: string;
    amount: number;
    outAmount: number;
    priorityFee: number;
    versionedTransaction: string;
    inputParams: {
      inputMint: string;
      outputMint: string;
      amount: number;
      swap_mode: string;
      public_key: string;
      priority_fee_needed: boolean;
    };
    tickers: {
      inputTokenTicker: string;
      outputTokenTicker: string;
    };
  };
}
