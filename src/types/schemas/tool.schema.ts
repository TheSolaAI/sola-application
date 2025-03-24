import React, { ReactNode } from 'react';
import { z } from 'zod';

export interface ToolConfig {
  toolSlug?: string;
  icon?: ReactNode;
  description: string;
  parameters: z.ZodType<any>;
  execute?: <T>(
    params: z.infer<T extends z.ZodType ? T : never>
  ) => Promise<any>;
  implementation?: (result: unknown) => React.ReactNode | null;
  requiredEnvVars?: string[];
}
