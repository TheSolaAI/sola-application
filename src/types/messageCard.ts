export type MessageCard = {
  type:
    | 'message'
    | 'card'
    | 'cards'
    | 'nftcards'
    | 'agent'
    | 'tokenCards'
    | 'transaction';
  message?: string;
  card?: SingleCard | MultipleCards | NFTCard[] | TokenCard[] | TransactionCard;
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
  name: string;
  image?: string;
  change: number;
  marketCap?: string;
  holdersCount?: number;
  listedAt?: string;
}
