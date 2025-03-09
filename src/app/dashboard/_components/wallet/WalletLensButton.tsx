'use client';
import { useWalletHandler } from '@/store/WalletHandler';
import { titleCase } from '@/utils/titleCase';
import Image from 'next/image';

interface WalletLensButtonProps {
  onClick?: () => void;
}

function WalletLensButton({ onClick }: WalletLensButtonProps) {
  /**
   * Global States
   */
  const { currentWallet } = useWalletHandler();

  return (
    <>
      {/* External Button*/}
      <button
        className=" my-2 bg-baseBackground rounded-lg sm:rounded-xl p-1 sm:p-4 flex flex-row gap-x-4 items-center hover:border-2 border-primaryDark z-30"
        onClick={onClick}
      >
        {currentWallet?.meta.icon ? (
          <Image
            src={currentWallet.meta.icon}
            alt="wallet logo"
            className="w-8 h-8 rounded-xl"
            width={20}
            height={20}
            onClick={(e) => {
              e.stopPropagation(); // Stop event from selecting the wallet
              window.open(
                `https://solscan.io/account/${currentWallet.address}`,
                '_blank'
              );
            }}
          />
        ) : (
          <Image
            src="/default_wallet.svg"
            alt="wallet logo"
            className="w-8 h-8 rounded-xl"
            width={20}
            height={20}
          />
        )}
        <h1 className=" hidden md:block text-textColor font-medium md:text-lg">
          {titleCase(currentWallet?.walletClientType)}
        </h1>
      </button>
    </>
  );
}

export default WalletLensButton;
