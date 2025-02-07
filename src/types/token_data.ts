export type TokenData = {
  image: string;
  metadata: {
    name: string;
    symbol: string;
    address:string;
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
