'use client';
import { WalletProvider } from '@/providers/WalletProvider';
import { usePrivy } from '@privy-io/react-auth';
import { useUserHandler } from '@/store/UserHandler';
import React, { useEffect, useState } from 'react';
import { LayoutProvider } from '@/providers/LayoutProvider';
import MasterLayout from '@/app/dashboard/_components/MasterLayout';
import { useChatRoomHandler } from '@/store/ChatRoomHandler';
import { SessionProvider } from '@/providers/SessionProvider';
import PageLoading from '@/components/common/PageLoading';
import { ChatNavigationProvider } from '@/providers/ChatNavigationProvider';
import ReduxProvider from '@/providers/ReduxProvider';
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /**
   * Global State Management
   */
  const { authenticated, ready } = usePrivy();
  const { login } = useUserHandler();
  const { initRoomHandler } = useChatRoomHandler();
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * Add any code here that needs to run when the user has completed authentication
   */
  useEffect(() => {
    const init = async () => {
      if (authenticated && ready) {
        setIsInitializing(true);
        await login();
        await initRoomHandler();
        setIsInitializing(false);
      }
    };
    init();
  }, [authenticated, ready, login, initRoomHandler]);

  // Show loading when either Privy is not ready or we're still initializing
  if (!ready || isInitializing) {
    return <PageLoading />;
  }

  return (
    <ReduxProvider>
      <WalletProvider isAuthenticated={authenticated && ready}>
        <LayoutProvider>
          <MasterLayout>
            <ChatNavigationProvider />
            <SessionProvider>{children}</SessionProvider>
          </MasterLayout>
        </LayoutProvider>
      </WalletProvider>
    </ReduxProvider>
  );
}
