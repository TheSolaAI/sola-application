import { Tool } from '../types/tool.ts';
import { useAgentHandler } from '../models/AgentHandler.ts';
import { useSessionHandler } from '../models/SessionHandler.ts';
import { AgentSwapChatContent } from '../types/chatItem.ts';

const functionDescription =
  "Use this function when the current user request cannot be fulfilled by the current agent tools that you have. Only call this function if the user's request falls within the context of the agents you support. Do not call this function if the user request falls outside of the agent contexts you possess.";

export const getAgentSwapper: Tool = {
  cost: 0, // the agent swapper is free
  implementation: getAgentSwapperFunction,
  abstraction: {
    type: 'function',
    name: 'getAgentSwapper',
    description: functionDescription,
    parameters: {
      type: 'object',
      required: ['agent'],
      properties: {
        agent: {
          type: 'string',
          description: 'The agent you want to switch to.',
          enum: [
            'token-analyst',
            'goatindex',
            'nft-analyst',
            'lulo-agent',
            'dam',
          ],
        },
        original_request: {
          type: 'string',
          description:
            'The original request that prompted the agent switch as is without any modifications',
        },
      },
    },
  },
};

function getAgentSwapperFunction(
  args: { agent: string; original_request: string },
  response_id: string,
): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: AgentSwapChatContent;
}> {
  useAgentHandler
    .getState()
    .setCurrentActiveAgent(
      useAgentHandler
        .getState()
        .agents.find((agent) => agent.slug === args.agent) ?? null,
    );
  useSessionHandler.getState().updateSession();
  return Promise.resolve({
    status: 'success',
    response: `Switched to ${args.agent} agent`,
    props: {
      sender: 'system',
      type: 'agent_swap',
      original_request: args.original_request,
      response_id: response_id,
    },
  });
}
