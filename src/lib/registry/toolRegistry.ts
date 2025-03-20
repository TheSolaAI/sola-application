import { z } from 'zod';
import { FC } from 'react';
import { ToolPropsType, RegisteredTool, ToolResult } from '@/types/tool';
import { ChatContentType } from '@/types/chatItem';

// Base tool interface without specific schema type
interface BaseTool<T extends ToolPropsType> {
  name: string;
  description: string;
  propsType: T;
  cost?: number;
  abstraction: {
    type: 'function';
    name: string;
    description: string;
    parameters: any;
  };
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
export function registerTool<T extends ToolPropsType, S extends z.ZodTypeAny>({
  name,
  description,
  propsType,
  cost,
  implementation,
  component,
  customParameters,
}: {
  name: string;
  description: string;
  propsType: T;
  cost?: number;
  implementation: (
    args: z.infer<S>,
    response_id: string
  ) => Promise<ToolResult<T>>;
  component?: FC<{ props: Extract<ChatContentType, { type: T }> }>;
  customParameters?: any;
}): RegisteredTool<T> {
  if (!registry[propsType]) {
    registry[propsType] = new Map();
  }

  const typeRegistry = registry[propsType]!;

  // Create the abstraction using either custom parameters or zod schema
  const parameters = customParameters || {};

  const abstraction = {
    type: 'function' as const,
    name,
    description,
    parameters,
  };

  // Create the tool with type-safe implementation but store it with a looser type
  const tool: BaseTool<T> = {
    name,
    description,
    propsType,
    cost,
    abstraction,
    implementation: implementation as any, // Type assertion because we can't properly express this constraint
    representation: component
      ? {
          props_type: propsType,
          component,
        }
      : undefined,
  };

  typeRegistry.set(name, tool);

  // Return the OpenAI-compatible tool with the pre-built abstraction
  return {
    abstraction,
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
  console.log(`Attempting to get tool: ${name} with propsType: ${propsType}`);
  console.log('Available registry categories:', Object.keys(registry));

  if (!registry[propsType]) {
    console.warn(`No tools registered for propsType: ${propsType}`);
    return undefined;
  }

  const toolsInCategory = Array.from(registry[propsType]!.keys());
  console.log(`Tools available in category ${propsType}:`, toolsInCategory);

  const tool = registry[propsType]?.get(name);

  if (!tool) {
    console.warn(`Tool "${name}" not found in category "${propsType}"`);
  } else {
    console.log(`Successfully found tool: ${name}`);
  }

  return tool;
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

// Get all tool abstractions for OpenAI - now uses pre-built abstractions
export function getAllToolAbstractions() {
  return getAllTools().map((tool) => tool.abstraction);
}
