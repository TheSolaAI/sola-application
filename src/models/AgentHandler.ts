import { create } from 'zustand';
import { Agent } from '../types/agent.ts';
import { Atom, ChartNetwork, Wallet, FolderKanban } from 'lucide-react';
import { GiGoat } from 'react-icons/gi';
import {
  depositLulo,
  getAgentSwapper,
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
} from '../tools';

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
      logo: ChartNetwork,
      tools: [
        // walletActions,
        getTokenData,
        getLstData, 
        // getMarketData,
        // getBlinks,
        limitOrder,
        getLimitOrders,
        getAgentSwapper,
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
        getAgentSwapper,
      ],
    },
    {
      name: 'NFT Analyst',
      slug: 'nft-analyst',
      description: 'Designed for NFT-related tasks and price queries.',
      logo: Atom,
      tools: [
        //walletActions,
        getNFTPrice,
        getTrendingNFTs,
        getBlinks,
        getAgentSwapper,
      ],
    },
    {
      name: 'Lulo Agent',
      slug: 'lulo-agent',
      description: 'Perform operation on Lulo platform',
      logo: FolderKanban,
      tools: [
        // walletActions,
        getLuloAssets,
        depositLulo,
        withdrawLulo,
        getAgentSwapper,
      ],
    },
    {
      name: 'OnChain Handler',
      slug: 'onchain-handler',
      description:
        'Agent to perform token swapping and token transfers (Send Tokens).',
      logo: Wallet,
      tools: [
        // walletActions,
        swapTokens,
        transferSolTx,
        transferSpl,
        swapLST,
        // getBlinks,
        getAgentSwapper,
      ],
    },
  ],
  currentActiveAgent: null,

  setCurrentActiveAgent: (agent: Agent | null) => {
    getState().currentActiveAgent = agent;
  },
}));
