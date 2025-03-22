import React, { ReactNode } from 'react';
import { z } from 'zod';

export interface ToolConfig {
  displayName?: string;
  icon?: ReactNode;
  description: string;
  parameters: z.ZodType<any>;
  execute?: <T>(
    params: z.infer<T extends z.ZodType ? T : never>
  ) => Promise<any>;
  render?: (result: unknown) => React.ReactNode | null;
  requiredEnvVars?: string[];
}
