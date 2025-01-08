export type Asset = {
  imageLink: string;
  id: string;
  symbol: string;
  balance: number;
  decimals: number;
  pricePerToken?: number;
  totalPrice?: number;
}