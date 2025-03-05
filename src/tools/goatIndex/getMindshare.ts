import { Tool } from '../../types/tool.ts';
import { AiProjects } from '../../components/messages/AiProjects.tsx';
import { AiProjectsChatContent } from '../../types/chatItem.ts';
import { useChatMessageHandler } from '../../models/ChatMessageHandler.ts';
import { ApiClient, apiClient } from '../../api/ApiClient.ts';
import { toast } from 'sonner';
import { GoatIndexTopAiProjectsApiResponse } from '../../types/goatIndex.ts';

const functionDescription =
  'To get the mindshare of AI projects or to get the graph analysis of AI projects';

export const getAiProjectsMindshare: Tool = {
  cost: 0.00001,
  implementation: handleGetAiProjectsMindshare,
  representation: {
    props_type: 'ai_projects_classification',
    component: AiProjects,
  },
  abstraction: {
    type: 'function',
    name: 'getAiProjectsMindshare',
    description: functionDescription,
    parameters: {},
  },
};

export async function handleGetAiProjectsMindshare(): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: AiProjectsChatContent;
}> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `GoatIndex agent: Fetching AI Mindshare...`,
      response_id: 'temp',
      sender: 'system',
    },
    id: 0,
    createdAt: new Date().toISOString(),
  });

  try {
    const response = await apiClient.get<GoatIndexTopAiProjectsApiResponse>(
      '/api/agent/overview?dataSource=AI_INDEX',
      undefined,
      'goatIndex',
    );

    if (ApiClient.isApiError(response)) {
      console.error(response);
      return {
        status: 'error',
        response: 'Error getting mindshare.',
      };
    }
    console.log('ogga booga');
    return {
      status: 'success',
      response: `Notify the successful fetch. Do add any custom information and refrain from responding anythingo ther than successfully fetched data`,
      props: {
        response_id: 'topAiProjects',
        sender: 'system',
        type: 'ai_projects_classification',
        category: 'mindshare',
        tokensByMindShare: response.data.data.topTokensOrderByMindShareIn6h,
      },
    };
  } catch (e) {
    console.log('ogga booga');
    console.log('ooga error');
    toast.error('Error getting AI projects.');
    return {
      status: 'error',
      response: 'Error getting mindshare of AI projects.',
    };
  }
}
