import { ToolContext, ToolSetDescription } from '@/types/tool';
import { createGetBlinkActionTool } from './getBlinkAction';
import { createExecuteBlinkActionTool } from './executeBlinkAction';

export const blinksToolSet: ToolSetDescription = {
  slug: 'blinks',
  name: 'blinks_tools',
  description:
    'Tools to load and initiate Blink (Solana Action) games and dApp actions directly, hands-free, without the default click-through Blink widget.',
};

export const getBlinksToolSet = (context: ToolContext) => {
  return {
    ...blinksToolSet,
    tools: {
      getBlinkAction: createGetBlinkActionTool(),
      executeBlinkAction: createExecuteBlinkActionTool(context),
    },
  };
};
