export interface TokenAsset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  pricePerToken: number;
  totalPrice: number;
  imageLink: string;
}

export interface NFTAsset {
  mint: string;
  metadata: string;
}

export interface WalletAssets {
  totalBalance: number | null;
  tokens: TokenAsset[];
  nfts: NFTAsset[];
}
