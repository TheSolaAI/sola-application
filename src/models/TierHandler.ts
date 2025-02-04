/**
 * Zustand store to manage user tier and credits.
 * 
 * State:
 * - `tier`: User's subscription tier (number or null).
 * - `credits`: Available credits (number or null).
 * 
 * Functions:
 * - `setTierAndCredits(tier, credits)`: Updates both tier and credits.
 * - `updateCredits(credits)`: Updates only the credits.
 * - `deductAndSendCredits(usedCredits)`: Deducts credits and sends the update to the server.
 */

import { create } from "zustand";

interface TierHandler {
  tier: number | null;
  credits: number | null;
  setTierAndCredits: (tier: number, credits: number) => void;
  updateCredits: (credits: number) => void;
  deductAndSendCredits: (usedCredits: number) => void;
}

export const useTierStore = create<TierHandler>((set) => {
  const sendUsedCredits = (usedCredits: number) => {
    // TODO: Make a POST request to the server
    console.log(`Sending used credits: ${usedCredits}`);
  };

  return {
    tier: null,
    credits: null,

    setTierAndCredits: (tier, credits) =>
      set({ tier, credits }),

    updateCredits: (credits) =>
      set({ credits }),

    deductAndSendCredits: (usedCredits) => {
      set((state) => {
        const newCredits = (state.credits ?? 0) - usedCredits;
        if (newCredits < 0) return state; 
        sendUsedCredits(usedCredits);
        return { credits: newCredits };
      });
    },
  };
});
