import { ToolContext, ToolSetDescription } from '@/types/tool';
import {
  createExecuteBlinkActionTool,
  createInspectBlinkTool,
} from './actions';

export const blinksToolSet: ToolSetDescription = {
  slug: 'blinks',
  name: 'Blinks',
  description:
    'Tools for inspecting and executing Solana Blinks (Blockchain Actions) and Blink games hands-free via voice or chat commands.',
};

export const getBlinksToolSet = (context: ToolContext) => {
  return {
    ...blinksToolSet,
    tools: {
      inspectBlink: createInspectBlinkTool(context),
      executeBlinkAction: createExecuteBlinkActionTool(context),
    },
  };
};
