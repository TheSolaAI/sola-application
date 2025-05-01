// filepath: /run/media/guhan_sensam/Dev/sola-application/src/tools/managementToolSet/reportBugTool.ts
import { ToolContext, ToolResult } from '@/types/tool';
import { z } from 'zod';

export const createReportBugTool = (context: ToolContext) => {
  const Parameters = z.object({
    title: z.string().describe('Short title describing the bug'),
    description: z.string().describe('Detailed description of the bug'),
    stepsToReproduce: z.string().describe('Steps to reproduce the bug'),
    expectedBehavior: z.string().describe('What was the expected behavior'),
    actualBehavior: z.string().describe('What actually happened'),
    additionalInfo: z
      .string()
      .describe('Any additional context, error messages, or screenshots'),
  });

  type ParametersType = z.infer<typeof Parameters>;

  return {
    name: 'report-bug',
    description:
      'Generate a bug report for the application and let the user manually submit it to GitHub',
    parameters: Parameters,
    execute: async (params: ParametersType): Promise<ToolResult> => {
      try {
        const {
          title,
          description,
          stepsToReproduce,
          expectedBehavior,
          actualBehavior,
          additionalInfo,
        } = params;

        // Create query parameters for each field in the template
        const queryParams = new URLSearchParams({
          template: 'bug-report.yml',
          title: `[Bug]: ${title}`,
          'bug-description': description,
          'steps-to-reproduce': stepsToReproduce,
          'expected-behavior': expectedBehavior,
          'actual-behavior': actualBehavior,
        });
        if (additionalInfo) {
          queryParams.append('additional-context', additionalInfo);
        }

        const issueUrl = `https://github.com/TheSolaAI/sola-application/issues/new?${queryParams.toString()}`;

        return {
          success: true,
          data: {
            url: issueUrl,
            title,
            description,
            stepsToReproduce,
            expectedBehavior,
            actualBehavior,
            additionalInfo,
          },
          message:
            'DO NOT TELL THE USER THE BUG REPORT IS SUBMITTED, THEY NEED TO MANUALLY CLICK THE SUBMIT BUTTON',
          error: undefined,
        };
      } catch (error) {
        console.error('Error reporting bug:', error);
        return {
          data: null,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred while reporting the bug.',
        };
      }
    },
  };
};
