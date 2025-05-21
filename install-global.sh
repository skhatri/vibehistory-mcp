#!/bin/bash

# VibeHistory MCP Global Installation Script

echo "=== VibeHistory MCP Global Installation ==="
echo ""

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
  CONFIG_DIR="$HOME/.cursor"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  CONFIG_DIR="$HOME/.config/Cursor"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  CONFIG_DIR="$APPDATA/Cursor"
else
  echo "Unsupported OS: $OSTYPE"
  echo "Please manually install according to CURSOR_SETUP.md"
  exit 1
fi

echo "Detected Cursor configuration directory: $CONFIG_DIR"

# Install package globally
echo "Installing vibehistory package globally..."
npm install -g vibehistory

# Create MCP directory
echo "Creating MCP directory..."
mkdir -p "$CONFIG_DIR/mcps"

# Create integration file
echo "Creating integration file..."
cat > "$CONFIG_DIR/mcps/vibehistory-mcp.js" << 'EOF'
/**
 * Cursor Integration for VibeHistory MCP
 * 
 * This file integrates the vibehistory MCP with Cursor.
 */

const { registerCommandHistoryMCP } = require('vibehistory');

/**
 * Register the Command History MCP with Cursor
 * 
 * @param {Object} registry - Cursor's MCP registry
 */
function register(registry) {
  // Custom configuration
  const config = {
    saveResponses: true,
    storage: {
      useHomeDir: true,
      retentionDays: 30
    },
    modifications: [
      {
        name: 'mask_credentials',
        type: 'mask',
        pattern: 'password\\s*[:=]\\s*\\S+',
        replacement: 'password: [REDACTED]',
        enabled: true
      },
      {
        name: 'mask_api_keys',
        type: 'mask',
        pattern: 'api[-_]?key\\s*[:=]\\s*\\S+',
        replacement: 'api_key: [REDACTED]',
        enabled: true
      },
      {
        name: 'mask_tokens',
        type: 'mask',
        pattern: '(token|auth[-_]?token)\\s*[:=]\\s*\\S+',
        replacement: 'token: [REDACTED]',
        enabled: true
      }
    ]
  };

  // Register the MCP with Cursor
  registerCommandHistoryMCP(registry, config);
  
  console.log('VibeHistory MCP registered successfully!');
}

module.exports = { register };
EOF

# Create or update MCP configuration
echo "Updating MCP configuration..."
if [ -f "$CONFIG_DIR/mcps.json" ]; then
  # Check if vibehistory is already in the config
  if grep -q "vibehistory" "$CONFIG_DIR/mcps.json"; then
    echo "VibeHistory MCP is already configured in mcps.json"
  else
    # Backup existing config
    cp "$CONFIG_DIR/mcps.json" "$CONFIG_DIR/mcps.json.bak"
    
    # Add vibehistory to the existing config
    # This is a simple approach - for complex configs, manual editing may be needed
    sed -i.bak 's/"mcps": \[/"mcps": \[\n    {\n      "name": "vibehistory",\n      "path": "~\/\.cursor\/mcps\/vibehistory-mcp.js"\n    },/g' "$CONFIG_DIR/mcps.json"
    echo "Added VibeHistory MCP to existing configuration"
  fi
else
  # Create new config
  cat > "$CONFIG_DIR/mcps.json" << 'EOF'
{
  "mcps": [
    {
      "name": "vibehistory",
      "path": "~/.cursor/mcps/vibehistory-mcp.js"
    }
  ]
}
EOF
  echo "Created new MCP configuration"
fi

echo ""
echo "=== Installation Complete ==="
echo "VibeHistory MCP has been installed and configured."
echo "Please restart Cursor to activate the MCP."
echo ""
echo "To verify installation, send a query to the AI assistant"
echo "and then check the ~/.vibehistory/ directory." 