import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import {create, StateCreator } from 'zustand';

interface AppState {
  appWallet: ConnectedSolanaWallet | null;
  appWallets: ConnectedSolanaWallet[];
  disclaimer: boolean;
  setWallet: (wallet: ConnectedSolanaWallet) => void;
  setDesclaimer: (disclaimer: boolean) => void;
}

const appStateCreator: StateCreator<AppState> = (set) => ({
  appWallet: null,
  appWallets: [],
  disclaimer: true,
  setWallet: (appWallet: ConnectedSolanaWallet) => set({ appWallet }),
  setDesclaimer: (disclaimer: boolean) => set({ disclaimer }),
});

export const useAppState = create<AppState>(appStateCreator);

export default useAppState;
