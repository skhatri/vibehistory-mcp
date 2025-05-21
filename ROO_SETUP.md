# Setting Up VibeHistory MCP in Roo

This guide will help you set up the VibeHistory MCP to work with Roo in all your sessions.

## Installation

1. Install the package globally (recommended):

```bash
npm install -g vibehistory
```

Or install it in your project:

```bash
npm install vibehistory
```

## Integration with Roo

### Step 1: Find your Roo configuration directory

The Roo configuration directory is typically located at:

- **macOS**: `~/.roo/`
- **Windows**: `%APPDATA%\Roo\`
- **Linux**: `~/.config/Roo/`

### Step 2: Create or locate the plugins directory

Create a `plugins` directory in your Roo configuration folder if it doesn't exist:

```bash
mkdir -p ~/.roo/plugins
```

### Step 3: Create the integration file

Create a file called `vibehistory-plugin.js` in the plugins directory:

```bash
touch ~/.roo/plugins/vibehistory-plugin.js
```

### Step 4: Add the plugin code

Open the file and add the following code:

```javascript
/**
 * Roo Integration for VibeHistory MCP
 * 
 * This file integrates the vibehistory MCP with Roo.
 */

const { logCommand, processCommand } = require('vibehistory');

/**
 * Roo plugin for VibeHistory
 */
module.exports = {
  name: 'vibehistory',
  description: 'Logs and optionally modifies all commands sent to AI backends',
  
  // Initialize the plugin
  initialize: async () => {
    console.log('VibeHistory plugin initialized');
  },
  
  // Hook into the message pipeline
  hooks: {
    // Process outgoing messages (from user to AI)
    beforeSendMessage: async (message, context) => {
      try {
        // Create a unique session ID based on conversation or use default
        const sessionId = context.conversationId || 'default-session';
        
        // Process the message through vibehistory
        const processedMessage = await processCommand({
          prompt: message.content,
          metadata: {
            timestamp: new Date().toISOString(),
            conversationId: context.conversationId
          }
        }, sessionId);
        
        // Return the processed message
        return {
          ...message,
          content: processedMessage.prompt
        };
      } catch (error) {
        console.error('Error in VibeHistory plugin:', error);
        return message; // Return original message on error
      }
    },
    
    // Process incoming messages (from AI to user)
    afterReceiveMessage: async (message, context) => {
      try {
        // Log the AI response
        const sessionId = context.conversationId || 'default-session';
        
        // Use the logCommand function to save the response
        await logCommand({
          type: 'ai-response',
          content: message.content,
          metadata: {
            timestamp: new Date().toISOString(),
            conversationId: context.conversationId
          }
        }, `${sessionId}-responses`);
        
        return message;
      } catch (error) {
        console.error('Error logging AI response:', error);
        return message;
      }
    }
  },
  
  // Plugin configuration
  config: {
    // Add any configuration options here
    maskSensitiveInfo: true,
    saveResponses: true
  }
};
```

### Step 5: Enable the plugin in Roo

Add the plugin to your Roo configuration file (usually `~/.roo/config.json`):

```json
{
  "plugins": [
    "vibehistory-plugin"
  ],
  "other_settings": "..."
}
```

### Step 6: Restart Roo

Restart Roo to load the new plugin configuration.

## Verification

To verify that the VibeHistory MCP is working:

1. Open a new Roo session
2. Send a query to the AI assistant
3. Check the `~/.vibehistory/` directory to see if your command was logged

```bash
ls -la ~/.vibehistory/
```

You should see a directory with your project name and a corresponding `.vibeR` directory.

## Customization

To customize the plugin configuration, edit the `~/.roo/plugins/vibehistory-plugin.js` file and modify the `config` object.

## Troubleshooting

If the plugin doesn't seem to be working:

1. Check that the package is installed correctly
2. Verify that the plugin file is in the correct location
3. Make sure the plugin is enabled in the Roo configuration
4. Check the Roo logs for any error messages

## Support

For issues or questions, please visit the GitHub repository or submit an issue. 