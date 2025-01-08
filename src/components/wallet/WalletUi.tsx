import { CreditCard, ExternalLink } from 'react-feather';
import { fetchFilteredAssets } from '../../lib/solana/wallet';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Button from '../Button';
import useAppState from '../../store/zustand/AppState';
import { Asset } from '../../types/walletBalance';
import { useWalletStore } from '../../store/zustand/WalletState';

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

  const setAssets = useWalletStore((state) => state.setAssets)

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
        icon={<CreditCard />}
        onClick={toggleWallet}
        className={`w-fit z-9 ${isWalletVisible ? 'bg-opacity-80' : ''}`}
      ></Button>
      {appWallet && (
        <section
          className={`
            bg-black h-72 w-64 overflow-x-hidden overflow-y-scroll  no-scrollbar rounded-xl p-4 text-white sm:w-72 md:w-80 lg:w-80
            transition-all duration-300 ease-in-out z-9
            ${
              isWalletVisible
                ? 'translate-x-0 translate-y-0 opacity-100'
                : 'translate-x-0 translate-y-0 opacity-0'
            }
          `}
        >
          <div
            className="z-9 w-full flex justify-center items-center bg-boxdark gap-2 p-2 rounded-full hover:bg-opacity-80 cursor-pointer"
            onClick={viewWalletInExplorer}
          >
            {appWallet.address.slice(0, 4)}...
            {appWallet.address.slice(-4)}
            <ExternalLink height={16} />
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
