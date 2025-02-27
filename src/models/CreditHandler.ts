import { create } from 'zustand';
import { Tool } from '../types/tool.ts';
import { useSettingsHandler } from './SettingsHandler.ts';
import { useSessionHandler } from './SessionHandler.ts';

interface CreditHandler {
  /**
   * The current credit count of the user
   */
  credits: number;

  setCurrentCredits: (credits: number) => void;

  calculateCreditUsage: (
    textInputTokens: number,
    audioInputTokens: number,
    cachedTokens: number,
    outputTextTokens: number,
    outputAudioTokens: number,
    tool?: Tool,
  ) => void;
}

export const useCreditHandler = create<CreditHandler>((set, get) => ({
  credits: 0,

  setCurrentCredits: (credits: number) => set({ credits }),

  calculateCreditUsage: (
    textInputTokens: number,
    audioInputTokens: number,
    cachedTokens: number,
    outputTextTokens: number,
    outputAudioTokens: number,
    tool?: Tool,
  ) => {
    let newCredits = get().credits;

    if (!tool) {
      newCredits -=
        textInputTokens * 0.000001 +
        audioInputTokens * 0.00002 +
        cachedTokens * 0.0000003 +
        outputTextTokens * 0.000004 +
        outputAudioTokens * 0.00004;
    } else if (tool.cost) {
      newCredits -= tool.cost;
    }

    // Update the credits in Zustand state
    set({ credits: newCredits });

    // Update credits in the settings handler
    useSettingsHandler.getState().updateCredits();

    // If the user runs out of credits, mute the session
    // if (newCredits <= 0) {
    //   useSessionHandler.getState().setMuted(true);
    // }
  },
}));
