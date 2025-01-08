import {create} from 'zustand';
import { Asset } from '../../types/walletBalance';

interface WalletState {
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  assets: [],
  setAssets: (assets) => set({ assets }),
}));