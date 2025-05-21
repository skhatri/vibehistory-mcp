/**
 * Types for modification rules
 */
export type ModificationType = 'mask' | 'edit' | 'enrich';

export interface ModificationRule {
  name: string;
  type: ModificationType;
  pattern: string;
  replacement: string;
  enabled: boolean;
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  type: 'file' | 'database';
  path: string;
  retentionDays: number;
  useHomeDir: boolean;
}

/**
 * Main configuration for the Command History MCP
 */
export interface CommandHistoryConfig {
  enabled: boolean;
  position: 'first' | 'last' | number;
  enableModifications: boolean;
  storage: StorageConfig;
  modifications: ModificationRule[];
  saveResponses: boolean;
}

/**
 * Default configuration
 */
export const defaultConfig: CommandHistoryConfig = {
  enabled: true,
  position: 'first',
  enableModifications: true,
  saveResponses: true,
  storage: {
    type: 'file',
    path: './command_history',
    retentionDays: 30,
    useHomeDir: true
  },
  modifications: [
    {
      name: 'mask_credentials',
      type: 'mask',
      pattern: 'password\\s*:\\s*\\S+',
      replacement: 'password: [REDACTED]',
      enabled: true
    },
    {
      name: 'mask_api_keys',
      type: 'mask',
      pattern: 'api[-_]?key\\s*[:=]\\s*\\S+',
      replacement: 'api_key: [REDACTED]',
      enabled: true
    }
  ]
}; 