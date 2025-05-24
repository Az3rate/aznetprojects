// Simple, reliable code instrumentation for browser environments
function instrumentCode(code: string): string {
  console.log('[DB1] Instrumenting code with enhanced promise chain tracking:', code);

  // The runtime tracking code that will be injected
  const runtimeTrackingCode = `
// Global state for tracking function execution
const parentStack = [];
const parentMap = new Map();
const promiseParentMap = new Map(); // Track parent context for promises
let instanceCounter = 0;
let pendingPromiseCount = 0;
let mainHasCompleted = false;

function getParentId() {
  return parentStack.length > 0 ? parentStack[parentStack.length - 1] : null;
}

// Enhanced parent capture that considers call context
function captureParentContext() {
  const currentParent = getParentId();
  console.log('[PARENT_CAPTURE] Current stack:', parentStack.slice());
  console.log('[PARENT_CAPTURE] Captured parent:', currentParent);
  return currentParent;
}

function emitProcessEvent(id, name, type, status, capturedParentId = null) {
  const parentId = capturedParentId !== null ? capturedParentId : getParentId();
  
  const event = {
    id,
    name,
    type, 
    status,
    parentId,
    timestamp: Date.now()
  };
  
  if (status === 'start') {
    if (parentId) {
      parentMap.set(id, parentId);
    }
    parentStack.push(id);
  } else if (status === 'end') {
    // Handle stack properly for end events
    if (parentStack.length > 0 && parentStack[parentStack.length - 1] === id) {
      parentStack.pop();
    } else {
      // Function might have completed out of order (async), find and remove
      const index = parentStack.indexOf(id);
      if (index !== -1) {
        parentStack.splice(index, 1);
      }
    }
    
    // Use the stored parent ID for end events if not provided
    if (capturedParentId === null && parentMap.has(id)) {
      event.parentId = parentMap.get(id);
    }
    
    event.isCompleted = true;
    
    // Track main completion
    if (name === 'main') {
      mainHasCompleted = true;
    }
    
    if (parentStack.length === 0) {
      event.isLastFunction = true;
    }
  }
  
  // Send the event to the main thread
  self.postMessage({
    type: 'runtime-process-event',
    event
  });
  
  // Check if all execution is complete
  if (mainHasCompleted && pendingPromiseCount === 0 && parentStack.length === 0) {
    console.log('[COMPLETION] All execution complete - main finished and no pending operations');
    self.postMessage({
      type: 'runtime-complete',
      timestamp: Date.now()
    });
  }
}

// Function to wrap existing functions with tracking
function __wrapFunction(originalFn, name) {
  if (typeof originalFn !== 'function') return originalFn;
  
  return function(...args) {
    console.log('[WRAPPER] Function called:', name, 'with args:', args);
    
    // Create unique instance ID to handle multiple calls of same function
    const instanceId = ++instanceCounter;
    const functionId = 'fn-' + name + '-' + instanceId;
    
    // Capture the current parent context
    const capturedParentId = captureParentContext();
    
    console.log('[WRAPPER] Function ' + name + ' instance ' + instanceId + ' called with parent: ' + (capturedParentId || 'none'));
    
    // Emit start event
    emitProcessEvent(functionId, name, 'function', 'start', capturedParentId);
    
    try {
      const result = originalFn.apply(this, args);
      
      console.log('[WRAPPER] Function result for', name, ':', typeof result, result && result.constructor ? result.constructor.name : 'null');
      console.log('[WRAPPER] Is Promise?', result instanceof Promise);
      
      if (result instanceof Promise) {
        console.log('[WRAPPER] Detected Promise result for function:', name, 'instance:', instanceId);
        
        // Track this pending Promise
        pendingPromiseCount++;
        console.log('[PROMISE_TRACKER] Promise started, pending count:', pendingPromiseCount);
        
        // Store the parent context for this promise
        promiseParentMap.set(result, functionId);
        
        // Add a safety timeout in case the Promise never resolves/rejects
        const timeoutId = originalSetTimeout(() => {
          console.log('[WRAPPER] Promise timeout fallback for function:', name, 'instance:', instanceId);
          pendingPromiseCount--;
          console.log('[PROMISE_TRACKER] Promise timeout, pending count:', pendingPromiseCount);
          emitProcessEvent(functionId, name, 'function', 'end', capturedParentId);
          
          // Check completion
          if (mainHasCompleted && pendingPromiseCount === 0 && parentStack.length === 0) {
            console.log('[PROMISE_TRACKER] Timeout triggered completion check');
            self.postMessage({
              type: 'runtime-complete',
              timestamp: Date.now()
            });
          }
        }, 10000); // 10 second timeout
        
        return result.finally(() => {
          originalClearTimeout(timeoutId);
          pendingPromiseCount--;
          console.log('[PROMISE_TRACKER] Promise completed, pending count:', pendingPromiseCount);
          console.log('[WRAPPER] Promise completed for function:', name, 'instance:', instanceId);
          emitProcessEvent(functionId, name, 'function', 'end', capturedParentId);
          
          // Check completion
          if (mainHasCompleted && pendingPromiseCount === 0 && parentStack.length === 0) {
            console.log('[PROMISE_TRACKER] Promise completion triggered final check');
            self.postMessage({
              type: 'runtime-complete',
              timestamp: Date.now()
            });
          }
        });
      }
      
      console.log('[WRAPPER] Function completed:', name, 'instance:', instanceId);
      emitProcessEvent(functionId, name, 'function', 'end', capturedParentId);
      return result;
    } catch (error) {
      console.log('[WRAPPER] Function errored:', name, 'instance:', instanceId, error);
      emitProcessEvent(functionId, name, 'function', 'end', capturedParentId);
      throw error;
    }
  };
}

// Store original setTimeout and clearTimeout before wrapping
const originalSetTimeout = (typeof globalThis !== 'undefined' && globalThis.setTimeout) || 
                          (typeof self !== 'undefined' && self.setTimeout) || 
                          (typeof window !== 'undefined' && window.setTimeout) || 
                          setTimeout;

const originalClearTimeout = (typeof globalThis !== 'undefined' && globalThis.clearTimeout) || 
                           (typeof self !== 'undefined' && self.clearTimeout) || 
                           (typeof window !== 'undefined' && window.clearTimeout) || 
                           clearTimeout;

// Enhanced Promise prototype to track .then() callbacks
const originalThen = Promise.prototype.then;
Promise.prototype.then = function(onFulfilled, onRejected) {
  console.log('[PROMISE_THEN] Promise.then called');
  
  // Get the parent context from the promise
  const promiseParent = promiseParentMap.get(this);
  console.log('[PROMISE_THEN] Promise parent:', promiseParent);
  
  // Wrap the onFulfilled callback if it exists
  let wrappedOnFulfilled = onFulfilled;
  if (typeof onFulfilled === 'function') {
    wrappedOnFulfilled = function(...args) {
      console.log('[PROMISE_THEN] .then callback executing with args:', args);
      
      const instanceId = ++instanceCounter;
      const callbackId = 'cb-then-' + instanceId;
      
      // Use the promise's parent as our parent
      console.log('[PROMISE_THEN] Callback parent:', promiseParent);
      emitProcessEvent(callbackId, '.then callback', 'function', 'start', promiseParent);
      
      try {
        const result = onFulfilled.apply(this, args);
        console.log('[PROMISE_THEN] Callback result:', typeof result, result && result.constructor ? result.constructor.name : 'null');
        
        if (result instanceof Promise) {
          // Track the returned promise's parent
          promiseParentMap.set(result, callbackId);
          console.log('[PROMISE_THEN] Callback returned promise, tracking parent');
        }
        
        emitProcessEvent(callbackId, '.then callback', 'function', 'end', promiseParent);
        return result;
      } catch (error) {
        console.log('[PROMISE_THEN] Callback errored:', error);
        emitProcessEvent(callbackId, '.then callback', 'function', 'end', promiseParent);
        throw error;
      }
    };
  }
  
  // Wrap the onRejected callback if it exists
  let wrappedOnRejected = onRejected;
  if (typeof onRejected === 'function') {
    wrappedOnRejected = function(...args) {
      console.log('[PROMISE_THEN] .catch callback executing');
      
      const instanceId = ++instanceCounter;
      const callbackId = 'cb-catch-' + instanceId;
      
      emitProcessEvent(callbackId, '.catch callback', 'function', 'start', promiseParent);
      
      try {
        const result = onRejected.apply(this, args);
        emitProcessEvent(callbackId, '.catch callback', 'function', 'end', promiseParent);
        return result;
      } catch (error) {
        emitProcessEvent(callbackId, '.catch callback', 'function', 'end', promiseParent);
        throw error;
      }
    };
  }
  
  const newPromise = originalThen.call(this, wrappedOnFulfilled, wrappedOnRejected);
  
  // Inherit parent context for chained promises
  if (promiseParent) {
    promiseParentMap.set(newPromise, promiseParent);
  }
  
  return newPromise;
};

// Enhanced catch method
const originalCatch = Promise.prototype.catch;
Promise.prototype.catch = function(onRejected) {
  console.log('[PROMISE_CATCH] Promise.catch called');
  return this.then(null, onRejected);
};

// Enhanced finally method
const originalFinally = Promise.prototype.finally;
Promise.prototype.finally = function(onFinally) {
  console.log('[PROMISE_FINALLY] Promise.finally called');
  
  const promiseParent = promiseParentMap.get(this);
  
  let wrappedOnFinally = onFinally;
  if (typeof onFinally === 'function') {
    wrappedOnFinally = function(...args) {
      console.log('[PROMISE_FINALLY] .finally callback executing');
      
      const instanceId = ++instanceCounter;
      const callbackId = 'cb-finally-' + instanceId;
      
      emitProcessEvent(callbackId, '.finally callback', 'function', 'start', promiseParent);
      
      try {
        const result = onFinally.apply(this, args);
        emitProcessEvent(callbackId, '.finally callback', 'function', 'end', promiseParent);
        return result;
      } catch (error) {
        emitProcessEvent(callbackId, '.finally callback', 'function', 'end', promiseParent);
        throw error;
      }
    };
  }
  
  return originalFinally.call(this, wrappedOnFinally);
};

// Enhanced setTimeout to track async callbacks - wrap all possible setTimeout references
function wrapSetTimeout(setTimeoutFn) {
  if (typeof setTimeoutFn !== 'function') return setTimeoutFn;
  
  return function(callback, delay, ...args) {
    console.log('[SETTIMEOUT] setTimeout called with delay:', delay);
    
    // Capture the current parent context when setTimeout is called
    const timeoutParent = captureParentContext();
    
    if (typeof callback === 'function') {
      const wrappedCallback = function(...callbackArgs) {
        console.log('[SETTIMEOUT] Timeout callback executing after', delay, 'ms');
        
        const instanceId = ++instanceCounter;
        const callbackId = 'cb-timeout-' + instanceId;
        
        emitProcessEvent(callbackId, 'timeout callback', 'function', 'start', timeoutParent);
        
        try {
          const result = callback.apply(this, callbackArgs);
          emitProcessEvent(callbackId, 'timeout callback', 'function', 'end', timeoutParent);
          return result;
        } catch (error) {
          console.log('[SETTIMEOUT] Timeout callback errored:', error);
          emitProcessEvent(callbackId, 'timeout callback', 'function', 'end', timeoutParent);
          throw error;
        }
      };
      
      return originalSetTimeout.call(this, wrappedCallback, delay, ...args);
    }
    
    return originalSetTimeout.call(this, callback, delay, ...args);
  };
}

// Wrap setTimeout in all possible locations
if (typeof globalThis !== 'undefined' && globalThis.setTimeout) {
  globalThis.setTimeout = wrapSetTimeout(globalThis.setTimeout);
}
if (typeof self !== 'undefined' && self.setTimeout) {
  self.setTimeout = wrapSetTimeout(self.setTimeout);
}
if (typeof window !== 'undefined' && window.setTimeout) {
  window.setTimeout = wrapSetTimeout(window.setTimeout);
}
// Also wrap the global setTimeout
if (typeof setTimeout !== 'undefined') {
  setTimeout = wrapSetTimeout(setTimeout);
}

// Dynamic function wrapping helper for nested functions
function __wrapNestedFunction(fn, name) {
  if (typeof fn !== 'function') return fn;
  
  return function(...args) {
    console.log('[NESTED_WRAPPER] Nested function called:', name, 'with args:', args);
    
    const instanceId = ++instanceCounter;
    const functionId = 'fn-' + name + '-' + instanceId;
    const capturedParentId = captureParentContext();
    
    console.log('[NESTED_WRAPPER] Function ' + name + ' instance ' + instanceId + ' called with parent: ' + (capturedParentId || 'none'));
    
    emitProcessEvent(functionId, name, 'function', 'start', capturedParentId);
    
    try {
      const result = fn.apply(this, args);
      
      if (result instanceof Promise) {
        promiseParentMap.set(result, functionId);
        return result.finally(() => {
          console.log('[NESTED_WRAPPER] Promise completed for nested function:', name, 'instance:', instanceId);
          emitProcessEvent(functionId, name, 'function', 'end', capturedParentId);
        });
      }
      
      console.log('[NESTED_WRAPPER] Nested function completed:', name, 'instance:', instanceId);
      emitProcessEvent(functionId, name, 'function', 'end', capturedParentId);
      return result;
    } catch (error) {
      console.log('[NESTED_WRAPPER] Nested function errored:', name, 'instance:', instanceId, error);
      emitProcessEvent(functionId, name, 'function', 'end', capturedParentId);
      throw error;
    }
  };
}
`;

  // Clean user code by removing any main() calls
  const cleanCode = code.replace(/\bmain\(\)\s*;?\s*$/gm, '');
  
  // Extract top-level function calls (not inside functions)
  const topLevelCalls = new Set<string>();
  const lines = cleanCode.split('\n');
  let insideFunction = false;
  let braceDepth = 0;
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    // Track if we're inside a function
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceDepth += openBraces - closeBraces;
    
    if (trimmedLine.includes('function ')) {
      insideFunction = true;
    }
    
    if (braceDepth === 0 && insideFunction) {
      insideFunction = false;
    }
    
    // Look for function calls at the top level (not inside any function)
    if (!insideFunction && braceDepth === 0) {
      const callMatch = trimmedLine.match(/^(\w+)\s*\(\s*\)\s*;?\s*$/);
      if (callMatch && callMatch[1] !== 'console') {
        topLevelCalls.add(callMatch[1]);
        console.log('[ANALYSIS] Found top-level function call:', callMatch[1]);
      }
    }
  });

  // Analyze code structure to find global vs nested functions
  const globalFunctions = new Set();
  const nestedFunctions = new Map(); // Maps nested function name to parent function
  
  // Parse the code to understand function nesting
  function analyzeCodeStructure(code: string) {
    const lines = code.split('\n');
    let braceDepth = 0;
    let functionStack: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for function declaration BEFORE updating brace depth
      const functionMatch = line.match(/function\s+(\w+)\s*\(/);
      if (functionMatch) {
        const functionName = functionMatch[1];
        
        console.log('[ANALYSIS] Processing function:', functionName, 'at brace depth:', braceDepth);
        
        if (braceDepth === 0) {
          // Top-level function
          globalFunctions.add(functionName);
          console.log('[ANALYSIS] Found global function:', functionName);
          // Reset function stack for new top-level function
          functionStack = [functionName];
        } else {
          // Nested function - parent is the last function in the stack
          const parentFunction = functionStack[functionStack.length - 1];
          nestedFunctions.set(functionName, parentFunction);
          console.log('[ANALYSIS] Found nested function:', functionName, 'inside', parentFunction, 'at depth:', braceDepth);
          // Add to function stack for potential further nesting
          functionStack.push(functionName);
        }
      }
      
      // Count braces on this line
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      
      // Update brace depth
      braceDepth += openBraces - closeBraces;
      
      // Pop from function stack when closing braces
      if (closeBraces > 0) {
        for (let j = 0; j < closeBraces; j++) {
          if (functionStack.length > 1) {
            const poppedFunction = functionStack.pop();
            console.log('[ANALYSIS] Popped function from stack:', poppedFunction, 'remaining stack:', functionStack);
          }
        }
      }
    }
  }
  
  analyzeCodeStructure(cleanCode);
  
  console.log('[ANALYSIS] Global functions:', Array.from(globalFunctions));
  console.log('[ANALYSIS] Nested functions:', Array.from(nestedFunctions.entries()));

  // Transform code with smart scoping
  let transformedCode = cleanCode;
  
  // Remove top-level function calls from the code since we'll execute them manually
  topLevelCalls.forEach(funcName => {
    const callPattern = new RegExp(`^\\s*${funcName}\\s*\\(\\s*\\)\\s*;?\\s*$`, 'gm');
    transformedCode = transformedCode.replace(callPattern, `// ${funcName}() call moved to end of instrumentation`);
  });
  
  // Only transform global function calls to use globalScope
  globalFunctions.forEach(functionName => {
    const lines = transformedCode.split('\n');
    const transformedLines = lines.map(line => {
      // Skip lines that contain function declarations
      if (line.includes(`function ${functionName}`) || line.includes(`async function ${functionName}`)) {
        return line;
      }
      
      // Transform function calls to use global scope ONLY for global functions
      const callPattern = new RegExp(`\\b${functionName}\\s*\\(`, 'g');
      return line.replace(callPattern, `globalScope.${functionName}(`);
    });
    transformedCode = transformedLines.join('\n');
  });

  // For nested functions, we need to wrap them at the point of definition
  // Use a sophisticated code transformation that injects wrapper immediately after function declaration
  nestedFunctions.forEach((parentFunction, nestedFunction) => {
    // Find the nested function declaration and inject wrapping code after it
    const lines = transformedCode.split('\n');
    let inTargetFunction = false;
    let braceDepth = 0;
    let functionFound = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Track if we're inside the parent function
      if (line.includes(`function ${parentFunction}(`)) {
        inTargetFunction = true;
        braceDepth = 0;
      }
      
      if (inTargetFunction) {
        // Count braces to track when we exit the parent function
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        braceDepth += openBraces - closeBraces;
        
        // Look for the nested function declaration
        if (line.includes(`function ${nestedFunction}(`) && !functionFound) {
          functionFound = true;
          console.log('[TRANSFORM] Found nested function declaration at line', i + 1);
          
          // Find the closing brace of this function declaration
          let nestedBraceDepth = 0;
          let foundOpeningBrace = false;
          
          for (let j = i; j < lines.length; j++) {
            const currentLine = lines[j];
            const openBracesInLine = (currentLine.match(/\{/g) || []).length;
            const closeBracesInLine = (currentLine.match(/\}/g) || []).length;
            
            if (openBracesInLine > 0 && !foundOpeningBrace) {
              foundOpeningBrace = true;
              nestedBraceDepth = 1;
            } else if (foundOpeningBrace) {
              nestedBraceDepth += openBracesInLine - closeBracesInLine;
            }
            
            // When we close the nested function, inject the wrapper
            if (foundOpeningBrace && nestedBraceDepth === 0) {
              console.log('[TRANSFORM] Injecting wrapper after nested function at line', j + 1);
              lines[j] += `\n    // Auto-wrap nested function for tracking\n    ${nestedFunction} = __wrapNestedFunction(${nestedFunction}, '${nestedFunction}');`;
              break;
            }
          }
        }
        
        // Exit when we close the parent function
        if (braceDepth <= 0 && inTargetFunction) {
          inTargetFunction = false;
          break;
        }
      }
    }
    
    transformedCode = lines.join('\n');
  });
  
  console.log('[TRANSFORM] Applied smart scoping transformations');

  // Enhanced instrumentation with better promise chain handling
  const finalCode = `
${runtimeTrackingCode}

// Store reference to global scope for Web Worker compatibility
const globalScope = (typeof self !== 'undefined') ? self : (typeof global !== 'undefined') ? global : this;

try {
  // Execute user code first to declare all functions
  ${transformedCode}
  
  console.log('[INSTRUMENT] User code executed, checking for functions...');
  
  // List of global function names we detected in the code
  const globalFunctionNames = ${JSON.stringify(Array.from(globalFunctions))};
  const topLevelCallNames = ${JSON.stringify(Array.from(topLevelCalls))};
  
  console.log('[INSTRUMENT] Global functions:', globalFunctionNames);
  console.log('[INSTRUMENT] Top-level calls detected:', topLevelCallNames);
  
  // Check what functions are actually accessible and promote them to global scope
  globalFunctionNames.forEach(functionName => {
    try {
      // Try to access the function in the current scope
      const fn = eval(functionName);
      if (typeof fn === 'function') {
        // Explicitly add it to global scope
        globalScope[functionName] = fn;
        console.log('[INSTRUMENT] Promoted function to global scope:', functionName);
      } else {
        console.log('[INSTRUMENT] Function not accessible:', functionName, typeof fn);
      }
    } catch (error) {
      console.log('[INSTRUMENT] Could not access function:', functionName, error.message);
    }
  });
  
  // Wrap each global function that exists in global scope
  let wrappedCount = 0;
  globalFunctionNames.forEach(functionName => {
    try {
      if (typeof globalScope[functionName] === 'function') {
        const originalFunction = globalScope[functionName];
        globalScope[functionName] = __wrapFunction(originalFunction, functionName);
        console.log('[INSTRUMENT] Wrapped global function:', functionName);
        wrappedCount++;
      } else {
        console.log('[INSTRUMENT] Global function not found in global scope:', functionName);
      }
    } catch (error) {
      console.error('[INSTRUMENT] Failed to wrap global function:', functionName, error);
    }
  });
  
  console.log('[INSTRUMENT] Wrapped', wrappedCount, 'global functions');
  console.log('[INSTRUMENT] Enhanced promise chain tracking enabled');
  
  // Execute detected top-level function calls or main()
  if (typeof globalScope.main === 'function') {
    console.log('[INSTRUMENT] Executing main function with tracking');
    globalScope.main();
  } else if (topLevelCallNames.length > 0) {
    console.log('[INSTRUMENT] Executing top-level function calls');
    topLevelCallNames.forEach(funcName => {
      if (typeof globalScope[funcName] === 'function') {
        console.log('[INSTRUMENT] Executing top-level call:', funcName);
        globalScope[funcName]();
      } else {
        console.log('[INSTRUMENT] Top-level function not found:', funcName);
      }
    });
  } else {
    console.log('[INSTRUMENT] No main function or top-level calls found, execution complete');
  }
  
} catch (error) {
  console.error('[RUNTIME_ERROR]', error);
}
`;

  console.log('[DB1] Successfully created enhanced instrumentation with promise chain tracking');
  return finalCode;
}

export { instrumentCode }; 