/**
 * Handles the application's routing.
 * 
 * - Unauthorized users are redirected to the Onboarding page.
 * - Authorized users have access to routes within the MasterLayout.
 */

import { Route, Routes } from 'react-router-dom';
import MasterLayout from '../layout/MasterLayout';
import PageTitle from '../components/PageTitle';
import Conversaction from '../pages/Conversation';
import Onboarding from '../pages/Onbording';
import WalletManagement from '../pages/WalletManagement';
import Settings from '../pages/Settings';
import OnRamp from '../pages/OnRamp';

interface Props {
  isAuthenticated: boolean;
}

const AppRoutes: React.FC<Props> = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Onboarding />;
  }

  return (
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
  );
};

export default AppRoutes;
