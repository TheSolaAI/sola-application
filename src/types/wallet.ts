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
  id: string;
  files: NFTFile[];
  name: string;
  symbol: string;
  description: string;
  attributes: [{ value: string; trait_type: string }];
}

export interface NFTFile {
  uri: string;
  type: 'image' | 'video' | 'audio' | 'model' | 'document';
}

export interface WalletAssets {
  totalBalance: number | null;
  tokens: TokenAsset[];
  nfts: NFTAsset[];
}
