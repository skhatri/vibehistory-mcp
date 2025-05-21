import { createCommandHistoryMCP } from '../src';
import { AIResponseEntry } from '../src/mcps/command-history/storage';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

async function homeStorageExample() {
  console.log('=== Home Directory Storage Example ===');
  
  // Create MCP with default config (already uses home directory)
  const mcp = createCommandHistoryMCP();
  
  // Mock context
  const context = {
    sessionId: 'home-dir-example',
    requestId: 'req-' + Date.now()
  };
  
  // Example command
  const command = {
    prompt: 'This is a test command with password: topsecret123',
    parameters: { temperature: 0.7 }
  };
  
  console.log('Sending command...');
  const modifiedCommand = await mcp.processRequest(command, context);
  console.log('Modified command:', JSON.stringify(modifiedCommand, null, 2));
  
  // Example response
  const response = {
    completion: 'This is a test response from the AI model.',
    metadata: {
      tokens: 12,
      model: 'gpt-4'
    }
  };
  
  console.log('\nReceiving response...');
  await mcp.processResponse(response, context);
  
  // Check storage locations
  const packageJson = fs.readJsonSync(path.join(process.cwd(), 'package.json'));
  const projectName = packageJson.name || path.basename(process.cwd());
  
  const commandDir = path.join(os.homedir(), '.vibehistory', projectName);
  const responseDir = path.join(os.homedir(), '.vibehistory', `${projectName}.vibeR`);
  
  console.log('\nStorage Locations:');
  console.log(`Commands: ${commandDir}`);
  console.log(`Responses: ${responseDir}`);
  
  // List saved files
  if (fs.existsSync(commandDir)) {
    const commandFiles = fs.readdirSync(commandDir).filter(f => f.endsWith('.json'));
    console.log(`\nCommand files (${commandFiles.length}):`);
    commandFiles.forEach(file => console.log(`- ${file}`));
    
    if (commandFiles.length > 0) {
      const latestFile = commandFiles[commandFiles.length - 1];
      const commandData = fs.readJsonSync(path.join(commandDir, latestFile));
      console.log('\nLatest command data:');
      console.log(JSON.stringify(commandData, null, 2));
    }
  } else {
    console.log('\nNo command files found.');
  }
  
  if (fs.existsSync(responseDir)) {
    const responseFiles = fs.readdirSync(responseDir).filter(f => f.endsWith('.json'));
    console.log(`\nResponse files (${responseFiles.length}):`);
    responseFiles.forEach(file => console.log(`- ${file}`));
    
    if (responseFiles.length > 0) {
      const latestFile = responseFiles[responseFiles.length - 1];
      const responseData = fs.readJsonSync(path.join(responseDir, latestFile));
      console.log('\nLatest response data:');
      console.log(JSON.stringify(responseData, null, 2));
    }
  } else {
    console.log('\nNo response files found.');
  }
}

// Run the example
homeStorageExample().catch(console.error); 