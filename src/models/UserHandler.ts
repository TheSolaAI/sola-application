/**
 * This handler is responsible for creating users, ensuring authentication and other user related tasks.
 */
import { create } from 'zustand';
import { getAccessToken } from '@privy-io/react-auth';
import { toast } from 'sonner';

interface UserHandler {
  authToken: string | null; // null represents the auth token has not been set yet

  /**
   * Called when any server retursn that the token has expired. This is called and
   * the request is retried with the new token. Returns false if privy does not return
   * an auth token meaning the user has most likely signed out.
   */
  updateAuthToken: () => Promise<boolean>;

  /**
   * Fetches the latest JWT from Privy. Should be called when the user is authenticated.
   * Returns false if privy does not return an auth token meaning the user has most likely signed out.
   */
  login: () => Promise<boolean>;
}

export const useUserHandler = create<UserHandler>((set, get) => {
  return {
    currentUser: null,
    authToken: null,

    updateAuthToken: async (): Promise<boolean> => {
      // get the latest auth token from privy
      const authToken = await getAccessToken();
      if (!authToken) {
        toast.error('Something Went Wrong. Please Login Again');
        return false;
      }
      return true;
    },

    login: async (): Promise<boolean> => {
      // get the latest auth token from privy
      const authToken = await getAccessToken();
      if (!authToken) {
        toast.error('Something Went Wrong. Please Login Again');
        return false;
      }
      set({ authToken });
      return true;
    },
  };
});
