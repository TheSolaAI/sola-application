'use client';

import React, { useEffect } from 'react';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { useWalletHandler } from '@/store/WalletHandler';

export const WalletProvider: React.FC<{
  children: React.ReactNode;
  isAuthenticated: boolean;
}> = ({ children, isAuthenticated }) => {
  const { ready, wallets } = useSolanaWallets();
  const setWallets = useWalletHandler((state) => state.setWallets);
  const initWalletManager = useWalletHandler(
    (state) => state.initWalletManager
  );

  useEffect(() => {
    if (ready && isAuthenticated) {
      setWallets(wallets);
      initWalletManager();
    }
  }, [ready, isAuthenticated, initWalletManager]);

  return <>{children}</>;
};
