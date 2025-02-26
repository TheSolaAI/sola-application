import { create } from 'zustand';
import { Agent } from '../types/agent.ts';
import { Atom, ChartNetwork, Wallet } from 'lucide-react';
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
  walletActions,
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
        getAgentSwapper,
        // walletActions,
        getTokenData,
        getLstData,
        // getMarketData,
        // getBlinks,
        limitOrder,
        getLimitOrders,
      ],
    },
    {
      name: 'GoatIndex',
      slug: 'goatindex',
      description: 'Agent to analyse AI projects using GoatIndex',
      logo: GiGoat,
      tools: [
        getAgentSwapper,
        // walletActions,
        swapTokens,
        getAiProjectsByClassification,
        getAiProjectsByToken,
        getAiProjectsMindshare,
      ],
    },
    {
      name: 'NFT Analyst',
      slug: 'nft-analyst',
      description: 'Designed for NFT-related tasks and price queries.',
      logo: Atom,
      tools: [
        getAgentSwapper,
        walletActions,
        getNFTPrice,
        getTrendingNFTs,
        // getNFTLaunchpad,
        // getMarketData,
        getBlinks,
      ],
    },
    {
      name: 'DAM',
      slug: 'dam',
      description:
        'DeFi Asset Manager - for Lulo operations and LST operations.',
      logo: Wallet,
      tools: [
        getAgentSwapper,
        // walletActions,
        transferSolTx,
        transferSpl,
        // getMarketData,
        getLuloAssets,
        depositLulo,
        withdrawLulo,
        swapLST,
        // getBlinks,
      ],
    },
  ],
  currentActiveAgent: null,

  setCurrentActiveAgent: (agent: Agent | null) => {
    getState().currentActiveAgent = agent;

  },
}));
