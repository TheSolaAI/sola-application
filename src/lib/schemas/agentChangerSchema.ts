import { z } from 'zod';

export const agentChangerSchema = z.object({
  agent: z.string().min(1, 'The agent you want to switch to.'),
  original_request: z
    .string()
    .min(
      1,
      'The original request that prompted the agent switch as is without any modifications'
    ),
});
