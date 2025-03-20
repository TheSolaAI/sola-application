'use client';

import { memo } from 'react';
import { useWalletHandler } from '@/store/WalletHandler';
import { titleCase } from '@/utils/titleCase';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface WalletLensButtonProps {
  onClick?: () => void;
}

/**
 * Optimized WalletLensButton component that displays the current wallet
 * and allows opening the wallet lens sidebar
 */
const WalletLensButton = memo(function WalletLensButton({
  onClick,
}: WalletLensButtonProps) {
  const { currentWallet } = useWalletHandler();

  // Animation variants
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
  };

  const handleSolscanClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from selecting the wallet
    if (currentWallet?.address) {
      window.open(
        `https://solscan.io/account/${currentWallet.address}`,
        '_blank'
      );
    }
  };

  return (
    <motion.button
      className="my-2 bg-baseBackground rounded-lg sm:rounded-xl p-1 sm:p-4 flex flex-row gap-x-4 items-center border-2 border-transparent hover:border-primaryDark z-30"
      onClick={onClick}
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      {currentWallet?.meta.icon ? (
        <Image
          src={currentWallet.meta.icon}
          alt="wallet logo"
          className="w-8 h-8 rounded-xl cursor-pointer"
          width={20}
          height={20}
          onClick={handleSolscanClick}
        />
      ) : (
        <Image
          src="/default_wallet.svg"
          alt="wallet logo"
          className="rounded-xl"
          width={20}
          height={20}
        />
      )}
      <h1 className="hidden md:block text-textColor font-medium md:text-lg">
        {titleCase(currentWallet?.meta.name)}
      </h1>
    </motion.button>
  );
});

export default WalletLensButton;
