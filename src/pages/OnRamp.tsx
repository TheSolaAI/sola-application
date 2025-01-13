import { useFundWallet } from '@privy-io/react-auth/solana';
import useAppState from '../store/zustand/AppState';
import { Button} from '@headlessui/react';
import { useState } from 'react';

const OnRamp = () => {
  const { fundWallet } = useFundWallet();
  const { appWallet } = useAppState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFundWallet = async () => {
    if (!appWallet?.address) {
      console.error('No wallet address available.');
      setError('No wallet connected. Please connect your wallet.');
      return;
    }

    

    setIsLoading(true);
    setError(null);

    try {
      await fundWallet(appWallet.address, {
        
        card: {
          preferredProvider: 'moonpay',
        },
        amount: ""
        
      });
      console.log('Funding wallet...');
    } catch (err: any) {
      console.error('Error funding wallet:', err);
      setError(err?.message || 'An error occurred funding the wallet.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!appWallet?.address) {
    return (
      <div className="text-red-500 text-center">
        No wallet connected. Please connect your wallet.
      </div>
    );
  }

  const bgColor = 'bg-graydark';
  const cardBgColor = 'bg-bodydark1';
  const textColor = 'text-white';
  const hoverColor = 'hover:bg-bodydark1/80';

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-16 dark:bg-darkalign animate-in fade-in-0 duration-300">
      <div className=' text-title-xl font-semibold dark:text-purple-300'>Easy On-Ramps</div>
      <div
        className={`${bgColor} rounded-xl p-8 shadow-sm w-2/6 h-2/4 flex flex-col justify-between dark:bg-darkalign2`}
      >
        <div className="flex justify-center items-center mb-4 w-full h-full">
          <img src={'./card.svg'} className="h-52" />
        </div>
        <div>
          <Button
            onClick={handleFundWallet}
            disabled={isLoading}
            className={`
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            ${cardBgColor} ${hoverColor} ${textColor} font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline dark:text-bodydark2 dark:bg-boxdark dark:hover:bg-boxdark-2
          `}
          >
            {isLoading ? 'Funding...' : 'Fund Wallet'}
          </Button>
        </div>
        {error && (
          <div className="mt-4 text-sm text-red-500 text-center">{error}</div>
        )}
      </div>
    </div>
  );
};

export default OnRamp;
