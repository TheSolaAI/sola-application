'use client';

import { create } from 'zustand';
import { toast } from 'sonner';
import { useUserHandler } from '@/store/UserHandler';
import {
  extractUserPrivyId,
  verifySession,
  verifyUserTier,
} from '@/lib/server/userSession';

export type SessionStatus =
  | 'idle'
  | 'checking'
  | 'no_sessions_left'
  | 'connecting'
  | 'connected'
  | 'error';

interface SessionManagerStore {
  // State
  showVerifyHoldersPopup: boolean;
  sessionStatus: SessionStatus;

  // State setters
  setShowVerifyHoldersPopup: (show: boolean) => void;
  setSessionStatus: (status: SessionStatus) => void;

  // Local storage API key management
  getUserProvidedApiKey: () => string | null;
  setUserProvidedApiKey: (key: string) => void;
  clearUserProvidedApiKey: () => void;

  // Network requests - now using server functions
  checkSessionAvailability: () => Promise<boolean>;
  verifyUserTierStatus: () => Promise<{
    success: boolean;
    tier: number;
    totalSolaBalance: number;
    message?: string;
  }>;
}

// LocalStorage key constant
const LOCAL_STORAGE_API_KEY = 'sola_user_openai_key';

export const useSessionManagerHandler = create<SessionManagerStore>(
  (set, get) => ({
    // Initial state
    showVerifyHoldersPopup: false,
    sessionStatus: 'idle',

    // State setters
    setShowVerifyHoldersPopup: (show) => set({ showVerifyHoldersPopup: show }),
    setSessionStatus: (status) => set({ sessionStatus: status }),

    // LocalStorage functions
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

    // Using server functions instead of API calls
    checkSessionAvailability: async () => {
      set({ sessionStatus: 'checking' });

      try {
        const authToken = useUserHandler.getState().authToken;
        if (!authToken) {
          set({ sessionStatus: 'error' });
          return false;
        }

        // Extract Privy ID from auth token
        const privyId = await extractUserPrivyId(authToken);

        // Get the user's current tier - we'll need to first verify their tier
        const tierInfo = await verifyUserTier(privyId, authToken);
        console.log(tierInfo);
        if (!tierInfo.success) {
          set({ sessionStatus: 'error' });
          return false;
        }

        if (!tierInfo.tier || tierInfo.tier === 0) {
          set({ sessionStatus: 'error' });
          return false;
        }

        // Check if the user has sessions available
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
        const authToken = useUserHandler.getState().authToken;
        if (!authToken) {
          return {
            success: false,
            tier: 0,
            totalSolaBalance: 0,
            message: 'unable to verify user',
          };
        }

        // Extract Privy ID from auth token
        const privyId = await extractUserPrivyId(authToken);

        // Call the server function to verify tier
        const tierInfo = await verifyUserTier(privyId, authToken);

        if (tierInfo.success) {
          // If verification was successful, check session availability
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
