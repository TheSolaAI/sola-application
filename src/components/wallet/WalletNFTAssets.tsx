import { useState } from 'react';
import { useWalletHandler } from '../../models/WalletHandler.ts';
import { titleCase } from '../utils/titleCase.ts';
import { ChevronDownIcon, ImageIcon, PauseIcon, PlayIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const WalletNFTAssets = () => {
  const {
    currentWallet,
    status,
    walletAssets,
    startMonitoring,
    stopMonitoring,
  } = useWalletHandler();

  /**
   * Local state
   */
  const [expandedNFT, setExpandedNFT] = useState<string | null>(null);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

  const toggleNFTExpand = (nftId: string) => {
    setExpandedNFT(expandedNFT === nftId ? null : nftId);
  };

  const getRarityAttribute = (
    attributes?: { value: string; trait_type: string }[],
  ) => {
    if (!attributes) return null;
    return attributes.find(
      (attr) =>
        attr.trait_type.toLowerCase().includes('rarity') ||
        attr.trait_type.toLowerCase() === 'rare',
    );
  };

  return (
    <div className="w-full">
      {walletAssets.nfts.length === 0 ? (
        <p className={'text-textColor'}>No NFT's found </p>
      ) : (
        <div>
          <div
            className={
              'bg-background rounded-xl flex flex-row p-2 justify-between items-center mb-2'
            }
          >
            <div
              className={
                'bg-baseBackground rounded-xl flex flex-row items-center p-2 justify-center w-full'
              }
            >
              <h1 className="text-textColor font-semibold text-lg">Status:</h1>
              <div
                className={`rounded-full w-4 h-4 ml-2 ${
                  status === 'listening'
                    ? 'bg-green-500'
                    : status === 'paused'
                      ? 'bg-yellow-500'
                      : status === 'updating'
                        ? 'bg-blue-500'
                        : status === 'error'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                }`}
              />
              <p
                className={`font-medium ml-1 ${
                  status === 'listening'
                    ? 'text-green-500'
                    : status === 'paused'
                      ? 'text-yellow-500'
                      : status === 'updating'
                        ? 'text-blue-500'
                        : status === 'error'
                          ? 'text-red-500'
                          : 'text-gray-500'
                }`}
              >
                {titleCase(status)}
              </p>
              {status === 'listening' || status === 'updating' ? (
                <button className={'ml-3'} onClick={() => stopMonitoring()}>
                  <PauseIcon className={'w-6 h-6 text-secText '} />
                </button>
              ) : status === 'paused' ? (
                <button
                  className={'ml-3'}
                  onClick={() =>
                    startMonitoring(currentWallet?.address!, false)
                  }
                >
                  <PlayIcon className={'w-6 h-6 text-secText '} />
                </button>
              ) : null}
            </div>
          </div>

          <div className={'gap-2 rounded-2xl flex items-start flex-col w-full'}>
            {walletAssets.nfts.map((nft) => {
              const rarityAttribute = getRarityAttribute(nft.attributes);
              const isExpanded = expandedNFT === nft.id;

              return (
                <motion.div
                  key={nft.id}
                  layout
                  className={'bg-background rounded-xl w-full overflow-hidden'}
                >
                  <motion.div
                    layout
                    className={
                      'flex flex-row p-3 gap-x-2 items-center cursor-pointer'
                    }
                    onClick={() => toggleNFTExpand(nft.id)}
                  >
                    {imageError[nft.id] ? (
                      <ImageIcon className={'h-15 w-15 text-primaryDark'} />
                    ) : (
                      <img
                        className={'h-15 w-15 rounded-xl object-cover'}
                        src={nft.files[0]?.uri}
                        alt={nft.name}
                        onError={() =>
                          setImageError({ ...imageError, [nft.id]: true })
                        }
                      />
                    )}

                    <div
                      className={
                        'flex flex-col w-full overflow-hidden flex-grow'
                      }
                    >
                      <h1 className={'text-textColor font-semibold text-lg'}>
                        {nft.name}
                      </h1>
                      <p
                        className={
                          'text-secText font-regular text-sm overflow-ellipsis overflow-hidden whitespace-nowrap'
                        }
                      >
                        {nft.id}
                      </p>
                    </div>
                    <button className={'ml-2'}>
                      {isExpanded ? (
                        <ChevronDownIcon
                          className={'rotate-180 text-secText'}
                        />
                      ) : (
                        <ChevronDownIcon className={'text-secText'} />
                      )}
                    </button>
                  </motion.div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={
                          'p-4 bg-baseBackground border-t border-gray-700 overflow-hidden'
                        }
                      >
                        <div className={'w-full flex justify-center mb-4'}>
                          {imageError[nft.id] ? (
                            <ImageIcon className={'h-15 w-15 text-gray-500'} />
                          ) : (
                            <motion.img
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className={
                                'max-h-64 max-w-full rounded-xl object-contain'
                              }
                              src={nft.files[0]?.uri}
                              alt={nft.name}
                              onError={() =>
                                setImageError({ ...imageError, [nft.id]: true })
                              }
                            />
                          )}
                        </div>
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={'mb-4'}
                        >
                          <h2
                            className={'text-textColor font-bold text-xl mb-2'}
                          >
                            {nft.name}
                          </h2>
                          <p className={'text-secText mb-4'}>
                            {nft.description}
                          </p>
                          <div className={'flex flex-wrap gap-2'}>
                            {rarityAttribute && (
                              <motion.span
                                className={
                                  'px-3 py-1 rounded-full bg-primaryDark text-textColor text-sm font-semibold'
                                }
                              >
                                {rarityAttribute.trait_type}:{' '}
                                {rarityAttribute.value}
                              </motion.span>
                            )}
                            {nft.attributes?.map(
                              (attr, index) =>
                                (!rarityAttribute ||
                                  attr !== rarityAttribute) && (
                                  <motion.span
                                    key={index}
                                    className={
                                      'px-3 py-1 rounded-full bg-background text-textColor text-sm'
                                    }
                                  >
                                    {attr.trait_type}: {attr.value}
                                  </motion.span>
                                ),
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
