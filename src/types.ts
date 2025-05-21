/**
 * Base interface for Model Completion Providers (MCPs)
 */
export interface MCP {
  /**
   * Process a request before it's sent to the model
   */
  processRequest(request: any, context: CompletionContextType): Promise<any>;
  
  /**
   * Process a response after it's received from the model
   */
  processResponse(response: any, context: CompletionContextType): Promise<any>;
}

/**
 * Context information for completions
 */
export interface CompletionContextType {
  /**
   * Unique identifier for the current session
   */
  sessionId?: string;
  
  /**
   * Unique identifier for the current request
   */
  requestId?: string;
  
  /**
   * Type of model being used
   */
  modelType?: string;
  
  /**
   * Additional metadata about the request
   */
  metadata?: Record<string, any>;
}

/**
 * Provider contract for registering MCPs with the system
 */
export interface ProviderContract {
  /**
   * Unique identifier for the provider
   */
  id: string;
  
  /**
   * Human-readable name for the provider
   */
  name: string;
  
  /**
   * Description of what the provider does
   */
  description: string;
  
  /**
   * Schema defining the provider's configuration options
   */
  configSchema?: Record<string, any>;
  
  /**
   * Position in the MCP execution chain ('first', 'last', or a number)
   */
  position?: 'first' | 'last' | number;
} 