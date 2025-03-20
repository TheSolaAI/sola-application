import { useAgentHandler } from '@/store/AgentHandler';
import { useSessionHandler } from '@/store/SessionHandler';
import { AgentSwapChatContent } from '@/types/chatItem';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { registerTool } from '@/lib/registry/toolRegistry';

export const getAgentChanger = registerTool({
  name: 'getAgentChanger',
  description:
    'Use this function when the current user request cannot be fulfilled by the current agent',
  propsType: 'agent_swap',
  cost: 0.00001,
  implementation: getAgentChangerFunction,
  component: undefined,
  customParameters: {
    type: 'object',
    required: ['agent', 'original_request'],
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
});

function getAgentChangerFunction(
  args: { agent: string; original_request: string },
  response_id: string
): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: AgentSwapChatContent;
}> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `Finding the suitable agent...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  useAgentHandler
    .getState()
    .setCurrentActiveAgent(
      useAgentHandler
        .getState()
        .agents.find((agent) => agent.slug === args.agent) ?? null
    );
  useSessionHandler.getState().updateSession('tools');
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
