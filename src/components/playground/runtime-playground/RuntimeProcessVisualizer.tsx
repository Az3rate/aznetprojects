import React from 'react';
import type { RuntimeProcessNode } from './types';
import MermaidDiagram from '../components/MermaidDiagram';
import styled from 'styled-components';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

interface Props {
  root: RuntimeProcessNode | null;
}

export const RuntimeProcessVisualizer: React.FC<Props> = ({ root }) => {
  if (!root) return <Container>No process tree available yet</Container>;

  // Generate a simple Mermaid chart directly
  let mermaidChart = 'graph TD\n';

  // Add all nodes first
  const addNodes = (node: RuntimeProcessNode) => {
    // Add this node
    mermaidChart += `  ${node.id}["${node.name}"]\n`;
    
    // Add style for this node based on status
    if (node.status === 'completed') {
      mermaidChart += `  style ${node.id} fill:#9f9,stroke:#393\n`;
    } else {
      mermaidChart += `  style ${node.id} fill:#ff9,stroke:#993\n`;
    }
    
    // Process all children
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => addNodes(child));
    }
  };
  
  // Add all connections
  const addConnections = (node: RuntimeProcessNode) => {
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        mermaidChart += `  ${node.id} --> ${child.id}\n`;
        addConnections(child);
      });
    }
  };
  
  // Build the chart
  addNodes(root);
  addConnections(root);
  
  console.log('[DEBUG_MERMAID_CHART]', mermaidChart);

  return (
    <Container>
      <Title>Process Tree</Title>
      <MermaidDiagram chart={mermaidChart} />
      <div style={{ marginTop: '20px' }}>
        <details>
          <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>Show Raw Data</summary>
          <pre style={{ fontSize: '12px', background: '#eee', padding: '8px', overflow: 'auto', maxHeight: '300px' }}>
            {JSON.stringify(root, null, 2)}
          </pre>
        </details>
      </div>
    </Container>
  );
}; 