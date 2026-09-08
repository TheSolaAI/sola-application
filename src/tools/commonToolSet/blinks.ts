import { z } from 'zod';
import { Tool } from 'ai';
import { ToolResult } from '@/types/tool';

const functionDescription = `Triggers a Solana blink (blockchain action) game or action, such as coinflip, snake and ladder, or rock-paper-scissors. The blink is executed handsfree without manual clicks.`;

const Parameters = z.object({
  actionName: z
    .enum(['coinflip', 'snake', 'rockpaperscissors'])
    .describe('The game or blink action the user wants to perform.'),
});

export function createGetBlinkTool() {
  const getBlinkTool: Tool<typeof Parameters, ToolResult> = {
    id: 'blinks.getBlink' as const,
    description: functionDescription,
    parameters: Parameters,
    execute: async (params) => {
      const { actionName } = params;
      return {
        success: true,
        data: { actionName },
      };
    },
  };
  return getBlinkTool;
}
