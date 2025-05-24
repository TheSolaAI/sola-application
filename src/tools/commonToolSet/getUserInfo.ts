import { ToolResult } from '@/types/tool';
import { Tool } from 'ai';
import { z } from 'zod';

const GetUserInfoSchema = z.object({
  type: z.enum(['wallet']).describe('The type of user data required'),
});

export type GetUserInfoType = z.infer<typeof GetUserInfoSchema>;

export function createGetUserInfoTool() {
  const getUserInfoTool: Tool<typeof GetUserInfoSchema, ToolResult> = {
    id: 'common.userinfo' as const,
    description: 'Get the user saved details and wallet address.',
    parameters: GetUserInfoSchema,
  };

  return getUserInfoTool;
}
