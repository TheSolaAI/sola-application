'use client';
import { create } from 'zustand';
import { Tool } from '@/types/tool';
import { apiClient } from '@/lib/ApiClient';
import { API_URLS } from '@/config/api_urls';

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
    tool?: Tool
  ) => void;
}

export const useCreditHandler = create<CreditHandler>((set, get) => ({
  credits: 0,

  setCurrentCredits: (credits: number) => set({ credits }),

  calculateCreditUsage: async (
    textInputTokens: number,
    audioInputTokens: number,
    cachedTokens: number,
    outputTextTokens: number,
    outputAudioTokens: number,
    tool?: Tool
  ) => {
    const currentCredits = get().credits;
    let chargedCredits = 0;

    if (!tool) {
      chargedCredits -=
        textInputTokens * 0.000001 +
        audioInputTokens * 0.00002 +
        cachedTokens * 0.0000003 +
        outputTextTokens * 0.000004 +
        outputAudioTokens * 0.00004;
    } else if (tool.cost) {
      chargedCredits -= tool.cost;
    }

    const newCredits = currentCredits - chargedCredits;

    // Update the credits in Zustand state
    set({ credits: newCredits });

    apiClient.post(
      API_URLS.AUTH.SETTINGS.UPDATE_CREDITS,
      { credits: chargedCredits },
      'auth'
    );

    // If the user runs out of credits, mute the session
    // if (newCredits <= 0) {
    //   useSessionHandler.getState().setMuted(true);
    // }
  },
}));
