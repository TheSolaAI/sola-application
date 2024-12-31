export type MessageCard = {
  type: 'message' | 'card' | 'cards' | 'nftcards' | 'agent';
  message?: string;
  card?: SingleCard | MultipleCards | NFTCards;
  link?: string;
};

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
  descirption: string;
  image: string;
  price: string;
  size: string;
  date: string;
};

export type NFTCards = {
  title: string;
  descirption: string;
  image: string;
  price: string;
  size: string;
  date: string;
}[];
