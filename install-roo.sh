#!/bin/bash

# VibeHistory MCP Roo Installation Script

echo "=== VibeHistory MCP Roo Installation ==="
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
  CONFIG_DIR="$HOME/.roo"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  CONFIG_DIR="$HOME/.config/Roo"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  CONFIG_DIR="$APPDATA/Roo"
else
  echo "Unsupported OS: $OSTYPE"
  echo "Please manually install according to ROO_SETUP.md"
  exit 1
fi

echo "Detected Roo configuration directory: $CONFIG_DIR"

# Install package globally
echo "Installing vibehistory package globally..."
npm install -g vibehistory

# Create plugins directory
echo "Creating plugins directory..."
mkdir -p "$CONFIG_DIR/plugins"

# Create integration file
echo "Creating plugin file..."
cat > "$CONFIG_DIR/plugins/vibehistory-plugin.js" << 'EOF'
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
EOF

# Create or update Roo configuration
echo "Updating Roo configuration..."
if [ -f "$CONFIG_DIR/config.json" ]; then
  # Check if vibehistory is already in the config
  if grep -q "vibehistory-plugin" "$CONFIG_DIR/config.json"; then
    echo "VibeHistory plugin is already configured in config.json"
  else
    # Backup existing config
    cp "$CONFIG_DIR/config.json" "$CONFIG_DIR/config.json.bak"
    
    # Add vibehistory to the existing config
    # This is a simple approach - for complex configs, manual editing may be needed
    if grep -q '"plugins"' "$CONFIG_DIR/config.json"; then
      # Plugins array already exists, add to it
      sed -i.bak 's/"plugins"\s*:\s*\[/"plugins": \[\n    "vibehistory-plugin",/g' "$CONFIG_DIR/config.json"
    else
      # No plugins array, add one
      sed -i.bak 's/{/{  "plugins": ["vibehistory-plugin"],/g' "$CONFIG_DIR/config.json"
    fi
    echo "Added VibeHistory plugin to existing configuration"
  fi
else
  # Create new config
  cat > "$CONFIG_DIR/config.json" << 'EOF'
{
  "plugins": [
    "vibehistory-plugin"
  ]
}
EOF
  echo "Created new Roo configuration"
fi

echo ""
echo "=== Installation Complete ==="
echo "VibeHistory plugin has been installed and configured for Roo."
echo "Please restart Roo to activate the plugin."
echo ""
echo "To verify installation, send a query to the AI assistant"
echo "and then check the ~/.vibehistory/ directory." 