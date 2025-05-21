import { CommandHistoryMCP } from './index';
import { CommandHistoryConfig } from './config';

/**
 * A simple wrapper to make it easier to use the CommandHistoryMCP
 * in different environments without having to implement all the MCP interfaces.
 */
export class CommandHistoryWrapper {
  private mcp: CommandHistoryMCP;
  
  constructor(config?: Partial<CommandHistoryConfig>) {
    this.mcp = new CommandHistoryMCP(config);
  }
  
  /**
   * Log a command without modifying it
   */
  async logCommand(command: any, sessionId: string = 'default'): Promise<void> {
    await this.mcp.processRequest(command, { sessionId });
  }
  
  /**
   * Process a command through the MCP and return the possibly modified version
   */
  async processCommand(command: any, sessionId: string = 'default'): Promise<any> {
    return await this.mcp.processRequest(command, { sessionId });
  }
  
  /**
   * Create as a singleton with default config
   */
  private static instance: CommandHistoryWrapper | null = null;
  
  /**
   * Get or create the singleton instance
   */
  static getInstance(config?: Partial<CommandHistoryConfig>): CommandHistoryWrapper {
    if (!CommandHistoryWrapper.instance) {
      CommandHistoryWrapper.instance = new CommandHistoryWrapper(config);
    }
    return CommandHistoryWrapper.instance;
  }
  
  /**
   * Quick helper method to log a command using the singleton
   */
  static async log(command: any, sessionId: string = 'default'): Promise<void> {
    await CommandHistoryWrapper.getInstance().logCommand(command, sessionId);
  }
  
  /**
   * Quick helper method to process a command using the singleton
   */
  static async process(command: any, sessionId: string = 'default'): Promise<any> {
    return await CommandHistoryWrapper.getInstance().processCommand(command, sessionId);
  }
} 