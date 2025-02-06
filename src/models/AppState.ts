import { create, StateCreator } from 'zustand';

interface AppState {
  embeddedWalletVisibility: boolean;
  aiVoice: string;
  aiEmotion: string;
  disclaimer: boolean;
  tier: number;
  setEmbeddedWalletVisibility: (visibility: boolean) => void;
  setAiVoice: (aiVoice: string) => void;
  setAiEmotion: (aiEmotion: string) => void;
  setDisclaimer: (disclaimer: boolean) => void;
  setTier: (tier: number) => void;
}

const appStateCreator: StateCreator<AppState> = (set) => ({
  tier: 0,
  embeddedWalletVisibility: false,
  aiVoice: 'ash',
  aiEmotion: 'Chearfull and Energetic',
  disclaimer: true,
  setEmbeddedWalletVisibility: (visibility: boolean) =>
    set({ embeddedWalletVisibility: visibility }),
  setAiVoice: (aiVoice: string) => set({ aiVoice }),
  setAiEmotion: (aiEmotion: string) => set({ aiEmotion }),
  setDisclaimer: (disclaimer: boolean) => set({ disclaimer }),
  setTier: (tier: number) => set({ tier }),
});

export const useAppState = create<AppState>(appStateCreator);

export default useAppState;
