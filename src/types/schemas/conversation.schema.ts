import { z } from 'zod';

export const TopMessageSchema = z.object({
  id: z.number(),
  text: z.string(),
  sender: z.enum(['user', 'assistant', 'system']),
  createdAt: z.string(),
  type: z.enum(['simple_message', 'user_audio_chat']),
});

export type TopMessage = z.infer<typeof TopMessageSchema>;
