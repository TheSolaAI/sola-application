import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { create, StateCreator } from 'zustand';

interface AppState {
  authorized: boolean;
  appWallet: ConnectedSolanaWallet | null;
  appWallets: ConnectedSolanaWallet[];
  embeddedWalletVisiblity: boolean;
  theme: 'light' | 'dark';
  disclaimer: boolean;
  setAuthorized: (auth: boolean) => void;
  setWallet: (wallet: ConnectedSolanaWallet) => void;
  setEmbeddedWalletVisiblity: (embeddedWalletVisiblity: boolean) => void;
  toggleTheme: () => void;
  setDesclaimer: (disclaimer: boolean) => void;
}

const appStateCreator: StateCreator<AppState> = (set) => ({
  authorized: false,
  appWallet: null,
  appWallets: [],
  embeddedWalletVisiblity: false,
  theme: localStorage.getItem('theme') as 'light' | 'dark' || 'dark', 
  disclaimer: true,
  setAuthorized: (authorized: boolean) => set({ authorized }),
  setWallet: (appWallet: ConnectedSolanaWallet) => set({ appWallet }),
  setEmbeddedWalletVisiblity: (embeddedWalletVisiblity: boolean) =>
    set({ embeddedWalletVisiblity }),
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.remove(state.theme); 
      document.documentElement.classList.add(newTheme); 
      return { theme: newTheme };
    }),
  setDesclaimer: (disclaimer: boolean) => set({ disclaimer }),
});

export const useAppState = create<AppState>(appStateCreator);

export default useAppState;
