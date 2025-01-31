import { create } from 'zustand';

export interface Agent {
  agentID: string;
  name: string;
  description: string;
  logo: string;
}

interface AgentHandler {
  agents: Agent[];
}

// TODO: Add Proper Agent fetching and handling

export const useAgentHandler = create<AgentHandler>(() => ({
  agents: [
    {
      agentID: '1',
      name: 'Agent 1',
      description: 'Designed for trading and quick reactions',
      logo: 'https://avatar.iran.liara.run/public/43',
    },
    {
      agentID: '2',
      name: 'Agent 2',
      description:
        'Designed for deep market analysis with a focus on long-term investments',
      logo: 'https://avatar.iran.liara.run/public/42',
    },
    {
      agentID: '3',
      name: 'Agent 3',
      description:
        'Designed for high-risk trading and quick profits. Smasher has an aggresive trading strategy',
      logo: 'https://avatar.iran.liara.run/public/37',
    },
  ],
}));
