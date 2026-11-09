import { ToolContext, ToolSetDescription } from '@/types/tool';
import { createExecuteBlinkActionTool } from './executeBlinkAction';

export const blinksToolSet: ToolSetDescription = {
  slug: 'blinks',
  name: 'Blinks',
  description:
    'Hands-free Solana Blinks (Blockchain Actions) toolset to inspect and trigger Blink game and DeFi actions by voice.',
};

export const getBlinksToolSet = (context: ToolContext) => {
  return {
    ...blinksToolSet,
    tools: {
      executeBlinkAction: createExecuteBlinkActionTool(context),
    },
  };
};
