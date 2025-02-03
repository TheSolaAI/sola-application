import { TokenBalance } from './lulo';
import { ShowLimitOrder } from './jupiter';

export type MessageCard = {
  type:
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
    | 'marketDataCard'
    | 'trendingNFTCard'
    | 'bubblemapCard'
    | 'blinkCard'
    | 'limitOrder';
  message?: string;
  card?:
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
    | MarketDataCard
    | TrendingNFTCard[]
    | BubblemapCard
    | ShowLimitOrderCard;
  link?: string;
};

export interface AiTranscription {
  id: string;
}

export interface TransactionCard {
  title: string;
  status: string;
  link: string;
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
  date: string;
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
  title: string;
  image: string;
  price: string;
  listed: string;
};

export interface TokenCard {
  address: string;
  image?: string;
  metadata?: {
    description: string;
    name: string;
    symbol: string;
    token_standard: string;
  };
  price?: string;
  marketCap?: string;
  volume?: string;
  priceChange?: string;
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
  issues: Risk[];
}

export interface TopHolder {
  amount: number;
  insider: boolean;
  owner: string;
}

export interface BubblemapCard {
  token: string;
}

export interface Risk {
  name: string;
  value: string;
  description: string;
  score: number;
  level: 'none' | 'warn' | 'danger';
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
