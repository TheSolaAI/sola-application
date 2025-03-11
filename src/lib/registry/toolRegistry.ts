import { z } from 'zod';
import { createFunctionDefinition } from '../zodToOpenAI';
import { FC } from 'react';
import { ToolPropsType, RegisteredTool, ToolResult } from '@/types/tool';
import { ChatContentType } from '@/types/chatItem';

// Base tool interface without specific schema type
interface BaseTool<T extends ToolPropsType> {
  name: string;
  description: string;
  schema: z.ZodTypeAny;
  propsType: T;
  cost?: number;
  implementation: (args: any, response_id: string) => Promise<ToolResult<T>>;
  representation?: {
    props_type: T;
    component: FC<{ props: Extract<ChatContentType, { type: T }> }>;
  };
}

// Type-safe registry without nested generics
type Registry = {
  [K in ToolPropsType]?: Map<string, BaseTool<K>>;
};

// The registry instance
const registry: Registry = {};

// Register a tool with type safety
export function registerTool<T extends ToolPropsType, S extends z.ZodTypeAny>(
  name: string,
  description: string,
  schema: S,
  propsType: T,
  cost: number | undefined,
  implementation: (
    args: z.infer<S>,
    response_id: string
  ) => Promise<ToolResult<T>>,
  component?: FC<{ props: Extract<ChatContentType, { type: T }> }>
): RegisteredTool<T> {
  if (!registry[propsType]) {
    registry[propsType] = new Map();
  }

  const typeRegistry = registry[propsType]!;

  // Create the tool with type-safe implementation but store it with a looser type
  const tool: BaseTool<T> = {
    name,
    description,
    schema,
    propsType,
    cost,
    implementation: implementation as any, // Type assertion because we can't properly express this constraint
    representation: component
      ? {
          props_type: propsType,
          component,
        }
      : undefined,
  };

  typeRegistry.set(name, tool);

  // Return the OpenAI-compatible tool
  return {
    abstraction: createFunctionDefinition(name, schema, description),
    cost,
    implementation: implementation as any, // Same type assertion
    representation: tool.representation,
  };
}

// Get a tool by name and type
export function getTool<T extends ToolPropsType>(
  name: string,
  propsType: T
): BaseTool<T> | undefined {
  return registry[propsType]?.get(name);
}

// Get tool by name
export function getToolByName(name: string): BaseTool<any> | undefined {
  for (const [_, typeMap] of Object.entries(registry)) {
    if (typeMap?.has(name)) {
      return typeMap.get(name);
    }
  }
  return undefined;
}

// Get all tools with a simpler return type
export function getAllTools(): BaseTool<ToolPropsType>[] {
  const result: BaseTool<ToolPropsType>[] = [];

  for (const typeMap of Object.values(registry)) {
    if (typeMap) {
      for (const tool of typeMap.values()) {
        result.push(tool as BaseTool<ToolPropsType>);
      }
    }
  }

  return result;
}

// Get all tool abstractions for OpenAI
export function getAllToolAbstractions() {
  return getAllTools().map((tool) =>
    createFunctionDefinition(tool.name, tool.schema, tool.description)
  );
}
