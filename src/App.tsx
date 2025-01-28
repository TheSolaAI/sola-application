import { useEffect, useCallback } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import PageTitle from './components/PageTitle';
import Conversaction from './pages/Conversation';
import MasterLayout from './layout/MasterLayout.tsx';
import Onbording from './pages/Onbording';
import WalletManagement from './pages/WalletManagement';
import useAppState from './store/zustand/AppState';
import Settings from './pages/Settings';
import OnRamp from './pages/OnRamp';
import useUser from './hooks/useUser';
import useThemeManager from './store/zustand/ThemeManager.ts';
import { tokenGate } from './lib/solana/tokenGate';

function App() {
  /**
   * Global State Management
   */
  const { authenticated, getAccessToken } = usePrivy();
  const { createWallet, wallets } = useSolanaWallets();
  const { setWallet, setAccessToken } = useAppState();
  const { pathname } = useLocation();
  const { tier,setTier} = useAppState();
  const memoizedCreateWallet = useCallback(createWallet, []);
  const { fetchSettings } = useUser();
  const { initManager } = useThemeManager();

  /**
   * Master UseEffect Run at app starts. Sets up app theme
   */
  useEffect(() => {
    initManager();
  }, []);

  const initializeWallet = async () => {
    try {
      await memoizedCreateWallet();
      console.log('Wallet initialized or already exists.');
    } catch (error) {
      console.error('Error initializing wallet:', error);
    }
  };

  const updateUserSettings = async () => {
    console.log(await fetchSettings());
  };

  // Adding Wallet to the global state.
  useEffect(() => {
    if (wallets.length > 0) {
      console.log(wallets);
      setWallet(wallets[0]);
    }
  }, [wallets]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const initializeApp = async () => {
      if (authenticated) {
        const jwt = await getAccessToken();
        if (!jwt) {
          throw new Error('Failed to fetch access token.');
        }
        setAccessToken(jwt);
        await initializeWallet();
        await updateUserSettings();
      }
    };

    initializeApp();
  }, [authenticated, memoizedCreateWallet, wallets.length]);
  useEffect(() => {

    const fetchTier = async () => {
      const result = await tokenGate(wallets[0].address);
      if (result === false) {
        setTier(0);
        return;
      }
      setTier(result.data.tier)
    };

    fetchTier();
  }, []); 

  const MemoizedAuthenticatedRoutes = useCallback(
    () => (
      <MasterLayout>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <PageTitle title="Home" />
                <Conversaction />
              </>
            }
          />
          <Route
            path="/c/:id"
            element={
              <>
                <PageTitle title="Home" />
                <Conversaction />
              </>
            }
          />
          <Route
            path="/settings/configuration"
            element={
              <>
                <PageTitle title="Settings" />
                <Settings />
              </>
            }
          />
          <Route
            path="/wallet"
            element={
              <>
                <PageTitle title="Wallet Management" />
                <WalletManagement />
              </>
            }
          />
          <Route
            path="/onramp"
            element={
              <>
                <PageTitle title="On Ramp" />
                <OnRamp />
              </>
            }
          />
        </Routes>
      </MasterLayout>
    ),
    [],
  );
  const MemoizedUnauthenticatedRoutes = useCallback(() => <Onbording />, []);

  return authenticated ? (
      <MemoizedAuthenticatedRoutes />
    ) :
    (
    <MemoizedUnauthenticatedRoutes />
  );
}

export default App;

