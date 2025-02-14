import { create } from 'zustand';
import { Agent } from '../types/agent.ts';
import { Atom, ChartNetwork, Wallet } from 'lucide-react';
import {
  depositLulo,
  getBlinks,
  getBubblemap,
  getLimitOrders,
  getLstData,
  getLuloAssets,
  // getMarketData,
  getNFTLaunchpad,
  getNFTPrice,
  getRugCheck,
  getTokenData,
  getTopHolders,
  getTrendingNFTs,
  limitOrder,
  swapLST,
  swapTokens,
  transferSolTx,
  transferSpl,
  walletActions,
  withdrawLulo,
} from '../tools';
import { Tool } from '../types/tool.ts';

interface AgentHandler {
  agents: Agent[];
  getToolsForAgent: (agentId: number) => Tool[]; // Returns the tools array for a given agent ID
}

export const useAgentHandler = create<AgentHandler>((_setState, getState) => ({
  agents: [
    {
      agentID: 1,
      name: 'Token Analyst',
      description: 'Designed for deep token analysis and trading experience.',
      logo: ChartNetwork,
      tools: [
        // walletActions,
        getTokenData,
        getTopHolders,
        getRugCheck,
        getBubblemap,
        getLstData,
        swapLST,
        // getMarketData,
        // getBlinks,
        limitOrder,
        getLimitOrders,
      ],
    },
    {
      agentID: 2,
      name: 'NFT Analyst',
      description: 'Designed for NFT-related tasks and price queries.',
      logo: Atom,
      tools: [
        walletActions,
        // getNFTPrice,
        // getTrendingNFTs,
        // getNFTLaunchpad,
        // getMarketData,
        getBlinks,
      ],
    },
    {
      agentID: 3,
      name: 'DAM',
      description:
        'DeFi Asset Manager - for Lulo operations and LST management.',
      logo: Wallet,
      tools: [
        // walletActions,
        swapTokens,
        transferSolTx,
        transferSpl,
        // getMarketData,
        getLuloAssets,
        depositLulo,
        withdrawLulo,
        getLstData,
        swapLST,
        // getBlinks,
      ],
    },
  ],

  getToolsForAgent: (agentId: number) => {
    return (
      getState().agents.find((agent) => agent.agentID === agentId)?.tools || []
    );
  },
}));
