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

function getParentId() {
  return parentStack.length > 0 ? parentStack[parentStack.length - 1] : null;
}

function emitProcessEvent(id, name, type, status) {
  // Get parent ID before manipulating the stack
  const parentId = getParentId();
  
  // Create the event with all necessary information
  const event = {
    id,
    name,
    type, 
    status,
    parentId,
    timestamp: Date.now()
  };
  
  // For logging clarity
  const eventType = status === 'start' ? 'START' : 'END';
  console.log('[RUNTIME_EVENT_' + eventType + '] ' + name + ' (' + id + ') with parent: ' + (parentId || 'none'));
  
  // Track explicit parent-child relationships
  if (status === 'start') {
    // Store this relationship in our parent map for later reference
    if (parentId) {
      parentMap.set(id, parentId);
      console.log('[RUNTIME_PARENT_MAP] Set parent', parentId, 'for child', id);
    }
    
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
    
    // Check if this was the last function in the stack
    if (parentStack.length === 0) {
      console.log('[RUNTIME_COMPLETE] Execution stack is empty, all functions completed');
      // Add a special signal for the visualizer to detect when everything is done
      event.isLastFunction = true;
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
  const debugEvent = {...event, syncTimestamp: Date.now()}; 
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
    
    // Run the user's code inside a tracked main function
    const main = trackFunction(function main() {
      // USER CODE BEGINS HERE
      ${code}
      // USER CODE ENDS HERE
    }, "main");
    
    main();
    
    console.log('[DEBUG_EVENT_EMISSION] Finished instrumented execution');
  })();
} catch (error) {
  console.error('[RUNTIME_ERROR]', error);
}
`;

    console.log('[DB1] Using user provided code with instrumentation wrapper');
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