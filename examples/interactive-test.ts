import * as readline from 'readline';
import { CommandHistoryWrapper } from '../src';

// Create a user input interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create a wrapper with default config
const historyWrapper = new CommandHistoryWrapper();

// Function to process the user input
async function processInput(input: string): Promise<void> {
  try {
    console.log('\nOriginal Input:');
    console.log(input);
    
    // Create a request object
    const request = {
      prompt: input,
      timestamp: new Date().toISOString()
    };
    
    // Process the request
    const modified = await historyWrapper.processCommand(request, 'interactive-session');
    
    console.log('\nModified Output:');
    console.log(modified.prompt);
    
    console.log('\nCommand history saved. Check command_history directory.');
  } catch (error) {
    console.error('Error processing input:', error);
  }
}

// Start the interactive session
console.log('=== Command History MCP Interactive Test ===');
console.log('Type your input and see how it gets processed and stored.');
console.log('Type "exit" to quit.');
console.log('');

function promptUser(): void {
  rl.question('> ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('Exiting...');
      rl.close();
      return;
    }
    
    await processInput(input);
    promptUser();
  });
}

// Start prompting
promptUser();

// Handle cleanup on exit
rl.on('close', () => {
  console.log('Interactive test completed.');
  process.exit(0);
}); 