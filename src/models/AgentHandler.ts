import { create } from 'zustand';
import { Atom, ChartNetwork, Wallet } from 'lucide-react';
import { Agent } from '../types/agent';
import {
  DAMAnalytsTools,
  nftAgentTools,
  tokenAnalystTools,
} from '../tools/config.ts';

interface AgentHandler {
  agents: Agent[];
}

// TODO: Add Proper Agent fetching and handling

export const useAgentHandler = create<AgentHandler>(() => ({
  agents: [
    {
      agentID: 1,
      name: 'Token Analyst',
      description: 'Designed for deep token analysis and trading experience.',
      logo: ChartNetwork,
      tools: tokenAnalystTools,
    },
    {
      agentID: 2,
      name: 'NFT Analyst',
      description: 'Designed for NFT realted tasks and Price related queries.',
      logo: Atom,
      tools: nftAgentTools,
    },
    {
      agentID: 3,
      name: 'DAM',
      description:
        'DeFi Asset Manager - for Lulo operations and LST management.',
      logo: Wallet,
      tools: DAMAnalytsTools,
    },
  ],
}));
