import { create } from 'zustand';
import { Agent, AgentTool } from '../types/agent.ts';
import { Atom, ChartNetwork, Wallet } from 'lucide-react';
import {
  DAMAnalytsTools,
  nftAgentTools,
  tokenAnalystTools,
} from '../tools/config.ts';

interface AgentHandler {
  agents: Agent[];
  getToolsForAgent: (agentId: number) => AgentTool[]; // Returns the tools array for a given agent ID
}

export const useAgentHandler = create<AgentHandler>((_setState, getState) => ({
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
      description: 'Designed for NFT-related tasks and price queries.',
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

  getToolsForAgent: (agentId: number) => {
    return (
      getState().agents.find((agent) => agent.agentID === agentId)?.tools || []
    );
  },
}));
