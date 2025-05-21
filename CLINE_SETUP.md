# Setting Up VibeHistory MCP in Cline

This guide will help you set up the VibeHistory MCP to work with Cline in all your sessions.

## Installation

1. Install the package globally (recommended):

```bash
npm install -g vibehistory
```

Or install it in your project:

```bash
npm install vibehistory
```

## Integration with Cline

### Step 1: Find your Cline configuration directory

The Cline configuration directory is typically located at:

- **macOS**: `~/.cline/`
- **Windows**: `%USERPROFILE%\.cline\`
- **Linux**: `~/.cline/`

### Step 2: Create the extensions directory

Create an `extensions` directory in your Cline configuration folder if it doesn't exist:

```bash
mkdir -p ~/.cline/extensions
```

### Step 3: Create the extension file

Create a file called `vibehistory-extension.js` in the extensions directory:

```bash
touch ~/.cline/extensions/vibehistory-extension.js
```

### Step 4: Add the extension code

Open the file and add the following code:

```javascript
/**
 * Cline Extension for VibeHistory MCP
 * 
 * This file integrates the vibehistory MCP with Cline.
 */

const { processCommand, logCommand } = require('vibehistory');

/**
 * VibeHistory extension for Cline
 */
module.exports = {
  name: 'vibehistory',
  version: '1.0.0',
  description: 'Logs and optionally modifies all commands sent to AI backends',
  
  /**
   * Initialize the extension
   */
  async activate(context) {
    console.log('VibeHistory extension activated');
    
    // Register command interceptors
    context.registerMessageInterceptor({
      // Intercept outgoing messages
      beforeSend: async (message, sessionInfo) => {
        try {
          // Generate a session ID from the chat session
          const sessionId = sessionInfo.sessionId || 'cline-session';
          
          // Process the message
          const processedMessage = await processCommand({
            prompt: message.content,
            metadata: {
              timestamp: new Date().toISOString(),
              sessionId: sessionInfo.sessionId,
              model: sessionInfo.model
            }
          }, sessionId);
          
          // Return the processed message
          return {
            ...message,
            content: processedMessage.prompt
          };
        } catch (error) {
          console.error('Error in VibeHistory extension:', error);
          return message; // Return original on error
        }
      },
      
      // Intercept incoming responses
      afterReceive: async (response, sessionInfo) => {
        try {
          const sessionId = sessionInfo.sessionId || 'cline-session';
          
          // Log the response
          await logCommand({
            type: 'ai-response',
            content: response.content,
            metadata: {
              timestamp: new Date().toISOString(),
              sessionId: sessionInfo.sessionId,
              model: sessionInfo.model
            }
          }, `${sessionId}-responses`);
          
          return response;
        } catch (error) {
          console.error('Error logging AI response:', error);
          return response;
        }
      }
    });
    
    // Return API
    return {
      getLoggedCommands: async (sessionId) => {
        // This is a placeholder for a function that would retrieve logged commands
        // You would need to implement this using the vibehistory storage API
        console.log(`Retrieving commands for session: ${sessionId}`);
        return [];
      }
    };
  },
  
  /**
   * Clean up on deactivation
   */
  async deactivate() {
    console.log('VibeHistory extension deactivated');
  },
  
  /**
   * Extension configuration
   */
  config: {
    maskSensitiveInfo: {
      type: 'boolean',
      default: true,
      description: 'Mask sensitive information like API keys and passwords'
    },
    saveResponses: {
      type: 'boolean',
      default: true,
      description: 'Save AI responses in addition to commands'
    },
    retentionDays: {
      type: 'number',
      default: 30,
      description: 'Number of days to keep history'
    }
  }
};
```

### Step 5: Enable the extension in Cline

Cline typically looks for extensions in the extensions directory automatically, but you may need to add it to your configuration file (usually `~/.cline/config.json`):

```json
{
  "extensions": {
    "enabled": [
      "vibehistory-extension"
    ]
  },
  "other_settings": "..."
}
```

### Step 6: Restart Cline

Restart Cline to load the new extension.

## Verification

To verify that the VibeHistory MCP is working:

1. Open a new Cline session
2. Send a query to the AI assistant
3. Check the `~/.vibehistory/` directory to see if your command was logged

```bash
ls -la ~/.vibehistory/
```

You should see a directory with your project name and a corresponding `.vibeR` directory.

## Customization

To customize the extension configuration, edit your Cline configuration file to include settings for the VibeHistory extension:

```json
{
  "extensions": {
    "enabled": ["vibehistory-extension"],
    "config": {
      "vibehistory-extension": {
        "maskSensitiveInfo": true,
        "saveResponses": true,
        "retentionDays": 60
      }
    }
  }
}
```

## Troubleshooting

If the extension doesn't seem to be working:

1. Check that the package is installed correctly
2. Verify that the extension file is in the correct location
3. Make sure the extension is enabled in the Cline configuration
4. Run Cline with the `--debug` flag to see detailed logs

## Support

For issues or questions, please visit the GitHub repository or submit an issue. 