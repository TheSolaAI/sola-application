import { Agent } from '@/types/agent';
import { getTool } from './toolRegistry';
import { createFunctionDefinition } from '../zodToOpenAI';
import { ToolPropsType } from '@/types/tool';

const agentRegistry = new Map<string, Agent>();

// Enhanced agent type with tool references
interface EnhancedAgent extends Omit<Agent, 'tools'> {
  tools: Array<{
    name: string;
    propsType: ToolPropsType;
  }>;
}

export function registerAgent(agent: EnhancedAgent): Agent {
  agentRegistry.set(agent.slug, agent);
  return agent;
}

export function getAgent(slug: string): Agent | undefined {
  return agentRegistry.get(slug);
}

export function getAllAgents(): Agent[] {
  return Array.from(agentRegistry.values());
}

export function getAgentTools(slug: string) {
  const agent = agentRegistry.get(slug) as EnhancedAgent | undefined;
  if (!agent) return [];

  return agent.tools
    .map((tool) => getTool(tool.name, tool.propsType))
    .filter(Boolean);
}

export function getAgentFunctionDefinitions(slug: string) {
  const tools = getAgentTools(slug);
  const nonNullTools = tools as NonNullable<ReturnType<typeof getTool>>[];

  return nonNullTools.map((tool) =>
    createFunctionDefinition(tool.name, tool.schema, tool.description)
  );
}
