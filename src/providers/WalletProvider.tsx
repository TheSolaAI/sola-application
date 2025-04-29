'use client';

import React, { useEffect } from 'react';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { useWalletHandler } from '@/store/WalletHandler';
import useIsMobile from '@/utils/isMobile';

export const WalletProvider: React.FC<{
  children: React.ReactNode;
  isAuthenticated: boolean;
}> = ({ children, isAuthenticated }) => {
  /*
   * Global states
   */
  const setWallets = useWalletHandler((state) => state.setWallets);
  const initWalletManager = useWalletHandler(
    (state) => state.initWalletManager
  );
  const initPhantomWallet = useWalletHandler(
    (state) => state.initPhantomWallet
  );

  /*
   * Hooks
   */
  const isMobile = useIsMobile();

  const { ready, wallets } = useSolanaWallets();

  useEffect(() => {
    const initializePhantomEmbeddedWallet = async () => {
      await initPhantomWallet();
    };
    if (ready && isAuthenticated) {
      setWallets(wallets);
      if (!isMobile) initializePhantomEmbeddedWallet();
      initWalletManager();
    }
  }, [ready, isAuthenticated, initWalletManager]);

  return <>{children}</>;
};
