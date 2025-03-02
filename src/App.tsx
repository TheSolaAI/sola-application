import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import AppRoutes from './routes/AppRoutes.tsx';
import { WalletProvider } from './models/provider/WalletProvider.tsx';
import { LayoutProvider } from './layout/LayoutProvider.tsx';
import { useUserHandler } from './models/UserHandler.ts';
import { useChatRoomHandler } from './models/ChatRoomHandler.ts';
import { useNavigate } from 'react-router-dom';
import useThemeManager from './models/ThemeManager.ts';

function App() {
  const navigate = useNavigate();
  /**
   * Global State Management
   */
  const { authenticated, ready } = usePrivy();
  const { login } = useUserHandler();
  const { initRoomHandler, currentChatRoom } = useChatRoomHandler();
  const { initThemeManager } = useThemeManager();

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
   * This useEffect will automatically navigate the user to the respective chat room based on the
   * currentChatRoom state if they are not already there
   */
  useEffect(() => {
    if (currentChatRoom) {
      navigate(`/c/${currentChatRoom.id}`);
    }
  }, [currentChatRoom]);

  /**
   * Add any code here that needs to run at the start of the application regardless of authentication status
   */
  useEffect(() => {
    initThemeManager();
  }, []);

  return (
    <WalletProvider isAuthenticated={authenticated && ready}>
      <LayoutProvider>
        <AppRoutes />
      </LayoutProvider>
    </WalletProvider>
  );
}

export default App;
