import { CommandHistoryMCP } from './index';
import { CommandHistoryConfig } from './config';

// Mock fs-extra and path modules
jest.mock('fs-extra', () => ({
  ensureDirSync: jest.fn(),
  writeJson: jest.fn().mockResolvedValue(undefined),
  readdir: jest.fn().mockResolvedValue([]),
  readJson: jest.fn().mockResolvedValue({}),
  remove: jest.fn().mockResolvedValue(undefined),
  existsSync: jest.fn().mockReturnValue(false),
  readJsonSync: jest.fn().mockReturnValue({ name: 'test-project' })
}));

jest.mock('path', () => ({
  resolve: jest.fn().mockImplementation((...args) => args.join('/')),
  join: jest.fn().mockImplementation((...args) => args.join('/')),
  basename: jest.fn().mockReturnValue('test-dir')
}));

jest.mock('os', () => ({
  homedir: jest.fn().mockReturnValue('/home/test-user')
}));

describe('CommandHistoryMCP', () => {
  let mcp: CommandHistoryMCP;
  const testConfig: Partial<CommandHistoryConfig> = {
    saveResponses: true,
    storage: {
      type: 'file',
      path: './test_history',
      retentionDays: 7,
      useHomeDir: false // For testing, use explicit path
    },
    modifications: [
      {
        name: 'test_mask',
        type: 'mask',
        pattern: 'password\\s*:\\s*\\S+',
        replacement: 'password: [REDACTED]',
        enabled: true
      }
    ]
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    mcp = new CommandHistoryMCP(testConfig);
  });
  
  it('should create directory when initialized', () => {
    // ensureDirSync should be called when the MCP is initialized
    const fs = require('fs-extra');
    expect(fs.ensureDirSync).toHaveBeenCalledTimes(2); // For commands and responses
  });
  
  it('should process and log requests', async () => {
    const testRequest = {
      prompt: 'This is a test with password: secret123',
      parameters: { temperature: 0.7 }
    };
    
    const context = { sessionId: 'test-session' };
    
    const result = await mcp.processRequest(testRequest, context);
    
    // Expect the password to be masked
    expect(result.prompt).toContain('[REDACTED]');
    expect(result.prompt).not.toContain('secret123');
    
    // Expect fs.writeJson to have been called to log the command
    const fs = require('fs-extra');
    expect(fs.writeJson).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        sessionId: 'test-session'
      }),
      expect.any(Object)
    );
  });
  
  it('should save AI responses', async () => {
    const testResponse = { 
      completion: 'This is a test response'
    };
    
    const context = { sessionId: 'test-session' };
    
    // First send a request to set the lastCommandId
    await mcp.processRequest({ prompt: 'test' }, context);
    
    // Then process the response
    const result = await mcp.processResponse(testResponse, context);
    
    // Response should be passed through unchanged
    expect(result).toBe(testResponse);
    
    // Expect fs.writeJson to have been called to log the response
    const fs = require('fs-extra');
    expect(fs.writeJson).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        sessionId: 'test-session',
        response: testResponse
      }),
      expect.any(Object)
    );
  });
  
  it('should return static provider info', () => {
    const info = CommandHistoryMCP.getProviderInfo();
    
    expect(info).toMatchObject({
      id: 'command-history-mcp',
      name: expect.any(String),
      description: expect.any(String),
      position: 'first'
    });
    
    // Check that config schema includes the new options
    const configSchema = info.configSchema as any;
    expect(configSchema.properties).toHaveProperty('saveResponses');
    expect(configSchema.properties.storage.properties).toHaveProperty('useHomeDir');
  });
}); 