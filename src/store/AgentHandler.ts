import { create } from 'zustand';
import { Agent } from '@/types/agent';
import { BiAtom } from "react-icons/bi";
import { LuChartNetwork, LuFolderKanban } from "react-icons/lu";
import { FaWallet } from "react-icons/fa";
import { GiGoat } from 'react-icons/gi';
import {
  depositLulo,
  getAgentChanger,
  getAiProjectsByClassification,
  getAiProjectsByToken,
  getAiProjectsMindshare,
  getBlinks,
  getLimitOrders,
  getLstData,
  getLuloAssets,
  getNFTPrice,
  getTokenData,
  getTrendingNFTs,
  limitOrder,
  swapLST,
  swapTokens,
  transferSolTx,
  transferSpl,
  // walletActions,
  withdrawLulo,
} from '@/tools';

interface AgentHandler {
  agents: Agent[];
  currentActiveAgent: Agent | null; // this is the current active agent in the session

  setCurrentActiveAgent: (agent: Agent | null) => void;
}

export const useAgentHandler = create<AgentHandler>((_setState, getState) => ({
  agents: [
    {
      name: 'Token Analyst',
      slug: 'token-analyst',
      description: 'Designed for deep token analysis and trading experience.',
      logo: LuChartNetwork,
      tools: [
        // walletActions,
        getTokenData,
        getLstData,
        // getMarketData,
        // getBlinks,
        limitOrder,
        getLimitOrders,
        getAgentChanger,
      ],
    },
    {
      name: 'GoatIndex',
      slug: 'goatindex',
      description: 'Agent to analyse AI projects using GoatIndex',
      logo: GiGoat,
      tools: [
        // walletActions,
        getAiProjectsByClassification,
        getAiProjectsByToken,
        getAiProjectsMindshare,
        getAgentChanger,
      ],
    },
    {
      name: 'NFT Analyst',
      slug: 'nft-analyst',
      description: 'Designed for NFT-related tasks and price queries.',
      logo: BiAtom,
      tools: [
        //walletActions,
        getNFTPrice,
        getTrendingNFTs,
        getBlinks,
        getAgentChanger,
      ],
    },
    {
      name: 'Lulo Agent',
      slug: 'lulo-agent',
      description: 'Perform operation on Lulo platform',
      logo: LuFolderKanban,
      tools: [
        // walletActions,
        getLuloAssets,
        depositLulo,
        withdrawLulo,
        getAgentChanger,
      ],
    },
    {
      name: 'OnChain Handler',
      slug: 'onchain-handler',
      description:
        'Agent to perform token swapping and token transfers (Send Tokens).',
      logo: FaWallet,
      tools: [
        // walletActions,
        swapTokens,
        transferSolTx,
        transferSpl,
        swapLST,
        // getBlinks,
        getAgentChanger,
      ],
    },
  ],
  currentActiveAgent: null,

  setCurrentActiveAgent: (agent: Agent | null) => {
    getState().currentActiveAgent = agent;
  },
}));
