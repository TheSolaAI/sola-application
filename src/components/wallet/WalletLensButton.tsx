import { useWalletHandler } from '../../models/WalletHandler.ts';
import { useEffect, useState } from 'react';
import SUPPORTED_WALLETS from '../../config/wallets/supportedWallets.ts';

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
    }
  }, [currentWallet?.walletClientType]);

  return (
    <>
      {/* External Button*/}
      <button
        className="rounded-xl bg-sec_background p-4 flex flex-row gap-x-4 items-center border-primaryDark border-[1px] hover:scale-[102%] hover:shadow-[0px_0px_10px_1px] hover:shadow-primaryDark transition-all duration-300"
        onClick={onClick}
      >
        <img
          src={walletLogo}
          alt="wallet-logo"
          className="w-8 h-8 rounded-xl"
        />
        <h1 className="text-textColor font-semibold text-lg">
          {titleCase(currentWallet?.walletClientType)}
        </h1>
      </button>
    </>
  );
}

function titleCase(s?: string) {
  if (!s) return '';
  return s
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default WalletLensButton;
