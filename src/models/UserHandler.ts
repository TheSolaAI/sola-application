/**
 * This handler is responsible for creating users, ensuring authentication and other user related tasks.
 */
import { create } from 'zustand';
import { getAccessToken } from '@privy-io/react-auth';

interface UserHandler {
  authToken: string | null; // null represents the auth token has not been set yet

  /**
   * Called when any server retursn that the token has expired. This is called and
   * the request is retried with the new token.
   */
  updateAuthToken: () => void;

  /**
   * Fetches the latest JWT from Privy. Should be called when the user is authenticated.
   */
  login: () => Promise<void>;
}

export const useUserHandler = create<UserHandler>((set, get) => {
  return {
    currentUser: null,
    authToken: null,

    updateAuthToken: () => {
      // get the latest auth token from privy
      const authToken = await getAccessToken();
      if (!authToken) {
        throw new Error('Failed to fetch access token.');
        // TODO: Navigate back to login page

    }

    login: async () => {
      // get the latest auth token from privy
      const authToken = await getAccessToken();
      if (!authToken) {
        throw new Error('Failed to fetch access token.');
        // TODO: Navigate back to login page
      }
      set({ authToken });
    },
  };
});
