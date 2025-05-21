interface CodeExample {
  id: string;
  name: string;
  description: string;
  code: string;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  visualizationHint: string;
}

export const codeExamples: CodeExample[] = [
  {
    id: 'simple',
    name: 'Simple Function Call',
    description: 'Basic function with a single call',
    complexity: 'basic',
    code: `// Basic function call
function main() {
  console.log('Hello world!');
  // Add small delay to better observe execution
  for (let i = 0; i < 1000000; i++) {}
}

main();`,
    visualizationHint: 'You should see a single node representing the main function with a timeline showing its execution time.'
  },
  {
    id: 'nested',
    name: 'Nested Functions',
    description: 'Functions defined inside other functions',
    complexity: 'basic',
    code: `// Nested function definitions
function outer() {
  console.log('Outer function');
  
  // Defined inside outer
  function inner() {
    console.log('Inner function');
    // Add small delay
    for (let i = 0; i < 1000000; i++) {}
  }
  
  // Add small delay before calling inner
  for (let i = 0; i < 500000; i++) {}
  inner();
}

outer();`,
    visualizationHint: 'You should see a tree with outer as the parent node and inner as its child node, showing the nested relationship.'
  },
  {
    id: 'async-await',
    name: 'Async/Await',
    description: 'Asynchronous code with async/await',
    complexity: 'intermediate',
    code: `// Async/await pattern
async function main() {
  console.log('Starting...');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('After 1 second');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('After 2 seconds');
  
  console.log('Done!');
}

main();`,
    visualizationHint: 'The async main function runs over a period of time, with await pauses shown in the execution timeline spanning about 2 seconds.'
  },
  {
    id: 'multiple-functions',
    name: 'Multiple Function Calls',
    description: 'Multiple functions calling each other in sequence',
    complexity: 'intermediate',
    code: `// Multiple function calls
function first() {
  console.log('First function');
  // Add delay to better observe sequence
  for (let i = 0; i < 800000; i++) {}
  second();
}

function second() {
  console.log('Second function');
  // Add delay to better observe sequence
  for (let i = 0; i < 800000; i++) {}
  third();
}

function third() {
  console.log('Third function');
  // Add delay to better observe sequence
  for (let i = 0; i < 800000; i++) {}
}

first();`,
    visualizationHint: 'You should see a multi-level process tree showing first → second → third function call hierarchy.'
  },
  {
    id: 'callbacks',
    name: 'Callback Functions',
    description: 'Functions using callbacks for asynchronous operations',
    complexity: 'intermediate',
    code: `// Callback patterns
function fetchData(callback) {
  console.log('Fetching data...');
  setTimeout(() => {
    const data = { result: 'Success!' };
    callback(data);
  }, 1500);
}

function processResult(data) {
  console.log('Processing:', data.result);
  // Add delay to see function execution time
  for (let i = 0; i < 1000000; i++) {}
}

function main() {
  console.log('Starting program');
  fetchData(processResult);
  console.log('Continue execution');
}

main();`,
    visualizationHint: 'The visualization shows how callbacks create a non-linear execution flow, with processResult executing after a delay.'
  },
  {
    id: 'promise-chain',
    name: 'Promise Chain',
    description: 'Chain of promises demonstrating sequential async operations',
    complexity: 'advanced',
    code: `// Promise chain
function fetchUser() {
  console.log('Fetching user...');
  return new Promise(resolve => {
    setTimeout(() => resolve({ id: 1, name: 'User' }), 1000);
  });
}

function fetchUserPosts(user) {
  console.log('Fetching posts for user:', user.name);
  return new Promise(resolve => {
    setTimeout(() => resolve(['Post 1', 'Post 2']), 1000);
  });
}

function displayPosts(posts) {
  console.log('Displaying posts:', posts);
  // Add small delay to observe execution time
  for (let i = 0; i < 1000000; i++) {}
  return posts;
}

function handleError(error) {
  console.error('Error:', error);
}

fetchUser()
  .then(fetchUserPosts)
  .then(displayPosts)
  .catch(handleError);`,
    visualizationHint: 'The visualization shows the promise chain as a sequence of function executions with the proper parent-child relationships.'
  },
  {
    id: 'recursion',
    name: 'Recursion',
    description: 'Recursive function calls demonstrating a call stack',
    complexity: 'advanced',
    code: `// Recursive function calls
function factorial(n) {
  console.log('Computing factorial for', n);
  
  // Add delay to better visualize recursion
  for (let i = 0; i < 500000; i++) {}
  
  if (n <= 1) {
    console.log('Base case reached, returning 1');
    return 1;
  }
  
  const result = n * factorial(n - 1);
  console.log('Factorial of', n, 'is', result);
  return result;
}

function main() {
  console.log('Starting factorial calculation');
  const result = factorial(4);
  console.log('Final result:', result);
}

main();`,
    visualizationHint: 'The visualization shows a recursive call tree with factorial(4) calling factorial(3) calling factorial(2) calling factorial(1).'
  },
  {
    id: 'generators',
    name: 'Generator Functions',
    description: 'Using generator functions with yield statements',
    complexity: 'advanced',
    code: `// Generator functions
function* numberGenerator() {
  console.log('Generator started');
  // Add delay to better observe yield points
  for (let i = 0; i < 500000; i++) {}
  yield 1;
  
  console.log('After first yield');
  // Add delay to better observe yield points
  for (let i = 0; i < 500000; i++) {}
  yield 2;
  
  console.log('After second yield');
  // Add delay to better observe yield points
  for (let i = 0; i < 500000; i++) {}
  yield 3;
  
  console.log('Generator complete');
}

function processGenerator(generator) {
  console.log('Processing generator');
  
  for (const value of generator) {
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
    code: `// Complex async operations
async function fetchData(id) {
  console.log('Fetching data for id:', id);
  return new Promise(resolve => {
    setTimeout(() => resolve({ id, name: 'Item ' + id }), 800);
  });
}

async function processInParallel(ids) {
  console.log('Processing ids in parallel:', ids);
  
  const promises = ids.map(id => fetchData(id));
  
  try {
    const results = await Promise.all(promises);
    console.log('All promises resolved:', results);
    return results;
  } catch (error) {
    console.error('Error in parallel processing:', error);
    throw error;
  }
}

function transformData(items, callback) {
  console.log('Transforming data...');
  
  const transformed = items.map(item => {
    console.log('Transforming item:', item.id);
    // Add delay to better observe transformation
    for (let i = 0; i < 300000; i++) {}
    return { ...item, transformed: true };
  });
  
  setTimeout(() => callback(transformed), 500);
}

async function main() {
  console.log('Program started');
  
  try {
    // Sequential async call
    const item1 = await fetchData(1);
    console.log('Item 1 fetched:', item1);
    
    // Parallel async calls
    const items = await processInParallel([2, 3, 4]);
    
    // Callback-based function
    new Promise(resolve => {
      transformData(items, resolve);
    }).then(transformedItems => {
      console.log('Transformed items:', transformedItems);
    });
    
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
    code: `// Class methods and inheritance
class BaseService {
  constructor(name) {
    this.name = name;
    console.log('BaseService created:', name);
  }
  
  initialize() {
    console.log('Initializing', this.name);
    return this.connect();
  }
  
  connect() {
    console.log('Base connect method called');
    // Add delay to better observe method call
    for (let i = 0; i < 500000; i++) {}
    return Promise.resolve('Connected');
  }
  
  process(data) {
    console.log('Base processing:', data);
    // Add delay to better observe method call
    for (let i = 0; i < 500000; i++) {}
    return data;
  }
}

class UserService extends BaseService {
  constructor() {
    super('UserService');
    console.log('UserService created');
  }
  
  connect() {
    console.log('UserService connecting to user database');
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('UserService connected');
        resolve('User DB Connected');
      }, 1000);
    });
  }
  
  async fetchUsers() {
    console.log('Fetching users');
    await new Promise(resolve => setTimeout(resolve, 800));
    return ['User1', 'User2'];
  }
  
  process(data) {
    console.log('Processing in UserService');
    // Add delay to better observe method call
    for (let i = 0; i < 300000; i++) {}
    const result = super.process(data);
    console.log('UserService specific processing');
    return { ...result, processed: true };
  }
}

async function main() {
  console.log('Application starting');
  
  const userService = new UserService();
  await userService.initialize();
  
  const users = await userService.fetchUsers();
  console.log('Users fetched:', users);
  
  const processedData = userService.process({ users });
  console.log('Final result:', processedData);
  
  console.log('Application complete');
}

main();`,
    visualizationHint: 'The visualization shows the inheritance patterns, with parent methods being called through super and class hierarchies visible in the process tree.'
  }
];

export default codeExamples; 