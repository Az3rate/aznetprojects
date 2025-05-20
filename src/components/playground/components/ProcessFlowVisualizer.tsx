import React, { useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background, Node, Edge } from 'react-flow-renderer';
import dagre from 'dagre';
import type { ProcessTreeNode } from '../utils/parseProcessesWithAcorn';

interface ProcessFlowVisualizerProps {
  processTree: ProcessTreeNode[];
  activeProcessIds: string[];
}

// Helper to flatten the process tree and build edges
function flattenTree(node: ProcessTreeNode, nodes: ProcessTreeNode[] = [], edges: Edge[] = []): { nodes: ProcessTreeNode[]; edges: Edge[] } {
  nodes.push(node);
  if (node.children && node.children.length) {
    for (const child of node.children) {
      edges.push({ id: `${node.id}->${child.id}`, source: node.id, target: child.id } as Edge);
      flattenTree(child, nodes, edges);
    }
  }
  return { nodes, edges };
}

function buildNodesAndEdges(processTree: ProcessTreeNode[]): { nodes: Node[]; edges: Edge[] } {
  if (!processTree || processTree.length === 0) return { nodes: [], edges: [] };
  // If processTree is an array of roots, flatten all
  let allNodes: ProcessTreeNode[] = [], allEdges: Edge[] = [];
  // Defensive: check if input has children property
  if (!('children' in processTree[0])) {
    console.warn('ProcessFlowVisualizer: input does not have children property, skipping tree layout.');
    return { nodes: [], edges: [] };
  }
  for (const root of processTree) {
    const { nodes, edges } = flattenTree(root);
    allNodes.push(...nodes);
    allEdges.push(...edges);
  }

  // Use dagre for layout
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB' });
  allNodes.forEach(proc => {
    g.setNode(proc.id, { label: proc.name, width: 150, height: 40 });
  });
  allEdges.forEach(edge => {
    g.setEdge(edge.source, edge.target);
  });
  dagre.layout(g);
  const nodes: Node[] = allNodes.map(proc => {
    const nodeWithPos = g.node(proc.id);
    return {
      id: proc.id,
      data: { label: proc.name },
      position: { x: nodeWithPos.x, y: nodeWithPos.y },
      style: {},
    };
  });
  // Debug logs
  console.log('%c[ProcessFlow] Flattened nodes:', 'color: #00c', allNodes);
  console.log('%c[ProcessFlow] Flattened edges:', 'color: #00c', allEdges);
  return { nodes, edges: allEdges };
}

const ProcessFlowVisualizer: React.FC<ProcessFlowVisualizerProps> = ({ processTree, activeProcessIds }) => {
  // Memoize nodes/edges for performance
  const { nodes, edges } = useMemo(() => buildNodesAndEdges(processTree), [processTree]);

  // Highlight active nodes
  const highlightedNodes = nodes.map(node =>
    activeProcessIds.includes(node.id)
      ? { ...node, style: { border: '2px solid #FFD600', boxShadow: '0 0 10px #FFD600', background: '#FFFDE7' } }
      : node
  );

  // Debug logs for highlight
  const highlightedIds = nodes.filter(node => activeProcessIds.includes(node.id)).map(n => n.id);
  // eslint-disable-next-line no-console
  console.log('[DEBUG_HIGHLIGHT_VIS] activeProcessIds:', activeProcessIds);
  // eslint-disable-next-line no-console
  console.log('[DEBUG_HIGHLIGHT_VIS] all node IDs:', nodes.map(n => n.id));
  // eslint-disable-next-line no-console
  console.log('[DEBUG_HIGHLIGHT_VIS] highlighted node IDs:', highlightedIds);

  // Debug logs for layout
  console.log('%c[ProcessFlow] ReactFlow nodes:', 'color: #09f', highlightedNodes);
  console.log('%c[ProcessFlow] ReactFlow edges:', 'color: #09f', edges);

  return (
    <div style={{ width: '100%', height: 500 }}>
      {/* Debug logs for layout */}
      {/*
      {JSON.stringify(highlightedNodes, null, 2)}
      {JSON.stringify(edges, null, 2)}
      */}
      <ReactFlow nodes={highlightedNodes} edges={edges} fitView>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default ProcessFlowVisualizer; 