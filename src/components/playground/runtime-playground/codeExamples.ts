interface CodeExample {
  id: string;
  name: string;
  description: string;
  code: string;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  visualizationHint: string;
}

// Utility function for artificial delay
const artificialDelay = (ms = 20) => {
  const start = Date.now();
  while (Date.now() - start < ms) {}
};

export const codeExamples: CodeExample[] = [
  {
    id: 'simple',
    name: 'Simple Function Call',
    description: 'Basic function with a single call',
    complexity: 'basic',
    code: `function artificialDelay(ms = 150) { 
  console.log("artificialDelay starting");
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
  console.log("artificialDelay completed");
}
function main() {
  console.log('Hello world!');
  artificialDelay(1500);
  console.log('Finished processing');
}
main();`,
    visualizationHint: 'You should see a single node representing the main function with a timeline showing its execution time.'
  },
  {
    id: 'nested',
    name: 'Nested Functions',
    description: 'Functions defined inside other functions',
    complexity: 'basic',
    code: `function artificialDelay(ms = 150) { 
  console.log("artificialDelay starting");
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
  console.log("artificialDelay completed");
}
function outer() {
  console.log('Outer function starting');
  
  // Define the inner function
  function inner() {
    console.log('Inner function starting');
    console.log('FUNCTION_RELATION: inner is defined inside outer');
    artificialDelay(1200);
    console.log('Inner function completed');
    return 'inner result';
  }
  
  artificialDelay(800);
  console.log('Outer function calling inner');
  
  // Call the inner function
  inner();
  
  console.log('Outer function received result from inner');
  console.log('Outer function completed');
}

// Start execution
console.log('Starting example with nested functions');
console.log('Main execution calling outer function');
outer();
console.log('Execution complete');`,
    visualizationHint: 'You should see a tree with outer as the parent node and inner as its child node, showing the nested relationship. If not, click the "Fix Nested Functions" button.'
  },
  {
    id: 'async-await',
    name: 'Async/Await',
    description: 'Asynchronous code with async/await',
    complexity: 'intermediate',
    code: `function artificialDelay(ms = 150) { 
  console.log("artificialDelay starting");
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
  console.log("artificialDelay completed");
}
async function main() {
  console.log('Main function starting');
  
  async function firstOperation() {
    console.log('First operation starting');
    await new Promise(resolve => setTimeout(resolve, 1500));
    artificialDelay(200);
    console.log('First operation completed');
    return 'first done';
  }
  
  async function secondOperation() {
    console.log('Second operation starting');
    await new Promise(resolve => setTimeout(resolve, 2000));
    artificialDelay(200);
    console.log('Second operation completed');
    return 'second done';
  }
  
  console.log('Main function calling firstOperation');
  await firstOperation();
  
  artificialDelay(800);
  
  console.log('Main function calling secondOperation');
  await secondOperation();
  
  console.log('Main function completed');
}
main();`,
    visualizationHint: 'The async main function runs over a period of time, with await pauses shown in the execution timeline spanning several seconds.'
  },
  {
    id: 'multiple-functions',
    name: 'Multiple Function Calls',
    description: 'Multiple functions calling each other in sequence',
    complexity: 'intermediate',
    code: `function artificialDelay(ms = 150) { 
  console.log("artificialDelay starting");
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
  console.log("artificialDelay completed");
}
function first() {
  console.log('First function starting');
  artificialDelay(1200);
  console.log('First function calling second');
  second();
  console.log('First function completed');
}
function second() {
  console.log('Second function starting');
  artificialDelay(1000);
  console.log('Second function calling third');
  third();
  console.log('Second function completed');
}
function third() {
  console.log('Third function starting');
  artificialDelay(1500);
  console.log('Third function completed');
}
first();`,
    visualizationHint: 'You should see a multi-level process tree showing first → second → third function call hierarchy with clear timing for each step.'
  },
  {
    id: 'callbacks',
    name: 'Callback Functions',
    description: 'Functions using callbacks for asynchronous operations',
    complexity: 'intermediate',
    code: `function artificialDelay(ms = 150) { 
  console.log("artificialDelay starting");
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
  console.log("artificialDelay completed");
}
function fetchData(callback) {
  console.log('fetchData starting');
  artificialDelay(800);
  console.log('fetchData starting async operation');
  setTimeout(() => {
    console.log('setTimeout callback starting');
    artificialDelay(500);
    console.log('Async operation completed, preparing data');
    artificialDelay(500);
    const data = { result: 'Success!', timestamp: Date.now() };
    console.log('fetchData calling callback with data');
    callback(data);
    console.log('setTimeout callback completed');
  }, 2000);
  console.log('fetchData completed');
}

function processResult(data) {
  console.log('processResult starting');
  artificialDelay(1500);
  console.log('Processing completed at', new Date(data.timestamp).toLocaleTimeString());
  console.log('processResult completed');
}

function main() {
  console.log('main starting');
  console.log('main calling fetchData');
  fetchData(processResult);
  console.log('main continuing execution');
  artificialDelay(1000);
  console.log('main completed');
}
main();`,
    visualizationHint: 'The visualization shows how callbacks create a non-linear execution flow, with processResult executing after a delay, allowing you to clearly see the asynchronous nature.'
  },
  {
    id: 'promise-chain',
    name: 'Promise Chain',
    description: 'Chain of promises demonstrating sequential async operations',
    complexity: 'advanced',
    code: `function artificialDelay(ms = 150) { 
  console.log("artificialDelay starting");
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
  console.log("artificialDelay completed");
}
function fetchUser() {
  console.log('fetchUser starting');
  artificialDelay(200);
  console.log('fetchUser creating promise');
  const promise = new Promise(resolve => {
    setTimeout(() => {
      console.log('fetchUser timeout callback starting'); 
      artificialDelay(200); 
      console.log('fetchUser resolving with user data');
      resolve({ id: 1, name: 'User' });
      console.log('fetchUser timeout callback completed');
    }, 1000);
  });
  console.log('fetchUser completed');
  return promise;
}

function fetchUserPosts(user) {
  console.log('fetchUserPosts starting with user:', user.name);
  artificialDelay(200);
  console.log('fetchUserPosts creating promise');
  const promise = new Promise(resolve => {
    setTimeout(() => {
      console.log('fetchUserPosts timeout callback starting');
      artificialDelay(200);
      console.log('fetchUserPosts resolving with posts');
      resolve(['Post 1', 'Post 2']);
      console.log('fetchUserPosts timeout callback completed');
    }, 1000);
  });
  console.log('fetchUserPosts completed');
  return promise;
}

function displayPosts(posts) {
  console.log('displayPosts starting');
  console.log('Displaying posts:', posts);
  artificialDelay(500);
  console.log('displayPosts completed');
  return posts;
}

function handleError(error) {
  console.log('handleError starting');
  console.error('Error:', error);
  console.log('handleError completed');
}

function main() {
  console.log('main starting');
  console.log('main calling fetchUser');
  fetchUser()
    .then(user => {
      console.log('main calling fetchUserPosts from then');
      return fetchUserPosts(user);
    })
    .then(posts => {
      console.log('main calling displayPosts from then');
      return displayPosts(posts);
    })
    .catch(error => {
      console.log('main calling handleError from catch');
      handleError(error);
    })
    .finally(() => {
      console.log('main completed');
    });
}
main();`,
    visualizationHint: 'The visualization shows the promise chain as a sequence of function executions with the proper parent-child relationships.'
  },
  {
    id: 'recursion',
    name: 'Recursion',
    description: 'Recursive function calls demonstrating a call stack',
    complexity: 'advanced',
    code: `function artificialDelay(ms = 150) { 
  console.log("artificialDelay starting");
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
  console.log("artificialDelay completed");
}
function factorial(n) {
  console.log('factorial starting with n =', n);
  artificialDelay(500);
  
  if (n <= 1) {
    console.log('factorial base case reached for n =', n);
    console.log('factorial completed with n =', n);
    return 1;
  }
  
  console.log('factorial calling factorial with n-1 =', (n-1));
  const subResult = factorial(n - 1);
  const result = n * subResult;
  
  console.log('factorial computed result for n =', n, 'result =', result);
  console.log('factorial completed with n =', n);
  
  return result;
}

function main() {
  console.log('main starting');
  console.log('main calling factorial');
  const result = factorial(4);
  console.log('main received factorial result:', result);
  console.log('main completed');
}

main();`,
    visualizationHint: 'See how recursive function calls build a deep tree where factorial(4) calls factorial(3), which calls factorial(2), etc., with each level unwinding after completion.'
  },
  {
    id: 'generators',
    name: 'Generator Functions',
    description: 'Using generator functions with yield statements',
    complexity: 'advanced',
    code: `function artificialDelay(ms = 150) { const start = Date.now(); while (Date.now() - start < ms) {} }
function* numberGenerator() {
  console.log('Generator started');
  artificialDelay(500);
  yield 1;
  console.log('After first yield');
  artificialDelay(500);
  yield 2;
  console.log('After second yield');
  artificialDelay(500);
  yield 3;
  console.log('Generator complete');
}
function processGenerator(generator) {
  console.log('Processing generator');
  for (const value of generator) {
    artificialDelay(200);
    console.log('Generated value:', value);
  }
  console.log('Generator processing complete');
}
function main() {
  console.log('Program started');
  const generator = numberGenerator();
  processGenerator(generator);
  console.log('Program complete');
}
main();`,
    visualizationHint: 'The visualization shows the unique execution flow of generators with yields creating pauses in execution.'
  },
  {
    id: 'complex-async',
    name: 'Complex Async Operations',
    description: 'Mixing promises, async/await, and callbacks to create a sophisticated execution tree',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { const start = Date.now(); while (Date.now() - start < ms) {} }
async function fetchData(id) {
  console.log('Fetching data for id:', id);
  artificialDelay(200);
  return new Promise(resolve => {
    setTimeout(() => { artificialDelay(200); resolve({ id, name: 'Item ' + id }); }, 800);
  });
}
async function processInParallel(ids) {
  console.log('Processing ids in parallel:', ids);
  artificialDelay(200);
  const promises = ids.map(id => fetchData(id));
  try {
    const results = await Promise.all(promises);
    artificialDelay(200);
    console.log('All promises resolved:', results);
    return results;
  } catch (error) {
    console.error('Error in parallel processing:', error);
    throw error;
  }
}
function transformData(items, callback) {
  console.log('Transforming data...');
  artificialDelay(200);
  const transformed = items.map(item => {
    console.log('Transforming item:', item.id);
    artificialDelay(300);
    return { ...item, transformed: true };
  });
  setTimeout(() => { artificialDelay(200); callback(transformed); }, 500);
}
async function main() {
  console.log('Program started');
  try {
    const item1 = await fetchData(1);
    artificialDelay(200);
    console.log('Item 1 fetched:', item1);
    const items = await processInParallel([2, 3, 4]);
    artificialDelay(200);
    new Promise(resolve => {
      transformData(items, resolve);
    }).then(transformedItems => {
      artificialDelay(200);
      console.log('Transformed items:', transformedItems);
    });
    artificialDelay(200);
    console.log('Main function continues...');
  } catch (error) {
    console.error('Main function error:', error);
  }
}
main();`,
    visualizationHint: 'This complex example shows parallel operations, sequential steps, and callbacks all in one tree. Watch how the parallel fetchData calls work simultaneously.'
  },
  {
    id: 'class-methods',
    name: 'Class Methods & Inheritance',
    description: 'Class methods with inheritance demonstrating object-oriented execution flow',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { const start = Date.now(); while (Date.now() - start < ms) {} }
class BaseService {
  constructor(name) {
    this.name = name;
    artificialDelay(100);
    console.log('BaseService created:', name);
  }
  initialize() {
    artificialDelay(100);
    console.log('Initializing', this.name);
    return this.connect();
  }
  connect() {
    artificialDelay(200);
    console.log('Base connect method called');
    return Promise.resolve('Connected');
  }
  process(data) {
    artificialDelay(200);
    console.log('Base processing:', data);
    return data;
  }
}
class UserService extends BaseService {
  constructor() {
    super('UserService');
    artificialDelay(100);
    console.log('UserService created');
  }
  connect() {
    artificialDelay(200);
    console.log('UserService connecting to user database');
    return new Promise(resolve => {
      setTimeout(() => {
        artificialDelay(200);
        console.log('UserService connected');
        resolve('User DB Connected');
      }, 1000);
    });
  }
  async fetchUsers() {
    artificialDelay(100);
    console.log('Fetching users');
    await new Promise(resolve => setTimeout(resolve, 800));
    artificialDelay(100);
    return ['User1', 'User2'];
  }
  process(data) {
    artificialDelay(200);
    console.log('Processing in UserService');
    const result = super.process(data);
    artificialDelay(200);
    console.log('UserService specific processing');
    return { ...result, processed: true };
  }
}
async function main() {
  artificialDelay(100);
  console.log('Application starting');
  const userService = new UserService();
  await userService.initialize();
  const users = await userService.fetchUsers();
  artificialDelay(100);
  console.log('Users fetched:', users);
  const processedData = userService.process({ users });
  artificialDelay(100);
  console.log('Final result:', processedData);
  artificialDelay(100);
  console.log('Application complete');
}
main();`,
    visualizationHint: 'The visualization shows the inheritance patterns, with parent methods being called through super and class hierarchies visible in the process tree.'
  },
  {
    id: 'stress-test',
    name: 'Hierarchical Stress Test',
    description: 'Complex hierarchical function calls to test visualization',
    complexity: 'advanced',
    code: `function artificialDelay(ms = 150) { const start = Date.now(); while (Date.now() - start < ms) {} }

function main() {
  console.log('Main function starting');
  artificialDelay(500);
  
  levelA1();
  levelA2();
  
  console.log('Main function completed');
}

function levelA1() {
  console.log('Level A1 starting');
  artificialDelay(300);
  
  levelB1();
  levelB2();
  
  console.log('Level A1 completed');
}

function levelA2() {
  console.log('Level A2 starting');
  artificialDelay(300);
  
  levelB3();
  
  console.log('Level A2 completed');
}

function levelB1() {
  console.log('Level B1 starting');
  artificialDelay(200);
  
  levelC1();
  levelC2();
  
  console.log('Level B1 completed');
}

function levelB2() {
  console.log('Level B2 starting');
  artificialDelay(150);
  console.log('Level B2 completed');
}

function levelB3() {
  console.log('Level B3 starting');
  artificialDelay(250);
  
  levelC3();
  
  console.log('Level B3 completed');
}

function levelC1() {
  console.log('Level C1 starting');
  artificialDelay(100);
  console.log('Level C1 completed');
}

function levelC2() {
  console.log('Level C2 starting');
  artificialDelay(100);
  console.log('Level C2 completed');
}

function levelC3() {
  console.log('Level C3 starting');
  artificialDelay(150);
  console.log('Level C3 completed');
}

main();`,
    visualizationHint: 'This test creates a complex tree with 10+ nodes in a hierarchical structure to stress test the visualization system.'
  },
  
  {
    id: 'async-stress-test',
    name: 'Async Stress Test',
    description: 'Complex async functions with callbacks to test visualization',
    complexity: 'advanced',
    code: `function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('Main function starting');
  await delay(500);
  
  await Promise.all([
    asyncLevelA1(),
    asyncLevelA2()
  ]);
  
  console.log('Main function completed');
}

async function asyncLevelA1() {
  console.log('Async Level A1 starting');
  await delay(300);
  
  setTimeout(() => {
    console.log('Timeout in A1 executing');
    callbackFunction();
  }, 200);
  
  await asyncLevelB1();
  await asyncLevelB2();
  
  console.log('Async Level A1 completed');
}

async function asyncLevelA2() {
  console.log('Async Level A2 starting');
  await delay(300);
  
  await asyncLevelB3();
  
  console.log('Async Level A2 completed');
}

async function asyncLevelB1() {
  console.log('Async Level B1 starting');
  await delay(200);
  
  await Promise.all([
    asyncLevelC1(),
    asyncLevelC2()
  ]);
  
  console.log('Async Level B1 completed');
}

async function asyncLevelB2() {
  console.log('Async Level B2 starting');
  await delay(150);
  console.log('Async Level B2 completed');
}

async function asyncLevelB3() {
  console.log('Async Level B3 starting');
  await delay(250);
  
  await asyncLevelC3();
  
  console.log('Async Level B3 completed');
}

async function asyncLevelC1() {
  console.log('Async Level C1 starting');
  await delay(100);
  console.log('Async Level C1 completed');
}

async function asyncLevelC2() {
  console.log('Async Level C2 starting');
  await delay(100);
  console.log('Async Level C2 completed');
}

async function asyncLevelC3() {
  console.log('Async Level C3 starting');
  await delay(150);
  console.log('Async Level C3 completed');
}

function callbackFunction() {
  console.log('Callback function executing');
  nestedCallback();
}

function nestedCallback() {
  console.log('Nested callback executing');
}

main();`,
    visualizationHint: 'This test creates a complex async tree with promises, timeouts, and callbacks to stress test the visualization system.'
  },
  {
    id: 'event-emission-test',
    name: 'Event Emission Test',
    description: 'Test visualization syncing with DEBUG_EVENT_EMISSION events',
    complexity: 'intermediate',
    code: `// Simple delay function
function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

// Root function
function main() {
  console.log('Main function starting');
  artificialDelay(300);
  
  // First branch
  console.log('Calling branch1 from main');
  branch1();
  
  // Second branch
  console.log('Calling branch2 from main');
  branch2();
  
  console.log('Main function completed');
}

// First branch
function branch1() {
  console.log('Branch1 starting');
  artificialDelay(200);
  
  // Log events that indicate our position in the call stack
  console.log('DEBUG_EVENT_EMISSION positions', {
    id: 'fn-branch1',
    parentId: 'fn-main',
    status: 'running'
  });
  
  // Call sub-functions
  subFunction1();
  subFunction2();
  
  console.log('Branch1 completed');
}

// Second branch
function branch2() {
  console.log('Branch2 starting');
  artificialDelay(200);
  
  // Log events that indicate our position in the call stack
  console.log('DEBUG_EVENT_EMISSION positions', {
    id: 'fn-branch2',
    parentId: 'fn-main',
    status: 'running'
  });
  
  // Use setTimeout to verify async operations work
  setTimeout(() => {
    console.log('Async operation in branch2');
    asyncFunction();
  }, 500);
  
  console.log('Branch2 completed');
}

// Sub-functions for branch1
function subFunction1() {
  console.log('SubFunction1 starting');
  artificialDelay(150);
  
  // Log events that indicate our position in the call stack
  console.log('DEBUG_EVENT_EMISSION positions', {
    id: 'fn-subFunction1',
    parentId: 'fn-branch1',
    status: 'running'
  });
  
  console.log('SubFunction1 completed');
}

function subFunction2() {
  console.log('SubFunction2 starting');
  artificialDelay(150);
  
  // Log events that indicate our position in the call stack
  console.log('DEBUG_EVENT_EMISSION positions', {
    id: 'fn-subFunction2',
    parentId: 'fn-branch1',
    status: 'running'
  });
  
  console.log('SubFunction2 completed');
}

// Async function called from setTimeout
function asyncFunction() {
  console.log('AsyncFunction starting');
  artificialDelay(100);
  
  // Log events that indicate our position in the call stack
  console.log('DEBUG_EVENT_EMISSION positions', {
    id: 'fn-asyncFunction',
    parentId: 'callback', // This will be filled in by instrumentation
    status: 'running'
  });
  
  console.log('AsyncFunction completed');
}

// Run the test
main();`,
    visualizationHint: 'This test checks that the visualization correctly syncs with the DEBUG_EVENT_EMISSION events, creating the proper hierarchy with accurate parent-child relationships.'
  },
  {
    id: 'sync-test',
    name: 'Sync Test',
    description: 'Test for sync-ing with console output',
    complexity: 'basic',
    code: `// Simple delay function that blocks the main thread
function delay(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {}
}

// Main function that calls other functions
function main() {
  console.log('Main function starting');
  delay(500);
  
  // Call function1 which will be shown in visualization
  function1();
  
  // Call function2 which will also be shown
  function2();
  
  console.log('Main function completed');
}

// First function definition
function function1() {
  console.log('Function1 starting');
  delay(300);
  
  // Output explicit debug info to help syncing
  console.log('[DEBUG_FUNCTION_STATUS] function1 is now running');
  
  console.log('Function1 completed');
}

// Second function definition
function function2() {
  console.log('Function2 starting');
  delay(300);
  
  // Output explicit debug info to help syncing
  console.log('[DEBUG_FUNCTION_STATUS] function2 is now running');
  
  console.log('Function2 completed');
}

// Run the test
main();`,
    visualizationHint: 'This test checks that the "Sync Status" button correctly updates the visualization to match the console output. Try clicking the button if functions are stuck in the "running" state.'
  },
  {
    id: 'delay-test',
    name: 'Artificial Delay Test',
    description: 'Test how artificial delay affects visualization',
    complexity: 'basic',
    code: `function artificialDelay(ms = 150) {
  console.log("artificialDelay starting");
  const start = Date.now();
  while (Date.now() - start < ms) {}
  console.log("artificialDelay completed");
}

// Main function with delays
function first() {
  console.log("First function starting");
  artificialDelay(500); // Add a delay
  console.log("First function calling second");
  second();
  console.log("First function completed");
}

function second() {
  console.log("Second function starting");
  artificialDelay(800); // Add a longer delay
  console.log("Second function calling third");
  third();
  console.log("Second function completed");
}

function third() {
  console.log("Third function starting");
  artificialDelay(300); // Add a short delay
  console.log("Third function completed");
}

// Run the test
first();`,
    visualizationHint: 'This example tests whether artificial delays are properly visualized and marked as completed.'
  },
  {
    id: 'timing-precision',
    name: 'Timing Precision Test',
    description: 'Test the timing precision of artificial delays in visualization',
    complexity: 'basic',
    code: `function artificialDelay(ms = 150) {
  console.log("artificialDelay starting");
  const start = Date.now();
  while (Date.now() - start < ms) {}
  console.log("artificialDelay completed");
}

// Main function that will call the same delay function with different durations
function main() {
  console.log("Main function starting");
  
  // Short delay
  console.log("Running short delay (100ms)");
  artificialDelay(100);
  
  // Medium delay
  console.log("Running medium delay (500ms)");
  artificialDelay(500);
  
  // Long delay
  console.log("Running long delay (1000ms)");
  artificialDelay(1000);
  
  console.log("Main function completed");
}

// Run the test
main();`,
    visualizationHint: 'This example tests whether the visualization accurately reflects the different durations of the artificial delays.'
  },
  {
    id: 'nested-delays',
    name: 'Nested Delays Test',
    description: 'Test nested function calls with different artificial delays',
    complexity: 'intermediate',
    code: `function artificialDelay(ms = 150) {
  console.log("artificialDelay starting");
  const start = Date.now();
  while (Date.now() - start < ms) {}
  console.log("artificialDelay completed");
}

// Each function introduces its own delay, creating a measurable timing hierarchy

function level1() {
  console.log("level1 starting");
  artificialDelay(200);  // 200ms delay
  
  console.log("level1 calling level2A");
  level2A();
  
  console.log("level1 calling level2B");
  level2B();
  
  artificialDelay(100);  // Another 100ms delay
  console.log("level1 completed");
}

function level2A() {
  console.log("level2A starting");
  artificialDelay(300);  // 300ms delay
  
  console.log("level2A calling level3");
  level3();
  
  artificialDelay(150);  // Another 150ms delay
  console.log("level2A completed");
}

function level2B() {
  console.log("level2B starting");
  artificialDelay(250);  // 250ms delay
  console.log("level2B completed");
}

function level3() {
  console.log("level3 starting");
  artificialDelay(400);  // 400ms delay
  console.log("level3 completed");
}

// Start the test
level1();`,
    visualizationHint: 'This test shows nested function calls with different artificial delays. The visualization should accurately reflect the hierarchy and timing of each function.'
  },

  // NEW STRESS TEST CASES
  {
    id: 'new-mixed-async-patterns',
    name: 'NEW: Mixed Async Patterns',
    description: 'Complex mix of promises, callbacks, and setTimeout',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

function asyncWithCallback(data, callback) {
  console.log('asyncWithCallback starting with:', data);
  artificialDelay(100);
  
  setTimeout(() => {
    console.log('asyncWithCallback timeout executing');
    artificialDelay(200);
    
    // Create a promise within the callback
    const promise = new Promise(resolve => {
      setTimeout(() => {
        console.log('nested promise resolving');
        artificialDelay(150);
        resolve(data + ' processed');
      }, 500);
    });
    
    promise.then(result => {
      console.log('nested promise resolved with:', result);
      callback(result);
    });
  }, 300);
  
  console.log('asyncWithCallback setup completed');
}

async function asyncFunction(input) {
  console.log('asyncFunction starting with:', input);
  
  return new Promise((resolve, reject) => {
    asyncWithCallback(input, (result) => {
      console.log('asyncFunction received callback result:', result);
      artificialDelay(100);
      
      // Chain another async operation
      setTimeout(() => {
        console.log('final timeout in asyncFunction');
        artificialDelay(200);
        resolve(result + ' finalized');
      }, 400);
    });
  });
}

function main() {
  console.log('main starting complex async pattern test');
  
  asyncFunction('test-data')
    .then(finalResult => {
      console.log('main received final result:', finalResult);
      artificialDelay(100);
      
      // Start another async operation after the first completes
      return asyncFunction('second-test');
    })
    .then(secondResult => {
      console.log('main completed second async operation:', secondResult);
    })
    .catch(error => {
      console.error('main caught error:', error);
    })
    .finally(() => {
      console.log('main async operations completed');
    });
    
  console.log('main continuing synchronously');
  artificialDelay(200);
  console.log('main sync portion completed');
}

main();`,
    visualizationHint: 'Tests complex nested async patterns with multiple layers of callbacks, promises, and timeouts to stress-test the parent-child relationship tracking.'
  },

  {
    id: 'new-parallel-promises',
    name: 'NEW: Parallel Promise Execution',
    description: 'Multiple promises running in parallel with Promise.all',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

function createTask(id, delay) {
  console.log('createTask starting for task', id);
  artificialDelay(100);
  
  return new Promise(resolve => {
    console.log('task', id, 'promise created');
    setTimeout(() => {
      console.log('task', id, 'timeout executing');
      artificialDelay(200);
      
      // Nested async operation within each task
      setTimeout(() => {
        console.log('task', id, 'nested timeout executing');
        artificialDelay(150);
        
        const result = { taskId: id, completed: true, timestamp: Date.now() };
        console.log('task', id, 'resolving with result');
        resolve(result);
      }, delay / 2);
    }, delay);
  });
}

function processResults(results) {
  console.log('processResults starting with', results.length, 'results');
  artificialDelay(300);
  
  results.forEach((result, index) => {
    console.log('processing result', index, ':', result.taskId);
    artificialDelay(100);
  });
  
  console.log('processResults completed');
  return results.map(r => ({ ...r, processed: true }));
}

async function main() {
  console.log('main starting parallel execution test');
  
  // Create multiple parallel tasks
  const tasks = [
    createTask('A', 800),
    createTask('B', 1200),
    createTask('C', 600),
    createTask('D', 1000)
  ];
  
  console.log('main created all tasks, waiting for completion');
  artificialDelay(200);
  
  try {
    const results = await Promise.all(tasks);
    console.log('main received all parallel results');
    
    const processedResults = processResults(results);
    console.log('main processing completed');
    
    // Chain another operation
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('main final operation completing');
        artificialDelay(250);
        resolve(processedResults);
      }, 500);
    });
    
  } catch (error) {
    console.error('main caught error in parallel execution:', error);
  }
}

main().then(finalResults => {
  console.log('execution completed with', finalResults ? finalResults.length : 0, 'results');
});`,
    visualizationHint: 'Tests parallel promise execution to see if the visualizer correctly handles multiple concurrent async operations and their proper completion timing.'
  },

  {
    id: 'new-error-handling',
    name: 'NEW: Error Handling & Recovery',
    description: 'Complex error scenarios with promise rejections and recovery',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

function riskyOperation(shouldFail = false) {
  console.log('riskyOperation starting, shouldFail:', shouldFail);
  artificialDelay(100);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('riskyOperation timeout executing');
      artificialDelay(200);
      
      if (shouldFail) {
        console.log('riskyOperation rejecting with error');
        reject(new Error('Intentional failure'));
      } else {
        console.log('riskyOperation resolving successfully');
        resolve('Success data');
      }
    }, 600);
  });
}

function recoveryOperation(error) {
  console.log('recoveryOperation starting for error:', error.message);
  artificialDelay(150);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('recoveryOperation timeout executing');
      artificialDelay(200);
      resolve('Recovered data');
    }, 400);
  });
}

function finalCleanup() {
  console.log('finalCleanup starting');
  artificialDelay(200);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('finalCleanup timeout executing');
      artificialDelay(100);
      console.log('finalCleanup completed');
      resolve('Cleanup done');
    }, 300);
  });
}

async function main() {
  console.log('main starting error handling test');
  
  // Test successful path
  try {
    console.log('main attempting successful operation');
    const successResult = await riskyOperation(false);
    console.log('main received success result:', successResult);
  } catch (error) {
    console.error('main caught unexpected error:', error.message);
  }
  
  artificialDelay(200);
  
  // Test error and recovery path
  try {
    console.log('main attempting risky operation that will fail');
    const failResult = await riskyOperation(true);
    console.log('main received unexpected success:', failResult);
  } catch (error) {
    console.log('main caught expected error:', error.message);
    
    try {
      console.log('main attempting recovery');
      const recoveryResult = await recoveryOperation(error);
      console.log('main received recovery result:', recoveryResult);
    } catch (recoveryError) {
      console.error('main recovery also failed:', recoveryError.message);
    }
  } finally {
    console.log('main executing finally block');
    await finalCleanup();
    console.log('main finally block completed');
  }
  
  console.log('main error handling test completed');
}

main();`,
    visualizationHint: 'Tests error handling, promise rejections, catch blocks, and finally blocks to ensure the visualization properly tracks error flows and recovery operations.'
  },

  {
    id: 'new-recursive-promises',
    name: 'NEW: Recursive Promises',
    description: 'Recursive functions that return promises',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

function recursiveAsync(depth, maxDepth = 5) {
  console.log('recursiveAsync starting, depth:', depth, 'maxDepth:', maxDepth);
  artificialDelay(100);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('recursiveAsync timeout at depth:', depth);
      artificialDelay(150);
      
      if (depth >= maxDepth) {
        console.log('recursiveAsync base case reached at depth:', depth);
        resolve(depth);
      } else {
        console.log('recursiveAsync calling deeper level:', depth + 1);
        
        recursiveAsync(depth + 1, maxDepth).then(result => {
          console.log('recursiveAsync received result from depth:', depth + 1, 'result:', result);
          artificialDelay(100);
          const currentResult = result + depth;
          console.log('recursiveAsync computed result at depth:', depth, 'returning:', currentResult);
          resolve(currentResult);
        });
      }
    }, 300 + (depth * 100)); // Increasing delay at each level
  });
}

function processRecursiveResult(result) {
  console.log('processRecursiveResult starting with:', result);
  artificialDelay(200);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('processRecursiveResult timeout executing');
      artificialDelay(150);
      const processedResult = result * 2;
      console.log('processRecursiveResult completed, returning:', processedResult);
      resolve(processedResult);
    }, 400);
  });
}

async function main() {
  console.log('main starting recursive promise test');
  
  try {
    console.log('main calling recursiveAsync');
    const recursiveResult = await recursiveAsync(1, 4);
    console.log('main received recursive result:', recursiveResult);
    
    console.log('main processing recursive result');
    const finalResult = await processRecursiveResult(recursiveResult);
    console.log('main received final processed result:', finalResult);
    
  } catch (error) {
    console.error('main caught error in recursive operations:', error);
  }
  
  console.log('main recursive promise test completed');
}

main();`,
    visualizationHint: 'Tests recursive promise chains to see if the visualization can handle deep call stacks with async operations and maintain proper parent-child relationships at each recursion level.'
  },

  {
    id: 'new-timing-edge-cases',
    name: 'NEW: Timing Edge Cases',
    description: 'Very short and very long delays to test timing precision',
    complexity: 'advanced',
    code: `function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

function microDelay() {
  console.log('microDelay starting');
  artificialDelay(1); // Very short delay
  console.log('microDelay completed');
}

function macroDelay() {
  console.log('macroDelay starting');
  artificialDelay(2000); // Long delay
  console.log('macroDelay completed');
}

function zeroDelay() {
  console.log('zeroDelay starting');
  artificialDelay(0); // Zero delay
  console.log('zeroDelay completed');
}

function rapidFire() {
  console.log('rapidFire starting');
  
  for (let i = 0; i < 5; i++) {
    console.log('rapidFire iteration:', i);
    artificialDelay(50); // Multiple short delays
  }
  
  console.log('rapidFire completed');
}

function asyncTimingTest() {
  console.log('asyncTimingTest starting');
  
  return new Promise(resolve => {
    // Very short timeout
    setTimeout(() => {
      console.log('asyncTimingTest short timeout');
      microDelay();
      
      // Another timeout with medium delay
      setTimeout(() => {
        console.log('asyncTimingTest medium timeout');
        artificialDelay(500);
        
        // Final timeout with zero delay
        setTimeout(() => {
          console.log('asyncTimingTest zero timeout');
          zeroDelay();
          resolve('timing test complete');
        }, 0);
        
      }, 200);
      
    }, 10);
  });
}

function main() {
  console.log('main starting timing edge cases test');
  
  microDelay();
  zeroDelay();
  rapidFire();
  
  asyncTimingTest().then(result => {
    console.log('main async timing completed:', result);
    macroDelay(); // Long delay at the end
    console.log('main timing edge cases test completed');
  });
  
  console.log('main sync portion completed');
}

main();`,
    visualizationHint: 'Tests edge cases with very short delays (1ms), zero delays, and very long delays (2000ms) to verify timing precision and visualization accuracy.'
  },

  {
    id: 'new-promise-race',
    name: 'NEW: Promise Race Conditions',
    description: 'Promise.race with competing async operations',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

function fastTask(id) {
  console.log('fastTask', id, 'starting');
  artificialDelay(100);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('fastTask', id, 'timeout executing');
      artificialDelay(100);
      resolve('fast-' + id);
    }, 300);
  });
}

function slowTask(id) {
  console.log('slowTask', id, 'starting');
  artificialDelay(100);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('slowTask', id, 'timeout executing (this should lose the race)');
      artificialDelay(200);
      resolve('slow-' + id);
    }, 1000);
  });
}

function mediumTask(id) {
  console.log('mediumTask', id, 'starting');
  artificialDelay(100);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('mediumTask', id, 'timeout executing');
      artificialDelay(150);
      resolve('medium-' + id);
    }, 600);
  });
}

function processWinner(winner) {
  console.log('processWinner starting with:', winner);
  artificialDelay(200);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('processWinner timeout executing');
      artificialDelay(100);
      resolve(winner + '-processed');
    }, 300);
  });
}

async function main() {
  console.log('main starting promise race test');
  
  // First race: fast vs slow
  console.log('main starting first race (fast vs slow)');
  const race1 = Promise.race([
    fastTask('A'),
    slowTask('B')
  ]);
  
  try {
    const winner1 = await race1;
    console.log('main first race winner:', winner1);
    
    const processed1 = await processWinner(winner1);
    console.log('main first race processed result:', processed1);
    
  } catch (error) {
    console.error('main first race error:', error);
  }
  
  artificialDelay(200);
  
  // Second race: multiple competitors
  console.log('main starting second race (multiple competitors)');
  const race2 = Promise.race([
    fastTask('C'),
    mediumTask('D'),
    slowTask('E'),
    fastTask('F')
  ]);
  
  try {
    const winner2 = await race2;
    console.log('main second race winner:', winner2);
    
    const processed2 = await processWinner(winner2);
    console.log('main second race processed result:', processed2);
    
  } catch (error) {
    console.error('main second race error:', error);
  }
  
  console.log('main promise race test completed');
}

main();`,
    visualizationHint: 'Tests Promise.race to see how the visualization handles competing async operations where only the fastest one matters, and whether losing operations are properly tracked.'
  },

  {
    id: 'new-nested-workers',
    name: 'NEW: Deeply Nested Async Workers',
    description: 'Complex nested async operations with multiple layers',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

function worker1(data) {
  console.log('worker1 starting with:', data);
  artificialDelay(100);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('worker1 timeout executing');
      artificialDelay(150);
      
      // worker1 calls worker2
      worker2(data + '-w1').then(result => {
        console.log('worker1 received result from worker2:', result);
        artificialDelay(100);
        resolve(result + '-completed');
      });
    }, 400);
  });
}

function worker2(data) {
  console.log('worker2 starting with:', data);
  artificialDelay(100);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('worker2 timeout executing');
      artificialDelay(150);
      
      // worker2 calls worker3
      worker3(data + '-w2').then(result => {
        console.log('worker2 received result from worker3:', result);
        artificialDelay(100);
        
        // worker2 also calls worker4 in parallel
        worker4(data + '-w2-parallel').then(parallelResult => {
          console.log('worker2 received parallel result from worker4:', parallelResult);
          artificialDelay(100);
          resolve(result + '-' + parallelResult);
        });
      });
    }, 300);
  });
}

function worker3(data) {
  console.log('worker3 starting with:', data);
  artificialDelay(100);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('worker3 timeout executing');
      artificialDelay(200);
      
      // worker3 is the deepest and creates its own nested operation
      const nestedOperation = new Promise(innerResolve => {
        setTimeout(() => {
          console.log('worker3 nested operation executing');
          artificialDelay(150);
          innerResolve(data + '-w3-nested');
        }, 200);
      });
      
      nestedOperation.then(nestedResult => {
        console.log('worker3 nested operation completed:', nestedResult);
        artificialDelay(100);
        resolve(nestedResult);
      });
    }, 500);
  });
}

function worker4(data) {
  console.log('worker4 starting with:', data);
  artificialDelay(100);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('worker4 timeout executing');
      artificialDelay(200);
      resolve(data + '-w4');
    }, 250);
  });
}

function coordinator(initialData) {
  console.log('coordinator starting with:', initialData);
  artificialDelay(150);
  
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('coordinator timeout executing');
      artificialDelay(100);
      
      // Start multiple worker chains
      const chain1 = worker1(initialData + '-chain1');
      const chain2 = worker1(initialData + '-chain2');
      
      Promise.all([chain1, chain2]).then(results => {
        console.log('coordinator received all chain results:', results);
        artificialDelay(200);
        resolve(results.join(' | '));
      });
    }, 200);
  });
}

async function main() {
  console.log('main starting deeply nested async workers test');
  
  try {
    const coordinatorResult = await coordinator('initial-data');
    console.log('main received coordinator result:', coordinatorResult);
    
    // Additional processing after coordination
    artificialDelay(300);
    console.log('main additional processing completed');
    
  } catch (error) {
    console.error('main caught error in nested workers:', error);
  }
  
  console.log('main deeply nested async workers test completed');
}

main();`,
    visualizationHint: 'Tests deeply nested async operations with multiple layers of workers calling each other, parallel operations, and complex dependency chains to stress-test the visualization hierarchy.'
  },

  // DIABOLICAL EDGE CASES THAT COULD BREAK THE SYSTEM
  {
    id: 'break-self-modifying',
    name: 'BREAK: Self-Modifying Functions',
    description: 'Functions that redefine themselves and other functions',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

// Function that redefines itself
function selfModifying() {
  console.log('selfModifying: first execution');
  artificialDelay(200);
  
  // Redefine myself for future calls
  selfModifying = function() {
    console.log('selfModifying: redefined version');
    artificialDelay(100);
    
    // Redefine myself again!
    selfModifying = function() {
      console.log('selfModifying: third version');
      artificialDelay(50);
    };
  };
  
  console.log('selfModifying: first execution completed');
}

// Function that redefines other functions
function functionKiller() {
  console.log('functionKiller: starting chaos');
  artificialDelay(100);
  
  // Try to break the instrumentation by redefining console.log
  const originalLog = console.log;
  console.log = function(...args) {
    originalLog('HIJACKED:', ...args);
  };
  
  // Redefine setTimeout
  const originalSetTimeout = setTimeout;
  setTimeout = function(callback, delay) {
    console.log('HIJACKED setTimeout called with delay:', delay);
    return originalSetTimeout(callback, delay);
  };
  
  console.log('functionKiller: chaos unleashed');
  artificialDelay(200);
}

// Function that deletes itself
function suicidalFunction() {
  console.log('suicidalFunction: about to delete myself');
  artificialDelay(100);
  
  delete globalThis.suicidalFunction;
  
  console.log('suicidalFunction: I should not exist anymore');
  artificialDelay(100);
}

function main() {
  console.log('main: starting self-modifying function test');
  
  // Call self-modifying function multiple times
  selfModifying(); // First version
  selfModifying(); // Second version
  selfModifying(); // Third version
  selfModifying(); // Still third version
  
  // Call the function killer
  functionKiller();
  
  // Call the suicidal function
  suicidalFunction();
  
  // Try to call the deleted function (this should cause an error)
  try {
    suicidalFunction();
  } catch (error) {
    console.log('main: caught expected error:', error.message);
  }
  
  console.log('main: self-modifying test completed');
}

main();`,
    visualizationHint: 'Tests functions that modify themselves and other functions at runtime, potentially breaking the instrumentation tracking.'
  },

  {
    id: 'break-dynamic-functions',
    name: 'BREAK: Dynamic Function Creation',
    description: 'Dynamically created functions and eval usage',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

function dynamicFunctionCreator() {
  console.log('dynamicFunctionCreator: creating functions on the fly');
  artificialDelay(100);
  
  // Create function using Function constructor
  const dynamicFunc1 = new Function('arg', \`
    console.log('Dynamic function 1 executing with:', arg);
    const start = Date.now(); 
    while (Date.now() - start < 150) {} 
    console.log('Dynamic function 1 completed');
    return arg + '-processed';
  \`);
  
  // Create function using eval
  const functionCode = \`
    function evalCreatedFunction(data) {
      console.log('Eval-created function executing with:', data);
      const start = Date.now(); 
      while (Date.now() - start < 200) {} 
      console.log('Eval-created function completed');
      return data + '-eval-processed';
    }
  \`;
  
  eval(functionCode);
  
  // Call the dynamically created functions
  const result1 = dynamicFunc1('test-data');
  console.log('dynamicFunctionCreator: result1:', result1);
  
  const result2 = evalCreatedFunction('eval-data');
  console.log('dynamicFunctionCreator: result2:', result2);
  
  artificialDelay(100);
  console.log('dynamicFunctionCreator: completed');
}

function higherOrderMadness() {
  console.log('higherOrderMadness: creating function factories');
  artificialDelay(100);
  
  // Function that returns a function that returns a function
  const createComplexFunction = (level) => {
    return (data) => {
      console.log(\`Level \${level} function executing with:\`, data);
      artificialDelay(50 * level);
      
      if (level > 1) {
        const innerFunc = createComplexFunction(level - 1);
        return innerFunc(data + \`-L\${level}\`);
      } else {
        console.log(\`Base level reached with:\`, data);
        return data + '-final';
      }
    };
  };
  
  const complexFunc = createComplexFunction(4);
  const result = complexFunc('start');
  console.log('higherOrderMadness: result:', result);
  
  artificialDelay(100);
  console.log('higherOrderMadness: completed');
}

// Immediately Invoked Function Expression (IIFE) chaos
(function() {
  console.log('IIFE: Anonymous function executing');
  artificialDelay(100);
  
  (function namedIIFE() {
    console.log('IIFE: Named IIFE executing');
    artificialDelay(100);
    
    // Nested IIFE
    (function() {
      console.log('IIFE: Nested anonymous IIFE');
      artificialDelay(50);
    })();
    
  })();
  
})();

function main() {
  console.log('main: starting dynamic function creation test');
  
  dynamicFunctionCreator();
  higherOrderMadness();
  
  console.log('main: dynamic function test completed');
}

main();`,
    visualizationHint: 'Tests dynamically created functions using Function constructor, eval, higher-order functions, and IIFEs that could confuse the instrumentation.'
  },

  {
    id: 'break-infinite-loops',
    name: 'BREAK: Infinite Loops & Runaway Code',
    description: 'Code that never terminates or runs for a very long time',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

function controlledInfiniteLoop() {
  console.log('controlledInfiniteLoop: starting controlled infinite loop');
  
  let counter = 0;
  const maxIterations = 1000000; // Limit to prevent browser crash
  
  const start = Date.now();
  while (counter < maxIterations) {
    counter++;
    
    // Break after 2 seconds to prevent hanging
    if (Date.now() - start > 2000) {
      console.log('controlledInfiniteLoop: breaking due to time limit, iterations:', counter);
      break;
    }
  }
  
  console.log('controlledInfiniteLoop: completed with', counter, 'iterations');
}

function recursiveMadness(depth = 0, maxDepth = 100) {
  console.log('recursiveMadness: depth', depth);
  
  if (depth >= maxDepth) {
    console.log('recursiveMadness: max depth reached, stopping recursion');
    return depth;
  }
  
  // Add small delay to prevent stack overflow too quickly
  artificialDelay(1);
  
  // Create multiple recursive branches
  const branch1 = recursiveMadness(depth + 1, maxDepth);
  const branch2 = recursiveMadness(depth + 1, maxDepth);
  
  return branch1 + branch2;
}

function memoryIntensiveOperation() {
  console.log('memoryIntensiveOperation: creating large arrays');
  artificialDelay(100);
  
  // Create large arrays to stress memory
  const largeArray1 = new Array(100000).fill(0).map((_, i) => ({ id: i, data: 'test-' + i }));
  console.log('memoryIntensiveOperation: created array 1 with', largeArray1.length, 'items');
  
  artificialDelay(100);
  
  const largeArray2 = new Array(100000).fill(0).map((_, i) => ({ id: i, data: 'test-' + i }));
  console.log('memoryIntensiveOperation: created array 2 with', largeArray2.length, 'items');
  
  // Process the arrays
  let sum = 0;
  for (let i = 0; i < Math.min(10000, largeArray1.length); i++) {
    sum += largeArray1[i].id + largeArray2[i].id;
  }
  
  console.log('memoryIntensiveOperation: processing completed, sum:', sum);
  artificialDelay(100);
}

function rapidFireFunctions() {
  console.log('rapidFireFunctions: starting rapid function calls');
  
  function rapidFunc(id) {
    artificialDelay(1); // Very short delay
    return id * 2;
  }
  
  // Call the same function many times rapidly
  for (let i = 0; i < 1000; i++) {
    rapidFunc(i);
  }
  
  console.log('rapidFireFunctions: completed 1000 rapid calls');
}

function neverEndingPromise() {
  console.log('neverEndingPromise: creating promise that never resolves');
  
  return new Promise((resolve) => {
    // This promise intentionally never resolves to test timeout handling
    console.log('neverEndingPromise: promise created but will never resolve');
    
    // Set a timer to resolve it after a reasonable time for testing
    setTimeout(() => {
      console.log('neverEndingPromise: finally resolving after timeout');
      resolve('finally-resolved');
    }, 5000); // 5 second timeout
  });
}

async function main() {
  console.log('main: starting runaway code test');
  
  controlledInfiniteLoop();
  
  console.log('main: starting recursive madness');
  const recursiveResult = recursiveMadness(0, 50); // Limit depth to prevent stack overflow
  console.log('main: recursive result:', recursiveResult);
  
  memoryIntensiveOperation();
  rapidFireFunctions();
  
  console.log('main: starting never-ending promise test');
  const promiseResult = await neverEndingPromise();
  console.log('main: never-ending promise result:', promiseResult);
  
  console.log('main: runaway code test completed');
}

main();`,
    visualizationHint: 'Tests infinite loops, deep recursion, memory-intensive operations, and promises that never resolve to see how the visualization handles runaway code.'
  },

  {
    id: 'break-parser-confusion',
    name: 'BREAK: Parser Confusion',
    description: 'Code designed to confuse the function parser',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

// Function with confusing string content
function stringConfusion() {
  console.log('stringConfusion: starting string chaos');
  artificialDelay(100);
  
  const fakeFunction = "function notRealFunction() { return 'fake'; }";
  console.log('stringConfusion: fake function string:', fakeFunction);
  
  const regexWithFunction = /function\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*\\(/g;
  console.log('stringConfusion: regex pattern:', regexWithFunction);
  
  const templateLiteral = \`
    This looks like a function but it's not:
    function templateFunction() {
      console.log('This is just a string!');
      artificialDelay(100);
    }
  \`;
  console.log('stringConfusion: template literal:', templateLiteral);
  
  artificialDelay(100);
  console.log('stringConfusion: completed');
}

// Function with lots of nested braces and confusing structure
function braceConfusion() {
  console.log('braceConfusion: starting brace chaos');
  artificialDelay(100);
  
  const complexObject = {
    method1: function() {
      console.log('braceConfusion: object method 1');
      return {
        nested: {
          deepMethod: function() {
            console.log('braceConfusion: deep nested method');
            artificialDelay(50);
          }
        }
      };
    },
    method2: () => {
      console.log('braceConfusion: arrow function method');
      artificialDelay(50);
    }
  };
  
  complexObject.method1().nested.deepMethod();
  complexObject.method2();
  
  // Array of functions
  const functionArray = [
    function() { console.log('braceConfusion: array function 1'); },
    function() { console.log('braceConfusion: array function 2'); },
    () => { console.log('braceConfusion: array arrow function'); }
  ];
  
  functionArray.forEach((func, index) => {
    console.log(\`braceConfusion: calling array function \${index}\`);
    func();
  });
  
  artificialDelay(100);
  console.log('braceConfusion: completed');
}

// Functions with identical names in different scopes
function scopeConfusion() {
  console.log('scopeConfusion: starting scope chaos');
  artificialDelay(100);
  
  function duplicateName() {
    console.log('scopeConfusion: outer duplicateName');
    artificialDelay(50);
    
    function duplicateName() {
      console.log('scopeConfusion: inner duplicateName');
      artificialDelay(25);
    }
    
    duplicateName(); // Calls inner
  }
  
  duplicateName(); // Calls outer
  
  // Same function name with different implementations
  (function duplicateName() {
    console.log('scopeConfusion: IIFE duplicateName');
    artificialDelay(25);
  })();
  
  artificialDelay(100);
  console.log('scopeConfusion: completed');
}

// Arrow functions with confusing syntax
const arrowConfusion = () => {
  console.log('arrowConfusion: starting arrow chaos');
  artificialDelay(100);
  
  const simpleArrow = x => x * 2;
  const multiLineArrow = (a, b) => {
    console.log('arrowConfusion: multi-line arrow function');
    artificialDelay(50);
    return a + b;
  };
  
  const complexArrow = (x) => (y) => (z) => {
    console.log('arrowConfusion: curried arrow function');
    artificialDelay(25);
    return x + y + z;
  };
  
  console.log('arrowConfusion: simple result:', simpleArrow(5));
  console.log('arrowConfusion: multi-line result:', multiLineArrow(3, 4));
  console.log('arrowConfusion: complex result:', complexArrow(1)(2)(3));
  
  artificialDelay(100);
  console.log('arrowConfusion: completed');
};

function main() {
  console.log('main: starting parser confusion test');
  
  stringConfusion();
  braceConfusion();
  scopeConfusion();
  arrowConfusion();
  
  // Comments that look like function calls
  // function commentFunction() { }
  /* function blockCommentFunction() { } */
  
  console.log('main: parser confusion test completed');
}

main();`,
    visualizationHint: 'Tests code with confusing syntax, string literals containing function-like patterns, complex nested structures, and identical function names in different scopes.'
  },

  {
    id: 'break-async-chaos',
    name: 'BREAK: Async Chaos & Race Conditions',
    description: 'Chaotic async patterns designed to break tracking',
    complexity: 'expert',
    code: `function artificialDelay(ms = 150) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

function asyncChaos() {
  console.log('asyncChaos: starting async chaos');
  artificialDelay(100);
  
  // Create multiple competing timers
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      console.log(\`asyncChaos: timer \${i} executing\`);
      artificialDelay(Math.random() * 100);
      
      // Create nested timers from within timers
      setTimeout(() => {
        console.log(\`asyncChaos: nested timer from \${i}\`);
        artificialDelay(50);
      }, Math.random() * 200);
      
    }, Math.random() * 500);
  }
  
  console.log('asyncChaos: all timers scheduled');
}

function promiseChaos() {
  console.log('promiseChaos: starting promise chaos');
  artificialDelay(100);
  
  // Create promises that resolve in random order
  const promises = [];
  for (let i = 0; i < 5; i++) {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        console.log(\`promiseChaos: promise \${i} resolving\`);
        artificialDelay(100);
        resolve(\`result-\${i}\`);
      }, Math.random() * 1000);
    });
    
    promises.push(promise);
  }
  
  // Handle promises in chaotic ways
  Promise.race(promises).then(winner => {
    console.log('promiseChaos: race winner:', winner);
  });
  
  Promise.all(promises).then(results => {
    console.log('promiseChaos: all resolved:', results.length);
  });
  
  Promise.allSettled(promises).then(results => {
    console.log('promiseChaos: all settled:', results.length);
  });
  
  console.log('promiseChaos: promise chaos initiated');
}

function recursiveAsyncChaos(depth = 0) {
  console.log(\`recursiveAsyncChaos: depth \${depth}\`);
  
  if (depth > 10) {
    console.log('recursiveAsyncChaos: max depth reached');
    return Promise.resolve(depth);
  }
  
  artificialDelay(50);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(\`recursiveAsyncChaos: timeout at depth \${depth}\`);
      
      // Create multiple recursive branches asynchronously
      const branch1 = recursiveAsyncChaos(depth + 1);
      const branch2 = recursiveAsyncChaos(depth + 1);
      
      Promise.all([branch1, branch2]).then(results => {
        console.log(\`recursiveAsyncChaos: branches completed at depth \${depth}\`);
        resolve(results.reduce((sum, val) => sum + val, 0));
      });
      
    }, Math.random() * 100);
  });
}

function errorChaos() {
  console.log('errorChaos: starting error chaos');
  artificialDelay(100);
  
  // Promise that randomly rejects
  const riskyPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        console.log('errorChaos: promise resolving');
        resolve('success');
      } else {
        console.log('errorChaos: promise rejecting');
        reject(new Error('Random failure'));
      }
    }, 500);
  });
  
  riskyPromise
    .then(result => {
      console.log('errorChaos: success result:', result);
      
      // Chain another risky operation
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.3) {
            resolve(result + '-chained');
          } else {
            reject(new Error('Chained failure'));
          }
        }, 300);
      });
    })
    .then(chainedResult => {
      console.log('errorChaos: chained success:', chainedResult);
    })
    .catch(error => {
      console.log('errorChaos: caught error:', error.message);
      
      // Recovery operation
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('errorChaos: recovery operation');
          artificialDelay(100);
          resolve('recovered');
        }, 200);
      });
    })
    .finally(() => {
      console.log('errorChaos: cleanup operation');
      artificialDelay(50);
    });
}

async function main() {
  console.log('main: starting async chaos test');
  
  asyncChaos();
  promiseChaos();
  errorChaos();
  
  console.log('main: starting recursive async chaos');
  const recursiveResult = await recursiveAsyncChaos(0);
  console.log('main: recursive chaos result:', recursiveResult);
  
  // Wait a bit for all the chaos to settle
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('main: async chaos test completed');
}

main();`,
    visualizationHint: 'Tests chaotic async patterns with random timings, competing operations, recursive async calls, and error handling that could break the visualization tracking.'
  },

  // Import the extreme chaos test
  {
    id: 'mega-chaos-ultimate',
    name: '💀 MEGA CHAOS: The Ultimate Parser Destroyer',
    description: 'Every possible JavaScript chaos pattern combined into one apocalyptic test - EXTREME WARNING',
    complexity: 'expert',
    code: `function artificialDelay(ms = 50) { 
  const start = Date.now(); 
  while (Date.now() - start < ms) {} 
}

// 🔥 CHAOS LEVEL 1: Dynamic Code Generation Hell
function dynamicCodeChaos() {
  console.log('🔥 Starting dynamic code generation chaos...');
  artificialDelay(100);
  
  // Create functions with eval (parser nightmare)
  try {
    eval(\`
      function evalCreatedFunction() {
        console.log('💀 This function was created by eval');
        artificialDelay(25);
        return 'eval-result';
      }
    \`);
    
    // Call the eval'd function if it exists
    if (typeof evalCreatedFunction !== 'undefined') {
      evalCreatedFunction();
    }
  } catch (e) {
    console.log('💀 Eval failed (expected):', e.message);
  }
  
  // Function constructor madness
  const FunctionConstructor = Function;
  const dynamicFunc = new FunctionConstructor('x', 'y', \`
    console.log('💀 Function constructor created me:', x, y);
    artificialDelay(25);
    return x + y;
  \`);
  
  console.log('💀 Dynamic function result:', dynamicFunc(5, 10));
  
  // Template literal function generation
  const funcTemplate = (name) => \`
    function \${name}() {
      console.log('💀 Template generated function: \${name}');
      artificialDelay(25);
    }
  \`;
  
  try {
    eval(funcTemplate('templateGenerated'));
    if (typeof templateGenerated !== 'undefined') {
      templateGenerated();
    }
  } catch (e) {
    console.log('💀 Template eval failed:', e.message);
  }
  
  artificialDelay(100);
  console.log('🔥 Dynamic code chaos completed');
}

// 🔥 CHAOS LEVEL 2: Meta-Programming Nightmare
function metaProgrammingHell() {
  console.log('🔥 Starting meta-programming hell...');
  artificialDelay(100);
  
  // Function factory that creates functions with closures
  function createFunctionFactory(type) {
    const functionMap = new Map();
    
    return function functionFactory(name, behavior) {
      const dynamicFunction = function(...args) {
        console.log(\`💀 Generated \${type} function: \${name}\`, args);
        artificialDelay(25);
        return behavior.apply(this, args);
      };
      
      // Store in map to avoid garbage collection
      functionMap.set(name, dynamicFunction);
      
      // Assign to global scope dynamically
      try {
        globalThis[name] = dynamicFunction;
        console.log(\`💀 Assigned \${name} to global scope\`);
      } catch (e) {
        console.log(\`💀 Failed to assign \${name}:\`, e.message);
      }
      
      return dynamicFunction;
    };
  }
  
  // Create different types of function factories
  const syncFactory = createFunctionFactory('sync');
  const asyncFactory = createFunctionFactory('async');
  
  // Generate functions dynamically
  syncFactory('generatedSync1', (x) => x * 2);
  syncFactory('generatedSync2', (a, b) => a + b);
  
  // Try to call generated functions
  try {
    if (typeof generatedSync1 !== 'undefined') {
      console.log('💀 Generated sync1 result:', generatedSync1(21));
    }
    if (typeof generatedSync2 !== 'undefined') {
      console.log('💀 Generated sync2 result:', generatedSync2(10, 15));
    }
  } catch (e) {
    console.log('💀 Generated function call failed:', e.message);
  }
  
  artificialDelay(100);
  console.log('🔥 Meta-programming hell completed');
}

// 🔥 CHAOS LEVEL 3: Self-Modifying Function Chaos
function selfModifyingChaos() {
  console.log('🔥 Starting self-modifying function chaos...');
  artificialDelay(100);
  
  // Function that redefines itself
  let shapeshifter = function() {
    console.log('💀 Shapeshifter: First form');
    artificialDelay(25);
    
    // Redefine itself
    shapeshifter = function() {
      console.log('💀 Shapeshifter: Second form');
      artificialDelay(25);
      
      // Redefine again
      shapeshifter = function() {
        console.log('💀 Shapeshifter: Final form');
        artificialDelay(25);
        return 'transformation-complete';
      };
      
      return 'second-form-result';
    };
    
    return 'first-form-result';
  };
  
  // Call the shapeshifter multiple times
  console.log('💀 Result 1:', shapeshifter());
  console.log('💀 Result 2:', shapeshifter());
  console.log('💀 Result 3:', shapeshifter());
  
  // Function that modifies other functions
  function functionHijacker() {
    console.log('💀 Function hijacker activated');
    artificialDelay(25);
    
    // Try to hijack console.log (dangerous!)
    const originalLog = console.log;
    let hijackCount = 0;
    
    console.log = function(...args) {
      hijackCount++;
      if (hijackCount <= 3) {
        originalLog('💀 [HIJACKED]', ...args);
      } else {
        // Restore after 3 calls
        console.log = originalLog;
        originalLog('💀 [RESTORED]', ...args);
      }
    };
    
    return 'hijacking-complete';
  }
  
  functionHijacker();
  console.log('Test hijacked log 1');
  console.log('Test hijacked log 2');
  console.log('Test hijacked log 3');
  console.log('Test restored log');
  
  artificialDelay(100);
  console.log('🔥 Self-modifying chaos completed');
}

// 🔥 CHAOS LEVEL 4: Memory Pressure & Function Spam
function memoryPressureHell() {
  console.log('🔥 Starting memory pressure hell...');
  artificialDelay(100);
  
  const functionCollection = [];
  const nameMap = new Map();
  
  // Create dozens of functions dynamically (reduced from 100 for safety)
  for (let i = 0; i < 25; i++) {
    const functionName = \`dynamicFunc_\${i}_\${Date.now()}\`;
    
    const dynamicFunction = new Function('index', \`
      console.log('💀 Dynamic function ' + index + ' executing');
      artificialDelay(5);
      return 'result-' + index;
    \`);
    
    // Store references to prevent garbage collection
    functionCollection.push(dynamicFunction);
    nameMap.set(functionName, dynamicFunction);
    
    // Assign to global scope (if possible)
    try {
      globalThis[functionName] = dynamicFunction;
    } catch (e) {
      // Ignore assignment failures
    }
  }
  
  console.log(\`💀 Created \${functionCollection.length} dynamic functions\`);
  
  // Execute a few random functions
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * functionCollection.length);
    const randomFunc = functionCollection[randomIndex];
    console.log(\`💀 Random execution \${i}:\`, randomFunc(randomIndex));
  }
  
  // Cleanup (release memory)
  functionCollection.length = 0;
  nameMap.clear();
  
  artificialDelay(100);
  console.log('🔥 Memory pressure hell completed');
}

// 🔥 MAIN CHAOS ORCHESTRATOR
async function main() {
  console.log('🔥🔥🔥 MEGA CHAOS TEST STARTED - BRACE FOR IMPACT! 🔥🔥🔥');
  console.log('💀 This test combines every possible JavaScript chaos pattern');
  console.log('💀 Expected: Parser confusion, tracking failures, memory pressure');
  console.log('💀 Goal: See what survives the apocalypse');
  
  artificialDelay(200);
  
  try {
    // Execute chaos levels (reduced set for safety)
    dynamicCodeChaos();
    metaProgrammingHell();
    selfModifyingChaos();
    memoryPressureHell();
    
    console.log('🔥🔥🔥 MEGA CHAOS TEST COMPLETED - SOMEHOW WE SURVIVED! 🔥🔥🔥');
    
  } catch (error) {
    console.log('💀💀💀 MEGA CHAOS CAUSED CATASTROPHIC FAILURE:', error.message);
    console.log('💀 Stack:', error.stack);
  }
  
  // Final memory cleanup attempt
  try {
    if (typeof gc === 'function') {
      gc(); // Force garbage collection if available
    }
  } catch (e) {
    // Ignore gc failures
  }
  
  console.log('🔥 Apocalypse test sequence completed');
}

main();`,
    visualizationHint: 'This is an EXTREME test designed to break parsers. It combines dynamic code generation, meta-programming, self-modifying functions, and memory pressure. Expect: many functions will NOT be tracked due to dynamic creation, eval usage, and runtime modification. The goal is to see what survives the chaos!'
  }
];

export default codeExamples; 