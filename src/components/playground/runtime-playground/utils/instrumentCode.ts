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
  // Get parentId before modifying the stack
  const parentId = getParentId();
  console.log('[DEB41] Emitting event:', { id, name, type, status, parentId, stack: [...parentStack] });
  
  const event = {
    id,
    name,
    type, 
    status,
    parentId,
    timestamp: Date.now()
  };
  
  // Modify stack after getting parentId
  if (status === 'start') {
    parentStack.push(id);
    console.log('[DEB41] Stack after push:', [...parentStack]);
  } else if (status === 'end') {
    parentStack.pop();
    console.log('[DEB41] Stack after pop:', [...parentStack]);
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
const parentMap = new Map(); // Map to store parent-child relationships
const fnNames = new Map(); // Map function IDs to their names
const functionCallTree = {}; // Track nested function relationships
const functionNestingLevels = {}; // Track function nesting levels
const callPathHistory = []; // Track call paths for visualization

// Call stack capture for better tracking
function captureCallStack() {
  try {
    // Create an error to capture the stack trace
    const err = new Error();
    const stack = err.stack || '';
    const stackLines = stack.split('\\n').slice(2); // Skip the Error and captureCallStack frames
    
    // Extract function names from the stack trace
    const callPath = stackLines.map(line => {
      const match = line.match(/at\\s+([\\w$.]+)\\s*\\(/);
      return match ? match[1] : 'anonymous';
    }).filter(name => name !== 'trackedExecution' && name !== 'anonymous');
    
    console.log('[CALL_STACK_CAPTURE]', JSON.stringify(callPath));
    
    // Store this call path for visualization
    if (callPath.length > 0) {
      callPathHistory.push(callPath);
      
      // Output relationship info for visualization
      if (callPath.length > 1) {
        for (let i = 0; i < callPath.length - 1; i++) {
          const child = callPath[i];
          const parent = callPath[i+1];
          console.log('[CALL_STACK_RELATION]', child, 'called by', parent);
        }
      }
    }
    
    return callPath;
  } catch (e) {
    console.error('[CALL_STACK_ERROR]', e);
    return [];
  }
}

function getParentId() {
  return parentStack.length > 0 ? parentStack[parentStack.length - 1] : null;
}

function emitProcessEvent(id, name, type, status) {
  // Get parent ID before manipulating the stack
  const parentId = getParentId();
  
  // Capture call stack for more accurate relationship tracking
  const callPath = captureCallStack();
  
  // Determine potential parent from call stack if available
  let callStackParentId = null;
  if (callPath.length > 1 && status === 'start') {
    // The parent is likely the function that called this one
    const potentialParent = callPath[1]; // skip current function
    // Store relationship for the visualization
    console.log('[CALL_STACK_RELATION]', name, 'called by', potentialParent);
    
    // Output specific relation info for better parser detection
    console.log('FUNCTION_RELATION:', name, 'is defined inside', potentialParent);
    
    // If the parent is a named function in our registry, use its ID
    for (const [fnId, fnName] of fnNames.entries()) {
      if (fnName === potentialParent) {
        callStackParentId = fnId;
        break;
      }
    }
  }
  
  // Create the event with all necessary information
  const event = {
    id,
    name,
    type, 
    status,
    // Prefer the explicit parent from parentMap, then parent stack, then call stack inference
    parentId: parentMap.get(id) || parentId || callStackParentId,
    timestamp: Date.now(),
    callPath: callPath // Include call path for better relationship detection
  };
  
  // For logging clarity
  const eventType = status === 'start' ? 'START' : 'END';
  console.log('[RUNTIME_EVENT_' + eventType + '] ' + name + ' (' + id + ') with parent: ' + (event.parentId || 'none'));
  
  // Enhanced logging to provide more clues to the visualization parser
  if (status === 'start') {
    console.log(name + ' function starting');
    if (parentStack.length > 0) {
      const parentName = fnNames.get(parentStack[parentStack.length - 1]) || 'unknown';
      console.log(parentName + ' is calling ' + name);
    }
  } else {
    console.log(name + ' function completed');
  }
  
  // Store function name for later reference
  fnNames.set(id, name);
  
  // Track explicit parent-child relationships
  if (status === 'start') {
    // Store this relationship in our parent map for later reference
    if (event.parentId) {
      parentMap.set(id, event.parentId);
      console.log('[RUNTIME_PARENT_MAP] Set parent', event.parentId, 'for child', id);
      
      // Also track in the function call tree
      if (!functionCallTree[event.parentId]) {
        functionCallTree[event.parentId] = [];
      }
      if (!functionCallTree[event.parentId].includes(id)) {
        functionCallTree[event.parentId].push(id);
        console.log('[FUNCTION_TREE] Added', id, 'as child of', event.parentId);
        
        // Output relationship for easier parsing
        const parentName = fnNames.get(event.parentId) || 'unknown';
        console.log('FUNCTION_RELATION:', name, 'is defined inside', parentName);
      }
    }
    
    // Track nesting level
    functionNestingLevels[id] = parentStack.length;
    
    // Add to parent stack for future children
    parentStack.push(id);
    console.log('[RUNTIME_STACK] After push:', JSON.stringify(parentStack));
  } else if (status === 'end') {
    // Verify this is the expected ID at the top of the stack
    if (parentStack.length > 0) {
      if (parentStack[parentStack.length - 1] === id) {
        // Normal case - this is the expected function ending
        parentStack.pop();
      } else {
        // Handle stack mismatch - find and remove the ID from stack
        const index = parentStack.indexOf(id);
        if (index !== -1) {
          // We found the ID but it's not at the top - remove just this ID
          parentStack.splice(index, 1);
          console.log('[RUNTIME_WARNING] Fixed stack by removing', id, 'at position', index);
        } else {
          // Function not found in stack - unusual but we'll handle it gracefully
          console.log('[RUNTIME_WARNING] Ending function not on stack:', id);
          
          // Use parentMap as fallback to verify parentId is consistent
          if (parentMap.has(id)) {
            event.parentId = parentMap.get(id);
            console.log('[RUNTIME_WARNING] Using stored parentId from map:', event.parentId);
          }
        }
      }
    }
    
    console.log('[RUNTIME_STACK] After pop:', JSON.stringify(parentStack));
    
    // For end events, include additional completion data to help sync visualization
    event.isCompleted = true;
    
    // Enhanced completion detection - use nesting level to verify completion
    if (functionNestingLevels[id] !== undefined) {
      // If current stack is smaller than this function's nesting level,
      // it means all nested functions have also completed
      if (parentStack.length < functionNestingLevels[id]) {
        console.log('[RUNTIME_NESTING_LEVEL] Function', name, 'and all its children are completed');
        
        // Output relationship completions for visualization
        if (functionCallTree[id]) {
          functionCallTree[id].forEach(childId => {
            const childName = fnNames.get(childId) || 'unknown';
            console.log('[RUNTIME_RELATIONSHIP_COMPLETE]', name, '->', childName);
          });
        }
      }
    }
    
    // Check if this was the last function in the stack
    if (parentStack.length === 0) {
      console.log('[RUNTIME_COMPLETE] Execution stack is empty, all functions completed');
      // Add a special signal for the visualizer to detect when everything is done
      event.isLastFunction = true;
      
      // Log the complete function tree for visualization
      console.log('[FUNCTION_TREE_COMPLETE]', JSON.stringify(functionCallTree));
      
      // Output all call paths for better relationship detection
      console.log('[CALL_PATH_HISTORY]', JSON.stringify(callPathHistory));
      
      // Output a special summary of all relationships
      console.log('[FUNCTION_RELATIONSHIPS_SUMMARY]');
      // Create relationship information from the parentMap
      for (const [childId, parentId] of parentMap.entries()) {
        const childName = fnNames.get(childId) || 'unknown';
        const parentName = fnNames.get(parentId) || 'unknown';
        console.log('FUNCTION_RELATION:', childName, 'is defined inside', parentName);
      }
    }
  }
  
  // Add extra debugging info
  console.log('[RUNTIME_EVENT]', { 
    id, 
    name, 
    type, 
    status, 
    parentId: event.parentId,
    stackDepth: parentStack.length,
    isCompleted: event.isCompleted,
    isLastFunction: event.isLastFunction
  });
  
  // Send the event to the main thread
  self.postMessage({
    type: 'runtime-process-event',
    event
  });
  
  // Special debug event for visualization with additional sync data
  const debugEvent = {...event, syncTimestamp: Date.now(), nestingLevel: functionNestingLevels[id]}; 
  console.log('[DEBUG_EVENT_EMISSION]', JSON.stringify(debugEvent));
  
  // For 'main' function completion, add an extra marker for sync
  if (name === 'main' && status === 'end') {
    console.log('[RUNTIME_MAIN_COMPLETED] Main function execution finished');
    // Signal that all functions should be marked as completed for sync
    self.postMessage({
      type: 'runtime-complete',
      timestamp: Date.now()
    });
  }
}

// Create a function proxy factory that tracks all functions
function createFunctionProxy(original, name, isMethod = false) {
  // Create a unique ID for this function
  const functionId = 'fn-' + name + '-' + Math.random().toString(36).substr(2, 9);
  
  // Store this function's name for later lookups
  fnNames.set(functionId, name);
  
  // Return a proxy that wraps the original function
  return new Proxy(original, {
    apply: function(target, thisArg, args) {
      // Get current parent ID
      const parentId = getParentId();
      
      // Record relationship immediately upon call
      if (parentId) {
        parentMap.set(functionId, parentId);
        console.log('[PROXY_TRACK] Set parent', parentId, 'for function', name);
      }
      
      // Log function entry with detailed info about caller/callee
      console.log('[FUNCTION_ENTRY]', {
        id: functionId,
        name: name,
        parentId: parentId || 'none',
        args: args.length > 0 ? 'has-args' : 'no-args',
        thisType: isMethod ? (thisArg ? typeof thisArg : 'none') : 'not-method'
      });
      
      // Emit start event with relationship info
      emitProcessEvent(functionId, name, 'function', 'start');
      
      try {
        // Execute the original function
        const result = target.apply(thisArg, args);
        
        // Handle promise results
        if (result instanceof Promise) {
          return result.finally(() => {
            console.log('[FUNCTION_EXIT]', name, 'with async result');
            emitProcessEvent(functionId, name, 'function', 'end');
          });
        }
        
        // Handle regular return values
        console.log('[FUNCTION_EXIT]', name, 'with result type:', typeof result);
        emitProcessEvent(functionId, name, 'function', 'end');
        return result;
      } catch (error) {
        // Handle errors
        console.log('[FUNCTION_ERROR]', name, ':', error);
        emitProcessEvent(functionId, name, 'function', 'end');
        throw error;
      }
    }
  });
}

// Function to wrap all global functions
function wrapGlobalFunctions(globalObj) {
  console.log('[PROXY_SETUP] Setting up global function proxies');
  
  // Collect all functions in the global scope
  const globalFunctions = [];
  for (const key in globalObj) {
    if (typeof globalObj[key] === 'function' 
        && key !== 'emitProcessEvent' 
        && key !== 'getParentId'
        && key !== 'createFunctionProxy'
        && key !== 'wrapGlobalFunctions'
        && key !== 'captureCallStack'
        && !key.startsWith('_')
        && globalObj.hasOwnProperty(key)) {
      globalFunctions.push(key);
    }
  }
  
  console.log('[PROXY_GLOBALS]', 'Found global functions:', globalFunctions);
  
  // Replace each function with a proxy version
  globalFunctions.forEach(funcName => {
    try {
      const original = globalObj[funcName];
      globalObj[funcName] = createFunctionProxy(original, funcName);
      console.log('[PROXY_WRAP]', 'Wrapped global function:', funcName);
    } catch (e) {
      console.error('[PROXY_ERROR]', 'Failed to wrap', funcName, ':', e);
    }
  });
  
  console.log('[PROXY_SETUP_COMPLETE]', 'Global functions wrapped');
  return globalFunctions.length;
}

// Override setTimeout to track callbacks
const originalSetTimeout = setTimeout;
self.setTimeout = function(callback, delay, ...args) {
  // Get the current parent ID to maintain context across async boundaries
  const parentId = getParentId();
  
  // Create a wrapper function that preserves the execution context
  const wrappedCallback = function() {
    // Generate a unique ID for this callback execution
    let callbackName = callback.name || 'anonymous_callback';
    const callbackId = 'callback-' + callbackName + '-' + Math.random().toString(36).substr(2, 9);
    
    // Store the parent context for this callback
    executionContexts.set(callbackId, parentId);
    console.log('[RUNTIME_CALLBACK] Created with parent:', parentId);
    
    // Restore the parent context before executing
    const storedParentId = executionContexts.get(callbackId);
    if (storedParentId) {
      console.log('[RUNTIME_CALLBACK] Restoring parent context:', storedParentId);
      // We set the parent context in the parent map rather than pushing to stack
      // This ensures that the callback knows its parent without affecting current execution
      parentMap.set(callbackId, storedParentId);
    }
    
    // Emit start event for the callback with correct parentId
    emitProcessEvent(callbackId, callbackName, 'callback', 'start');
    
    try {
      // Execute the original callback
      return callback.apply(this, args);
    } finally {
      // Emit end event for the callback
      emitProcessEvent(callbackId, callbackName, 'callback', 'end');
      
      // Clean up execution context
      executionContexts.delete(callbackId);
    }
  };
  
  // Call the original setTimeout with our wrapped callback
  return originalSetTimeout.call(this, wrappedCallback, delay);
};

// Special handling for tracking named callbacks
function trackFunction(fn, name) {
  return function(...args) {
    // Generate a consistent ID for this function instance
    const functionId = 'fn-' + name;
    
    // Get current parent context
    const parentId = getParentId();
    
    // Store the relationship in our parent map
    if (parentId) {
      parentMap.set(functionId, parentId);
      console.log('[RUNTIME_CALLBACK_TRACK] Set parent', parentId, 'for function', functionId);
    }
    
    // Emit start event
    emitProcessEvent(functionId, name, 'function', 'start');
    
    try {
      // Execute the original function
      const result = fn.apply(this, args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result.finally(() => {
          emitProcessEvent(functionId, name, 'function', 'end');
        });
      }
      
      // Handle regular return values
      emitProcessEvent(functionId, name, 'function', 'end');
      return result;
    } catch (error) {
      // Handle errors
      emitProcessEvent(functionId, name, 'function', 'end');
      throw error;
    }
  };
}

// Track calls to artificialDelay function
function artificialDelay(ms = 150) { 
  const functionId = 'fn-artificialDelay';
  const parentId = getParentId();
  
  // Emit start event
  emitProcessEvent(functionId, 'artificialDelay', 'function', 'start');
  console.log('artificialDelay starting with ' + ms + 'ms');
  
  const start = Date.now(); 
  while (Date.now() - start < ms) {}
  const actualTime = Date.now() - start;
  
  // Emit end event
  console.log('artificialDelay completed after ' + actualTime + 'ms');
  emitProcessEvent(functionId, 'artificialDelay', 'function', 'end');
  
  return ms;
}
`;

  try {
    // Create a wrapper that executes the user's code with our instrumentation
    let transformedCode = `
${parentTrackingCode}

// User code wrapped with instrumentation
try {
  // Execute the user code with tracking
  (function trackedExecution() {
    // Define function wrappers and other setup
    function registerFunction(fn, name) {
      return trackFunction(fn, name);
    }
    
    // Start execution
    console.log('[DEBUG_EVENT_EMISSION] Starting instrumented execution');
    
    // Set up global function proxies to catch all function calls
    wrapGlobalFunctions(this);
    
    // Special handling for artificialDelay function which is commonly used
    const originalArtificialDelay = typeof artificialDelay !== 'undefined' ? artificialDelay : null;
    if (originalArtificialDelay) {
      console.log('[TRACKING] Found artificialDelay function, adding special tracking');
      artificialDelay = createFunctionProxy(originalArtificialDelay, 'artificialDelay');
    }
    
    // Add direct tracking for common test functions
    if (typeof main === 'function') {
      console.log('[TRACKING] Found main function, adding special tracking');
      main = createFunctionProxy(main, 'main');
    }
    
    // Run the user's code inside a tracked main function
    const mainFunction = trackFunction(function main() {
      // USER CODE BEGINS HERE
      ${code}
      // USER CODE ENDS HERE
    }, "main");
    
    // Execute the main function
    console.log('[MANUALLY_EMIT_START] main');
    
    // Manually emit the start event for the main function
    // This ensures the main function always has a start event
    emitProcessEvent('fn-main', 'main', 'function', 'start');
    
    // Execute the main function
    mainFunction();
    
    // Manually emit the end event for the main function
    // This ensures the main function always has an end event
    emitProcessEvent('fn-main', 'main', 'function', 'end');
    
    console.log('[MANUALLY_EMIT_END] main');
    console.log('[DEBUG_EVENT_EMISSION] Finished instrumented execution');
    
    // Signal completion
    setTimeout(() => {
      console.log('[RUNTIME_COMPLETE] All execution finished');
      self.postMessage({
        type: 'runtime-complete',
        timestamp: Date.now()
      });
    }, 100);
  })();
} catch (error) {
  console.error('[RUNTIME_ERROR]', error);
}
`;

    console.log('[DB1] Using user provided code with enhanced instrumentation wrapper');
    return transformedCode;
  } catch (error) {
    console.error('[DB1] Error transforming code:', error);
    return `
${parentTrackingCode}

// Failed to instrument code, using simple wrapper
try {
  console.log('[DEBUG_EVENT_EMISSION] Starting instrumented execution');
  
  // Run the original code
  const main = trackFunction(function main() {
    ${code}
  }, "main");
  
  main();
  
  console.log('[DEBUG_EVENT_EMISSION] Finished instrumented execution');
} catch (error) {
  console.error('[RUNTIME_ERROR]', error);
}
`;
  }
}

export { instrumentCode }; 