import { TokenBalance } from './lulo';

export type MessageCard = {
    type:
    | 'message'
    | 'card'
    | 'cards'
    | 'nftcards'
    | 'agent'
    | 'tokenCards'
    | 'nftCollectionCard'
    | 'transaction'
    | 'transactions'
    | 'luloCard'
    | 'sanctumCard'
    | 'trendingNFTCard';
  message?: string;
  card?:
    | SingleCard
    | MultipleCards
    | NFTCard[]
    | TokenCard[]
    | NFTCollectionCard
    | LuloCard
    | TransactionCard
    | SanctumCard[]
    | TrendingNFTCard[];
  link?: string;
};

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
  volume_24hr:number
};

export type NFTCollectionCard = {
  symbol: string;
  title: string;
  image: string;
  price: string;
  listed:string;
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
}

export interface SanctumCard {
  logo_uri: string;
  symbol: string;
  url: string;
  apy: number;
  address:string
}
