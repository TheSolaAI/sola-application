import { getAgentChanger, getTokenData } from '@/tools';

/**
 * Initializes all tools by importing them, which triggers their registration
 * This function doesn't need to do anything - just importing the tools will
 * cause their registration code to run
 */
export function initializeTools() {
  // The imports above will trigger tool registration
  // We can add logging to confirm registration
  console.log('Tool initialization started');
  const tools = [getAgentChanger, getTokenData];
  console.log(`Initialized ${tools.length} tools`);

  return true;
}
