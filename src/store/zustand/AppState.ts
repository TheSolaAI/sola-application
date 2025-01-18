import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { create, StateCreator } from 'zustand';
import { ThemeType } from '../../types/app';

interface AppState {
  authorized: boolean;
  appWallet: ConnectedSolanaWallet | null;
  appWallets: ConnectedSolanaWallet[];
  embeddedWalletVisibility: boolean;
  accessToken: string | null;
  theme: ThemeType;
  aiVoice: string;
  aiEmotion: string;
  disclaimer: boolean;
  setAuthorized: (auth: boolean) => void;
  setWallet: (wallet: ConnectedSolanaWallet) => void;
  setEmbeddedWalletVisibility: (visibility: boolean) => void;
  setAccessToken: (accessToken: string) => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  setAiVoice: (aiVoice: string) => void;
  setAiEmotion: (aiEmotion: string) => void;
  setDisclaimer: (disclaimer: boolean) => void;
}

const appStateCreator: StateCreator<AppState> = (set) => ({
  authorized: false,
  appWallet: null,
  appWallets: [],
  embeddedWalletVisibility: false,
  accessToken: null,
  theme: (localStorage.getItem('theme') as ThemeType) || 'dark',
  aiVoice: 'ash',
  aiEmotion: 'Chearfull and Energetic',
  disclaimer: true,
  setAuthorized: (authorized: boolean) => set({ authorized }),
  setWallet: (appWallet: ConnectedSolanaWallet) => set({ appWallet }),
  setEmbeddedWalletVisibility: (visibility: boolean) =>
    set({ embeddedWalletVisibility: visibility }),
  setAccessToken: (accessToken: string) => set({ accessToken }),
  toggleTheme: () =>
    set((state) => {
      const newTheme: ThemeType = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.remove(state.theme);
      document.documentElement.classList.add(newTheme);
      return { theme: newTheme };
    }),
  setTheme: (theme: ThemeType) =>
    set((state) => {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.remove(state.theme);
      document.documentElement.classList.add(theme);
      return { theme };
    }),
  setAiVoice: (aiVoice: string) => set({ aiVoice }),
  setAiEmotion: (aiEmotion: string) => set({ aiEmotion }),
  setDisclaimer: (disclaimer: boolean) => set({ disclaimer }),
});

export const useAppState = create<AppState>(appStateCreator);

export default useAppState;
