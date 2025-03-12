'use client';

import { registerTool } from '@/lib/registry/toolRegistry';
import { AiProjects } from '@/components/messages/AiProjects';
import { AiProjectsChatContent } from '@/types/chatItem';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ApiClient, apiClient } from '@/lib/ApiClient';
import { toast } from 'sonner';
import { GoatIndexTopAiProjectsApiResponse } from '@/types/goatIndex';

async function handleGetAiProjectsByClassification(
  _args: Record<string, never>,
  response_id: string
): Promise<{
  status: 'success' | 'error';
  response: string;
  props?: AiProjectsChatContent;
}> {
  useChatMessageHandler.getState().setCurrentChatItem({
    content: {
      type: 'loader_message',
      text: `GoatIndex agent: Fetching AI projects...`,
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
      'goatIndex'
    );

    if (ApiClient.isApiError(response)) {
      console.error(response);
      return {
        status: 'error',
        response: 'Error getting AI projects.',
      };
    }

    return {
      status: 'success',
      response: `Notify the successful fetch. Do add any custom information and refrain from responding anything other than successfully fetched data`,
      props: {
        response_id,
        sender: 'system',
        type: 'ai_projects_classification',
        category: 'tokensByMindShare',
        tokensByMindShare: response.data.data.topTokensOrderByMindShareIn6h,
      },
    };
  } catch (e) {
    console.log(e);
    toast.error('Error getting AI projects.');
    return {
      status: 'error',
      response: 'Error getting AI projects.',
    };
  }
}

export const getAiProjectsByClassification = registerTool({
  name: 'getAiProjectsByClassification',
  description: 'To get the top AI projects',
  propsType: 'ai_projects_classification',
  cost: 0.00001,
  implementation: handleGetAiProjectsByClassification,
  component: AiProjects,
  customParameters: {
    type: 'object',
    properties: {},
    // No required parameters as the function doesn't take any inputs
  },
});
