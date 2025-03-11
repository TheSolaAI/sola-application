import { z } from 'zod';
import { getToolByName } from './registry/toolRegistry';

export async function executeToolCall(
  toolName: string,
  args: any,
  response_id: string
) {
  const tool = getToolByName(toolName);

  if (!tool) {
    console.error(`Tool ${toolName} not found`);
    return {
      status: 'error' as const,
      response: `Tool ${toolName} not found`,
    };
  }

  try {
    // Validate args using the tool's schema
    const validatedArgs = tool.schema.parse(args);

    // Execute the tool with validated args
    const result = await tool.implementation(validatedArgs, response_id);

    // Return the result
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Validation error for tool ${toolName}:`, error.errors);
      return {
        status: 'error' as const,
        response: `Validation error for tool ${toolName}: ${error.errors.map((e) => e.message).join(', ')}`,
      };
    }

    console.error(`Error executing tool ${toolName}:`, error);
    return {
      status: 'error' as const,
      response: `Error executing tool ${toolName}`,
    };
  }
}
