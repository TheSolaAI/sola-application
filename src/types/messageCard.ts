import { TokenBalance } from "./lulo";

export type MessageCard = {
  type:
    | 'message'
    | 'card'
    | 'cards'
    | 'nftcards'
    | 'agent'
    | 'tokenCards'
    | 'transaction'
    | 'transactions'
    | 'luloCard';
  message?: string;
  card?: SingleCard | MultipleCards | NFTCard[] | TokenCard[] | LuloCard | TransactionCard;
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
    totalValue: number
}

export type NFTCard = {
  title: string;
  description: string;
  image: string;
  price: string;
  size: string;
  date: string;
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


