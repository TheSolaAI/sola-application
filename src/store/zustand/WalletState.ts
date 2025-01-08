import {create} from 'zustand';
import { Asset } from '../../types/walletBalance';

interface WalletState {
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  getAssetById: (id: string) => Asset | undefined;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  assets: [],
  setAssets: (assets) => set({ assets }),
  getAssetById: (id) => get().assets.find((asset) => asset.id === id),
}));