import React, { useEffect } from 'react';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { useWalletHandler } from '../WalletHandler.ts';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { ready, wallets } = useSolanaWallets();
  const setWallets = useWalletHandler((state) => state.setWallets);
  const initWalletManager = useWalletHandler(
    (state) => state.initWalletManager,
  );

  useEffect(() => {
    if (ready) {
      setWallets(wallets);
      initWalletManager();
    }
  }, [ready, wallets, setWallets, initWalletManager]);

  return <>{children}</>;
};
