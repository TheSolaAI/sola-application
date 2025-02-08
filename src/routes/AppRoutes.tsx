/**
 * Handles the application's routing.
 *
 * - Unauthorized users are redirected to the Onboarding page.
 * - Authorized users have access to routes within the MasterLayout.
 */

import { Route, Routes } from 'react-router-dom';
import MasterLayout from '../layout/MasterLayout';
import PageTitle from '../components/PageTitle';
import Conversation from '../pages/Conversation';
import Onboarding from '../pages/Onbording';
import WalletManagement from '../pages/WalletManagement';
import Settings from '../pages/Settings';
import OnRamp from '../pages/OnRamp';
import Pricing from '../pages/Pricing';
import { SessionProvider } from '../models/provider/SessionProvider.tsx';

interface Props {
  isAuthenticated: boolean;
}

const AppRoutes: React.FC<Props> = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Onboarding />;
  }

  return (
    <MasterLayout>
      <SessionProvider>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <PageTitle title="Home" />
                <Conversation />
              </>
            }
          />
          <Route
            path="/c/:id"
            element={
              <>
                <PageTitle title="Home" />
                <Conversation />
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
          <Route
            path="/pricing"
            element={
              <>
                <PageTitle title="Pricing" />
                <Pricing />
              </>
            }
          />
        </Routes>
      </SessionProvider>
    </MasterLayout>
  );
};

export default AppRoutes;
