'use client';
import { create } from 'zustand';
import { Agent } from '@/types/agent';
import { BiAtom } from 'react-icons/bi';
import { LuChartNetwork, LuFolderKanban } from 'react-icons/lu';
import { FaWallet } from 'react-icons/fa';
import { GiGoat } from 'react-icons/gi';
import { registerAgent, getAgentTools } from '@/lib/registry/agentRegistry';

// Define agents using the registry
const TokenAnalyst = registerAgent({
  name: 'Token Analyst',
  slug: 'token-analyst',
  description: 'Designed for deep token analysis and trading experience.',
  logo: LuChartNetwork,
  tools: [
    { name: 'TokenAddress', propsType: 'token_address_result' },
    { name: 'getTokenData', propsType: 'token_data' },
    { name: 'Bubblemap', propsType: 'bubble_map' },
    { name: 'TopHolders', propsType: 'top_holders' },
    { name: 'RugCheck', propsType: 'rug_check' },
    { name: 'limitOrder', propsType: 'create_limit_order' },
    { name: 'getLimitOrders', propsType: 'get_limit_order' },
    { name: 'getAgentChanger', propsType: 'agent_swap' },
  ],
});

const GoatIndex = registerAgent({
  name: 'GoatIndex',
  slug: 'goatindex',
  description: 'Agent to analyse AI projects using GoatIndex',
  logo: GiGoat,
  tools: [
    {
      name: 'getAiProjectsByClassification',
      propsType: 'ai_projects_classification',
    },
    { name: 'getAiProjectsByToken', propsType: 'ai_projects_classification' },
    { name: 'getAgentChanger', propsType: 'agent_swap' },
  ],
});

const NFTAnalyst = registerAgent({
  name: 'NFT Analyst',
  slug: 'nft-analyst',
  description: 'Designed for NFT-related tasks and price queries.',
  logo: BiAtom,
  tools: [
    {
      name: 'getNFTPrice',
      propsType: 'nft_collection_data',
    },
    { name: 'getTrendingNFTs', propsType: 'get_trending_nfts' },
    { name: 'getAgentChanger', propsType: 'agent_swap' },
  ],
});

const LuloAgent = registerAgent({
  name: 'Lulo Agent',
  slug: 'lulo-agent',
  description: 'Perform operation on Lulo platform',
  logo: LuFolderKanban,
  tools: [
    {
      name: 'getLuloAssets',
      propsType: 'user_lulo_data',
    },
    { name: 'depositLulo', propsType: 'transaction_message' },
    { name: 'withdrawLulo', propsType: 'transaction_message' },
    { name: 'getAgentChanger', propsType: 'agent_swap' },
  ],
});

const OnChainHandler = registerAgent({
  name: 'OnChainHandler',
  slug: 'onchain-handler',
  description:
    'Agent to perform token swapping and token transfers (Send Tokens).',
  logo: FaWallet,
  tools: [
    { name: 'resolveSnsName', propsType: 'token_address_result' },
    { name: 'TokenAddress', propsType: 'token_address_result' },
    { name: 'swapTokens', propsType: 'swap' },
    { name: 'transferSolTx', propsType: 'transaction_message' },
    { name: 'transferSpl', propsType: 'transaction_message' },
    { name: 'getAgentChanger', propsType: 'agent_swap' },
  ],
});

interface AgentHandler {
  agents: Agent[];
  currentActiveAgent: Agent | null;
  setCurrentActiveAgent: (agent: Agent | null) => void;
  getAgentTools: (slug: string) => any[];
}

export const useAgentHandler = create<AgentHandler>((set, get) => ({
  agents: [TokenAnalyst, GoatIndex, NFTAnalyst, LuloAgent, OnChainHandler],
  currentActiveAgent: null,

  setCurrentActiveAgent: (agent: Agent | null) => {
    set({ currentActiveAgent: agent });
  },

  getAgentTools: (slug: string) => {
    return getAgentTools(slug);
  },
}));
