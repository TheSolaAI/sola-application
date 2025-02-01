import { CreditCard, ExternalLink } from 'react-feather';
import { fetchFilteredAssets } from '../../lib/solana/wallet';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import useAppState from '../../models/AppState.ts';
import { Asset } from '../../types/walletBalance';
import { useWalletHandler } from '../../models/WalletHandler.ts';
import { Button } from '@headlessui/react';

interface WalletUiProps {
  toggleWallet: () => void;
  isWalletVisible: boolean;
}

function WalletUi({ toggleWallet, isWalletVisible }: WalletUiProps) {
  const { appWallet } = useAppState();
  const [ownerAddress, setOwnerAddress] = useState<string>('');

  function viewWalletInExplorer() {
    if (appWallet) {
      window.open(`https://solscan.io/account/${appWallet.address}`);
    }
  }

  const {
    data: assets = [],
    error,
    isLoading,
  } = useSWR<Asset[]>(
    ownerAddress ? ['getAssetsByOwner', ownerAddress] : null,
    () => fetchFilteredAssets('getAssetsByOwner', ownerAddress),
    { refreshInterval: 5000 },
  );

  const setAssets = useWalletHandler((state) => state.setAssets);

  useEffect(() => {
    if (assets.length > 0) {
      setAssets(assets);
    }
  }, [assets]);

  useEffect(() => {
    if (appWallet) {
      setOwnerAddress(appWallet.address);
    }
  }, [appWallet]);

  return (
    <div className="flex flex-col items-end gap-2 z-9">
      <Button
        onClick={toggleWallet}
        className={`w-fit z-9 text-graydark bg-body px-8 py-4 rounded-2xl animate-in fade-in-0 duration-500 ${isWalletVisible ? 'bg-opacity-80' : ''}`}
      >
        {' '}
        <CreditCard />{' '}
      </Button>
      {appWallet && (
        <section
          className={`
            bg-body h-72 w-64 overflow-x-hidden overflow-y-scroll no-scrollbar rounded-xl p-4 text-white sm:w-72 md:w-80 lg:w-80
            z-9
            ${
              isWalletVisible
                ? 'translate-x-0 translate-y-0 opacity-100'
                : 'translate-x-0 translate-y-0 opacity-0 hidden'
            }
          `}
        >
          <div className="z-9 w-full flex justify-between items-center bg-strokedark gap-2 p-2 rounded-xl hover:bg-opacity-80 cursor-pointer">
            <div>
              {appWallet.address.slice(0, 4)}...
              {appWallet.address.slice(-4)}
            </div>
            <div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(appWallet.address);
                }}
              >
                <img
                  src="./copy.svg"
                  alt="Dex Icon"
                  className="h-4 w-4 mr-3 "
                />
              </button>
              <button
                className={`${isWalletVisible ? 'visible' : 'hidden'}`}
                onClick={viewWalletInExplorer}
              >
                <ExternalLink height={16} />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center my-4">
            <div className="text-sm font-semibold">Tokens</div>
            <div className="text-sm font-semibold">
              $
              {assets
                .reduce((acc, asset) => acc + (asset.totalPrice || 0), 0)
                .toFixed(2)}
            </div>
          </div>
          <div className="space-y-4">
            {isLoading && <div>Loading tokens...</div>}
            {error && <div>Error fetching tokens.</div>}
            {!isLoading && assets.length === 0 && <div>No tokens found.</div>}
            {assets.map((asset, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <img
                    src={asset.imageLink || '/placeholder-image.png'}
                    alt={asset.symbol || 'Token'}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="text-sm font-semibold">
                      {asset.symbol || 'Unknown'}{' '}
                      <span className="text-xs">({asset.symbol || 'N/A'})</span>
                    </div>
                    <div className="text-xs">
                      {(asset.balance / 10 ** asset.decimals).toFixed(
                        asset.decimals,
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    ${asset.totalPrice ? asset.totalPrice.toFixed(2) : 'N/A'}
                  </div>
                  <div className="text-xs">
                    @ $
                    {asset.pricePerToken
                      ? asset.pricePerToken.toFixed(4)
                      : 'N/A'}{' '}
                    $
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default WalletUi;
