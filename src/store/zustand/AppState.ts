import { ConnectedSolanaWallet } from '@privy-io/react-auth';
import { create, StateCreator } from 'zustand';

interface AppState {
  authorized: boolean;
  appWallet: ConnectedSolanaWallet | null;
  appWallets: ConnectedSolanaWallet[];
  embeddedWalletVisibility: boolean;
  accessToken: string | null;
  aiVoice: string;
  aiEmotion: string;
  disclaimer: boolean;
  setAuthorized: (auth: boolean) => void;
  setWallet: (wallet: ConnectedSolanaWallet) => void;
  setEmbeddedWalletVisibility: (visibility: boolean) => void;
  setAccessToken: (accessToken: string | null) => void;
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
  aiVoice: 'ash',
  aiEmotion: 'Chearfull and Energetic',
  disclaimer: true,
  setAuthorized: (authorized: boolean) => set({ authorized }),
  setWallet: (appWallet: ConnectedSolanaWallet) => set({ appWallet }),
  setEmbeddedWalletVisibility: (visibility: boolean) =>
    set({ embeddedWalletVisibility: visibility }),
  setAccessToken: (accessToken: string | null) => set({ accessToken }),
  setAiVoice: (aiVoice: string) => set({ aiVoice }),
  setAiEmotion: (aiEmotion: string) => set({ aiEmotion }),
  setDisclaimer: (disclaimer: boolean) => set({ disclaimer }),
});

export const useAppState = create<AppState>(appStateCreator);

export default useAppState;
