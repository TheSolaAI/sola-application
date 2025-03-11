import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export function createFunctionDefinition(
  name: string,
  schema: z.ZodTypeAny,
  description: string
) {
  const jsonSchema = zodToJsonSchema(schema, {
    target: 'openApi3',
    $refStrategy: 'none',
  });

  return {
    type: 'function' as const,
    name,
    description,
    parameters: jsonSchema,
  };
}
