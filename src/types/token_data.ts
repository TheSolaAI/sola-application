export type TokenData = {
  image: string;
  metadata: {
    description: string;
    name: string;
    symbol: string;
    token_standard: string;
  };
  price: number;
  marketcap: number;
  volume: number;
  price_change_24: number;
};

export type TokenGate = {
  status: string;
  data: TokenAmount;
  message: string;
};

interface TokenAmount {
  amount: number;
  tier: number;
}
