#!/bin/bash

# VibeHistory MCP Cline Installation Script

echo "=== VibeHistory MCP Cline Installation ==="
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* || "$OSTYPE" == "linux-gnu"* ]]; then
  CONFIG_DIR="$HOME/.cline"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  CONFIG_DIR="$USERPROFILE/.cline"
else
  echo "Unsupported OS: $OSTYPE"
  echo "Please manually install according to CLINE_SETUP.md"
  exit 1
fi

echo "Detected Cline configuration directory: $CONFIG_DIR"

# Install package globally
echo "Installing vibehistory package globally..."
npm install -g vibehistory

# Create extensions directory
echo "Creating extensions directory..."
mkdir -p "$CONFIG_DIR/extensions"

# Create integration file
echo "Creating extension file..."
cat > "$CONFIG_DIR/extensions/vibehistory-extension.js" << 'EOF'
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
EOF

# Create or update Cline configuration
echo "Updating Cline configuration..."
if [ -f "$CONFIG_DIR/config.json" ]; then
  # Check if vibehistory is already in the config
  if grep -q "vibehistory-extension" "$CONFIG_DIR/config.json"; then
    echo "VibeHistory extension is already configured in config.json"
  else
    # Backup existing config
    cp "$CONFIG_DIR/config.json" "$CONFIG_DIR/config.json.bak"
    
    # Add vibehistory to the existing config
    # This is a simple approach - for complex configs, manual editing may be needed
    if grep -q '"extensions"' "$CONFIG_DIR/config.json"; then
      if grep -q '"enabled"' "$CONFIG_DIR/config.json"; then
        # Extensions.enabled array already exists, add to it
        sed -i.bak 's/"enabled"\s*:\s*\[/"enabled": \[\n      "vibehistory-extension",/g' "$CONFIG_DIR/config.json"
      else
        # Extensions object exists but no enabled array
        sed -i.bak 's/"extensions"\s*:\s*{/"extensions": {\n    "enabled": ["vibehistory-extension"],/g' "$CONFIG_DIR/config.json"
      fi
    else
      # No extensions object, add one
      sed -i.bak 's/{/{  "extensions": {\n    "enabled": ["vibehistory-extension"]\n  },/g' "$CONFIG_DIR/config.json"
    fi
    echo "Added VibeHistory extension to existing configuration"
  fi
else
  # Create new config
  cat > "$CONFIG_DIR/config.json" << 'EOF'
{
  "extensions": {
    "enabled": [
      "vibehistory-extension"
    ]
  }
}
EOF
  echo "Created new Cline configuration"
fi

echo ""
echo "=== Installation Complete ==="
echo "VibeHistory extension has been installed and configured for Cline."
echo "Please restart Cline to activate the extension."
echo ""
echo "To verify installation, send a query to the AI assistant"
echo "and then check the ~/.vibehistory/ directory." 