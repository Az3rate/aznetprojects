interface CodeExample {
  id: string;
  name: string;
  description: string;
  code: string;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
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
}

main();`
  },
  {
    id: 'nested',
    name: 'Nested Functions',
    description: 'Functions defined inside other functions',
    complexity: 'basic',
    code: `// Nested function definitions
function outer() {
  console.log('Outer function');
  
  function inner() {
    console.log('Inner function');
  }
  
  inner();
}

outer();`
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

main();`
  },
  {
    id: 'multiple-functions',
    name: 'Multiple Function Calls',
    description: 'Multiple functions calling each other',
    complexity: 'intermediate',
    code: `// Multiple function calls
function first() {
  console.log('First function');
  second();
}

function second() {
  console.log('Second function');
  third();
}

function third() {
  console.log('Third function');
}

first();`
  },
  {
    id: 'callbacks',
    name: 'Callback Functions',
    description: 'Functions using callbacks',
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
}

function main() {
  console.log('Starting program');
  fetchData(processResult);
  console.log('Continue execution');
}

main();`
  },
  {
    id: 'promise-chain',
    name: 'Promise Chain',
    description: 'Chain of promises',
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
}

function handleError(error) {
  console.error('Error:', error);
}

fetchUser()
  .then(fetchUserPosts)
  .then(displayPosts)
  .catch(handleError);`
  },
  {
    id: 'recursion',
    name: 'Recursion',
    description: 'Recursive function calls',
    complexity: 'advanced',
    code: `// Recursive function calls
function factorial(n) {
  console.log('Computing factorial for', n);
  
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

main();`
  },
  {
    id: 'generators',
    name: 'Generator Functions',
    description: 'Using generator functions',
    complexity: 'advanced',
    code: `// Generator functions
function* numberGenerator() {
  console.log('Generator started');
  yield 1;
  console.log('After first yield');
  yield 2;
  console.log('After second yield');
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

main();`
  },
  {
    id: 'complex-async',
    name: 'Complex Async Operations',
    description: 'Mixing promises, async/await, and callbacks',
    complexity: 'expert',
    code: `// Complex async operations
async function fetchData(id) {
  console.log('Fetching data for id:', id);
  return new Promise(resolve => {
    setTimeout(() => resolve({ id, name: 'Item ' + id }), 1000);
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
    return { ...item, transformed: true };
  });
  
  setTimeout(() => callback(transformed), 500);
}

async function main() {
  console.log('Program started');
  
  try {
    // Sequential async calls
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

main();`
  },
  {
    id: 'class-methods',
    name: 'Class Methods & Inheritance',
    description: 'Class methods with inheritance',
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
    return Promise.resolve('Connected');
  }
  
  process(data) {
    console.log('Base processing:', data);
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

main();`
  }
];

export default codeExamples; 