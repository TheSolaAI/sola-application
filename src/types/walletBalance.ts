export type Asset = {
  imageLink: string;
  symbol: string;
  balance: number;
  decimals: number;
  pricePerToken?: number;
  totalPrice?: number;
}