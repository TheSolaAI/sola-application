import { useEffect, useCallback } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import PageTitle from './components/PageTitle';
import Conversaction from './pages/Conversation';
import DefaultLayout from './layout/DefaultLayout';
import Onbording from './pages/Onbording';
import WalletManagement from './pages/WalletManagement';
import useAppState from './store/zustand/AppState';
import Settings from './pages/Settings';
import OnRamp from './pages/OnRamp';
import useUser from './hooks/useUser';

function App() {
  const { authenticated, getAccessToken } = usePrivy();
  const { createWallet, wallets } = useSolanaWallets();
  const { setWallet, setAccessToken } = useAppState();
  const { authorized, setAuthorized } = useAppState();
  const { pathname } = useLocation();
  const memoizedCreateWallet = useCallback(createWallet, []);
  const { fetchSettings } = useUser();

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

  useEffect(() => {
    if (authenticated !== authorized) {
      setAuthorized(authenticated);
    }
  }, [authenticated, authorized, setAuthorized]);

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

  const MemoizedAuthenticatedRoutes = useCallback(
    () => (
      <DefaultLayout>
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
      </DefaultLayout>
    ),
    [],
  );
  const MemoizedUnauthenticatedRoutes = useCallback(() => <Onbording />, []);

  return authorized ? (
    <MemoizedAuthenticatedRoutes />
  ) : (
    <MemoizedUnauthenticatedRoutes />
  );
}

export default App;
