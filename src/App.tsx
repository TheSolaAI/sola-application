import { useCallback, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import useUser from './hooks/useUser';
import AppRoutes from './routes/AppRoutes.tsx';
import useAppState from './models/AppState.ts';
import useThemeManager from './models/ThemeManager.ts';

// import { tokenGate } from './lib/solana/tokenGate';

function App() {
  /**
   * Global State Management
   */
  const { authenticated, getAccessToken, ready, user } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { setWallet, setAccessToken } = useAppState();
  // const { tier, setTier } = useAppState();
  const { fetchSettings } = useUser();
  const { initManager } = useThemeManager();

  const updateUserSettings = useCallback(async () => {
    console.log(await fetchSettings());
  }, [authenticated, ready, user]);

  /**
   * Callback function that handles creating embedded wallet and update user settings on user login
   */
  const initializeApp = useCallback(async () => {
    if (authenticated && ready) {
      const jwt = await getAccessToken();
      console.log(jwt);
      if (!jwt) {
        throw new Error('Failed to fetch access token.');
      }
      setAccessToken(jwt);
      //TODO: get user tire status here
      await updateUserSettings();

      if (wallets.length > 0) {
        setWallet(wallets[0]);
      }
    }
  }, [authenticated, ready]);

  /**
   * Master UseEffect Run at app starts. Sets up app theme
   */
  useEffect(() => {
    initManager();
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return <AppRoutes isAuthenticated={authenticated && ready} />;
}

export default App;
