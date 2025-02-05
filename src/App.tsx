import { useCallback, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import useUser from './hooks/useUser';
import AppRoutes from './routes/AppRoutes.tsx';
import useAppState from './models/AppState.ts';
import useThemeManager from './models/ThemeManager.ts';
import { WalletProvider } from './models/provider/WalletProvider.tsx';
import ApiClient from './api/ApiClient.ts';
import { LayoutProvider } from './layout/LayoutProvider.tsx';

function App() {
  /**
   * Global State Management
   */
  const { authenticated, getAccessToken, ready, user } = usePrivy();
  const { setAccessToken } = useAppState();
  const { fetchSettings } = useUser();
  const { initThemeManager } = useThemeManager();

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
      ApiClient.setAccessToken(jwt);
      //TODO: get user tire status here
      await updateUserSettings();
    }
  }, [authenticated, ready]);

  /**
   * Master UseEffect Run at app starts. Sets up app theme
   */
  useEffect(() => {
    initThemeManager();
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <WalletProvider isAuthenticated={authenticated && ready}>
      <LayoutProvider>
        <AppRoutes isAuthenticated={authenticated} />
      </LayoutProvider>
    </WalletProvider>
  );
}

export default App;
