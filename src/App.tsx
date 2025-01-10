import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import Loader from './common/Loader';
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

  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    if (wallets.length > 0) {
      setWallet(wallets[0]);
    }
  }, [wallets]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const initializeWallet = async () => {
      setLoading(true);
      try {
        await createWallet();
        console.log('A wallet has been created.');
      } catch (error) {
        console.log('Wallet already created:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authenticated) {
      initializeWallet();
    }
  }, [authenticated]);

  const AuthenticatedRoutes = () => (
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
  );

  const UnauthenticatedRoutes = () => <Onbording />;

  return loading ? (
    <Loader />
  ) : authenticated ? (
    <AuthenticatedRoutes />
  ) : (
    <UnauthenticatedRoutes />
  );
}

export default App;
