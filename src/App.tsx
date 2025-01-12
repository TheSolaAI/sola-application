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

function App() {
  const { authenticated } = usePrivy();
  const { createWallet, wallets } = useSolanaWallets();
  const { setWallet } = useAppState();
  const { authorized, setAuthorized } = useAppState();

  const { pathname } = useLocation();

  const memoizedCreateWallet = useCallback(createWallet, []);

  const initializeWallet = async () => {
    try {
      await memoizedCreateWallet();
      console.log('Wallet initialized or already exists.');
    } catch (error) {
      console.error('Error initializing wallet:', error);
    }
  };

  useEffect(() => {
    if (authenticated !== authorized) {
      setAuthorized(authenticated);
    }
  }, [authenticated, authorized, setAuthorized]);

  // Adding Wallet to the global state.
  useEffect(() => {
    if (wallets.length > 0) {
      setWallet(wallets[0]);
    }
  }, [wallets]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (authenticated && wallets.length === 0) {
      initializeWallet();
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
