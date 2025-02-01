import { create } from 'zustand';
import { Asset } from '../types/walletBalance.ts';

interface WalletHandler {
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;

  getAssetById: (id: string) => Asset | undefined;
}

export const useWalletHandler = create<WalletHandler>((set, get) => ({
  assets: [],
  setAssets: (assets) => set({ assets }),
  getAssetById: (id) => get().assets.find((asset) => asset.id === id),
}));
