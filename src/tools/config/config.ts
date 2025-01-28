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
import { getTrendingNFTs } from '../functions/getTrendingNFTs';
import { swapLST } from '../functions/swapLSTfromClick';
import { swapTokens } from '../functions/swapTokens';
import { transferSolTx } from '../functions/transferSolTx';
import { transferSpl } from '../functions/transferSpl';
import { walletActions } from '../functions/walletActions';
import { withdrawLulo } from '../functions/withdrawLulo';

export const freeTools = [walletActions,
        swapTokens,
        getNFTLaunchpad,
        getLuloAssets,
        depositLulo,
        withdrawLulo,
        transferSolTx,
        getTokenData,
        getLstData,
        getNFTPrice,
        getTrendingNFTs,
        swapLST,
        transferSpl,
        getRugCheck,
        getMarketData,
        getBubblemap,
        getBlinks,];
export const fullTools = [
    swapTokens,
        getNFTLaunchpad,
        getLuloAssets,
        depositLulo,
        withdrawLulo,
        transferSolTx,
        getTokenData,
        getLstData,
        getNFTPrice,
        getTrendingNFTs,
        swapLST,
        transferSpl,
        getRugCheck,
        getMarketData,
        getBubblemap,
        getBlinks,
];
