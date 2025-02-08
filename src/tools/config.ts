import { depositLulo } from './functions/depositLulo.ts';
import { getBlinks } from './functions/getBlinks.ts';
import { getBubblemap } from './functions/getBubblemap.ts';
import { getNFTLaunchpad } from './functions/getLaunchpadCollections.ts';
import { getLstData } from './functions/getLstData.ts';
import { getLuloAssets } from './functions/getLuloAssets.ts';
import { getMarketData } from './functions/getMarketData.ts';
import { getNFTPrice } from './functions/getNFTPrice.ts';
import { getRugCheck } from './functions/getRugCheck.ts';
import { getTokenData } from './functions/getTokenData.ts';
import { getTopHolders } from './functions/getTopHolders.ts';
import { getTrendingNFTs } from './functions/getTrendingNFTs.ts';
import { swapLST } from './functions/swapLSTfromClick.ts';
import { swapTokens } from './functions/swapTokens.ts';
import { transferSolTx } from './functions/transferSolTx.ts';
import { transferSpl } from './functions/transferSpl.ts';
import { walletActions } from './functions/walletActions.ts';
import { withdrawLulo } from './functions/withdrawLulo.ts';
import { limitOrder } from './functions/limitOrder.ts';
import { getLimitOrders } from './functions/getLimitOrder.ts';

export const nftAgentTools = [
  walletActions,
  getNFTPrice,
  getTrendingNFTs,
  getNFTLaunchpad,
  getMarketData,
  getBlinks,
];

export const tokenAnalystTools = [
  walletActions,
  getTokenData,
  getTopHolders,
  getRugCheck,
  getBubblemap,
  getLstData,
  swapLST,
  getMarketData,
  getBlinks,
  limitOrder,
  getLimitOrders,
];

export const DAMAnalytsTools = [
  walletActions,
  swapTokens,
  transferSolTx,
  transferSpl,
  getMarketData,
  getLuloAssets,
  depositLulo,
  withdrawLulo,
  getLstData,
  swapLST,
  getBlinks,
];

export let agentConfig = new Map<number, any[]>();

agentConfig.set(1, tokenAnalystTools);
agentConfig.set(2, nftAgentTools);
agentConfig.set(3, DAMAnalytsTools);
