'use client';

import { create } from 'zustand';
import { toast } from 'sonner';
import { useUserHandler } from '@/store/UserHandler';
import {
  extractUserPrivyId,
  verifySession,
  verifyUserTier,
} from '@/lib/server/userSession';

/**
 * SessionStatus type defines the different states a session can be in.
 */
export type SessionStatus =
  | 'idle'
  | 'checking'
  | 'no_sessions_left'
  | 'connecting'
  | 'connected'
  | 'error';

/**
 * Interface for the Session Manager store.
 */
interface SessionManagerStore {
  /** Indicates whether the verification popup is visible */
  showVerifyHoldersPopup: boolean;
  /** Represents the current session status */
  sessionStatus: SessionStatus;

  /** Sets the visibility of the verification popup */
  setShowVerifyHoldersPopup: (show: boolean) => void;
  /** Sets the current session status */
  setSessionStatus: (status: SessionStatus) => void;

  /** Retrieves the user-provided API key from local storage */
  getUserProvidedApiKey: () => string | null;
  /** Stores the provided API key in local storage */
  setUserProvidedApiKey: (key: string) => void;
  /** Removes the API key from local storage */
  clearUserProvidedApiKey: () => void;

  /**
   * Checks if the user has an available session.
   * It validates the auth token, verifies the user tier, and checks session availability.
   */
  checkSessionAvailability: () => Promise<boolean>;

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
 * Local storage key for saving the user provided API key.
 */
const LOCAL_STORAGE_API_KEY = 'sola_user_openai_key';

/**
 * Zustand store for managing session-related state and actions.
 * This includes handling UI state, local storage management for API keys,
 * and verifying session and user tier statuses via server functions.
 */
export const useSessionManagerHandler = create<SessionManagerStore>(
  (set, get) => ({
    showVerifyHoldersPopup: false,
    sessionStatus: 'idle',

    setShowVerifyHoldersPopup: (show) => set({ showVerifyHoldersPopup: show }),
    setSessionStatus: (status) => set({ sessionStatus: status }),

    getUserProvidedApiKey: () => {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(LOCAL_STORAGE_API_KEY);
    },

    setUserProvidedApiKey: (key) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(LOCAL_STORAGE_API_KEY, key);
    },

    clearUserProvidedApiKey: () => {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(LOCAL_STORAGE_API_KEY);
    },

    checkSessionAvailability: async () => {
      set({ sessionStatus: 'checking' });
      try {
        // Retrieve the authentication token from the user handler
        const authToken = useUserHandler.getState().authToken;
        if (!authToken) {
          set({ sessionStatus: 'error' });
          return false;
        }

        // Extract the user's Privy ID and verify tier information
        const privyId = await extractUserPrivyId(authToken);
        const tierInfo = await verifyUserTier(privyId, authToken);
        console.log(tierInfo);

        // If tier verification fails or the tier is zero, report error
        if (!tierInfo.success || !tierInfo.tier || tierInfo.tier === 0) {
          set({ sessionStatus: 'error' });
          return false;
        }

        // Check if the user has any remaining sessions based on tier info
        const hasSessionsRemaining = await verifySession(
          privyId,
          tierInfo.tier
        );
        if (hasSessionsRemaining) {
          return true;
        } else {
          set({ sessionStatus: 'no_sessions_left' });
          return false;
        }
      } catch (error) {
        console.error('Error checking session availability:', error);
        set({ sessionStatus: 'error' });
        toast.error('Failed to check session availability');
        return false;
      }
    },

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

        // Extract the user's Privy ID and verify tier information
        const privyId = await extractUserPrivyId(authToken);
        const tierInfo = await verifyUserTier(privyId, authToken);
        if (tierInfo.success) {
          const hasSessionsAvailable = await get().checkSessionAvailability();
          return {
            success: true,
            tier: tierInfo.tier || 0,
            totalSolaBalance: tierInfo.totalSolaBalance || 0,
            message: hasSessionsAvailable
              ? 'Tier verified successfully. You can now start a session.'
              : 'Tier verified, but no sessions available for your tier.',
          };
        } else {
          return {
            success: false,
            tier: 0,
            totalSolaBalance: 0,
            message: tierInfo.error || 'Failed to verify tier',
          };
        }
      } catch (error) {
        console.error('Error verifying tier:', error);
        return {
          success: false,
          tier: 0,
          totalSolaBalance: 0,
          message:
            error instanceof Error ? error.message : 'Failed to verify tier',
        };
      }
    },
  })
);
