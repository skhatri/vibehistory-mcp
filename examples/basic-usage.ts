import { createCommandHistoryMCP, CommandHistoryConfig } from '../src';

// Example of a simple MCP registry
class MCPRegistry {
  private mcps: Map<string, () => any> = new Map();
  
  register(id: string, factory: () => any): void {
    this.mcps.set(id, factory);
    console.log(`Registered MCP: ${id}`);
  }
  
  getMCP(id: string): any {
    const factory = this.mcps.get(id);
    if (!factory) {
      throw new Error(`MCP not found: ${id}`);
    }
    return factory();
  }
  
  async processRequest(request: any, context: any): Promise<any> {
    let modifiedRequest = { ...request };
    
    // Process through all MCPs in order
    for (const [id, factory] of this.mcps.entries()) {
      const mcp = factory();
      modifiedRequest = await mcp.processRequest(modifiedRequest, context);
      console.log(`Request processed by MCP: ${id}`);
    }
    
    return modifiedRequest;
  }
}

// Create a registry
const registry = new MCPRegistry();

// Create custom configuration
const config: Partial<CommandHistoryConfig> = {
  storage: {
    type: 'file',
    path: './example_history',
    retentionDays: 30
  },
  modifications: [
    {
      name: 'mask_passwords',
      type: 'mask',
      pattern: 'password\\s*[:=]\\s*\\S+',
      replacement: 'password: [REDACTED]',
      enabled: true
    },
    {
      name: 'enrich_prompt',
      type: 'enrich',
      pattern: '^',  // Match start of string
      replacement: '[Be sure to follow the project guidelines] ',
      enabled: true
    }
  ]
};

// Manual registration
const mcp = createCommandHistoryMCP(config);
registry.register('command-history-mcp', () => mcp);

// Or use the registration helper
// import { registerCommandHistoryMCP } from '../src';
// registerCommandHistoryMCP(registry, config);

// Example of using the MCP in a request
async function exampleRequest(): Promise<void> {
  const request = {
    prompt: 'Please create a new user with password: supersecret123',
    parameters: {
      temperature: 0.7,
      max_tokens: 100
    }
  };
  
  const context = {
    sessionId: 'example-session-123',
    requestId: 'req-' + Date.now(),
    modelType: 'gpt-4'
  };
  
  console.log('Original request:', JSON.stringify(request, null, 2));
  
  // Process the request through all MCPs
  const modifiedRequest = await registry.processRequest(request, context);
  
  console.log('Modified request:', JSON.stringify(modifiedRequest, null, 2));
}

// Run the example
exampleRequest().catch(console.error); 