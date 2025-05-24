// Simple, reliable code instrumentation for browser environments
function instrumentCode(code: string): string {
  console.log('[DB1] Instrumenting code with enhanced AST-aware parsing:', code);

  // Enhanced parsing that understands JavaScript context
  function parseJavaScriptFunctions(code: string) {
    const functions = new Set<string>();
    const nestedFunctions = new Map<string, string>();
    
    // Advanced JavaScript tokenizer with proper context tracking
    class JavaScriptTokenizer {
      private pos = 0;
      private code: string;
      private currentLine = 1;
      private currentColumn = 1;
      private tokens: Array<{ type: string; value: string; line: number; column: number }> = [];
      
      constructor(code: string) {
        this.code = code;
      }
      
      private peek(offset = 0): string {
        return this.code[this.pos + offset] || '';
      }
      
      private advance(): string {
        const char = this.code[this.pos++];
        if (char === '\n') {
          this.currentLine++;
          this.currentColumn = 1;
        } else {
          this.currentColumn++;
        }
        return char;
      }
      
      private skipWhitespace(): void {
        while (this.pos < this.code.length && /\s/.test(this.peek())) {
          this.advance();
        }
      }
      
      private readString(quote: string): string {
        let value = quote;
        this.advance(); // Skip opening quote
        
        while (this.pos < this.code.length) {
          const char = this.peek();
          if (char === quote) {
            value += this.advance();
            break;
          } else if (char === '\\') {
            value += this.advance(); // Backslash
            value += this.advance(); // Escaped character
          } else {
            value += this.advance();
          }
        }
        return value;
      }
      
      private readTemplateString(): string {
        let value = '`';
        this.advance(); // Skip opening backtick
        let braceDepth = 0;
        
        while (this.pos < this.code.length) {
          const char = this.peek();
          if (char === '`' && braceDepth === 0) {
            value += this.advance();
            break;
          } else if (char === '$' && this.peek(1) === '{') {
            value += this.advance(); // $
            value += this.advance(); // {
            braceDepth++;
          } else if (char === '}' && braceDepth > 0) {
            value += this.advance();
            braceDepth--;
          } else if (char === '\\') {
            value += this.advance(); // Backslash
            value += this.advance(); // Escaped character
          } else {
            value += this.advance();
          }
        }
        return value;
      }
      
      private readRegex(): string {
        let value = '/';
        this.advance(); // Skip opening slash
        
        while (this.pos < this.code.length) {
          const char = this.peek();
          if (char === '/') {
            value += this.advance();
            // Read flags
            while (this.pos < this.code.length && /[gimuy]/.test(this.peek())) {
              value += this.advance();
            }
            break;
          } else if (char === '\\') {
            value += this.advance(); // Backslash
            value += this.advance(); // Escaped character
          } else {
            value += this.advance();
          }
        }
        return value;
      }
      
      private readLineComment(): string {
        let value = '//';
        this.advance(); // First /
        this.advance(); // Second /
        
        while (this.pos < this.code.length && this.peek() !== '\n') {
          value += this.advance();
        }
        return value;
      }
      
      private readBlockComment(): string {
        let value = '/*';
        this.advance(); // /
        this.advance(); // *
        
        while (this.pos < this.code.length - 1) {
          if (this.peek() === '*' && this.peek(1) === '/') {
            value += this.advance(); // *
            value += this.advance(); // /
            break;
          } else {
            value += this.advance();
          }
        }
        return value;
      }
      
      private readIdentifier(): string {
        let value = '';
        while (this.pos < this.code.length && /[a-zA-Z0-9_$]/.test(this.peek())) {
          value += this.advance();
        }
        return value;
      }
      
      private isRegexContext(): boolean {
        // Look backwards to determine if / should be treated as regex or division
        let i = this.tokens.length - 1;
        while (i >= 0 && this.tokens[i].type === 'WHITESPACE') {
          i--;
        }
        
        if (i < 0) return true; // Start of file
        
        const lastToken = this.tokens[i];
        const regexContexts = ['=', '(', '[', '{', ';', ',', ':', '!', '&', '|', '?', '+', '-', '*', '/', '%', 'return', 'throw', 'case'];
        return regexContexts.includes(lastToken.value) || regexContexts.includes(lastToken.type);
      }
      
      public tokenize(): Array<{ type: string; value: string; line: number; column: number }> {
        this.tokens = [];
        this.pos = 0;
        this.currentLine = 1;
        this.currentColumn = 1;
        
        while (this.pos < this.code.length) {
          this.skipWhitespace();
          if (this.pos >= this.code.length) break;
          
          const startLine = this.currentLine;
          const startColumn = this.currentColumn;
          const char = this.peek();
          
          let token;
          
          if (char === '"' || char === "'") {
            token = { type: 'STRING', value: this.readString(char), line: startLine, column: startColumn };
          } else if (char === '`') {
            token = { type: 'TEMPLATE', value: this.readTemplateString(), line: startLine, column: startColumn };
          } else if (char === '/' && this.peek(1) === '/') {
            token = { type: 'LINE_COMMENT', value: this.readLineComment(), line: startLine, column: startColumn };
          } else if (char === '/' && this.peek(1) === '*') {
            token = { type: 'BLOCK_COMMENT', value: this.readBlockComment(), line: startLine, column: startColumn };
          } else if (char === '/' && this.isRegexContext()) {
            token = { type: 'REGEX', value: this.readRegex(), line: startLine, column: startColumn };
          } else if (/[a-zA-Z_$]/.test(char)) {
            token = { type: 'IDENTIFIER', value: this.readIdentifier(), line: startLine, column: startColumn };
          } else {
            token = { type: 'OPERATOR', value: this.advance(), line: startLine, column: startColumn };
          }
          
          this.tokens.push(token);
        }
        
        return this.tokens;
      }
    }
    
    // Parse tokens to find function declarations in proper context
    class FunctionParser {
      private tokens: Array<{ type: string; value: string; line: number; column: number }>;
      private pos = 0;
      
      constructor(tokens: Array<{ type: string; value: string; line: number; column: number }>) {
        this.tokens = tokens;
      }
      
      private peek(offset = 0): any {
        return this.tokens[this.pos + offset] || { type: 'EOF', value: '', line: 0, column: 0 };
      }
      
      private advance(): any {
        return this.tokens[this.pos++] || { type: 'EOF', value: '', line: 0, column: 0 };
      }
      
      private skipNonCode(): void {
        while (this.pos < this.tokens.length) {
          const token = this.peek();
          if (token.type === 'STRING' || token.type === 'TEMPLATE' || 
              token.type === 'LINE_COMMENT' || token.type === 'BLOCK_COMMENT' || 
              token.type === 'REGEX') {
            this.advance();
          } else {
            break;
          }
        }
      }
      
      public parseFunctions(): { functions: Set<string>; nestedFunctions: Map<string, string> } {
        const functions = new Set<string>();
        const nestedFunctions = new Map<string, string>();
        const scopeStack: string[] = [];
        let braceDepth = 0;
        
        while (this.pos < this.tokens.length) {
          this.skipNonCode();
          
          const token = this.peek();
          
          if (token.type === 'IDENTIFIER' && token.value === 'function') {
            // Found function keyword, parse function declaration
            this.advance(); // Skip 'function'
            this.skipNonCode();
            
            // Check for generator function (*)
            if (this.peek().value === '*') {
              this.advance(); // Skip *
              this.skipNonCode();
            }
            
            // Get function name
            const nameToken = this.peek();
            if (nameToken.type === 'IDENTIFIER') {
              const functionName = nameToken.value;
              this.advance(); // Skip function name
              
              console.log('[AST_PARSER] Found function:', functionName, 'at line', nameToken.line, 'depth:', braceDepth);
              
              if (braceDepth === 0) {
                functions.add(functionName);
                console.log('[AST_PARSER] Added global function:', functionName);
                scopeStack.push(functionName);
              } else {
                const parentFunction = scopeStack[scopeStack.length - 1];
                if (parentFunction) {
                  nestedFunctions.set(functionName, parentFunction);
                  console.log('[AST_PARSER] Added nested function:', functionName, 'inside', parentFunction);
                  scopeStack.push(functionName);
                }
              }
            }
          } else if (token.type === 'IDENTIFIER' && (token.value === 'const' || token.value === 'let' || token.value === 'var')) {
            // Check for function expressions and arrow functions
            this.advance(); // Skip variable declaration
            this.skipNonCode();
            
            const nameToken = this.peek();
            if (nameToken.type === 'IDENTIFIER') {
              const variableName = nameToken.value;
              this.advance(); // Skip variable name
              this.skipNonCode();
              
              if (this.peek().value === '=') {
                this.advance(); // Skip =
                this.skipNonCode();
                
                // Check if it's a function expression or arrow function
                const nextToken = this.peek();
                if (nextToken.type === 'IDENTIFIER' && nextToken.value === 'function') {
                  // Function expression
                  console.log('[AST_PARSER] Found function expression:', variableName, 'at line', nameToken.line);
                  if (braceDepth === 0) {
                    functions.add(variableName);
                  } else {
                    const parentFunction = scopeStack[scopeStack.length - 1];
                    if (parentFunction) {
                      nestedFunctions.set(variableName, parentFunction);
                    }
                  }
                } else {
                  // Could be arrow function, look for => pattern
                  let lookahead = 0;
                  let foundArrow = false;
                  let parenDepth = 0;
                  
                  while (lookahead < 10 && this.pos + lookahead < this.tokens.length) {
                    const lookToken = this.peek(lookahead);
                    if (lookToken.value === '(') parenDepth++;
                    if (lookToken.value === ')') parenDepth--;
                    if (lookToken.value === '=' && this.peek(lookahead + 1)?.value === '>') {
                      foundArrow = true;
                      break;
                    }
                    if (parenDepth < 0) break;
                    lookahead++;
                  }
                  
                  if (foundArrow) {
                    console.log('[AST_PARSER] Found arrow function:', variableName, 'at line', nameToken.line);
                    if (braceDepth === 0) {
                      functions.add(variableName);
                    } else {
                      const parentFunction = scopeStack[scopeStack.length - 1];
                      if (parentFunction) {
                        nestedFunctions.set(variableName, parentFunction);
                      }
                    }
                  }
                }
              }
            }
          } else if (token.value === '{') {
            braceDepth++;
            this.advance();
          } else if (token.value === '}') {
            braceDepth--;
            if (braceDepth >= 0 && scopeStack.length > 0) {
              const poppedFunction = scopeStack.pop();
              console.log('[AST_PARSER] Popped function from scope:', poppedFunction);
            }
            this.advance();
          } else {
            this.advance();
          }
        }
        
        return { functions, nestedFunctions };
      }
    }
    
    try {
      console.log('[AST_PARSER] Starting enhanced JavaScript parsing...');
      
      // Tokenize the code with context awareness
      const tokenizer = new JavaScriptTokenizer(code);
      const tokens = tokenizer.tokenize();
      
      console.log('[AST_PARSER] Tokenized', tokens.length, 'tokens');
      
      // Parse tokens to find functions in correct context
      const parser = new FunctionParser(tokens);
      const result = parser.parseFunctions();
      
      console.log('[AST_PARSER] Parsing complete. Found', result.functions.size, 'global functions and', result.nestedFunctions.size, 'nested functions');
      
      return result;
    } catch (error) {
      console.error('[AST_PARSER] Parsing failed, falling back to simple parsing:', error);
      
      // Fallback to simpler parsing if AST parsing fails
      return parseJavaScriptFunctionsSimple(code);
    }
  }
  
  // Fallback simple parsing function for when AST parsing fails
  function parseJavaScriptFunctionsSimple(code: string) {
    console.log('[SIMPLE_PARSER] Using fallback parser');
    const functions = new Set<string>();
    const nestedFunctions = new Map<string, string>();
    
    // Very basic parsing as fallback
    const lines = code.split('\n');
    let braceDepth = 0;
    let parentStack: string[] = [];
    
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum].trim();
      
      // Very basic function detection for fallback
      const functionMatch = line.match(/^function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
      if (functionMatch) {
        const functionName = functionMatch[1];
        
        if (braceDepth === 0) {
          functions.add(functionName);
          parentStack = [functionName];
        } else {
          const parentFunction = parentStack[parentStack.length - 1];
          if (parentFunction) {
            nestedFunctions.set(functionName, parentFunction);
            parentStack.push(functionName);
          }
        }
      }
      
      // Track brace depth
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceDepth += openBraces - closeBraces;
      
      if (closeBraces > 0) {
        for (let j = 0; j < closeBraces; j++) {
          if (parentStack.length > 1) {
            parentStack.pop();
          }
        }
      }
    }
    
    return { functions, nestedFunctions };
  }

  // Runtime tracking code (unchanged)
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
  
  console.log('[EVENT_EMIT] ' + status + ' ' + name + ' (ID: ' + id + ') -> Parent: ' + (parentId || 'none'));
  
  if (status === 'start') {
    if (parentId) {
      parentMap.set(id, parentId);
    }
    parentStack.push(id);
    console.log('[STACK] After ' + name + ' START, stack:', parentStack.slice());
  } else if (status === 'end') {
    // For synchronous functions, they should complete in LIFO order
    // For async functions, they might complete out of order
    
    // Always use the stored parent ID for end events
          if (parentMap.has(id)) {
            event.parentId = parentMap.get(id);
      console.log('[EVENT_EMIT] Using stored parent for ' + name + ': ' + event.parentId);
    }
    
    // Handle stack cleanup - remove the function from wherever it is in the stack
    const stackIndex = parentStack.indexOf(id);
    if (stackIndex !== -1) {
      parentStack.splice(stackIndex, 1);
      console.log('[STACK] After ' + name + ' END, removed from position ' + stackIndex + ', stack:', parentStack.slice());
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

  // Use enhanced parsing instead of naive regex
  const parseResult = parseJavaScriptFunctions(cleanCode);
  const globalFunctions = parseResult.functions;
  const nestedFunctions = parseResult.nestedFunctions;
  
  console.log('[ENHANCED_ANALYSIS] Global functions:', Array.from(globalFunctions));
  console.log('[ENHANCED_ANALYSIS] Nested functions:', Array.from(nestedFunctions.entries()));

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
  
  console.log('[TRANSFORM] Applied enhanced parsing transformations');

  // Enhanced instrumentation with better promise chain handling
  const finalCode = `
${runtimeTrackingCode}

// Store reference to global scope for Web Worker compatibility
const globalScope = (typeof self !== 'undefined') ? self : (typeof global !== 'undefined') ? global : this;

// Error handling wrapper for better resilience
function safeExecute(fn, context = 'unknown') {
  try {
    return fn();
  } catch (error) {
    console.error('[SAFE_EXECUTE] Error in', context, ':', error);
    return null;
  }
}

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
    safeExecute(() => {
      // Try to access the function in the current scope
      const fn = eval(functionName);
      if (typeof fn === 'function') {
        // Explicitly add it to global scope
        globalScope[functionName] = fn;
        console.log('[INSTRUMENT] Promoted function to global scope:', functionName);
      } else {
        console.log('[INSTRUMENT] Function not accessible:', functionName, typeof fn);
      }
    }, 'function promotion for ' + functionName);
  });
  
  // Wrap each global function that exists in global scope
  let wrappedCount = 0;
  globalFunctionNames.forEach(functionName => {
    safeExecute(() => {
      if (typeof globalScope[functionName] === 'function') {
        const originalFunction = globalScope[functionName];
        globalScope[functionName] = __wrapFunction(originalFunction, functionName);
        console.log('[INSTRUMENT] Wrapped global function:', functionName);
        wrappedCount++;
      } else {
        console.log('[INSTRUMENT] Global function not found in global scope:', functionName);
      }
    }, 'function wrapping for ' + functionName);
  });
  
  console.log('[INSTRUMENT] Wrapped', wrappedCount, 'global functions');
  console.log('[INSTRUMENT] Enhanced AST-aware parsing enabled');
  
  // Runtime function detection fallback - find functions that static analysis missed
  function discoverRuntimeFunctions() {
    console.log('[RUNTIME_DISCOVERY] Scanning for dynamically created or missed functions...');
    
    const discoveredFunctions = [];
    const potentialFunctionNames = [];
    
    // Comprehensive list of built-in functions to NEVER wrap
    const systemFunctions = new Set([
      // Core JavaScript
      'eval', 'Function', 'Object', 'Array', 'String', 'Number', 'Boolean', 
      'Date', 'RegExp', 'Error', 'Symbol', 'BigInt', 'Promise', 'Proxy',
      'Map', 'Set', 'WeakMap', 'WeakSet', 'ArrayBuffer', 'DataView',
      'Int8Array', 'Uint8Array', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array',
      'Float32Array', 'Float64Array', 'Uint8ClampedArray', 'BigInt64Array', 'BigUint64Array',
      
      // Timers
      'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'requestAnimationFrame',
      'cancelAnimationFrame', 'queueMicrotask',
      
      // Global functions
      'isNaN', 'isFinite', 'parseFloat', 'parseInt', 'encodeURI', 'decodeURI',
      'encodeURIComponent', 'decodeURIComponent', 'escape', 'unescape',
      
      // Console and debugging
      'console', 'alert', 'confirm', 'prompt', 'dump', 'reportError',
      
      // Web Worker specific
      'postMessage', 'close', 'importScripts', 'addEventListener', 'removeEventListener',
      'dispatchEvent', 'btoa', 'atob', 'createImageBitmap', 'structuredClone', 'fetch',
      
      // Event and DOM related
      'Event', 'EventTarget', 'CustomEvent', 'MessageEvent', 'ErrorEvent', 'CloseEvent',
      'ProgressEvent', 'MessageChannel', 'MessagePort', 'BroadcastChannel',
      
      // Web APIs
      'XMLHttpRequest', 'WebSocket', 'Worker', 'Blob', 'File', 'FileReader',
      'URL', 'URLSearchParams', 'Headers', 'Request', 'Response', 'AbortController',
      'AbortSignal', 'FormData', 'Crypto', 'CryptoKey', 'SubtleCrypto',
      
      // Storage and IndexedDB
      'IDBFactory', 'IDBDatabase', 'IDBTransaction', 'IDBObjectStore', 'IDBIndex',
      'IDBCursor', 'IDBKeyRange', 'IDBRequest', 'IDBOpenDBRequest',
      
      // Streams
      'ReadableStream', 'WritableStream', 'TransformStream', 'CompressionStream',
      'DecompressionStream', 'TextEncoder', 'TextDecoder',
      
      // Canvas and WebGL
      'CanvasGradient', 'CanvasPattern', 'ImageData', 'ImageBitmap', 'Path2D',
      'WebGLRenderingContext', 'WebGL2RenderingContext', 'OffscreenCanvas',
      
      // Performance and Observers
      'Performance', 'PerformanceEntry', 'PerformanceObserver', 'MutationObserver',
      'IntersectionObserver', 'ResizeObserver',
      
      // Instrumentation system functions
      'safeExecute', 'discoverRuntimeFunctions', '__wrapFunction', '__wrapNestedFunction',
      'emitProcessEvent', 'captureParentContext', 'getParentId', 'wrapSetTimeout',
      
      // Constructor functions that should never be wrapped
      'WeakRef', 'FinalizationRegistry', 'Iterator', 'Generator', 'GeneratorFunction',
      'AsyncFunction', 'AsyncGenerator', 'AsyncGeneratorFunction'
    ]);
    
    // Only look for functions that could be user-defined
    const userDefinedPattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    
    // Scan globalScope for function properties that we might have missed
    for (const key in globalScope) {
      try {
        // Skip if it's a system function
        if (systemFunctions.has(key)) {
          continue;
        }
        
        // Skip if it doesn't look like a user-defined function name
        if (!userDefinedPattern.test(key)) {
          continue;
        }
        
        // Skip if it's already been found by static analysis
        if (globalFunctionNames.includes(key)) {
          continue;
        }
        
        // Skip internal/private functions
        if (key.startsWith('_') || key.startsWith('$') || key.includes('Interval') || key.includes('Timeout')) {
          continue;
        }
        
        // Skip if it's not actually a function
        if (typeof globalScope[key] !== 'function') {
          continue;
        }
        
        // Additional safety check - skip constructor functions for built-in types
        try {
          const fnString = globalScope[key].toString();
          if (fnString.includes('[native code]') || fnString.length < 20) {
            continue; // Skip native functions and very short functions (likely built-ins)
          }
        } catch (e) {
          continue; // Skip functions we can't inspect
        }
        
        // Skip if the function name suggests it's a built-in (uppercase start often indicates constructor)
        if (key[0] === key[0].toUpperCase() && key.length > 1) {
          continue; // Skip potential constructor functions
        }
        
        potentialFunctionNames.push(key);
} catch (error) {
        // Skip any functions that cause errors during inspection
        console.log('[RUNTIME_DISCOVERY] Skipping function due to error:', key, error.message);
        continue;
      }
    }
    
    console.log('[RUNTIME_DISCOVERY] Found potential user functions:', potentialFunctionNames);
    
    // Wrap discovered functions with additional safety checks
    potentialFunctionNames.forEach(functionName => {
      safeExecute(() => {
        // Double-check the function still exists and is safe to wrap
        if (typeof globalScope[functionName] === 'function' && 
            !systemFunctions.has(functionName) &&
            !functionName.startsWith('__')) {
          
          const originalFunction = globalScope[functionName];
          
          // Final safety check - don't wrap if it's critical to the system
          try {
            const fnString = originalFunction.toString();
            if (fnString.includes('[native code]')) {
              console.log('[RUNTIME_DISCOVERY] Skipping native function:', functionName);
              return;
            }
          } catch (e) {
            console.log('[RUNTIME_DISCOVERY] Cannot inspect function, skipping:', functionName);
            return;
          }
          
          globalScope[functionName] = __wrapFunction(originalFunction, functionName);
          discoveredFunctions.push(functionName);
          console.log('[RUNTIME_DISCOVERY] Wrapped discovered function:', functionName);
        }
      }, 'runtime function wrapping for ' + functionName);
    });
    
    return discoveredFunctions;
  }
  
  // Perform runtime discovery
  const discoveredFunctions = discoverRuntimeFunctions();
  console.log('[RUNTIME_DISCOVERY] Discovered and wrapped', discoveredFunctions.length, 'additional functions:', discoveredFunctions);
  
  // Execute detected top-level function calls or main()
  if (typeof globalScope.main === 'function') {
    console.log('[INSTRUMENT] Executing main function with tracking');
    safeExecute(() => globalScope.main(), 'main function execution');
  } else if (topLevelCallNames.length > 0) {
    console.log('[INSTRUMENT] Executing top-level function calls');
    topLevelCallNames.forEach(funcName => {
      if (typeof globalScope[funcName] === 'function') {
        console.log('[INSTRUMENT] Executing top-level call:', funcName);
        safeExecute(() => globalScope[funcName](), 'top-level call ' + funcName);
      } else {
        console.log('[INSTRUMENT] Top-level function not found:', funcName);
      }
    });
  } else {
    console.log('[INSTRUMENT] No main function or top-level calls found, execution complete');
  }
  
} catch (error) {
  console.error('[RUNTIME_ERROR]', error);
  // Attempt to provide partial functionality even if parsing fails
  console.log('[FALLBACK] Attempting fallback execution...');
  safeExecute(() => {
    if (typeof main === 'function') {
      console.log('[FALLBACK] Found main function, executing without full instrumentation');
      main();
    }
  }, 'fallback main execution');
}
`;

  console.log('[DB1] Successfully created enhanced AST-aware instrumentation');
  return finalCode;
}

export { instrumentCode }; 