# Setting Up VibeHistory MCP in Cursor

This guide will help you set up the VibeHistory MCP to work with Cursor in all your sessions.

## Installation

1. Install the package globally (recommended):

```bash
npm install -g vibehistory
```

Or install it in your project:

```bash
npm install vibehistory
```

## Integration with Cursor

### Step 1: Find your Cursor configuration directory

The Cursor configuration directory is typically located at:

- **macOS**: `~/.cursor/`
- **Windows**: `%APPDATA%\Cursor\`
- **Linux**: `~/.config/Cursor/`

### Step 2: Create or locate the MCP directory

Create an `mcps` directory in your Cursor configuration folder if it doesn't exist:

```bash
mkdir -p ~/.cursor/mcps
```

### Step 3: Copy the integration file

Copy the `cursor-integration.js` file from this repository to the Cursor MCP directory:

```bash
cp cursor-integration.js ~/.cursor/mcps/vibehistory-mcp.js
```

### Step 4: Create or update Cursor's MCP configuration

Create or edit the `~/.cursor/mcps.json` file to include the VibeHistory MCP:

```json
{
  "mcps": [
    {
      "name": "vibehistory",
      "path": "~/.cursor/mcps/vibehistory-mcp.js"
    }
  ]
}
```

If you already have other MCPs configured, add the VibeHistory MCP to the existing array.

### Step 5: Restart Cursor

Restart Cursor to load the new MCP configuration.

## Verification

To verify that the VibeHistory MCP is working:

1. Open a new Cursor session
2. Send a query to the AI assistant
3. Check the `~/.vibehistory/` directory to see if your command was logged

```bash
ls -la ~/.vibehistory/
```

You should see a directory with your project name and a corresponding `.vibeR` directory.

## Customization

To customize the MCP configuration, edit the `~/.cursor/mcps/vibehistory-mcp.js` file and modify the `config` object.

Available configuration options:

- `saveResponses`: Whether to save AI responses
- `storage.useHomeDir`: Whether to use the home directory for storage
- `storage.retentionDays`: How many days to keep history
- `modifications`: Array of rules for modifying/masking sensitive data

## Troubleshooting

If the MCP doesn't seem to be working:

1. Check that the package is installed correctly
2. Verify that the integration file is in the correct location
3. Make sure the `mcps.json` file has the correct path
4. Look for any error messages in the Cursor console (Help > Toggle Developer Tools)

## Support

For issues or questions, please visit the GitHub repository or submit an issue. 