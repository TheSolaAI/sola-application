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
  title: string;
  status: 'pending' | 'success' | 'failed';
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
};

export type TrendingNFTCard = {
  name: string;
  floor_price: number;
  listed_count: number;
  volume_all: number;
  image: string;
  volume_24hr: number;
};

export interface TokenExtensions {
  coingeckoId: string;
  website: string;
  telegram: string | null;
  twitter: string;
  description: string;
  discord: string;
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
