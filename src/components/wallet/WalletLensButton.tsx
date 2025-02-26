import { useWalletHandler } from '../../models/WalletHandler.ts';
import { useEffect, useState } from 'react';
import SUPPORTED_WALLETS from '../../config/wallets/supportedWallets.ts';
import { titleCase } from '../../utils/titleCase.ts';

interface WalletLensButtonProps {
  onClick?: () => void;
}

function WalletLensButton({ onClick }: WalletLensButtonProps) {
  /**
   * Global States
   */
  const { currentWallet } = useWalletHandler();

  /**
   * Local State
   */
  const [walletLogo, setWalletLogo] = useState<string>('');

  useEffect(() => {
    if (SUPPORTED_WALLETS.includes(currentWallet?.walletClientType)) {
      setWalletLogo(`/wallets/${currentWallet?.walletClientType}.svg`);
    } else {
      setWalletLogo('/wallets/default.svg');
    }
  }, [currentWallet?.walletClientType]);

  return (
    <>
      {/* External Button*/}
      <button
        className=" my-2 bg-baseBackground rounded-lg sm:rounded-xl p-1 sm:p-4 flex flex-row gap-x-4 items-center hover:border-2 border-primaryDark z-20"
        onClick={onClick}
      >
        <img
          src={walletLogo}
          alt="wallet-logo"
          className=" w-8 h-8 rounded-xl"
        />
        <h1 className=" hidden md:block text-textColor font-medium md:text-lg">
          {titleCase(currentWallet?.walletClientType)}
        </h1>
      </button>
    </>
  );
}

export default WalletLensButton;
