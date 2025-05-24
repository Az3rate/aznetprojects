// Extreme BREAK Test Cases - Designed to Destroy Any Parser
// These tests push JavaScript parsing to the absolute limit

interface ExtremeBreakTest {
  id: string;
  name: string;
  description: string;
  code: string;
  complexity: 'nightmare' | 'apocalypse' | 'impossible';
  warningLevel: 'high' | 'extreme' | 'DO_NOT_RUN';
  expectedFailures: string[];
}

export const extremeBreakTests: ExtremeBreakTest[] = [
  {
    id: 'mega-chaos-ultimate',
    name: '🔥 MEGA CHAOS: The Ultimate Parser Destroyer',
    description: 'Every possible JavaScript chaos pattern combined into one apocalyptic test',
    complexity: 'apocalypse',
    warningLevel: 'extreme',
    expectedFailures: [
      'Dynamic function creation will not be tracked',
      'Eval\'d functions will be invisible',
      'Proxy-created functions won\'t be detected',
      'Symbol-named functions will be missed',
      'Meta-programming patterns will confuse static analysis',
      'Memory pressure may cause performance issues'
    ],
    code: `
// Delay function for timing
function artificialDelay(ms = 50) { 
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

// 🔥 CHAOS LEVEL 3: Prototype Pollution & Symbol Chaos
function prototypeAndSymbolChaos() {
  console.log('🔥 Starting prototype pollution & symbol chaos...');
  artificialDelay(100);
  
  // Create symbol-named functions (invisible to most parsers)
  const funcSymbol1 = Symbol('hiddenFunction1');
  const funcSymbol2 = Symbol.for('hiddenFunction2');
  
  // Object with symbol methods
  const symbolObject = {
    [funcSymbol1]: function() {
      console.log('💀 Symbol function 1 executed');
      artificialDelay(25);
    },
    [funcSymbol2]: function() {
      console.log('💀 Symbol function 2 executed');
      artificialDelay(25);
    },
    // Computed property name function
    [\`computed_\${Date.now()}\`]: function() {
      console.log('💀 Computed property function executed');
      artificialDelay(25);
    }
  };
  
  // Execute symbol functions
  symbolObject[funcSymbol1]();
  symbolObject[funcSymbol2]();
  
  // Get computed property and execute it
  const computedKeys = Object.keys(symbolObject).filter(k => k.startsWith('computed_'));
  if (computedKeys.length > 0) {
    symbolObject[computedKeys[0]]();
  }
  
  // Prototype pollution (dangerous but for testing)
  try {
    Object.prototype.pollutedFunction = function() {
      console.log('💀 Prototype pollution function called on:', this.constructor.name);
      artificialDelay(25);
    };
    
    // Test pollution
    const testObj = {};
    testObj.pollutedFunction();
    
    // Clean up pollution
    delete Object.prototype.pollutedFunction;
  } catch (e) {
    console.log('💀 Prototype pollution failed:', e.message);
  }
  
  artificialDelay(100);
  console.log('🔥 Prototype & symbol chaos completed');
}

// 🔥 CHAOS LEVEL 4: Proxy Hell & Function Traps
function proxyHellscape() {
  console.log('🔥 Starting proxy hellscape...');
  artificialDelay(100);
  
  // Create a proxy that intercepts function calls
  const functionProxy = new Proxy({}, {
    get: function(target, prop, receiver) {
      if (typeof prop === 'string' && prop.startsWith('proxy_')) {
        return function(...args) {
          console.log(\`💀 Proxy intercepted function call: \${prop}\`, args);
          artificialDelay(25);
          return \`proxy-result-\${prop}-\${args.join('-')}\`;
        };
      }
      return target[prop];
    },
    
    set: function(target, prop, value, receiver) {
      if (typeof value === 'function') {
        console.log(\`💀 Proxy intercepted function assignment: \${prop}\`);
        target[prop] = new Proxy(value, {
          apply: function(target, thisArg, argumentsList) {
            console.log(\`💀 Proxy intercepted function execution: \${prop}\`);
            artificialDelay(25);
            return target.apply(thisArg, argumentsList);
          }
        });
        return true;
      }
      target[prop] = value;
      return true;
    }
  });
  
  // Use the proxy
  functionProxy.proxy_test1 = function() {
    console.log('💀 Original proxy function');
  };
  
  // Call proxy functions
  console.log('💀 Proxy call result:', functionProxy.proxy_test1());
  console.log('💀 Dynamic proxy call:', functionProxy.proxy_dynamic(1, 2, 3));
  
  artificialDelay(100);
  console.log('🔥 Proxy hellscape completed');
}

// 🔥 CHAOS LEVEL 5: Async Generator Nightmare
async function asyncGeneratorNightmare() {
  console.log('🔥 Starting async generator nightmare...');
  artificialDelay(100);
  
  // Async generator that yields functions
  async function* functionGenerator() {
    let counter = 0;
    
    while (counter < 3) {
      counter++;
      
      yield async function generatedAsync() {
        console.log(\`💀 Generated async function \${counter}\`);
        artificialDelay(25);
        await new Promise(resolve => setTimeout(resolve, 10));
        return \`async-result-\${counter}\`;
      };
      
      yield function* generatedGenerator() {
        console.log(\`💀 Generated generator function \${counter}\`);
        artificialDelay(25);
        yield \`generator-result-\${counter}-1\`;
        yield \`generator-result-\${counter}-2\`;
      };
    }
  }
  
  // Consume the function generator
  try {
    for await (const generatedFunc of functionGenerator()) {
      if (generatedFunc.constructor.name === 'AsyncFunction') {
        const result = await generatedFunc();
        console.log('💀 Async generator result:', result);
      } else if (generatedFunc.constructor.name === 'GeneratorFunction') {
        const gen = generatedFunc();
        for (const value of gen) {
          console.log('💀 Generator value:', value);
        }
      }
    }
  } catch (e) {
    console.log('💀 Async generator failed:', e.message);
  }
  
  artificialDelay(100);
  console.log('🔥 Async generator nightmare completed');
}

// 🔥 CHAOS LEVEL 6: Self-Modifying Function Chaos
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

// 🔥 CHAOS LEVEL 7: Memory Pressure & Function Spam
function memoryPressureHell() {
  console.log('🔥 Starting memory pressure hell...');
  artificialDelay(100);
  
  const functionCollection = [];
  const nameMap = new Map();
  
  // Create hundreds of functions dynamically
  for (let i = 0; i < 100; i++) {
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
  for (let i = 0; i < 5; i++) {
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
    // Execute all chaos levels
    dynamicCodeChaos();
    metaProgrammingHell();
    prototypeAndSymbolChaos();
    proxyHellscape();
    await asyncGeneratorNightmare();
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

main();
`
  }
];

export default extremeBreakTests; 