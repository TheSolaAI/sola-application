'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useWalletHandler } from '@/store/WalletHandler';
import { titleCase } from '@/utils/titleCase';
import {
  LuArrowUpDown,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuImage,
  LuPause,
  LuPlay,
} from 'react-icons/lu';
import { AnimatePresence, motion } from 'framer-motion';
import { PaginationCountDropDown } from './PaginationCountDropDown';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationOpen, setPaginationOpen] = useState(false);
  const [paginationCount, setPaginationCount] = useState(20);

  /**
   * refs
   */
  const paginationCountRef = useRef<HTMLButtonElement>(null);

  const paginatedNFTs = useMemo(() => {
    const startIndex = (currentPage - 1) * paginationCount;
    return walletAssets.nfts.slice(startIndex, startIndex + paginationCount);
  }, [walletAssets.nfts, currentPage, paginationCount]);

  const totalPages = useMemo(
    () => Math.ceil(walletAssets.nfts.length / paginationCount),
    [walletAssets.nfts.length, paginationCount]
  );

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    // Reset expanded NFT when changing pages
    setExpandedNFT(null);
  }, [totalPages]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    // Reset expanded NFT when changing pages
    setExpandedNFT(null);
  }, []);

  const toggleNFTExpand = (nftId: string) => {
    setExpandedNFT(expandedNFT === nftId ? null : nftId);
  };

  const getRarityAttribute = (
    attributes?: { value: string; trait_type: string }[]
  ) => {
    if (!attributes) return null;
    return attributes.find(
      (attr) =>
        attr.trait_type.toLowerCase().includes('rarity') ||
        attr.trait_type.toLowerCase() === 'rare'
    );
  };

  return (
    <div className="flex flex-col gap-y-4 w-full transition-opacity duration-500">
      {walletAssets.nfts.length === 0 ? (
        <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg p-6 text-center">
          <p className="text-textColor font-medium">No NFTs found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-y-4">
          {/* NFT Collection Section */}
          <div className="overflow-hidden rounded-xl bg-sec_background border border-border shadow-lg w-full">
            <div className="px-4 py-3 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold text-textColor">
                NFT Collection
              </h2>

              <div className="flex items-center gap-x-2">
                <div className="flex items-center bg-surface/30 px-3 py-1 rounded-lg">
                  <span className="text-xs uppercase tracking-wider text-secText mr-2">
                    Status:
                  </span>
                  <div
                    className={`rounded-full w-3 h-3 mr-1 ${
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
                  <span
                    className={`font-medium text-sm ${
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
                  </span>
                </div>

                {status === 'listening' || status === 'updating' ? (
                  <button
                    className="p-1 rounded-full hover:bg-surface/50 transition-colors"
                    onClick={() => stopMonitoring()}
                  >
                    <LuPause className="w-5 h-5 text-secText" />
                  </button>
                ) : status === 'paused' ? (
                  <button
                    className="p-1 rounded-full hover:bg-surface/50 transition-colors"
                    onClick={() =>
                      startMonitoring(currentWallet?.address || '', false)
                    }
                  >
                    <LuPlay className="w-5 h-5 text-secText" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-surface/10">
              <button
                ref={paginationCountRef}
                onClick={() => setPaginationOpen(true)}
                className="bg-surface/30 px-3 py-1 rounded-lg flex items-center gap-x-2 hover:bg-surface/50 transition-colors"
              >
                <span className="text-xs uppercase tracking-wider text-secText">
                  Items
                </span>
                <span className="text-textColor font-medium">
                  {paginationCount}
                </span>
                <LuArrowUpDown className="w-4 h-4 text-secText" />
              </button>

              <div className="flex items-center gap-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-1 rounded-lg ${
                    currentPage === 1
                      ? 'text-secText/50 cursor-not-allowed'
                      : 'text-secText hover:bg-surface/50 transition-colors'
                  }`}
                >
                  <LuChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-secText">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`p-1 rounded-lg ${
                    currentPage === totalPages || totalPages === 0
                      ? 'text-secText/50 cursor-not-allowed'
                      : 'text-secText hover:bg-surface/50 transition-colors'
                  }`}
                >
                  <LuChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* NFT List */}
            <div className="p-4">
              <div className="flex flex-col gap-3">
                {paginatedNFTs.map((nft) => {
                  const rarityAttribute = getRarityAttribute(nft.attributes);
                  const isExpanded = expandedNFT === nft.id;

                  return (
                    <motion.div
                      key={nft.id}
                      layout
                      className="overflow-hidden bg-surface/30 rounded-lg border border-border/40"
                    >
                      <motion.div
                        layout
                        className="flex items-center p-3 cursor-pointer hover:bg-surface/40 transition-colors"
                        onClick={() => toggleNFTExpand(nft.id)}
                      >
                        {imageError[nft.id] ? (
                          <div className="w-10 h-10 flex items-center justify-center bg-surface/50 rounded-lg mr-3">
                            <LuImage className="w-6 h-6 text-secText" />
                          </div>
                        ) : (
                          <img
                            src={nft.files[0]?.uri}
                            alt={nft.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                            onError={() =>
                              setImageError({ ...imageError, [nft.id]: true })
                            }
                          />
                        )}

                        <div className="flex-1 overflow-hidden">
                          <h3 className="text-textColor font-medium">
                            {nft.name}
                          </h3>
                          <p className="text-secText text-sm truncate">
                            {nft.id}
                          </p>
                        </div>

                        <button className="ml-2 p-1 rounded-full hover:bg-surface/50 transition-colors">
                          <LuChevronDown
                            className={`w-5 h-5 text-secText transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </motion.div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-surface/20 border-t border-border/50"
                          >
                            <div className="w-full flex justify-center mb-4">
                              {imageError[nft.id] ? (
                                <div className="w-64 h-64 flex items-center justify-center bg-surface/30 rounded-lg">
                                  <LuImage className="w-16 h-16 text-secText" />
                                </div>
                              ) : (
                                <motion.img
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                  className="max-h-64 rounded-lg object-contain"
                                  src={nft.files[0]?.uri}
                                  alt={nft.name}
                                  onError={() =>
                                    setImageError({
                                      ...imageError,
                                      [nft.id]: true,
                                    })
                                  }
                                />
                              )}
                            </div>

                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mb-4"
                            >
                              <h2 className="text-textColor font-semibold text-lg mb-2">
                                {nft.name}
                              </h2>
                              <p className="text-secText mb-4 text-sm">
                                {nft.description}
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {rarityAttribute && (
                                  <span className="px-2 py-1 rounded-md bg-primaryDark text-white text-xs font-medium">
                                    {rarityAttribute.trait_type}:{' '}
                                    {rarityAttribute.value}
                                  </span>
                                )}
                                {nft.attributes?.map(
                                  (attr, index) =>
                                    (!rarityAttribute ||
                                      attr !== rarityAttribute) && (
                                      <span
                                        key={index}
                                        className="px-2 py-1 rounded-md bg-surface/50 text-secText text-xs"
                                      >
                                        {attr.trait_type}: {attr.value}
                                      </span>
                                    )
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
          </div>

          <PaginationCountDropDown
            isOpen={paginationOpen}
            onClose={() => setPaginationOpen(false)}
            anchorEl={paginationCountRef.current!}
            currentCount={paginationCount}
            onCountChange={setPaginationCount}
          />
        </div>
      )}
    </div>
  );
};
