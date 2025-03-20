'use client';
import { registerTool } from '@/lib/registry/toolRegistry';
import { AiProjects } from '@/components/messages/AiProjects';
import { useChatMessageHandler } from '@/store/ChatMessageHandler';
import { ApiClient, apiClient } from '@/lib/ApiClient';
import { toast } from 'sonner';
import { AIProjectRankingApiResponse } from '@/types/goatIndex';
import { ToolResult } from '@/types/tool';

// Implementation function with response_id parameter
async function handleGetAiProjectsByToken(
  args: { withToken: boolean },
  response_id: string
): Promise<ToolResult<'ai_projects_classification'>> {
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
        response_id: response_id,
        sender: 'system',
        type: 'ai_projects_classification',
        category: 'tokenByRanking',
        projectsByRanking: response.data.data.data,
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

// Register the tool using the registry
export const getAiProjectsByToken = registerTool({
  name: 'getAiProjectsByToken',
  description: 'To get the AI projects by token status',
  propsType: 'ai_projects_classification',
  cost: 0.00001,
  implementation: handleGetAiProjectsByToken,
  component: AiProjects,
  customParameters: {
    type: 'object',
    properties: {
      withToken: {
        type: 'boolean',
        description: 'get ai projects with token or without token',
      },
    },
    required: ['withToken'],
  },
});
