import { Agent } from '@/types/agent';
import { getTool } from './toolRegistry';
import { ToolPropsType } from '@/types/tool';
import { getAgentChanger } from '@/tools';

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

  const tools = agent.tools
    .map((tool) => {
      const foundTool = getTool(tool.name, tool.propsType);
      if (!foundTool) {
        console.warn(
          `Tool "${tool.name}" with type "${tool.propsType}" not found for agent "${agent.name}"`
        );
      }
      return foundTool;
    })
    .filter(Boolean); // Remove undefined tools

  console.log(
    `Found ${tools.length} of ${agent.tools.length} tools for agent ${agent.name}`
  );

  return tools;
}

// Modify your getAgentFunctionDefinitions function
export function getAgentFunctionDefinitions(slug: string | undefined | null) {
  console.log('Getting function definitions for slug:', slug);

  if (!slug) {
    console.log('No slug provided, returning only agent changer');
    return [getAgentChanger.abstraction];
  }

  // Get the agent directly from the registry
  const agent = agentRegistry.get(slug);
  if (!agent) {
    console.log(`Agent with slug "${slug}" not found in registry`);
    return [getAgentChanger.abstraction];
  }

  const tools = getAgentTools(slug);
  console.log(`Retrieved ${tools.length} tools for agent ${slug}`);

  // Always include the agent changer tool
  const allTools: {
    type: 'function';
    name: string;
    description: string;
    parameters: any;
  }[] = [];

  // Add any other tool abstractions
  tools.forEach((tool) => {
    if (tool && tool.abstraction) {
      console.log(`Adding tool: ${tool.abstraction.name}`);
      allTools.push(tool.abstraction);
    } else {
      console.log('Found invalid tool without abstraction');
    }
  });

  return allTools;
}
