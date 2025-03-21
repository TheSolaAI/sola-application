export type TokenData = {
  image: string;
  metadata: {
    name: string;
    symbol: string;
    address: string;
  };
  price: number;
  marketcap: number;
  volume: number;
  price_change_24: number;
};

export type LSTData = {
  logo_uri: string;
  symbol: string;
  url: string;
  apy: number;
  address: string;
};

export type RugCheck = {
  score: number;
  message: string;
};
