export type MessageCard = {
  type: 'message' | 'card' | 'cards' | 'agent';
  message?: string;
  card?: SingleCard | MultipleCards;
  link?: string;
};

export type SingleCard = {
  title: string;
  status: string;
  date: string;
};

export type MultipleCards = {
  metric: string;
  value: string;
}[];
