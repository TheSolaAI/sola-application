import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import {create, StateCreator } from 'zustand';

interface AppState {
  appWallet: ConnectedSolanaWallet | null;
  appWallets: ConnectedSolanaWallet[];
  setWallet: (wallet: ConnectedSolanaWallet) => void;
}

const appStateCreator: StateCreator<AppState> = (set) => ({
  appWallet: null,
  appWallets: [],
  setWallet: (appWallet: ConnectedSolanaWallet) => set({ appWallet }),
});

export const useAppState = create<AppState>(appStateCreator);

export default useAppState;
