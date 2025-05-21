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
    code: `// We don't need to define artificialDelay - it's handled by the instrumenter
// The instrumentation will add starting/completed logs automatically

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
    code: `// We don't need to define artificialDelay - it's handled by the instrumenter
// The instrumentation will add starting/completed logs automatically

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
    code: `// Each function introduces its own delay, creating a measurable timing hierarchy

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
  }
];

export default codeExamples; 