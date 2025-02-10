import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import AppRoutes from './routes/AppRoutes.tsx';
import useThemeManager from './models/ThemeManager.ts';
import { WalletProvider } from './models/provider/WalletProvider.tsx';
import { LayoutProvider } from './layout/LayoutProvider.tsx';
import { useUserHandler } from './models/UserHandler.ts';
import { useChatRoomHandler } from './models/ChatRoomHandler.ts';

function App() {
  /**
   * Global State Management
   */
  const { authenticated, ready } = usePrivy();
  const { initThemeManager } = useThemeManager();
  const { login } = useUserHandler();
  const { initRoomHandler } = useChatRoomHandler();

  /**
   * Add any code here that needs to run when the user has completed authentication
   */
  useEffect(() => {
    const init = async () => {
      if (authenticated && ready) {
        await login(); // check function documentation for more details
        initRoomHandler();
      }
    };
    init();
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
