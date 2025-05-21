#!/bin/bash

# VibeHistory Universal Installation Script

echo "=== VibeHistory Universal Installation ==="
echo ""

# Install the package globally
echo "Installing vibehistory package globally..."
npm install -g vibehistory

# Detect which tools are installed
CURSOR_INSTALLED=false
ROO_INSTALLED=false
CLINE_INSTALLED=false

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS paths
  if [ -d "$HOME/.cursor" ]; then
    CURSOR_INSTALLED=true
  fi
  if [ -d "$HOME/.roo" ]; then
    ROO_INSTALLED=true
  fi
  if [ -d "$HOME/.cline" ]; then
    CLINE_INSTALLED=true
  fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux paths
  if [ -d "$HOME/.cursor" ]; then
    CURSOR_INSTALLED=true
  fi
  if [ -d "$HOME/.config/Roo" ]; then
    ROO_INSTALLED=true
  fi
  if [ -d "$HOME/.cline" ]; then
    CLINE_INSTALLED=true
  fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows paths
  if [ -d "$APPDATA/Cursor" ]; then
    CURSOR_INSTALLED=true
  fi
  if [ -d "$APPDATA/Roo" ]; then
    ROO_INSTALLED=true
  fi
  if [ -d "$USERPROFILE/.cline" ]; then
    CLINE_INSTALLED=true
  fi
fi

# Install for detected tools
echo ""
echo "Detected tools:"
if [ "$CURSOR_INSTALLED" = true ]; then
  echo "- Cursor: FOUND"
  echo ""
  echo "Installing for Cursor..."
  ./install-global.sh
  echo ""
else
  echo "- Cursor: NOT FOUND"
fi

if [ "$ROO_INSTALLED" = true ]; then
  echo "- Roo: FOUND"
  echo ""
  echo "Installing for Roo..."
  ./install-roo.sh
  echo ""
else
  echo "- Roo: NOT FOUND"
fi

if [ "$CLINE_INSTALLED" = true ]; then
  echo "- Cline: FOUND"
  echo ""
  echo "Installing for Cline..."
  ./install-cline.sh
  echo ""
else
  echo "- Cline: NOT FOUND"
fi

if [ "$CURSOR_INSTALLED" = false ] && [ "$ROO_INSTALLED" = false ] && [ "$CLINE_INSTALLED" = false ]; then
  echo "No supported tools detected."
  echo "You can still use vibehistory as a library in your projects."
  echo "To install manually for a specific tool, run one of these scripts:"
  echo "- ./install-global.sh (for Cursor)"
  echo "- ./install-roo.sh (for Roo)"
  echo "- ./install-cline.sh (for Cline)"
fi

echo ""
echo "=== Installation Complete ==="
echo "To verify installation, send a query to the AI assistant"
echo "and then check the ~/.vibehistory/ directory." 