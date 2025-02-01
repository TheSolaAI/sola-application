import { create, StateCreator } from 'zustand';

interface AppState {
  embeddedWalletVisibility: boolean;
  accessToken: string | null;
  aiVoice: string;
  aiEmotion: string;
  disclaimer: boolean;
  tier: number;
  setEmbeddedWalletVisibility: (visibility: boolean) => void;
  setAccessToken: (accessToken: string | null) => void;
  setAiVoice: (aiVoice: string) => void;
  setAiEmotion: (aiEmotion: string) => void;
  setDisclaimer: (disclaimer: boolean) => void;
  setTier: (tier: number) => void;
}

const appStateCreator: StateCreator<AppState> = (set) => ({
  tier: 0,
  embeddedWalletVisibility: false,
  accessToken: null,
  aiVoice: 'ash',
  aiEmotion: 'Chearfull and Energetic',
  disclaimer: true,
  setEmbeddedWalletVisibility: (visibility: boolean) =>
    set({ embeddedWalletVisibility: visibility }),
  setAccessToken: (accessToken: string | null) => set({ accessToken }),
  setAiVoice: (aiVoice: string) => set({ aiVoice }),
  setAiEmotion: (aiEmotion: string) => set({ aiEmotion }),
  setDisclaimer: (disclaimer: boolean) => set({ disclaimer }),
  setTier: (tier: number) => set({ tier }),
});

export const useAppState = create<AppState>(appStateCreator);

export default useAppState;
