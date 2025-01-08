import { addCalenderEvent } from './functions/addCalenderEvent';
import { getNFTLaunchpad } from './functions/getLaunchpadCollections';
import { swapTokens } from './functions/swapTokens';
import { toggleWallet } from './functions/toggleWallet';
import { getLuloAssets } from './functions/getLuloAssets';
import { depositLulo } from './functions/depositLulo';
import { withdrawLulo } from './functions/withdrawLulo';
import { transferSolTx } from './functions/transferSolTx';
import { getTokenData } from './functions/getTokenData';
import { getLstData } from './functions/getLstData';
import { getNFTPrice } from './functions/getNFTPrice';
import { getTrendingNFTs } from './functions/getTrendingNFTs';
import { getTokenDataSymbol } from './functions/getTokenDataSymbol';

const instructions = `
You are a personalized Solana blockchain assistant.
You can answer user queries and help the user find and execute the best tool for their queries.
Be precise.
If any function execution fails, do not try it again and again.
Just inform the user that there is a problem with that particular execution.
`;

export const tools = {
  type: 'session.update',
  session: {
    modalities: ['text', 'audio'],
    instructions: instructions,
    voice: 'sage',
    tools: [
      toggleWallet,
      swapTokens,
      addCalenderEvent,
      getNFTLaunchpad,
      getLuloAssets,
      depositLulo,
      withdrawLulo,
      transferSolTx,
      getTokenData,
      getLstData,
      getNFTPrice,
      getTrendingNFTs,
      getTokenDataSymbol,
    ],
    tool_choice: 'auto',
    temperature: 0.6,
  },
};
