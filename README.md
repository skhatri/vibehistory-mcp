# Command History MCP

A Model Completion Provider (MCP) that logs and optionally modifies all commands sent to AI assistant backends.

## Features

- **Command Logging**: Records all commands sent to AI backends with timestamps and session tracking
- **Response Logging**: Optionally records AI responses paired with their originating commands
- **Command Modification**: Modifies or masks sensitive information before sending to the model
- **Home Directory Storage**: Can store history in `~/.vibehistory/<project-name>/` for commands and `~/.vibehistory/<project-name>.vibeR/` for responses
- **Rule-Based System**: Configurable rules for how commands should be modified
- **First in Chain**: Can be configured to be the first MCP in the processing chain

## Installation

```bash
npm install vibehistory
```

## Usage

### Basic Usage

```typescript
import { createCommandHistoryMCP } from 'vibehistory';

// Create with default configuration
const historyMCP = createCommandHistoryMCP();
```

### Custom Configuration

```typescript
import { createCommandHistoryMCP, CommandHistoryConfig } from 'vibehistory';

const config: Partial<CommandHistoryConfig> = {
  saveResponses: true,
  storage: {
    type: 'file',
    useHomeDir: true,  // Use ~/.vibehistory/<project-name>
    path: './custom_history_path', // Used if useHomeDir is false
    retentionDays: 60
  },
  modifications: [
    {
      name: 'mask_api_keys',
      type: 'mask',
      pattern: 'api[-_]?key\\s*[:=]\\s*\\S+',
      replacement: 'api_key: [REDACTED]',
      enabled: true
    }
  ]
};

const historyMCP = createCommandHistoryMCP(config);
```

### Using the Convenience Wrapper

```typescript
import { logCommand, processCommand } from 'vibehistory';

// Log a command without modifying
await logCommand({
  prompt: "What's the weather today?",
  timestamp: new Date().toISOString()
}, 'my-session');

// Process and modify a command
const modifiedCommand = await processCommand({
  prompt: "My API key is sk_123456",
  timestamp: new Date().toISOString()
}, 'my-session');
```

### System Registration

To register the MCP with your system:

```typescript
import { registerCommandHistoryMCP } from 'vibehistory';

// Assuming your system has an MCP registry
registerCommandHistoryMCP(mcpRegistry, customConfig);
```

## Configuration Options

The MCP accepts the following configuration options:

- `enabled` (boolean): Whether the MCP is active
- `position` ('first'|'last'|number): Position in the MCP execution chain
- `enableModifications` (boolean): Whether to apply modification rules
- `saveResponses` (boolean): Whether to save AI responses
- `storage`: Storage configuration
  - `type` ('file'|'database'): Storage type
  - `useHomeDir` (boolean): Store in home directory (~/.vibehistory/)
  - `path` (string): Path for file storage (when useHomeDir is false)
  - `retentionDays` (number): Days to retain history
- `modifications`: Array of modification rules
  - `name` (string): Name of the rule
  - `type` ('mask'|'edit'|'enrich'): Type of modification
  - `pattern` (string): Regex pattern to match
  - `replacement` (string): Replacement text
  - `enabled` (boolean): Whether the rule is active

## Storage Locations

When `useHomeDir` is set to `true` (default):

- Commands are stored in: `~/.vibehistory/<project-name>/`
- Responses are stored in: `~/.vibehistory/<project-name>.vibeR/`

The project name is determined from your package.json or from the current directory name.

## Modification Types

- **Mask**: Completely replaces matched text with the replacement
- **Edit**: Performs a regex replacement on matched text
- **Enrich**: Appends the replacement text to matched text

## Security Considerations

Command history may contain sensitive information. Consider:

1. Using secure storage locations
2. Configuring appropriate masking rules for sensitive data
3. Setting reasonable retention periods
4. Restricting access to history files

## License

MIT 