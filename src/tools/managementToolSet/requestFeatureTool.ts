import { ToolContext, ToolResult } from '@/types/tool';
import { z } from 'zod';

export const createRequestFeatureTool = (context: ToolContext) => {
  const Parameters = z.object({
    feature: z.string().describe('The Name of the feature to be requested'),
    description: z.string().describe('Description of the feature'),
    additionalInfo: z
      .string()
      .describe(
        'Any additional information inferred from the context of the request about this feature'
      ),
  });

  type ParametersType = z.infer<typeof Parameters>;

  return {
    name: 'request-feature',
    description:
      'Generate a new feature request for the Sola application and let the user manually submit it to GitHub.',
    parameters: Parameters,
    execute: async (params: ParametersType): Promise<ToolResult> => {
      try {
        const { feature, description, additionalInfo } = params;

        // Create query parameters for each field in the template
        const queryParams = new URLSearchParams({
          template: 'feature-request.yml',
          title: `[Feature Request]: ${feature}`,
          'feature-description': description,
          'problem-solution': 'This feature would improve user experience.',
          'proposed-solution': description,
        });

        // Add additional context if provided
        if (additionalInfo) {
          queryParams.append('additional-context', additionalInfo);
        }
        const issueUrl = `https://github.com/TheSolaAI/sola-application/issues/new?${queryParams.toString()}`;

        return {
          success: true,
          data: {
            url: issueUrl,
            feature,
            description,
            additionalInfo,
          },
          message:
            'DO NOT TELL THE USER THE FEATURE REQUEST IS SUBMITTED, THEY NEED TO MANUALLY CLICK THE SUBMIT BUTTON',
          error: undefined,
        };
      } catch (error) {
        console.error('Error creating feature request:', error);
        return {
          data: null,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred while creating the feature request.',
        };
      }
    },
  };
};
