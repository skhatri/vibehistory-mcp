import { CommandHistoryMCP } from './mcps/command-history';
import { CommandHistoryConfig } from './mcps/command-history/config';
import { CommandHistoryWrapper } from './mcps/command-history/wrapper';

/**
 * Factory function to create a new CommandHistoryMCP instance
 */
export function createCommandHistoryMCP(config?: Partial<CommandHistoryConfig>): CommandHistoryMCP {
  return new CommandHistoryMCP(config);
}

/**
 * Export the MCP class directly
 */
export { CommandHistoryMCP };

/**
 * Export the wrapper class for easier usage
 */
export { CommandHistoryWrapper };

/**
 * Export config types
 */
export * from './mcps/command-history/config';

/**
 * Export MCP provider info for registration
 */
export const COMMAND_HISTORY_PROVIDER_INFO = CommandHistoryMCP.getProviderInfo();

/**
 * Register the MCP with the system
 * 
 * This function should be called by the MCP registration system
 */
export function registerCommandHistoryMCP(registry: any, config?: Partial<CommandHistoryConfig>): void {
  if (!registry || typeof registry.register !== 'function') {
    throw new Error('Invalid MCP registry provided');
  }
  
  registry.register(COMMAND_HISTORY_PROVIDER_INFO.id, () => createCommandHistoryMCP(config));
}

/**
 * Convenience function to log a command without registering the MCP
 */
export async function logCommand(command: any, sessionId: string = 'default'): Promise<void> {
  await CommandHistoryWrapper.log(command, sessionId);
}

/**
 * Convenience function to process a command without registering the MCP
 */
export async function processCommand(command: any, sessionId: string = 'default'): Promise<any> {
  return await CommandHistoryWrapper.process(command, sessionId);
} 