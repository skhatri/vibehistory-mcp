#!/bin/bash

echo "Setting up Command History MCP project..."

# Install dependencies
npm install

# Create necessary directories
mkdir -p command_history
mkdir -p example_history
mkdir -p dist

# Build the project
npm run build

echo "Setup complete! You can now run the example with:"
echo "node dist/examples/basic-usage.js" 