import { TokenBalance } from './lulo';
import { ShowLimitOrder } from './jupiter';

export type MessageCard = {
  type:
    | 'user'
    | 'message'
    | 'aiTranscription'
    | 'card'
    | 'cards'
    | 'nftcards'
    | 'agent'
    | 'tokenCard'
    | 'nftCollectionCard'
    | 'transaction'
    | 'transactions'
    | 'luloCard'
    | 'sanctumCard'
    | 'rugCheckCard'
    | 'topHoldersCard'
    | 'marketDataCard'
    | 'trendingNFTCard'
    | 'bubblemapCard'
    | 'blinkCard'
    | 'limitOrder';
  message?: string;
  card?:
    | UserAudio
    | AiTranscription
    | SingleCard
    | MultipleCards
    | NFTCard[]
    | TokenCard
    | NFTCollectionCard
    | LuloCard
    | TransactionCard
    | SanctumCard[]
    | RugCheckCard
    | TopHolder[]
    | MarketDataCard
    | TrendingNFTCard[]
    | BubblemapCard
    | ShowLimitOrderCard;
  link?: string;
};

export interface UserAudio {
  base64URL: string;
}

export interface AiTranscription {
  id: string;
}

export interface TransactionCard {
  // Basic information (existing fields)
  title: string;
  status: 'pending' | 'success' | 'failed';
  link: string;

  txid?: string;
  timestamp?: string;

  // Token information
  tokenSymbol?: string;
  tokenAddress?: string;
  amount?: number;

  // Transaction participants
  sender?: string;
  recipient?: string;

  // Additional metadata
  type?: 'transfer' | 'swap' | 'stake' | 'unstake' | 'other';
  errorMessage?: string;
  confirmations?: number;
}

export type SingleCard = {
  title: string;
  status?: string;
  date: string;
};

export type MultipleCards = {
  metric: string;
  value: string;
}[];

export type LuloCard = {
  depositValue: number;
  interestEarned: number;
  tokenBalance: TokenBalance[];
  totalValue: number;
};

export type NFTCard = {
  title: string;
  description: string;
  image: string;
  price: string;
  size: string;
};

export type TrendingNFTCard = {
  name: string;
  floor_price: number;
  listed_count: number;
  volume_all: number;
  image: string;
  volume_24hr: number;
};

export type NFTCollectionCard = {
  symbol: string;
  image: string;
  floor_price: number;
  avg_price_24hr: number;
  listed_count: number;
  volume_all: number;
};

export interface TokenExtensions {
  coingeckoId: string;
  website: string;
  telegram: string | null;
  twitter: string;
  description: string;
  discord: string;
}

export interface TokenCard {
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
  topHolders?: TopHolder[];
}

export interface SanctumCard {
  logo_uri: string;
  symbol: string;
  url: string;
  apy: number;
  address: string;
}

export interface RugCheckCard {
  score: number;
  message: string;
}

export interface TopHolder {
  amount: number;
  insider: boolean;
  owner: string;
}

export interface BubblemapCard {
  token: string;
}

export interface MarketDataCard {
  marketAnalysis: MarketInfo[];
  coinInfo: CoinInfo[];
}

export interface CoinInfo {
  symbol: string;
  price: number;
  change: number;
  sparkLine: string;
}

export interface MarketInfo {
  text: string;
  link: string;
}

export interface ShowLimitOrderCard {
  orders: ShowLimitOrder[];
}
