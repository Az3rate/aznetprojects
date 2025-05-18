import * as acorn from 'acorn';

export interface ParsedProcess {
  id: string;
  name: string;
  type: string;
  async?: boolean;
}

export function parseProcessesWithAcorn(code: string): ParsedProcess[] {
  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'script' });
  } catch (e) {
    return [];
  }
  const processes: ParsedProcess[] = [];

  function walk(node: any, parent: any) {
    if (!node) return;
    // Function declarations
    if (node.type === 'FunctionDeclaration') {
      processes.push({
        id: `fn-${node.id.name}`,
        name: node.id.name,
        type: node.async ? 'async function' : 'function',
        async: node.async,
      });
    }
    // Arrow functions
    if (node.type === 'VariableDeclarator' && node.init && node.init.type === 'ArrowFunctionExpression') {
      processes.push({
        id: `arrow-${node.id.name}`,
        name: node.id.name,
        type: 'arrow function',
        async: node.init.async,
      });
    }
    // Class methods
    if (node.type === 'MethodDefinition' && node.value && node.value.body) {
      processes.push({
        id: `method-${node.key.name}`,
        name: node.key.name,
        type: 'class method',
        async: node.value.async,
      });
    }
    // Timers
    if (node.type === 'CallExpression' && node.callee && node.callee.name === 'setTimeout') {
      processes.push({ id: 'timer-setTimeout', name: 'setTimeout', type: 'timer' });
    }
    if (node.type === 'CallExpression' && node.callee && node.callee.name === 'setInterval') {
      processes.push({ id: 'timer-setInterval', name: 'setInterval', type: 'timer' });
    }
    // Recurse
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach(n => walk(n, node));
        } else if (typeof child === 'object' && child && child.type) {
          walk(child, node);
        }
      }
    }
  }

  walk(ast, null);
  // Remove duplicates (e.g., multiple setTimeout calls)
  const seen = new Set();
  return processes.filter(proc => {
    const key = proc.id + proc.name + proc.type;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
} 