import { MCP, ProviderContract, CompletionContextType } from '../../types';
import { CommandHistoryStorage } from './storage';
import { CommandModifier } from './modifier';
import { CommandHistoryConfig, defaultConfig } from './config';

/**
 * CommandHistoryMCP - Saves and potentially modifies all commands sent to AI backends
 * 
 * This MCP intercepts all commands sent to the AI model, logs them, and can
 * optionally modify or mask sensitive information before passing them on.
 */
export class CommandHistoryMCP implements MCP {
  private config: CommandHistoryConfig;
  private storage: CommandHistoryStorage;
  private modifier: CommandModifier;
  private lastCommandId: string | null = null;

  constructor(userConfig?: Partial<CommandHistoryConfig>) {
    this.config = { ...defaultConfig, ...userConfig };
    this.storage = new CommandHistoryStorage(this.config.storage);
    this.modifier = new CommandModifier(this.config.modifications);
  }

  /**
   * Process the completion request before it's sent to the model
   */
  async processRequest(request: any, context: CompletionContextType): Promise<any> {
    try {
      // Store the original request
      const originalRequest = JSON.parse(JSON.stringify(request));
      
      // Generate a unique ID for this request
      this.lastCommandId = this.generateUniqueId();
      
      // Apply modifications if enabled
      const modifiedRequest = this.config.enableModifications 
        ? this.modifier.process(request) 
        : request;
      
      // Log the command
      await this.storage.saveCommand({
        id: this.lastCommandId,
        timestamp: new Date().toISOString(),
        sessionId: context.sessionId || 'unknown',
        originalCommand: originalRequest,
        modifiedCommand: modifiedRequest,
        modifications: this.modifier.getAppliedModifications()
      });

      // Return the modified request
      return modifiedRequest;
    } catch (error) {
      console.error('Error in CommandHistoryMCP:', error);
      // On error, return the original request to ensure functionality continues
      return request;
    }
  }

  /**
   * Process the model response
   */
  async processResponse(response: any, context: CompletionContextType): Promise<any> {
    // If response saving is enabled and we have a command ID, save the response
    if (this.config.saveResponses && this.lastCommandId) {
      try {
        await this.storage.saveResponse({
          id: this.generateUniqueId(),
          timestamp: new Date().toISOString(),
          sessionId: context.sessionId || 'unknown',
          commandId: this.lastCommandId,
          response: response
        });
      } catch (error) {
        console.error('Error saving AI response:', error);
      }
    }
    
    // This MCP doesn't modify responses
    return response;
  }

  /**
   * Generate a unique ID for the command
   */
  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Return MCP metadata for registration and configuration
   */
  static getProviderInfo(): ProviderContract {
    return {
      id: 'command-history-mcp',
      name: 'Command History MCP',
      description: 'Logs and optionally modifies all commands sent to AI backends',
      configSchema: {
        properties: {
          enabled: {
            type: 'boolean',
            title: 'Enable MCP',
            description: 'Whether this MCP is active',
            default: true
          },
          position: {
            type: 'string',
            title: 'Position in MCP Chain',
            description: 'Position in the MCP execution chain',
            enum: ['first', 'last'],
            default: 'first'
          },
          enableModifications: {
            type: 'boolean',
            title: 'Enable Modifications',
            description: 'Whether to apply modification rules to commands',
            default: true
          },
          saveResponses: {
            type: 'boolean',
            title: 'Save AI Responses',
            description: 'Whether to save AI responses along with commands',
            default: true
          },
          storage: {
            type: 'object',
            title: 'Storage Configuration',
            properties: {
              type: {
                type: 'string',
                title: 'Storage Type',
                enum: ['file', 'database'],
                default: 'file'
              },
              path: {
                type: 'string',
                title: 'Storage Path',
                description: 'Path for file storage',
                default: './command_history'
              },
              retentionDays: {
                type: 'number',
                title: 'Retention Period',
                description: 'Number of days to retain history (0 for no limit)',
                default: 30
              },
              useHomeDir: {
                type: 'boolean',
                title: 'Use Home Directory',
                description: 'Store in ~/.vibehistory/<project-name>',
                default: true
              }
            }
          },
          modifications: {
            type: 'array',
            title: 'Modification Rules',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  title: 'Rule Name'
                },
                type: {
                  type: 'string',
                  title: 'Modification Type',
                  enum: ['mask', 'edit', 'enrich']
                },
                pattern: {
                  type: 'string',
                  title: 'Match Pattern',
                  description: 'Regular expression pattern to match'
                },
                replacement: {
                  type: 'string',
                  title: 'Replacement Text'
                },
                enabled: {
                  type: 'boolean',
                  title: 'Rule Enabled',
                  default: true
                }
              },
              required: ['name', 'type', 'pattern', 'replacement']
            }
          }
        },
        required: ['enabled', 'storage']
      },
      position: 'first', // Run this MCP first in the chain
    };
  }
} 