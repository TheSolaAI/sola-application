import { create } from 'zustand';
import { ChartNetwork, Atom, Wallet } from 'lucide-react';

export interface Agent {
  agentID: number;
  name: string;
  description: string;
  logo: React.ElementType;
}

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
    },
    {
      agentID: 2,
      name: 'NFT Analyst',
      description: 'Designed for NFT realted tasks and Price related queries.',
      logo: Atom,
    },
    {
      agentID: 3,
      name: 'DAM',
      description:
        'DeFi Asset Manager - for Lulo operations and LST management.',
      logo: Wallet,
    },
  ],
}));
