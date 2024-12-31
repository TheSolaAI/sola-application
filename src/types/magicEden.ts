export type Collection = {
  symbol: string;
  name: string;
  description: string;
  featured: boolean;
  image: string;
  price: number;
  size: number;
  launchDatetime: string;
  chainId?: string;
  contractAddress?: string;
};
