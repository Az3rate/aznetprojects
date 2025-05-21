import * as acorn from 'acorn';

export interface ParsedProcess {
  id: string;
  name: string;
  type: string;
  async?: boolean;
}

export interface ProcessTreeNode {
  id: string;
  name: string;
  type: string;
  async?: boolean;
  children: ProcessTreeNode[];
  parentId?: string;
  start: number;
}

export function parseProcessTreeWithAcorn(code: string): ProcessTreeNode[] {
  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'script', locations: true });
  } catch (e) {
    return [];
  }

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

  const scopeStack: string[] = [];
  const localCounters: Record<string, number> = {};
  const nodeIdSet = new Set<string>();
  const functionMap: Record<string, ProcessTreeNode> = {};

  function uniqueId(base: string) {
    let id = base;
    let counter = 1;
    while (nodeIdSet.has(id)) {
      id = `${base}__${++counter}`;
    }
    nodeIdSet.add(id);
    return id;
  }

  const rootNodes: ProcessTreeNode[] = [];

  // First pass: collect all top-level function declarations
  function collectFunctions(node: any, parentNames: string[] = [], parentId?: string) {
    if (!node) return;
    if (node.type === 'FunctionDeclaration') {
      const fnName = node.id?.name || 'anonymousFn';
      const idBase = semanticId({ type: 'fn', name: fnName, parentNames });
      const processNode: ProcessTreeNode = {
        id: uniqueId(idBase),
        name: fnName,
        type: node.async ? 'async function' : 'function',
        async: node.async,
        children: [],
        parentId,
        start: node.start
      };
      functionMap[fnName] = processNode;
      rootNodes.push(processNode);
    }
    if (node.type === 'VariableDeclarator' && node.init && node.init.type === 'ArrowFunctionExpression') {
      const varName = node.id?.name || 'arrow';
      const idBase = semanticId({ type: 'arrow', name: varName, parentNames });
      const processNode: ProcessTreeNode = {
        id: uniqueId(idBase),
        name: varName,
        type: 'arrow function',
        async: node.init.async,
        children: [],
        parentId,
        start: node.start
      };
      functionMap[varName] = processNode;
      rootNodes.push(processNode);
    }
    if (node.type === 'MethodDefinition' && node.key?.name) {
      const methodName = node.key.name;
      const idBase = semanticId({ type: 'method', name: methodName, parentNames });
      const processNode: ProcessTreeNode = {
        id: uniqueId(idBase),
        name: methodName,
        type: 'class method',
        async: node.value.async,
        children: [],
        parentId,
        start: node.start
      };
      functionMap[methodName] = processNode;
      rootNodes.push(processNode);
    }
    // Recurse for all child nodes
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const child = node[key];
        if (Array.isArray(child)) {
          for (const n of child) {
            collectFunctions(n, parentNames, node.id?.name);
          }
        } else if (typeof child === 'object' && child && child.type) {
          collectFunctions(child, parentNames, node.id?.name);
        }
      }
    }
  }

  // Second pass: link called functions as children and add call nodes
  let callCounter = 0;
  function linkCalledFunctions(node: any, parentProcess: ProcessTreeNode | null) {
    if (!node) return;
    
    // Process function bodies
    if (node.type === 'FunctionDeclaration' && node.body && node.body.body) {
      for (const stmt of node.body.body) {
        linkCalledFunctions(stmt, functionMap[node.id?.name]);
      }
    }
    
    // Look for function calls in any expression
    if (node.type === 'CallExpression') {
      const callee = node.callee;
      if (callee && callee.type === 'Identifier' && functionMap[callee.name]) {
        // Add a call node for this invocation
        const callId = `call-${callee.name}-${node.start}`;
        const callNode: ProcessTreeNode = {
          id: callId,
          name: `${callee.name}() call`,
          type: 'function call',
          children: [functionMap[callee.name]],
          parentId: parentProcess ? parentProcess.id : undefined,
          start: node.start
        };
        if (parentProcess) {
          parentProcess.children.push(callNode);
        } else {
          rootNodes.push(callNode);
        }
        // Always recurse into arguments and callee for nested calls
        for (const key in node) {
          if (node.hasOwnProperty(key)) {
            const child = node[key];
            if (Array.isArray(child)) {
              for (const n of child) {
                linkCalledFunctions(n, callNode);
              }
            } else if (typeof child === 'object' && child && child.type) {
              linkCalledFunctions(child, callNode);
            }
          }
        }
        return;
      }
    }
    
    // Process arrow function bodies
    if (node.type === 'ArrowFunctionExpression' && node.body && node.body.body) {
      for (const stmt of node.body.body) {
        linkCalledFunctions(stmt, parentProcess);
      }
    }
    
    // Recurse for all child nodes
    for (const key in node) {
      if (node.hasOwnProperty(key)) {
        const child = node[key];
        if (Array.isArray(child)) {
          for (const n of child) {
            linkCalledFunctions(n, parentProcess);
          }
        } else if (typeof child === 'object' && child && child.type) {
          linkCalledFunctions(child, parentProcess);
        }
      }
    }
  }

  // Helper to set parentId for all nodes in the tree
  function setParentIds(node: ProcessTreeNode, parentId?: string) {
    node.parentId = parentId;
    if (node.children && node.children.length) {
      for (const child of node.children) {
        setParentIds(child, node.id);
      }
    }
  }

  // Run passes
  if (ast && ast.body && Array.isArray(ast.body)) {
    for (const stmt of ast.body) {
      collectFunctions(stmt, []);
    }
    for (const stmt of ast.body) {
      linkCalledFunctions(stmt, null);
    }
    // Set parentId for all nodes in the tree
    for (const root of rootNodes) {
      setParentIds(root, undefined);
    }
  }
  // Unique debug log for process tree
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[AZNET_AUDIT] PROCESS_TREE_DEBUG', JSON.stringify(rootNodes, null, 2));
  }

  // If there is a function named 'main', return only that as the root
  const mainRoot = rootNodes.find(n => n.name === 'main');
  if (mainRoot) return [mainRoot];
  // Otherwise, return all top-level roots
  return rootNodes;
}

type ASTNode = any; // Replace with a more specific type if available

function extractId(node: ASTNode): string | undefined {
  // Try to extract a unique id from the node (e.g., node.id.name or node.name)
  if (node.id && typeof node.id.name === 'string') return node.id.name;
  if (typeof node.name === 'string') return node.name;
  return undefined;
}

function extractName(node: ASTNode): string | undefined {
  // Try to extract a display name from the node
  if (node.id && typeof node.id.name === 'string') return node.id.name;
  if (typeof node.name === 'string') return node.name;
  return undefined;
}

// Example recursive walk with parentId
function walkAST(node: ASTNode, parentId: string | null = null, processList: any[] = []): any[] {
  const id = extractId(node);
  const name = extractName(node);
  if (id && name) {
    processList.push({
      id,
      name,
      parentId,
      // ...other props
    });
  }
  // For each child node:
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: ASTNode) => walkAST(child, id, processList));
  }
  return processList;
}

// ... export or use walkAST as needed ... 