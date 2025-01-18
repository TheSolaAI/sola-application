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
  const { authenticated, getAccessToken, user } = usePrivy();
  const { createWallet, wallets } = useSolanaWallets();
  const { setWallet } = useAppState();
  const { authorized, setAuthorized } = useAppState();
  const { pathname } = useLocation();
  const memoizedCreateWallet = useCallback(createWallet, []);
  const { register, setAccessToken, updateSettings } = useUser();

  const initializeWallet = async () => {
    try {
      await memoizedCreateWallet();
      console.log('Wallet initialized or already exists.');
    } catch (error) {
      console.error('Error initializing wallet:', error);
    }
  };

  const registerUser = async () => {
    const accessToken = await getAccessToken();
    setAccessToken(accessToken ?? '');
    console.log("user: ",user?.linkedAccounts)
    console.log(
      await register({
        privy_wallet_id: 'string',
        wallet_id: 'string',
        wallet_provider: 'string',
      }),
    );
  };

  const updateUserSettings = async () => {
    console.log(await updateSettings({ theme: 'dark' }));
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
    if (authenticated) {
      // initializeWallet();
      registerUser();
      updateUserSettings();
    }
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
            path="/home"
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
