import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { StorageConfig, ModificationRule } from './config';

/**
 * Command history entry structure
 */
export interface CommandHistoryEntry {
  id: string;
  timestamp: string;
  sessionId: string;
  originalCommand: any;
  modifiedCommand: any;
  modifications: {
    type: string;
    pattern: string;
    replacement: string;
  }[];
}

/**
 * AI Response entry structure
 */
export interface AIResponseEntry {
  id: string;
  timestamp: string;
  sessionId: string;
  commandId: string;
  response: any;
}

/**
 * Handles storage and retrieval of command history
 */
export class CommandHistoryStorage {
  private config: StorageConfig;
  private storagePath: string;
  private responseStoragePath: string;
  private projectName: string;

  constructor(config: StorageConfig) {
    this.config = config;
    this.projectName = this.determineProjectName();
    
    // Set storage paths
    this.storagePath = this.config.useHomeDir 
      ? path.join(os.homedir(), '.vibehistory', this.projectName)
      : path.resolve(process.cwd(), config.path);

    this.responseStoragePath = this.config.useHomeDir
      ? path.join(os.homedir(), '.vibehistory', `${this.projectName}.vibeR`)
      : path.resolve(process.cwd(), `${config.path}.vibeR`);

    this.ensureStorageExists();
  }

  /**
   * Try to determine project name from package.json or use current directory name
   */
  private determineProjectName(): string {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = fs.readJsonSync(packageJsonPath);
        return packageJson.name || path.basename(process.cwd());
      }
    } catch (error) {
      // Fallback to directory name if package.json can't be read
    }
    return path.basename(process.cwd());
  }

  /**
   * Make sure the storage directories exist
   */
  private ensureStorageExists(): void {
    fs.ensureDirSync(this.storagePath);
    fs.ensureDirSync(this.responseStoragePath);
  }

  /**
   * Save a command to storage
   */
  async saveCommand(entry: CommandHistoryEntry): Promise<void> {
    try {
      const filePath = path.join(
        this.storagePath,
        `${entry.sessionId}_${entry.id}.json`
      );
      
      await fs.writeJson(filePath, entry, { spaces: 2 });
      
      // Log success in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log(`Command history saved to ${filePath}`);
      }
      
      // Clean up old entries if retention is enabled
      if (this.config.retentionDays > 0) {
        this.cleanupOldEntries();
      }
    } catch (error) {
      console.error('Error saving command history:', error);
    }
  }

  /**
   * Save an AI response to storage
   */
  async saveResponse(entry: AIResponseEntry): Promise<void> {
    try {
      const filePath = path.join(
        this.responseStoragePath,
        `${entry.sessionId}_${entry.id}.json`
      );
      
      await fs.writeJson(filePath, entry, { spaces: 2 });
      
      // Log success in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log(`AI response saved to ${filePath}`);
      }
    } catch (error) {
      console.error('Error saving AI response:', error);
    }
  }

  /**
   * Get command history entries, optionally filtered
   */
  async getEntries(filter?: {
    sessionId?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<CommandHistoryEntry[]> {
    try {
      const files = await fs.readdir(this.storagePath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const entries: CommandHistoryEntry[] = [];
      
      for (const file of jsonFiles) {
        try {
          const entry = await fs.readJson(path.join(this.storagePath, file));
          
          // Apply filters if provided
          if (filter) {
            const entryDate = new Date(entry.timestamp);
            
            if (filter.sessionId && entry.sessionId !== filter.sessionId) {
              continue;
            }
            
            if (filter.fromDate && entryDate < filter.fromDate) {
              continue;
            }
            
            if (filter.toDate && entryDate > filter.toDate) {
              continue;
            }
          }
          
          entries.push(entry);
        } catch (err) {
          console.error(`Error reading file ${file}:`, err);
        }
      }
      
      // Sort by timestamp descending (newest first)
      return entries.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error retrieving command history:', error);
      return [];
    }
  }

  /**
   * Get AI response entries, optionally filtered
   */
  async getResponses(filter?: {
    sessionId?: string;
    commandId?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<AIResponseEntry[]> {
    try {
      const files = await fs.readdir(this.responseStoragePath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const entries: AIResponseEntry[] = [];
      
      for (const file of jsonFiles) {
        try {
          const entry = await fs.readJson(path.join(this.responseStoragePath, file));
          
          // Apply filters if provided
          if (filter) {
            const entryDate = new Date(entry.timestamp);
            
            if (filter.sessionId && entry.sessionId !== filter.sessionId) {
              continue;
            }
            
            if (filter.commandId && entry.commandId !== filter.commandId) {
              continue;
            }
            
            if (filter.fromDate && entryDate < filter.fromDate) {
              continue;
            }
            
            if (filter.toDate && entryDate > filter.toDate) {
              continue;
            }
          }
          
          entries.push(entry);
        } catch (err) {
          console.error(`Error reading file ${file}:`, err);
        }
      }
      
      // Sort by timestamp descending (newest first)
      return entries.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error retrieving AI responses:', error);
      return [];
    }
  }

  /**
   * Delete entries older than the retention period
   */
  private async cleanupOldEntries(): Promise<void> {
    try {
      if (this.config.retentionDays <= 0) return;
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
      
      const entries = await this.getEntries();
      
      for (const entry of entries) {
        const entryDate = new Date(entry.timestamp);
        
        if (entryDate < cutoffDate) {
          const filePath = path.join(
            this.storagePath,
            `${entry.sessionId}_${entry.id}.json`
          );
          
          await fs.remove(filePath);
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`Deleted old command history: ${filePath}`);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old command history:', error);
    }
  }
} 