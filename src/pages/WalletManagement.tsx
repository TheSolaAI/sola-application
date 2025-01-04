import { useState } from 'react';
import { useSolanaWallets } from '@privy-io/react-auth';
import useAppState from '../store/zustand/AppState';

function WalletManagement() {
  const { appWallet, setWallet } = useAppState();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(
    appWallet?.walletClientType || 'Select Wallet',
  );
  const { wallets } = useSolanaWallets();

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="bg-graydark h-full p-4 rounded-lg ">
      <h1 className='font-bold text-xl'>Wallet Management :</h1>
      <div className='p-4 mt-8'>
        <span className="text-boxdark font-medium">Switch Wallet : </span>
        <div className="relative inline-block text-left">
          <div>
            <button
              onClick={toggleDropdown}
              className="inline-flex justify-between w-full rounded-md border border-bodydark shadow-sm px-4 py-2 bg-white text-sm font-medium text-boxdark-2 hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-boxdark focus:ring-offset-2 focus:ring-offset-gray-100"
              id="wallet-menu-button"
              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              {selectedWallet}
              <svg
                className={`-mr-1 ml-2 h-5 w-5 transform transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.707a1 1 0 011.414 0L10 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {isOpen && (
            <div
              className={`absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all duration-200 ${
                isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
              }`}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="wallet-menu-button"
            >
              <div className="py-1">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.walletClientType}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                    onClick={() => {
                      setSelectedWallet(wallet.walletClientType);
                      setWallet(wallet);
                      setIsOpen(false);
                    }}
                  >
                    {wallet.walletClientType}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalletManagement;
