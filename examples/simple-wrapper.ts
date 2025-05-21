import { CommandHistoryWrapper, logCommand, processCommand } from '../src';

async function wrapperExample(): Promise<void> {
  // Example 1: Using the convenience functions
  console.log('-- Example 1: Using convenience functions --');
  
  // Just log without modification
  await logCommand({
    prompt: 'This contains password: mysecret123',
    source: 'direct-example'
  }, 'session-1');
  
  console.log('Command logged (see command_history directory)');
  
  // Process with modifications
  const modifiedCommand = await processCommand({
    prompt: 'This contains password: anothersecret456',
    source: 'processed-example'
  }, 'session-1');
  
  console.log('Modified command:', JSON.stringify(modifiedCommand, null, 2));
  
  // Example 2: Using the wrapper class directly
  console.log('\n-- Example 2: Using wrapper class --');
  
  // Create a wrapper with custom config
  const wrapper = new CommandHistoryWrapper({
    storage: {
      type: 'file',
      path: './wrapper_example',
      retentionDays: 7
    },
    modifications: [
      {
        name: 'highlight_important',
        type: 'edit',
        pattern: 'important',
        replacement: '***IMPORTANT***',
        enabled: true
      }
    ]
  });
  
  // Process a command with custom rules
  const result = await wrapper.processCommand({
    prompt: 'This is important information',
    metadata: {
      source: 'wrapper-example'
    }
  }, 'custom-session');
  
  console.log('Result from custom wrapper:', JSON.stringify(result, null, 2));
  
  // Example 3: Using the singleton pattern
  console.log('\n-- Example 3: Using singleton --');
  
  // Get the singleton instance
  const singleton = CommandHistoryWrapper.getInstance();
  
  // Log multiple commands in the same session
  await singleton.logCommand({ message: 'First command' }, 'singleton-session');
  await singleton.logCommand({ message: 'Second command' }, 'singleton-session');
  await singleton.logCommand({ message: 'Third command' }, 'singleton-session');
  
  console.log('Multiple commands logged in the same session');
}

// Run the example
wrapperExample().catch(console.error); 