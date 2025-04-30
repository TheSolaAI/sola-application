'use client';
import { memo } from 'react';
import { useWalletHandler } from '@/store/WalletHandler';
import { titleCase } from '@/utils/titleCase';
import Image from 'next/image';
import { motion } from 'framer-motion';
import useIsMobile from '@/utils/isMobile';

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
  const isMobile = useIsMobile();

  // Animation variants
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
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
      className="overflow-hidden bg-sec_background border border-border shadow-lg rounded-lg flex items-center transition-all px-3 py-2 hover:border-primaryDark"
      onClick={onClick}
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <div className="flex items-center gap-x-3">
        {currentWallet?.meta.icon ? (
          <div className="relative w-8 h-8 rounded-lg overflow-hidden">
            <Image
              src={currentWallet.meta.icon}
              alt="wallet logo"
              className="rounded-lg object-cover"
              width={32}
              height={32}
              onClick={isMobile ? undefined : handleSolscanClick}
            />
          </div>
        ) : (
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-surface/30">
            <Image
              src="/default_wallet.svg"
              alt="wallet logo"
              className="rounded-lg object-cover"
              width={32}
              height={32}
            />
          </div>
        )}

        <div className="hidden md:block">
          <span className="text-textColor font-medium">
            {titleCase(currentWallet?.meta.name || 'No Wallet')}
          </span>
          {currentWallet?.address && (
            <p className="text-xs text-secText truncate max-w-36">
              {`${currentWallet.address.substring(0, 4)}...${currentWallet.address.substring(currentWallet.address.length - 4)}`}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
});

export default WalletLensButton;
