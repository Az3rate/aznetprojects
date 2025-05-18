import * as acorn from 'acorn';
import * as astring from 'astring';
import * as walk from 'acorn-walk';

// Helper to generate postMessage code
function processEventCode(id: string, name: string, type: string, status: 'start' | 'end') {
  return `parent.postMessage({ type: 'playground-process', payload: { id: '${id}', name: '${name}', type: '${type}', status: '${status}' } }, '*');`;
}

// Helper to create a try/finally block
function createTryFinallyBlock(body: any[], id: string, name: string, type: string) {
  return {
    type: 'TryStatement',
    block: { type: 'BlockStatement', body },
    handler: null,
    finalizer: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ExpressionStatement',
          expression: acorn.parseExpressionAt(processEventCode(id, name, type, 'end'), 0, { ecmaVersion: 2020 })
        }
      ]
    }
  };
}

// Main instrumentation function
export function instrumentWithAcorn(code: string): string {
  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'script' });
  } catch (e) {
    console.error('[instrumentWithAcorn] Parse error:', e);
    return code;
  }

  // Walk the AST and instrument functions
  walk.simple(ast, {
    FunctionDeclaration(node: any) {
      const fnName = node.id.name;
      const id = `fn-${fnName}`;
      const type = node.async ? 'async function' : 'function';
      
      // Add start event
      const startEvent = {
        type: 'ExpressionStatement',
        expression: acorn.parseExpressionAt(processEventCode(id, fnName, type, 'start'), 0, { ecmaVersion: 2020 })
      };

      // Wrap body in try/finally
      const tryFinally = createTryFinallyBlock(node.body.body, id, fnName, type);
      
      // Replace body with start event + try/finally
      node.body.body = [startEvent, tryFinally];
    },

    ArrowFunctionExpression(node: any) {
      // Generate a unique ID for the arrow function
      const id = `arrow-${Math.random().toString(36).substr(2, 9)}`;
      const type = 'arrow function';
      const name = 'anonymous arrow function';

      // Add start event
      const startEvent = {
        type: 'ExpressionStatement',
        expression: acorn.parseExpressionAt(processEventCode(id, name, type, 'start'), 0, { ecmaVersion: 2020 })
      };

      // Convert concise body to block if needed
      if (node.body.type !== 'BlockStatement') {
        node.body = {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: node.body }]
        };
      }

      // Wrap body in try/finally
      const tryFinally = createTryFinallyBlock(node.body.body, id, name, type);
      
      // Replace body with start event + try/finally
      node.body.body = [startEvent, tryFinally];
    },

    MethodDefinition(node: any) {
      const fnName = node.key.name;
      const id = `method-${fnName}`;
      const type = 'class method';

      // Add start event
      const startEvent = {
        type: 'ExpressionStatement',
        expression: acorn.parseExpressionAt(processEventCode(id, fnName, type, 'start'), 0, { ecmaVersion: 2020 })
      };

      // Wrap body in try/finally
      const tryFinally = createTryFinallyBlock(node.value.body.body, id, fnName, type);
      
      // Replace body with start event + try/finally
      node.value.body.body = [startEvent, tryFinally];
    },

    CallExpression(node: any) {
      // Instrument setTimeout and setInterval
      if (node.callee.type === 'Identifier' && ['setTimeout', 'setInterval'].includes(node.callee.name)) {
        const timerName = node.callee.name;
        const id = `timer-${timerName}`;
        const type = 'timer';

        // Add start event
        const startEvent = {
          type: 'ExpressionStatement',
          expression: acorn.parseExpressionAt(processEventCode(id, timerName, type, 'start'), 0, { ecmaVersion: 2020 })
        };

        // Get the callback function
        const callback = node.arguments[0];
        if (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression') {
          // Convert concise body to block if needed
          if (callback.body.type !== 'BlockStatement') {
            callback.body = {
              type: 'BlockStatement',
              body: [{ type: 'ReturnStatement', argument: callback.body }]
            };
          }

          // Wrap body in try/finally
          const tryFinally = createTryFinallyBlock(callback.body.body, id, timerName, type);
          
          // Replace body with start event + try/finally
          callback.body.body = [startEvent, tryFinally];
        }
      }
    }
  });

  return astring.generate(ast);
}