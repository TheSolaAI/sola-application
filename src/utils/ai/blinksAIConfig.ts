import { Action } from '@solana/actions';

export interface BlinksAIConfigTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: Record<string, any>, context?: any) => Promise<any>;
}

export const createHandsfreeBlinkTool = (executeActionFn: (params: Record<string, any>) => Promise<any>): BlinksAIConfigTool => {
  return {
    name: 'trigger_handsfree_blink',
    description: 'Triggers a Solana Blink action handsfree via AI config tools.',
    parameters: {
      type: 'object',
      properties: {
        actionParameters: {
          type: 'object',
          description: 'Parameters required by the blink action',
        },
      },
      required: [],
    },
    execute: async (params: Record<string, any>) => {
      try {
        const result = await executeActionFn(params.actionParameters || {});
        return {
          success: true,
          result,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Unknown error during handsfree blink execution',
        };
      }
    },
  };
};
