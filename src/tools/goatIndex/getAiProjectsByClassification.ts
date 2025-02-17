import { Tool } from '../../types/tool.ts';
import { AiProjects } from '../../components/ui/message_items/AiProjects.tsx';

const functionDescription =
  'To get the top AI projects or AI projects related to particular category';

export const getAiProjectsByClassification: Tool = {
  implementation: handleGetAiProjectsByClassification,
  representation: {
    props_type: 'ai_projects_classification',
    component: AiProjects,
  },
  abstraction: {
    type: 'function',
    name: 'getAiProjectsByClassification',
    description: functionDescription,
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['AI_INDEX', 'HACKATHON', 'SOLANA_AGENT_KIT'],
          description: 'The category of the ai project',
        },
      },
      required: ['category'],
    },
  },
};

export async function handleGetAiProjectsByClassification() {}
