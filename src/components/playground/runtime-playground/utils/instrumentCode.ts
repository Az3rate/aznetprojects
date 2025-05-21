import * as babel from '@babel/core';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as acorn from 'acorn';
import { simple as walk } from 'acorn-walk';
import * as astring from 'astring';

// Add a global stack for tracking parent functions
const parentStack: string[] = [];

function getParentId(): string | null {
  return parentStack.length > 0 ? parentStack[parentStack.length - 1] : null;
}

function emitProcessEvent(id: string, name: string, type: string, status: 'start' | 'end') {
  const event = {
    id,
    name,
    type, 
    status,
    parentId: getParentId(),
    timestamp: Date.now()
  };
  
  if (status === 'start') {
    parentStack.push(id);
  } else if (status === 'end') {
    parentStack.pop();
  }
  
  self.postMessage({
    type: 'runtime-process-event',
    event
  });
  console.log('[DEBUG_EVENT_EMISSION]', JSON.stringify(event));
}

// Use Babel to parse, traverse, and generate JavaScript code
function instrumentCode(code: string): string {
  console.log('[DB1] Instrumenting code:', code);

  // The parent tracking code to prepend to the user code
  const parentTrackingCode = `
// Add a global stack for tracking parent functions
const parentStack = [];
const executionContexts = new Map();

function getParentId() {
  return parentStack.length > 0 ? parentStack[parentStack.length - 1] : null;
}

function emitProcessEvent(id, name, type, status) {
  const event = {
    id,
    name,
    type, 
    status,
    parentId: getParentId(),
    timestamp: Date.now()
  };
  
  if (status === 'start') {
    parentStack.push(id);
  } else if (status === 'end') {
    parentStack.pop();
  }
  
  self.postMessage({
    type: 'runtime-process-event',
    event
  });
  console.log('[DEBUG_EVENT_EMISSION]', JSON.stringify(event));
}

// Override setTimeout to track callbacks
const originalSetTimeout = setTimeout;
self.setTimeout = function(callback, delay, ...args) {
  // If we're in an execution context, wrap the callback to maintain parent-child relationship
  const parentId = getParentId();
  const wrappedCallback = function() {
    // Restore parent context if we had one
    if (parentId) {
      parentStack.push(parentId);
    }
    
    // If this is a named function, track it
    let callbackName = callback.name || 'anonymous_callback';
    const callbackId = 'callback-' + Math.random().toString(36).substr(2, 9);
    
    // Emit start event for the callback
    emitProcessEvent(callbackId, callbackName, 'callback', 'start');
    
    try {
      // Execute the original callback
      return callback.apply(this, args);
    } finally {
      // Emit end event
      emitProcessEvent(callbackId, callbackName, 'callback', 'end');
      
      // Remove parent context if we added it
      if (parentId) {
        parentStack.pop();
      }
    }
  };
  
  // Call the original setTimeout with our wrapped callback
  return originalSetTimeout.call(this, wrappedCallback, delay);
};

// Special handling for tracking named callbacks
function trackCallback(fn, name) {
  return function wrappedCallback(...args) {
    const callbackId = 'fn-' + name;
    emitProcessEvent(callbackId, name, 'function', 'start');
    try {
      return fn.apply(this, args);
    } finally {
      emitProcessEvent(callbackId, name, 'function', 'end');
    }
  };
}
`;

  // Parse the code into an AST using Acorn
  const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'module' });
  console.log('[DB1] Code parsed into AST');

  // Traverse the AST to add instrumentation for function declarations
  walk(ast, {
    FunctionDeclaration(node) {
      if (node.id && node.id.name) { // Check for null or undefined
        const fnName = node.id.name;
        console.log(`[DB1] Instrumenting function declaration: ${fnName}`);
        
        const startLog = `emitProcessEvent('fn-${fnName}', '${fnName}', 'function', 'start');`;
        const endLog = `emitProcessEvent('fn-${fnName}', '${fnName}', 'function', 'end');`;

        // Wrap the parsed expression as a statement with start and end
        const startLogStatement = {
          type: 'ExpressionStatement' as const,
          expression: acorn.parseExpressionAt(startLog, 0, { ecmaVersion: 2020 }),
          start: 0,
          end: startLog.length
        };
        const endLogStatement = {
          type: 'ExpressionStatement' as const,
          expression: acorn.parseExpressionAt(endLog, 0, { ecmaVersion: 2020 }),
          start: 0,
          end: endLog.length
        };

        // Add start log at the beginning of the function body
        node.body.body.unshift(startLogStatement);
        // Add end log at the end of the function body
        node.body.body.push(endLogStatement);
      }
    }
  });

  // Generate the modified code from the AST using astring
  const output = astring.generate(ast);
  console.log('[DB1] AST transformed back to code');

  // Add tracking for arrow functions with regexp since the AST approach has linting issues
  const outputWithArrowFns = output.replace(
    /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(([^)]*)\)\s*=>\s*{([^}]*)}/g,
    (match, name, params, body) => {
      console.log(`[DB1] Instrumenting arrow function: ${name}`);
      return `const ${name} = (${params}) => {
  emitProcessEvent('fn-${name}', '${name}', 'function', 'start');
  ${body}
  emitProcessEvent('fn-${name}', '${name}', 'function', 'end');
}`;
    }
  );
  
  // Process the code to handle common callback patterns
  let processedCode = outputWithArrowFns;
  
  // Handle callback functions in setTimeout
  processedCode = processedCode.replace(
    /setTimeout\(\s*(\w+)\s*,\s*(\d+)\)/g, 
    (match, callbackName, delay) => {
      // Check if the callback is a known function
      if (code.includes(`function ${callbackName}(`) || 
          code.includes(`const ${callbackName} =`)) {
        console.log(`[DB1] Instrumenting setTimeout callback: ${callbackName}`);
        return `setTimeout(trackCallback(${callbackName}, "${callbackName}"), ${delay})`;
      }
      return match;
    }
  );
  
  // Handle callback functions in function calls like fetchData(processResult)
  processedCode = processedCode.replace(
    /(\w+)\((\w+)\)/g, 
    (match, fn, callback) => {
      // Don't replace standard function calls or constructor calls
      if (['setTimeout', 'setInterval', 'console', 'Promise', 'Math', 'Date', 'JSON', 
           'Object', 'Array', 'String', 'Number', 'Boolean'].includes(fn)) {
        return match;
      }
      
      // Don't replace common methods
      if (['log', 'error', 'warn', 'info', 'debug', 'map', 'filter', 'reduce', 
           'push', 'pop', 'join', 'split', 'resolve', 'reject'].includes(fn)) {
        return match;
      }
      
      // Check if callback is likely a function name in the code
      const isLikelyCallback = 
        code.includes(`function ${callback}(`) || 
        code.includes(`const ${callback} =`) ||
        code.includes(`let ${callback} =`) ||
        code.includes(`var ${callback} =`);
      
      if (isLikelyCallback) {
        console.log('[DB1] Found callback usage:', match);
        return `${fn}(trackCallback(${callback}, "${callback}"))`;
      }
      
      return match;
    }
  );

  // Create the final instrumented code
  const finalCode = parentTrackingCode + '\n' + processedCode;
  console.log('[DB1] Final instrumented code generated');
  return finalCode;
}

// Use a simpler approach that resembles the working simple wrapper
function instrumentCodeOld(code: string): string {
  // Start with the basic wrapper code
  let instrumentedCode = `
// Runtime instrumentation setup
// Create a global tracking stack for parent-child relationships
const parentStack = [];

function getParentId() {
  return parentStack.length > 0 ? parentStack[parentStack.length - 1] : null;
}

function emitProcessEvent(id, name, type, status) {
  console.log('[DEBUG_EVENT_EMISSION] Emitting event:', { id, name, type, status });
  
  // Get the current parent ID
  const parentId = getParentId();
  
  // For clear debugging
  console.log('[RUNTIME_EVENT]', { id, name, type, status, parentId });
  
  // Track parent-child relationships using the stack
  if (status === 'start') {
    parentStack.push(id);
  } else if (status === 'end') {
    parentStack.pop();
  }
  
  try {
    // Send event to main thread via postMessage
    self.postMessage({
      type: 'runtime-process-event',
      event: {
        id,
        name,
        type,
        status,
        parentId,
        timestamp: Date.now()
      }
    });
  } catch (e) {
    console.error('[RUNTIME_ERROR] Failed to emit event:', e);
  }
}

// Override setTimeout to track callbacks
const originalSetTimeout = setTimeout;
self.setTimeout = function(callback, delay, ...args) {
  // Get the current parent ID for context tracking
  const parentId = getParentId();
  
  // Create a wrapper function that maintains the execution context
  const wrappedCallback = function() {
    // Restore parent context
    if (parentId) {
      parentStack.push(parentId);
    }
    
    // Generate an ID for this callback
    const callbackName = callback.name || 'anonymous_callback';
    const callbackId = 'callback-' + callbackName + '-' + Date.now();
    
    // Track callback start
    emitProcessEvent(callbackId, callbackName, 'callback', 'start');
    
    try {
      // Execute original callback
      return callback.apply(this, args);
    } finally {
      // Track callback end
      emitProcessEvent(callbackId, callbackName, 'callback', 'end');
      
      // Remove parent context
      if (parentId) {
        parentStack.pop();
      }
    }
  };
  
  // Call original setTimeout with our wrapped callback
  return originalSetTimeout.call(this, wrappedCallback, delay);
};

// Wrap functions to track execution
function trackFunction(fn, name) {
  return function(...args) {
    const id = 'fn-' + name;
    emitProcessEvent(id, name, 'function', 'start');
    try {
      const result = fn.apply(this, args);
      if (result instanceof Promise) {
        return result.finally(() => {
          emitProcessEvent(id, name, 'function', 'end');
        });
      }
      emitProcessEvent(id, name, 'function', 'end');
      return result;
    } catch (error) {
      emitProcessEvent(id, name, 'function', 'end');
      throw error;
    }
  };
}

// Initialize tracking
console.log('[RUNTIME] Instrumentation initialized');

try {
  // Automatically wrapped user code will be inserted here
  ${transformCode(code)}
} catch (error) {
  console.error('[RUNTIME_ERROR] Error in instrumented code:', error);
}
`;

  return instrumentedCode;
}

// Correct transformation logic to handle setTimeout correctly
function transformCode(code: string): string {
  // Replace function declarations with tracked versions
  let transformed = code.replace(
    /async\s+function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*{([^}]*)}/g,
    (match, name, params, body) => {
      return `const ${name} = trackFunction(async function(${params}) {${body}}, '${name}');`;
    }
  );

  // Handle non-async functions
  transformed = transformed.replace(
    /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*{([^}]*)}/g,
    (match, name, params, body) => {
      return `const ${name} = trackFunction(function(${params}) {${body}}, '${name}');`;
    }
  );

  // Handle setTimeout callbacks - specially wrap any callback passed to setTimeout
  transformed = transformed.replace(
    /setTimeout\((\w+),\s*(\d+)\);/g, 
    (match, callbackName, delay) => {
      if (transformed.includes(`function ${callbackName}`) || 
          transformed.includes(`const ${callbackName} =`)) {
        return `setTimeout(trackFunction(${callbackName}, '${callbackName}'), ${delay});`;
      }
      return match;
    }
  );
  
  // Debugging: Log the transformed code
  console.log('[DEBUG_TRANSFORMED_CODE]', transformed);
  
  // Wrap the main function call at the end - if it exists
  if (transformed.match(/main\(\);/)) {
    transformed = transformed.replace(
      /main\(\);/,
      `console.log('[RUNTIME] Starting main function');\nmain();`
    );
  }
  
  return transformed;
}

export { instrumentCode }; 