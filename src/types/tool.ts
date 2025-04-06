import { Tool } from 'ai';

/**
 * The Tool type is defined inside vercel's SDK
 */

export interface ToolSetDescription {
  slug: string;
  name: string;
  description: string;
}

export interface ToolSet extends ToolSetDescription {
  tools: Record<string, Tool<any, any>>;
}

/**
 * This is used inside a tool to signify the result of the tool call
 */
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * An Array of these are returned after the tool call
 */
export interface ToolCallResult {
  type: 'tool-result';
  toolName: string;
  toolCallId: string;
  result: ToolResult;
}

/**
 * Provides Extra context to the tool. Not All Props are garunted to be present
 */
export interface ToolContext {
  authToken?: string;
  publicKey?: string;
}
