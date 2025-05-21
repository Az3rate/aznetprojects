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
  // The parent tracking code to prepend to the user code
  const parentTrackingCode = `
// Add a global stack for tracking parent functions
const parentStack = [];

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
`;

  // Parse the code into an AST using Acorn
  const ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'module' });

  // Traverse the AST to add instrumentation for function declarations
  walk(ast, {
    FunctionDeclaration(node) {
      if (node.id && node.id.name) { // Check for null or undefined
        const fnName = node.id.name;
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
  console.log('[DEBUG_TRANSFORMED_CODE]', output);

  // Add tracking for arrow functions with regexp since the AST approach has linting issues
  const outputWithArrowFns = output.replace(
    /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(([^)]*)\)\s*=>\s*{([^}]*)}/g,
    (match, name, params, body) => {
      return `const ${name} = (${params}) => {
  emitProcessEvent('fn-${name}', '${name}', 'function', 'start');
  ${body}
  emitProcessEvent('fn-${name}', '${name}', 'function', 'end');
}`;
    }
  );

  // Prepend the parent tracking code
  return parentTrackingCode + '\n' + outputWithArrowFns;
}

// Use a simpler approach that resembles the working simple wrapper
function instrumentCodeOld(code: string): string {
  // Start with the basic wrapper code
  let instrumentedCode = `
// Runtime instrumentation setup
function emitProcessEvent(id, name, type, status) {
  console.log('[DEBUG_EVENT_EMISSION] Emitting event:', { id, name, type, status });
  console.log('[RUNTIME_EVENT]', { id, name, type, status });
  try {
    window.parent.postMessage({
      type: 'runtime-process-event',
      event: {
        id,
        name,
        type,
        status,
        timestamp: Date.now()
      }
    }, '*');
  } catch (e) {
    console.error('[RUNTIME_ERROR] Failed to emit event:', e);
  }
}

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

  // Correctly handle setTimeout calls
  transformed = transformed.replace(/setTimeout\(\(\) => {([^}]*)},\s*(\d+)\);/g, (match, body, delay) => {
    return `setTimeout(() => {${body}}, ${delay});`;
  });
  
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