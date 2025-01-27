import { getNFTLaunchpad } from './functions/getLaunchpadCollections';
import { swapTokens } from './functions/swapTokens';
import { getLuloAssets } from './functions/getLuloAssets';
import { depositLulo } from './functions/depositLulo';
import { withdrawLulo } from './functions/withdrawLulo';
import { transferSolTx } from './functions/transferSolTx';
import { getTokenData } from './functions/getTokenData';
import { getLstData } from './functions/getLstData';
import { getNFTPrice } from './functions/getNFTPrice';
import { getTrendingNFTs } from './functions/getTrendingNFTs';
import { swapLST } from './functions/swapLSTfromClick';
import { transferSpl } from './functions/transferSpl';
import { getRugCheck } from './functions/getRugCheck';
import { getMarketData } from './functions/getMarketData';
import { getBubblemap } from './functions/getBubblemap';
import { getBlinks } from './functions/getBlinks';
import { walletActions } from './functions/walletActions';

export const createToolsConfig = (aiVoice: string, aiEmotion: string) => {
  const instructions = `
    You are Sola AI, a voice assistant specializing in the Solana blockchain and its ecosystem, powered by the SOLA token. Your role is to provide accurate, real-time information and actionable advice in a professional, teacher-like tone.

    Key Guidelines:
    - Be ${aiEmotion},dont repeat words from ${aiEmotion} and be concise, elaborating only when necessary.
    - Access online sources for accuracy and cite reputable links when needed.
    - Clearly report execution failures without retries, offering alternatives instead.
    - Educate users about DeFi risks while guiding them to tools and platforms.
    - Adapt explanations to the user’s expertise and answer follow-up questions patiently.

    Focus on empowering users to explore the Solana ecosystem confidently.
  `;

  return {
    type: 'session.update',
    session: {
      modalities: ['text', 'audio'],
      instructions,
      voice: aiVoice.toLowerCase(),
      tools: [
        walletActions,
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
      ],
      tool_choice: 'auto',
      temperature: 0.6,
    },
  };
};
