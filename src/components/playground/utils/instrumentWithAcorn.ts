import * as acorn from 'acorn';
import * as astring from 'astring';
import type { ProcessTreeNode } from './parseProcessesWithAcorn';

// --- ID logic copied from process tree parser ---
function semanticId({ type, name, parentNames, localIdx, fallback }: {
  type: string;
  name?: string;
  parentNames?: string[];
  localIdx?: number;
  fallback?: string;
}) {
  let id = type;
  if (parentNames && parentNames.length) {
    id += '-' + parentNames.join('.');
  }
  if (name) {
    id += '-' + name;
  }
  if (typeof localIdx === 'number') {
    id += `_${localIdx}`;
  }
  if (fallback) {
    id += fallback;
  }
  return id;
}
const nodeIdSet = new Set<string>();
function uniqueId(base: string) {
  let id = base;
  let counter = 1;
  while (nodeIdSet.has(id)) {
    id = `${base}__${++counter}`;
  }
  nodeIdSet.add(id);
  return id;
}

function processEventStatements(id: string, name: string, type: string, status: 'start' | 'end') {
  return [
    acorn.parseExpressionAt(`console.log('[DEBUG_HIGHLIGHT_IFRAME] Emitting process event', { id: '${id}', name: '${name}', type: '${type}', status: '${status}' })`, 0, { ecmaVersion: 2020 }),
    acorn.parseExpressionAt(`parent.postMessage({ source: 'aznet-playground', version: 1, runId: window.__AZNET_RUN_ID, type: 'playground-process', payload: { id: '${id}', name: '${name}', type: '${type}', status: '${status}' } }, '*')`, 0, { ecmaVersion: 2020 })
  ];
}

function createTryFinallyBlock(body: any[], id: string, name: string, type: string) {
  const [logExpr, postMsgExpr] = processEventStatements(id, name, type, 'end');
  return {
    type: 'TryStatement',
    block: { type: 'BlockStatement', body },
    handler: null,
    finalizer: {
      type: 'BlockStatement',
      body: [
        { type: 'ExpressionStatement', expression: logExpr },
        { type: 'ExpressionStatement', expression: postMsgExpr }
      ]
    }
  };
}

export function instrumentWithAcorn(code: string, processTree?: ProcessTreeNode[]): string {
  // Reset nodeIdSet to avoid ID drift between runs
  nodeIdSet.clear();
  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'script' });
  } catch (e) {
    console.error('[instrumentWithAcorn] Parse error:', e);
    return code;
  }

  // Build a map from function/arrow/method name to process ID from the process tree
  const idMap: Record<string, string> = {};
  function buildIdMap(nodes: any[]) {
    for (const node of nodes) {
      if (node.name && node.id) {
        idMap[node.name] = node.id;
      }
      if (node.children && node.children.length) {
        buildIdMap(node.children);
      }
    }
  }
  if (processTree) buildIdMap(processTree);

  const localCounters: Record<string, number> = {};

  function instrumentNode(node: any, parentNames: string[] = []) {
    if (!node) return;

    // FunctionDeclaration
    if (node.type === 'FunctionDeclaration') {
      const fnName = node.id?.name || 'anonymousFn';
      const id = idMap[fnName] || semanticId({ type: 'fn', name: fnName, parentNames });
      const type = node.async ? 'async function' : 'function';
      // Add start event
      const [logExpr, postMsgExpr] = processEventStatements(id, fnName, type, 'start');
      const startEvents = [
        { type: 'ExpressionStatement', expression: logExpr },
        { type: 'ExpressionStatement', expression: postMsgExpr }
      ];
      // Instrument children
      if (node.body && node.body.body) {
        for (const stmt of node.body.body) {
          instrumentNode(stmt, [...parentNames, fnName]);
        }
      }
      // Wrap body in try/finally
      const tryFinally = createTryFinallyBlock(node.body.body, id, fnName, type);
      node.body.body = [...startEvents, tryFinally];
      return;
    }
    // Arrow functions assigned to variables
    if (node.type === 'VariableDeclarator' && node.init && node.init.type === 'ArrowFunctionExpression') {
      const varName = node.id?.name || 'arrow';
      const id = idMap[varName] || semanticId({ type: 'arrow', name: varName, parentNames });
      const type = 'arrow function';
      // Instrument children
      if (node.init.body && node.init.body.body) {
        for (const stmt of node.init.body.body) {
          instrumentNode(stmt, [...parentNames, varName]);
        }
      }
      // Add start event
      const [logExpr, postMsgExpr] = processEventStatements(id, varName, type, 'start');
      const startEvents = [
        { type: 'ExpressionStatement', expression: logExpr },
        { type: 'ExpressionStatement', expression: postMsgExpr }
      ];
      // Convert concise body to block if needed
      if (node.init.body.type !== 'BlockStatement') {
        node.init.body = {
          type: 'BlockStatement',
          body: [{ type: 'ReturnStatement', argument: node.init.body }]
        };
      }
      // Wrap body in try/finally
      const tryFinally = createTryFinallyBlock(node.init.body.body, id, varName, type);
      node.init.body.body = [...startEvents, tryFinally];
      return;
    }
    // Class methods
    if (node.type === 'MethodDefinition' && node.value && node.value.body) {
      const methodName = node.key?.name || 'method';
      const id = idMap[methodName] || semanticId({ type: 'method', name: methodName, parentNames });
      const type = 'class method';
      // Instrument children
      for (const stmt of node.value.body.body) {
        instrumentNode(stmt, [...parentNames, methodName]);
      }
      // Add start event
      const [logExpr, postMsgExpr] = processEventStatements(id, methodName, type, 'start');
      const startEvents = [
        { type: 'ExpressionStatement', expression: logExpr },
        { type: 'ExpressionStatement', expression: postMsgExpr }
      ];
      // Wrap body in try/finally
      const tryFinally = createTryFinallyBlock(node.value.body.body, id, methodName, type);
      node.value.body.body = [...startEvents, tryFinally];
      return;
    }
    // Timers
    if (node.type === 'CallExpression' && node.callee && node.callee.name === 'setTimeout') {
      const parentScope = parentNames[parentNames.length - 1] || 'global';
      const key = `timer-setTimeout-${parentScope}`;
      if (!localCounters[key]) localCounters[key] = 0;
      const idx = localCounters[key]++;
      const id = semanticId({ type: 'timer-setTimeout', parentNames, localIdx: idx });
      const type = 'timer';
      // Instrument callback
      const callback = node.arguments[0];
      if (callback && (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression')) {
        if (callback.body && callback.body.body) {
          for (const stmt of callback.body.body) {
            instrumentNode(stmt, [...parentNames, 'setTimeout']);
          }
        }
        // Add start event for timer
        const [logExpr, postMsgExpr] = processEventStatements(id, 'setTimeout', type, 'start');
        const startEvents = [
          { type: 'ExpressionStatement', expression: logExpr },
          { type: 'ExpressionStatement', expression: postMsgExpr }
        ];
        // Convert concise body to block if needed
        if (callback.body.type !== 'BlockStatement') {
          callback.body = {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: callback.body }]
          };
        }
        // Wrap body in try/finally
        const tryFinally = createTryFinallyBlock(callback.body.body, id, 'setTimeout', type);
        callback.body.body = [...startEvents, tryFinally];
      }
      return;
    }
    if (node.type === 'CallExpression' && node.callee && node.callee.name === 'setInterval') {
      const parentScope = parentNames[parentNames.length - 1] || 'global';
      const key = `timer-setInterval-${parentScope}`;
      if (!localCounters[key]) localCounters[key] = 0;
      const idx = localCounters[key]++;
      const id = semanticId({ type: 'timer-setInterval', parentNames, localIdx: idx });
      const type = 'timer';
      // Instrument callback
      const callback = node.arguments[0];
      if (callback && (callback.type === 'ArrowFunctionExpression' || callback.type === 'FunctionExpression')) {
        if (callback.body && callback.body.body) {
          for (const stmt of callback.body.body) {
            instrumentNode(stmt, [...parentNames, 'setInterval']);
          }
        }
        // Add start event for timer
        const [logExpr, postMsgExpr] = processEventStatements(id, 'setInterval', type, 'start');
        const startEvents = [
          { type: 'ExpressionStatement', expression: logExpr },
          { type: 'ExpressionStatement', expression: postMsgExpr }
        ];
        // Convert concise body to block if needed
        if (callback.body.type !== 'BlockStatement') {
          callback.body = {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: callback.body }]
          };
        }
        // Wrap body in try/finally
        const tryFinally = createTryFinallyBlock(callback.body.body, id, 'setInterval', type);
        callback.body.body = [...startEvents, tryFinally];
      }
      return;
    }
    // Recurse for all child nodes
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const child = node[key];
        if (Array.isArray(child)) {
          for (const n of child) {
            instrumentNode(n, parentNames);
          }
        } else if (typeof child === 'object' && child && child.type) {
          instrumentNode(child, parentNames);
        }
      }
    }
  }

  // Instrument all top-level AST body
  if (ast && ast.body && Array.isArray(ast.body)) {
    for (const stmt of ast.body) {
      instrumentNode(stmt, []);
    }
  }

  return astring.generate(ast);
}