import {
  getAgentChanger,
  getTokenData,
  limitOrder,
  getLimitOrders,
  getAiProjectsByClassification,
  getAiProjectsByToken,
  getNFTPrice,
  getTrendingNFTs,
  getLuloAssets,
  depositLulo,
  withdrawLulo,
  swapTokens,
  transferSolTx,
  transferSpl,
  topHolders,
  bubblemap,
  rugCheck,
  tokenAddress,
  resolveSnsName,
} from '@/tools';

/**
 * Initializes all tools by importing them, which triggers their registration
 * This function doesn't need to do anything - just importing the tools will
 * cause their registration code to run
 */
export function initializeTools() {
  // The imports above will trigger tool registration
  console.log('Tool initialization started');

  const tools = [
    // Agent swapper
    getAgentChanger,

    // Token Analyst tools
    getTokenData,
    limitOrder,
    getLimitOrders,
    topHolders,
    bubblemap,
    rugCheck,
    tokenAddress,

    // GoatIndex tools
    getAiProjectsByClassification,
    getAiProjectsByToken,

    // NFT Analyst tools
    getNFTPrice,
    getTrendingNFTs,

    // Lulo Agent tools
    getLuloAssets,
    depositLulo,
    withdrawLulo,

    // OnChain Handler tools
    resolveSnsName,
    swapTokens,
    transferSolTx,
    transferSpl,
  ];

  console.log(`Initialized ${tools.length} tools`);

  return true;
}
