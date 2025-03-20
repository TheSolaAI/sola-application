import { z } from 'zod';

export const tokenDataSchema = z.object({
  token_address: z.string().min(1, 'Token address is required'),
});
