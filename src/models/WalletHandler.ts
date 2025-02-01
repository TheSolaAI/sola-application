import { create } from 'zustand';
import { Asset } from '../types/walletBalance.ts';
import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { toast } from 'sonner';

interface WalletHandler {
  currentWallet: ConnectedSolanaWallet | null; // The current wallet that the user is using
  defaultWallet: ConnectedSolanaWallet | null; // The default wallet that the user has set
  wallets: ConnectedSolanaWallet[]; // All connected wallets

  setWallets: (wallets: ConnectedSolanaWallet[]) => void; // Updates available wallets
  setCurrentWallet: (wallet: ConnectedSolanaWallet | null) => void; // Updates current wallet
  setDefaultWallet: (wallet: ConnectedSolanaWallet | null) => void; // Updates default wallet

  initWalletManager: () => void; // Initializes the wallet manager
  assets: Asset[];
  setAssets: (assets: Asset[]) => void;
  getAssetById: (id: string) => Asset | undefined;
}

export const useWalletHandler = create<WalletHandler>((set, get) => ({
  currentWallet: null,
  defaultWallet: null,
  wallets: [],

  setWallets: (wallets) => set({ wallets }),
  setCurrentWallet: (wallet) => set({ currentWallet: wallet }),
  setDefaultWallet: (wallet) => {
    set({ defaultWallet: wallet });
    if (wallet) {
      localStorage.setItem('defaultWallet', wallet.address);
    }
  },

  /**
   * Initializes the wallet manager by loading the default wallet from localStorage
   */
  // TODO: Load this from the Server
  initWalletManager: () => {
    const defaultWalletAddress = localStorage.getItem('defaultWallet');
    if (defaultWalletAddress) {
      const wallet = get().wallets.find(
        (w) => w.address === defaultWalletAddress,
      );
      if (wallet) {
        set({ currentWallet: wallet });
      } else {
        toast.error(
          "Your Default Wallet doesn't exist anymore, please select a new one.",
        );
        set({ defaultWallet: null });
        set({ currentWallet: get().wallets[0] });
      }
    } else {
      if (get().wallets.length === 0) {
        return;
      }
      set({ currentWallet: get().wallets[0] });
      localStorage.setItem('defaultWallet', get().wallets[0].address);
    }
    console.log('Default Wallet Address', get().currentWallet?.address);
  },

  assets: [],
  setAssets: (assets) => set({ assets }),
  getAssetById: (id) => get().assets.find((asset) => asset.id === id),
}));
