import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { create, StateCreator } from 'zustand';
import { ThemeType } from '../../types/app';

interface AppState {
  appWallet: ConnectedSolanaWallet | null;
  appWallets: ConnectedSolanaWallet[];
  embeddedWalletVisibility: boolean;
  accessToken: string | null;
  theme: ThemeType;
  aiVoice: string;
  aiEmotion: string;
  disclaimer: boolean;
  tier:number,
  setWallet: (wallet: ConnectedSolanaWallet) => void;
  setEmbeddedWalletVisibility: (visibility: boolean) => void;
  setAccessToken: (accessToken: string | null) => void;
  setTheme: (theme: ThemeType) => void;
  setAiVoice: (aiVoice: string) => void;
  setAiEmotion: (aiEmotion: string) => void;
  setDisclaimer: (disclaimer: boolean) => void;
  setTier: (tier: number) => void;
}

const appStateCreator: StateCreator<AppState> = (set) => ({
  tier:0,
  appWallet: null,
  appWallets: [],
  embeddedWalletVisibility: false,
  accessToken: null,
  theme: (localStorage.getItem('theme') as ThemeType) || 'light',
  aiVoice: 'ash',
  aiEmotion: 'Chearfull and Energetic',
  disclaimer: true,
  setWallet: (appWallet: ConnectedSolanaWallet) => set({ appWallet }),
  setEmbeddedWalletVisibility: (visibility: boolean) =>
    set({ embeddedWalletVisibility: visibility }),
  setAccessToken: (accessToken: string | null) => set({ accessToken }),
  setTheme: (theme: ThemeType) =>
    set((state) => {
      const resolveTheme = (selectedTheme: ThemeType): ThemeType => {
        if (selectedTheme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        }
        return selectedTheme;
      };

      const resolvedTheme = resolveTheme(theme);
      localStorage.setItem('theme', theme);
      document.documentElement.classList.remove(state.theme);
      document.documentElement.classList.add(resolvedTheme);

      return { theme: resolvedTheme };
    }),
  setAiVoice: (aiVoice: string) => set({ aiVoice }),
  setAiEmotion: (aiEmotion: string) => set({ aiEmotion }),
  setDisclaimer: (disclaimer: boolean) => set({ disclaimer }),
  setTier: (tier: number) => set({ tier }),
});

export const useAppState = create<AppState>(appStateCreator);

export default useAppState;
