// Simple, reliable code instrumentation for browser environments
function instrumentCode(code: string): string {
  console.log('[DB1] Instrumenting code with runtime monkey patching:', code);

  // The runtime tracking code that will be injected
  const runtimeTrackingCode = `
// Global state for tracking function execution
const parentStack = [];
const parentMap = new Map();
const deferredStackOps = []; // Queue for batching stack operations
let instanceCounter = 0;
let isInDeferredMode = false;

function getParentId() {
  return parentStack.length > 0 ? parentStack[parentStack.length - 1] : null;
}

// Enhanced parent capture that considers call context
function captureParentContext() {
  // Get the current top of stack as the parent
  const currentParent = getParentId();
  
  // For debugging: log the stack state
  console.log('[PARENT_CAPTURE] Current stack:', parentStack.slice());
  console.log('[PARENT_CAPTURE] Captured parent:', currentParent);
  
  return currentParent;
}

// Detect if we're in a parallel execution context (multiple rapid calls)
function detectParallelExecution() {
  // Check if multiple function calls are happening in rapid succession
  // This is a heuristic to detect map() or similar parallel operations
  const now = Date.now();
  if (!detectParallelExecution.lastCallTime) {
    detectParallelExecution.lastCallTime = now;
    detectParallelExecution.callCount = 1;
    return false;
  }
  
  if (now - detectParallelExecution.lastCallTime < 5) { // 5ms threshold
    detectParallelExecution.callCount++;
    if (detectParallelExecution.callCount >= 2) {
      console.log('[PARALLEL_DETECT] Parallel execution detected, enabling deferred mode');
      return true;
    }
  } else {
    detectParallelExecution.callCount = 1;
  }
  
  detectParallelExecution.lastCallTime = now;
  return false;
}

function emitProcessEvent(id, name, type, status, capturedParentId = null, deferStackOp = false) {
  // Use captured parent ID if provided, otherwise fall back to stack lookup
  const parentId = capturedParentId !== null ? capturedParentId : getParentId();
  
  const event = {
    id,
    name,
    type, 
    status,
    parentId,
    timestamp: Date.now()
  };
  
  // Handle stack operations - either immediately or deferred
  if (status === 'start') {
    if (parentId) {
      parentMap.set(id, parentId);
    }
    
    if (deferStackOp || isInDeferredMode) {
      // Defer stack operation for parallel execution
      deferredStackOps.push({ type: 'push', id });
      console.log('[DEFERRED] Queued stack push for:', id);
    } else {
      parentStack.push(id);
    }
  } else if (status === 'end') {
    // Handle stack properly and maintain correct parent relationship
    if (parentStack.length > 0) {
      if (parentStack[parentStack.length - 1] === id) {
        parentStack.pop();
      } else {
        // Function might have completed out of order (async), find and remove
        const index = parentStack.indexOf(id);
        if (index !== -1) {
          parentStack.splice(index, 1);
        }
      }
    }
    
    // Use the stored parent ID for end events if not provided
    if (capturedParentId === null && parentMap.has(id)) {
      event.parentId = parentMap.get(id);
    }
    
    event.isCompleted = true;
    
    if (parentStack.length === 0) {
      event.isLastFunction = true;
    }
  }
  
  // Send the event to the main thread
  self.postMessage({
    type: 'runtime-process-event',
    event
  });
  
  // For 'main' function completion, add an extra marker for sync
  if (name === 'main' && status === 'end') {
    self.postMessage({
      type: 'runtime-complete',
      timestamp: Date.now()
    });
  }
}

// Process deferred stack operations
function processDeferredStackOps() {
  console.log('[DEFERRED] Processing', deferredStackOps.length, 'deferred stack operations');
  deferredStackOps.forEach(op => {
    if (op.type === 'push') {
      parentStack.push(op.id);
      console.log('[DEFERRED] Applied stack push for:', op.id);
    }
  });
  deferredStackOps.length = 0; // Clear the queue
  isInDeferredMode = false;
}

// Function to wrap existing functions with tracking
function __wrapFunction(originalFn, name) {
  if (typeof originalFn !== 'function') return originalFn;
  
  return function(...args) {
    console.log('[WRAPPER] Function called:', name, 'with args:', args);
    
    // Detect parallel execution pattern
    const isParallel = detectParallelExecution();
    if (isParallel && !isInDeferredMode) {
      isInDeferredMode = true;
      console.log('[PARALLEL] Entering deferred mode for parallel execution');
    }
    
    // Create unique instance ID to handle multiple calls of same function
    const instanceId = ++instanceCounter;
    const functionId = 'fn-' + name + '-' + instanceId;
    
    // CRITICAL FIX: For parallel execution, freeze the current parent context
    const capturedParentId = captureParentContext();
    
    console.log('[WRAPPER] Function ' + name + ' instance ' + instanceId + ' called with parent: ' + (capturedParentId || 'none'));
    
    // Emit start event with captured parent ID and deferred stack management
    emitProcessEvent(functionId, name, 'function', 'start', capturedParentId, isInDeferredMode);
    
    // Schedule deferred stack processing after current execution stack clears
    if (isInDeferredMode && deferredStackOps.length > 0) {
      setTimeout(() => {
        if (deferredStackOps.length > 0) {
          processDeferredStackOps();
        }
      }, 0);
    }
    
    try {
      const result = originalFn.apply(this, args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          console.log('[WRAPPER] Promise completed for function:', name, 'instance:', instanceId);
          // Use the same captured parent ID for consistency
          emitProcessEvent(functionId, name, 'function', 'end', capturedParentId);
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
`;

  // Clean user code by removing any main() calls
  const cleanCode = code.replace(/\bmain\(\)\s*;?\s*$/gm, '');
  
  // Extract function names using regex on the original code
  const functionNames = new Set();
  
  // Find function declarations
  const functionDeclarations = cleanCode.match(/function\s+(\w+)\s*\(/g);
  if (functionDeclarations) {
    functionDeclarations.forEach(decl => {
      const match = decl.match(/function\s+(\w+)/);
      if (match) {
        functionNames.add(match[1]);
      }
    });
  }
  
  // Find arrow function variable assignments
  const arrowFunctions = cleanCode.match(/(const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g);
  if (arrowFunctions) {
    arrowFunctions.forEach(decl => {
      const match = decl.match(/(const|let|var)\s+(\w+)/);
      if (match) {
        functionNames.add(match[2]);
      }
    });
  }
  
  console.log('[EXTRACT] Function names found in code:', Array.from(functionNames));

  // Transform function calls to use global scope
  let transformedCode = cleanCode;
  functionNames.forEach(functionName => {
    // More precise regex that avoids function declarations
    // Match function calls but not function declarations
    const lines = transformedCode.split('\n');
    const transformedLines = lines.map(line => {
      // Skip lines that contain function declarations
      if (line.includes(`function ${functionName}`) || line.includes(`async function ${functionName}`)) {
        return line;
      }
      
      // Transform function calls to use global scope
      const callPattern = new RegExp(`\\b${functionName}\\s*\\(`, 'g');
      return line.replace(callPattern, `globalScope.${functionName}(`);
    });
    transformedCode = transformedLines.join('\n');
  });
  
  console.log('[TRANSFORM] Transformed function calls to use global scope');

  // Simple and safe approach: Runtime monkey patching after execution
  const finalCode = `
${runtimeTrackingCode}

// Store reference to global scope for Web Worker compatibility
const globalScope = (typeof self !== 'undefined') ? self : (typeof global !== 'undefined') ? global : this;

try {
  // Execute user code first to declare all functions
  ${transformedCode}
  
  console.log('[INSTRUMENT] User code executed, checking for functions...');
  
  // List of function names we detected in the code
  const expectedFunctions = ${JSON.stringify(Array.from(functionNames))};
  
  console.log('[INSTRUMENT] Expected functions:', expectedFunctions);
  
  // Check what functions are actually accessible and promote them to global scope
  expectedFunctions.forEach(functionName => {
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
  
  // Wrap each function that exists in global scope
  let wrappedCount = 0;
  expectedFunctions.forEach(functionName => {
    try {
      if (typeof globalScope[functionName] === 'function') {
        const originalFunction = globalScope[functionName];
        globalScope[functionName] = __wrapFunction(originalFunction, functionName);
        console.log('[INSTRUMENT] Wrapped function:', functionName);
        wrappedCount++;
      } else {
        console.log('[INSTRUMENT] Function not found in global scope:', functionName);
      }
    } catch (error) {
      console.error('[INSTRUMENT] Failed to wrap function:', functionName, error);
    }
  });
  
  console.log('[INSTRUMENT] Wrapped', wrappedCount, 'functions');
  
  // Finally, execute main() with tracking if it exists
  if (typeof globalScope.main === 'function') {
    console.log('[INSTRUMENT] Executing main function with tracking');
    globalScope.main();
  } else {
    console.log('[INSTRUMENT] No main function found, execution complete');
  }
  
} catch (error) {
  console.error('[RUNTIME_ERROR]', error);
}
`;

  console.log('[DB1] Successfully created runtime monkey patching instrumentation');
  return finalCode;
}

export { instrumentCode }; 