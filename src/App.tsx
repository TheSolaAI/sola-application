import { useEffect, useCallback } from 'react';
import { usePrivy, WalletWithMetadata } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import useAppState from './store/zustand/AppState';
import useUser from './hooks/useUser';
import useThemeManager from './store/zustand/ThemeManager.ts';
import AppRoutes from './routes/appRoutes.tsx';
// import { tokenGate } from './lib/solana/tokenGate';

function App() {
  /**
   * Global State Management
   */
  const { authenticated, getAccessToken, ready, user } = usePrivy();
  const { createWallet, wallets } = useSolanaWallets();
  const { setWallet, setAccessToken } = useAppState();
  // const { tier, setTier } = useAppState();
  const memoizedCreateWallet = useCallback(createWallet, []);
  const { fetchSettings } = useUser();
  const { initManager } = useThemeManager();

  /**
   * Callback functions to create embedded wallet and update user settings on user login
   */
  const initializeWallet = useCallback(async () => {
    const hasEmbeddedWallet = !!user?.linkedAccounts.find(
      (account): account is WalletWithMetadata =>
        account.type === 'wallet' &&
        account.walletClientType === 'privy' &&
        account.chainType === 'solana',
    );
    if (!hasEmbeddedWallet) {
      try {
        await memoizedCreateWallet();
      } catch (error) {
        console.error('Error initializing wallet:', error);
      }
    }
  }, [authenticated, ready, user]);

  const updateUserSettings = useCallback(async () => {
    console.log(await fetchSettings());
  }, [authenticated, ready, user]);

  /**
   * Callback function that handles createing embedded wallet and update user settings on user login
   */
  const initializeApp = useCallback(async () => {
    if (authenticated && ready) {
      const jwt = await getAccessToken();
      console.log(jwt);
      if (!jwt) {
        throw new Error('Failed to fetch access token.');
      }
      setAccessToken(jwt);
      await initializeWallet();
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
