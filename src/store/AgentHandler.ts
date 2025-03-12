'use client';
import { create } from 'zustand';
import { Agent } from '@/types/agent';
import { BiAtom } from 'react-icons/bi';
import { LuChartNetwork, LuFolderKanban } from 'react-icons/lu';
import { FaWallet } from 'react-icons/fa';
import { GiGoat } from 'react-icons/gi';
import { registerAgent, getAgentTools } from '@/lib/registry/agentRegistry';

// Define agents using the registry
const tokenAnalyst = registerAgent({
  name: 'Token Analyst',
  slug: 'token-analyst',
  description: 'Designed for deep token analysis and trading experience.',
  logo: LuChartNetwork,
  tools: [
    { name: 'getTokenData', propsType: 'token_data' },
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
  agents: [tokenAnalyst],
  currentActiveAgent: null,

  setCurrentActiveAgent: (agent: Agent | null) => {
    set({ currentActiveAgent: agent });
  },

  getAgentTools: (slug: string) => {
    return getAgentTools(slug);
  },
}));
