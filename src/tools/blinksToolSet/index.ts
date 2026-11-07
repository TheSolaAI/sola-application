import { ToolSetDescription } from '@/types/tool';
import {
  BlinksToolContext,
  createExecuteBlinkActionTool,
} from './executeBlinkAction';

// Describes the Blinks toolset so the AI orchestrator routes Solana Action and
// Blink URLs to handsfree action inspection and transaction initiation.
export const blinksToolSet: ToolSetDescription = {
  slug: 'blinks',
  name: 'Blinks',
  description:
    'Tools for inspecting, initiating, and executing Solana Blinks (Blockchain Links) and Solana Actions handsfree via voice or chat commands.',
};

export const getBlinksToolSet = (context: BlinksToolContext = {}) => {
  return {
    ...blinksToolSet,
    tools: {
      executeBlinkAction: createExecuteBlinkActionTool(context),
    },
  };
};
