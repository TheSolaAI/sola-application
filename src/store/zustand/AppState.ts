import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { create, StateCreator } from 'zustand';

interface AppState {
  authorized: boolean;
  appWallet: ConnectedSolanaWallet | null;
  appWallets: ConnectedSolanaWallet[];
  embeddedWalletVisiblity: boolean;
  disclaimer: boolean;
  setAuthorized: (auth: boolean) => void;
  setWallet: (wallet: ConnectedSolanaWallet) => void;
  setEmbeddedWalletVisiblity: (embeddedWalletVisiblity: boolean) => void;
  setDesclaimer: (disclaimer: boolean) => void;
}

const appStateCreator: StateCreator<AppState> = (set) => ({
  authorized: false,
  appWallet: null,
  appWallets: [],
  embeddedWalletVisiblity: false,
  disclaimer: true,
  setAuthorized: (authorized: boolean) => set({ authorized }),
  setWallet: (appWallet: ConnectedSolanaWallet) => set({ appWallet }),
  setEmbeddedWalletVisiblity: (embeddedWalletVisiblity: boolean) => set({embeddedWalletVisiblity}),
  setDesclaimer: (disclaimer: boolean) => set({ disclaimer }),
});

export const useAppState = create<AppState>(appStateCreator);

export default useAppState;
