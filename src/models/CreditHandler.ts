import { create } from 'zustand';
import { Tool } from '../types/tool.ts';
import { useSettingsHandler } from './SettingsHandler.ts';

interface CreditHandler {
  /**
   * The current credit count of the user
   */
  credits: number;

  setCurrentCredits: (credits: number) => void;

  calculateCreditUsage: (
    inputTokens: number,
    outputTokens: number,
    tool?: Tool,
  ) => void;
}

export const useCreditHandler = create<CreditHandler>((set, get) => {
  return {
    credits: 0,

    setCurrentCredits: (credits: number) => {
      return { credits: credits };
    },

    calculateCreditUsage: (
      inputTokens: number,
      outputTokens: number,
      tool?: Tool,
    ) => {
      let newCredits = get().credits - (inputTokens + outputTokens);
      if (tool?.cost) {
        newCredits -= tool.cost;
      }
      // update the credits on our database
      set({ credits: newCredits });
      useSettingsHandler().updateCredits();
      if (newCredits < 0) {
        // TODO: Tell the user that they have insufficient credits for the next action
      }
    },
  };
});
