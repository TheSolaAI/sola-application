import { depositLulo } from '../functions/depositLulo';
import { getBlinks } from '../functions/getBlinks';
import { getBubblemap } from '../functions/getBubblemap';
import { getNFTLaunchpad } from '../functions/getLaunchpadCollections';
import { getLstData } from '../functions/getLstData';
import { getLuloAssets } from '../functions/getLuloAssets';
import { getMarketData } from '../functions/getMarketData';
import { getNFTPrice } from '../functions/getNFTPrice';
import { getRugCheck } from '../functions/getRugCheck';
import { getTokenData } from '../functions/getTokenData';
import { getTopHolders } from '../functions/getTopHolders';
import { getTrendingNFTs } from '../functions/getTrendingNFTs';
import { swapLST } from '../functions/swapLSTfromClick';
import { swapTokens } from '../functions/swapTokens';
import { transferSolTx } from '../functions/transferSolTx';
import { transferSpl } from '../functions/transferSpl';
import { walletActions } from '../functions/walletActions';
import { withdrawLulo } from '../functions/withdrawLulo';
import { limitOrder } from '../functions/limitOrder';
import { getLimitOrders } from '../functions/getLimitOrder';

export const nftAnalyst = [
  walletActions,
  getNFTPrice,
  getTrendingNFTs,
  getNFTLaunchpad,
  getMarketData,
  getBlinks,
];

export const tokenAnalyst = [
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

export const DAM = [
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

agentConfig.set(1, tokenAnalyst);
agentConfig.set(2, nftAnalyst);
agentConfig.set(3, DAM);
