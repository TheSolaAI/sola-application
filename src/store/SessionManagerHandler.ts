'use client';

import { create } from 'zustand';
import { useUserHandler } from '@/store/UserHandler';
import { extractUserPrivyId, verifyUserTier } from '@/lib/server/userSession';

/**
 * Interface for the Session Manager store.
 */
interface SessionManagerStore {
  /** Indicates whether the verification popup is visible */
  showVerifyHoldersPopup: boolean;

  /** Sets the visibility of the verification popup */
  setShowVerifyHoldersPopup: (show: boolean) => void;

  /**
   * Verifies the user's tier status.
   * It returns an object containing success, tier level, total balance, and an optional message.
   */
  verifyUserTierStatus: () => Promise<{
    success: boolean;
    tier: number;
    totalSolaBalance: number;
    message?: string;
  }>;
}

/**
 * Zustand store for managing session-related state and actions.
 * This includes handling UI state, local storage management for API keys,
 * and verifying session and user tier statuses via server functions.
 */
export const useSessionManagerHandler = create<SessionManagerStore>((set) => ({
  showVerifyHoldersPopup: false,

  setShowVerifyHoldersPopup: (show) => set({ showVerifyHoldersPopup: show }),

  verifyUserTierStatus: async () => {
    try {
      // Retrieve the authentication token from the user handler
      const authToken = useUserHandler.getState().authToken;
      if (!authToken) {
        return {
          success: false,
          tier: 0,
          totalSolaBalance: 0,
          message: 'unable to verify user',
        };
      }

      const privyId = await extractUserPrivyId(authToken, false);
      const tierInfo = await verifyUserTier(privyId, authToken);
      if (tierInfo.success) {
        return {
          success: true,
          tier: tierInfo.tier || 0,
          totalSolaBalance: tierInfo.totalSolaBalance || 0,
          message: 'Tier updated successfully',
        };
      } else {
        return {
          success: false,
          tier: 0,
          totalSolaBalance: 0,
          message: 'Failed to verify tier',
        };
      }
    } catch (error) {
      console.error('Error verifying tier:', error);
      return {
        success: false,
        tier: 0,
        totalSolaBalance: 0,
        message: 'Failed to verify tier',
      };
    }
  },
}));
