import { Tool } from '../../types/tool.ts';
import { AiProjects } from '../../components/ui/message_items/AiProjects.tsx';
import { AiProjectsChatContent } from '../../types/chatItem.ts';
import { useChatMessageHandler } from '../../models/ChatMessageHandler.ts';
import { ApiClient, apiClient } from '../../api/ApiClient.ts';
import { toast } from 'sonner';
import { AIProjectRankingApiResponse } from '../../types/goatIndex.ts';

const functionDescription = 'To get the AI projects by token status';

export const getAiProjectsByToken: Tool = {
  implementation: handleGetAiProjectsByToken,
  representation: {
    props_type: 'ai_projects_classification',
    component: AiProjects,
  },
  abstraction: {
    type: 'function',
    name: 'getAiProjectsByToken',
    description: functionDescription,
    parameters: {
      withToken: {
        type: 'boolean',
        description: 'get ai projects with token or without token',
      },
      required: ['withToken'],
    },
  },
};

export async function handleGetAiProjectsByToken(args: {
  withToken: boolean;
}): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: AiProjectsChatContent;
}> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'simple_message',
      text: `Fetching AI projects...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  try {
    const response = await apiClient.post<AIProjectRankingApiResponse>(
      '/api/agent/rankings',
      {
        sortByColumn: 'mindShare',
        sortDirection: 'desc',
        filter: {
          status: [`${args.withToken ? 'HAS_TOKEN' : 'NO_TOKEN'}`],
        },
        dataSource: 'AI_INDEX',
        timeDimension: 'HOUR_6',
        page: 1,
        limit: 15,
      },
      'goatIndex',
    );

    if (ApiClient.isApiError(response)) {
      console.error(response);
      return {
        status: 'error',
        response: 'Error getting AI projects.',
      };
    }

    console.log(response);

    return {
      status: 'success',
      response: `Successfully fetched top agent details.`,
      props: {
        response_id: 'topAiProjects',
        sender: 'system',
        type: 'ai_projects_classification',
        category: 'tokenByRanking',
        projectsByRanking: response.data.results,
      },
    };
  } catch (e) {
    toast.error('Error getting AI projects.');
    return {
      status: 'error',
      response: 'Error getting AI projects.',
    };
  }
}
