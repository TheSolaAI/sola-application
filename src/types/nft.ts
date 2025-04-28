export type NFTCollection = {
  symbol: string;
  image: string;
  floor_price: number;
  avg_price_24hr: number;
  listed_count: number;
  volume_all: number;
};

export type TrendingNFT = {
  name: string;
  floor_price: number;
  listed_count: number;
  volume_all: number;
  image: string;
  volume_24hr: number;
};
