import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import AppRoutes from './routes/AppRoutes.tsx';
import useThemeManager from './models/ThemeManager.ts';
import { WalletProvider } from './models/provider/WalletProvider.tsx';
import { LayoutProvider } from './layout/LayoutProvider.tsx';
import { useUserHandler } from './models/UserHandler.ts';

function App() {
  /**
   * Global State Management
   */
  const { authenticated, ready } = usePrivy();
  const { initThemeManager } = useThemeManager();
  const { login } = useUserHandler();

  /**
   * Add any code here that needs to run when the user has completed authentication
   */
  useEffect(() => {
    if (authenticated && ready) {
      login(); // check function documentation for more details
    }
  }, [authenticated, ready]);

  /**
   * Add any code here that needs to run at the start of the application regardless of authentication status
   */
  useEffect(() => {
    initThemeManager();
  }, []);

  return (
    <WalletProvider isAuthenticated={authenticated && ready}>
      <LayoutProvider>
        <AppRoutes isAuthenticated={authenticated} />
      </LayoutProvider>
    </WalletProvider>
  );
}

export default App;
