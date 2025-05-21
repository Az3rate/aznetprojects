import * as acorn from 'acorn';
import * as astring from 'astring';
import type { ProcessTreeNode } from './parseProcessesWithAcorn';

// --- RUNTIME INSTRUMENTATION ONLY ---

// Helper to inject global runtime tracking at the top
const RUNTIME_HEADER = `
window.__AZNET_CALL_STACK = window.__AZNET_CALL_STACK || [];
window.__AZNET_CALL_COUNTER = window.__AZNET_CALL_COUNTER || 0;
`;

function processEventStatements(idExpr: string, name: string, type: string, status: 'start' | 'end', isRuntimeId = false) {
  // If isRuntimeId, don't quote idExpr
  const idField = isRuntimeId ? idExpr : `'${idExpr}'`;
  return [
    acorn.parseExpressionAt(
      `console.log('[AZNET_RUNTIME] PROCESS_EVENT', { id: ${idField}, name: '${name}', type: '${type}', status: '${status}' })`,
      0,
      { ecmaVersion: 2020 }
    ),
    acorn.parseExpressionAt(
      `parent.postMessage({ source: 'aznet-playground', version: 1, runId: window.__AZNET_RUN_ID, type: 'playground-process', payload: { id: ${idField}, name: '${name}', type: '${type}', status: '${status}' } }, '*')`,
      0,
      { ecmaVersion: 2020 }
    )
  ];
}

function createRuntimeCallId(fnName: string) {
  // Parse a variable declaration as a statement, not an expression
  return acorn.parse(`const __aznet_callId = 'call-${fnName}-' + (++window.__AZNET_CALL_COUNTER);`, { ecmaVersion: 2020 }).body[0];
}

function pushCallId() {
  return acorn.parseExpressionAt(`window.__AZNET_CALL_STACK.push(__aznet_callId);`, 0, { ecmaVersion: 2020 });
}
function popCallId() {
  return acorn.parseExpressionAt(`window.__AZNET_CALL_STACK.pop();`, 0, { ecmaVersion: 2020 });
}

export function instrumentWithAcorn(code: string, processTree?: ProcessTreeNode[]): string {
  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'script' });
  } catch (e) {
    console.error('[AZNET_RUNTIME] Parse error:', e);
    return code;
  }

  function instrumentNode(node: any, parentName?: string) {
    if (!node) return;
    // Instrument all function-like nodes
    if ((node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') && node.body && node.body.body) {
      // Try to get a name for the function
      let fnName = 'anonymous';
      if (node.id && node.id.name) fnName = node.id.name;
      else if (node.key && node.key.name) fnName = node.key.name;
      else if (parentName) fnName = parentName;
      else if (node.parentVarName) fnName = node.parentVarName;
      // Instrument all statements in the function body, including nested function declarations
      for (let i = 0; i < node.body.body.length; i++) {
        const stmt = node.body.body[i];
        if (stmt && (stmt.type === 'FunctionDeclaration' || stmt.type === 'FunctionExpression' || stmt.type === 'ArrowFunctionExpression')) {
          instrumentNode(stmt);
        } else {
          instrumentNode(stmt);
        }
      }
      // Inject runtime callId and stack logic
      const callIdDecl = createRuntimeCallId(fnName);
      const pushCall = pushCallId();
      const popCall = popCallId();
      const [callStartLog, callStartMsg] = processEventStatements('__aznet_callId', `${fnName}() call`, 'function call', 'start', true);
      const [callEndLog, callEndMsg] = processEventStatements('__aznet_callId', `${fnName}() call`, 'function call', 'end', true);
      const [fnStartLog, fnStartMsg] = processEventStatements(`fn-${fnName}`, fnName, 'function', 'start');
      const [fnEndLog, fnEndMsg] = processEventStatements(`fn-${fnName}`, fnName, 'function', 'end');
      node.body.body = [
        { type: 'ExpressionStatement', expression: callIdDecl },
        { type: 'ExpressionStatement', expression: pushCall },
        { type: 'ExpressionStatement', expression: callStartLog },
        { type: 'ExpressionStatement', expression: callStartMsg },
        { type: 'ExpressionStatement', expression: fnStartLog },
        { type: 'ExpressionStatement', expression: fnStartMsg },
        {
          type: 'TryStatement',
          block: { type: 'BlockStatement', body: node.body.body },
          handler: null,
          finalizer: {
            type: 'BlockStatement',
            body: [
              { type: 'ExpressionStatement', expression: fnEndLog },
              { type: 'ExpressionStatement', expression: fnEndMsg },
              { type: 'ExpressionStatement', expression: callEndLog },
              { type: 'ExpressionStatement', expression: callEndMsg },
              { type: 'ExpressionStatement', expression: popCall }
            ]
          }
        }
      ];
      return;
    }
    // Instrument class methods
    if (node.type === 'MethodDefinition' && node.value && node.value.body) {
      instrumentNode(node.value, node.key?.name);
      return;
    }
    // Instrument variable declarators with function expressions or arrow functions
    if (node.type === 'VariableDeclarator' && node.init && (node.init.type === 'FunctionExpression' || node.init.type === 'ArrowFunctionExpression')) {
      node.init.parentVarName = node.id?.name || 'arrow';
      instrumentNode(node.init, node.id?.name || 'arrow');
      return;
    }
    // Recurse for all child nodes
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const child = node[key];
        if (Array.isArray(child)) {
          for (const n of child) {
            if (typeof n === 'object' && n && n.type) {
              instrumentNode(n);
            }
          }
        } else if (typeof child === 'object' && child && child.type) {
          instrumentNode(child);
        }
      }
    }
  }

  // Instrument all top-level AST body
  if (ast && ast.body && Array.isArray(ast.body)) {
    for (const stmt of ast.body) {
      instrumentNode(stmt);
    }
  }

  // Inject runtime header at the top
  return RUNTIME_HEADER + astring.generate(ast);
}