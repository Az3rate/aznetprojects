import React from 'react';
import type { RuntimeProcessNode } from './types';
import MermaidDiagram from '../components/MermaidDiagram';
import { RuntimeTimeline } from './RuntimeTimeline';
import styled from 'styled-components';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  box-shadow: ${({ theme }) => theme.effects.boxShadow.sm};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  
  &:before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    background-color: #4CAF50;
    border-radius: 50%;
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

const RawDataContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.md};
`;

const RawDataSummary = styled.summary`
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const RawDataContent = styled.pre`
  font-size: 12px;
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  overflow: auto;
  max-height: 300px;
`;

// Custom visualization for nodes
const TreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 100%;
  overflow: auto;
`;

const TreeNodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FunctionNode = styled.div<{ status?: string }>`
  background: ${({ status }) => status === 'completed' ? '#9f9' : '#ff9'};
  border: 2px solid ${({ status }) => status === 'completed' ? '#393' : '#993'};
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 120px;
  text-align: center;
  color: #000;
`;

const ConnectorLine = styled.div`
  width: 2px;
  height: 30px;
  background: #393;
  margin: 0 auto;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -4px;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 8px solid #393;
  }
`;

const AsyncConnectorLine = styled.div`
  width: 2px;
  height: 30px;
  background: repeating-linear-gradient(
    to bottom,
    #393 0,
    #393 5px,
    transparent 5px,
    transparent 8px
  );
  margin: 0 auto;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: -4px;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 8px solid #393;
  }
`;

const ChildrenContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 90vw;
`;

const AsyncOperationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.md};
`;

const AsyncChildrenContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 90vw;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const AsyncLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.background.glass};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const TimingBadge = styled.div`
  font-size: 10px;
  position: absolute;
  right: -70px;
  top: 50%;
  transform: translateY(-50%);
  background: ${({ theme }) => theme.colors.background.glass};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 2px 6px;
  border-radius: 10px;
  white-space: nowrap;
`;

const CallbackNode = styled(FunctionNode)`
  position: relative;
  border-style: dashed;
  background: ${({ status }) => status === 'completed' ? 'rgba(153, 255, 153, 0.7)' : 'rgba(255, 255, 153, 0.7)'};
`;

const ExecutionMessage = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-style: italic;
  margin-top: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.glass};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: 20px;
  font-size: 0.9em;
`;

const NoVisualizationContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.glass};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  border-left: 4px solid ${({ theme }) => theme.colors.warning};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const WarningIcon = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.warning};
  font-size: 24px;
`;

const WarningMessage = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-align: center;
`;

const ExplanationText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  margin-top: ${({ theme }) => theme.spacing.sm};
  text-align: center;
  max-width: 600px;
`;

// Recursive component to render a tree node and its children
const TreeNode: React.FC<{ 
  node: RuntimeProcessNode;
  isAsyncCallback?: boolean;
}> = ({ node, isAsyncCallback = false }) => {
  const safeNode = {
    ...node,
    children: Array.isArray(node.children) ? node.children : []
  };

  // Determine if this node is a callback function
  const isCallback = safeNode.name.includes('callback') || 
                    safeNode.name === 'setTimeout' || 
                    safeNode.name === 'fetchData' ||
                    isAsyncCallback;

  // For callbacks, force the status to "completed" if they have a startTime
  // This ensures they appear green regardless of missing endTime
  const displayStatus = isCallback && safeNode.startTime ? 'completed' : safeNode.status;

  // Identify async children
  const asyncChildren = isCallback ? [] : safeNode.children.filter(child => 
    child.name.includes('callback') || 
    child.name === 'setTimeout' || 
    child.name === 'fetchData'
  );

  // Regular synchronous children
  const regularChildren = isCallback ? [] : safeNode.children.filter(child => 
    !child.name.includes('callback') && 
    child.name !== 'setTimeout' && 
    child.name !== 'fetchData'
  );

  const NodeComponent = isCallback ? CallbackNode : FunctionNode;
  
  return (
    <TreeNodeContainer>
      <NodeComponent status={displayStatus}>
        {safeNode.name}()
        {safeNode.startTime && safeNode.endTime && (
          <TimingBadge>
            {((safeNode.endTime - safeNode.startTime) / 1000).toFixed(3)}s
          </TimingBadge>
        )}
      </NodeComponent>
      
      {regularChildren.length > 0 && (
        <>
          <ConnectorLine />
          <ChildrenContainer>
            {regularChildren.map((child, index) => (
              <TreeNode key={child.id || index} node={child} isAsyncCallback={false} />
            ))}
          </ChildrenContainer>
        </>
      )}

      {asyncChildren.length > 0 && (
        <AsyncOperationsContainer>
          <AsyncLabel>Asynchronous Operations</AsyncLabel>
          <AsyncConnectorLine />
          <AsyncChildrenContainer>
            {asyncChildren.map((child, index) => (
              <TreeNode 
                key={child.id || index} 
                node={child} 
                isAsyncCallback={true}
              />
            ))}
          </AsyncChildrenContainer>
        </AsyncOperationsContainer>
      )}
    </TreeNodeContainer>
  );
};

interface Props {
  root: RuntimeProcessNode | null;
}

export const RuntimeProcessVisualizer: React.FC<Props> = ({ root }) => {
  console.log('[DB1] RuntimeProcessVisualizer rendering with root:', root);
  
  if (!root) {
    console.log('[DB1] No root node provided');
    return <Container>No process tree available yet</Container>;
  }

  // Sometimes we get a root with undefined children due to race conditions
  // Let's ensure root.children is always an array
  const safeRoot = {
    ...root,
    children: Array.isArray(root.children) ? root.children : []
  };

  // Detect if we have a callback-heavy example that might not show properly
  const hasSetTimeoutInChildren = safeRoot.children.some(child => 
    child.name === 'fetchData' || child.name === 'setTimeout' || 
    child.name.includes('callback') || child.name.includes('Callback'));
  
  const isIncompleteTree = safeRoot.children.length > 0 && 
    safeRoot.children.every(child => !child.children || child.children.length === 0) &&
    (safeRoot.name === 'main' || safeRoot.name === 'outer') &&
    hasSetTimeoutInChildren;
    
  // If we have an incomplete tree with timeouts/callbacks, show a special message
  if (isIncompleteTree) {
    return (
      <Container>
        <Title>Process Tree</Title>
        <NoVisualizationContainer>
          <WarningIcon>⚠️</WarningIcon>
          <WarningMessage>Asynchronous Execution in Progress</WarningMessage>
          <ExplanationText>
            This code example uses asynchronous operations with callbacks that execute 
            after the main function completes. Some parts of the execution tree 
            might not be fully connected because callbacks run independently after 
            their parent functions have already completed.
          </ExplanationText>
        </NoVisualizationContainer>
        
        {/* Custom visualization even for incomplete trees */}
        <TreeContainer>
          <TreeNode node={safeRoot} />
          <ExecutionMessage>
            Some child operations may continue running asynchronously
          </ExecutionMessage>
        </TreeContainer>
        
        <RawDataContainer>
          <details open>
            <RawDataSummary>Show Raw Data</RawDataSummary>
            <RawDataContent>
              {JSON.stringify(safeRoot, null, 2)}
            </RawDataContent>
          </details>
        </RawDataContainer>
      </Container>
    );
  }

  // Check if this is a single node with no children
  const isSingleNode = safeRoot.children.length === 0;

  return (
    <Container>
      <Title>Process Tree</Title>
      
      {isIncompleteTree && (
        <ExplanationText style={{ marginBottom: '20px', borderLeft: '4px solid #ff9800', padding: '10px', backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
          This code example uses asynchronous operations. The visualization below shows the relationship between 
          synchronous operations (solid lines) and asynchronous callbacks (dashed lines and boxes).
        </ExplanationText>
      )}
      
      {/* Always use custom visualization */}
      <TreeContainer>
        <TreeNode node={safeRoot} />
        
        {isSingleNode && (
          <ExecutionMessage>
            Function executed successfully in {safeRoot.endTime && safeRoot.startTime 
              ? ((safeRoot.endTime - safeRoot.startTime) / 1000).toFixed(3) 
              : '0.000'} seconds
          </ExecutionMessage>
        )}
      </TreeContainer>
      
      {/* Add the timeline visualization for better insights */}
      <RuntimeTimeline node={safeRoot} />
      
      <RawDataContainer>
        <details open>
          <RawDataSummary>Show Raw Data</RawDataSummary>
          <RawDataContent>
            {JSON.stringify(safeRoot, null, 2)}
          </RawDataContent>
        </details>
      </RawDataContainer>
    </Container>
  );
};

// Helper function to generate Mermaid chart (kept for reference)
function generateMermaidChart(root: RuntimeProcessNode): string {
  let mermaidChart = 'graph TD\n';

  // Ensure root has valid children array
  const safeRoot = {
    ...root,
    children: Array.isArray(root.children) ? root.children : []
  };

  // Add all nodes first
  const addNodes = (node: RuntimeProcessNode) => {
    // Skip invalid nodes
    if (!node || !node.id) {
      console.log('[DB1] Skipping invalid node:', node);
      return;
    }
    
    // Add this node
    console.log(`[DB1] Adding node to chart: ${node.id} (${node.name})`);
    mermaidChart += `  ${node.id}["${node.name}"]\n`;
    
    // Add style for this node based on status
    if (node.status === 'completed') {
      mermaidChart += `  style ${node.id} fill:#9f9,stroke:#393\n`;
    } else {
      mermaidChart += `  style ${node.id} fill:#ff9,stroke:#993\n`;
    }
    
    // Process all children
    if (node.children && node.children.length > 0) {
      console.log(`[DB1] Node ${node.id} has ${node.children.length} children`);
      node.children.forEach(child => addNodes(child));
    } else {
      console.log(`[DB1] Node ${node.id} has no children`);
    }
  };
  
  // Add all connections
  const addConnections = (node: RuntimeProcessNode) => {
    // Skip invalid nodes
    if (!node || !node.id || !node.children) {
      return;
    }
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        if (child && child.id) {
          console.log(`[DB1] Adding connection: ${node.id} --> ${child.id}`);
          mermaidChart += `  ${node.id} --> ${child.id}\n`;
          addConnections(child);
        }
      });
    }
  };
  
  // Build the chart
  addNodes(safeRoot);
  addConnections(safeRoot);
  
  // Handle single-node case specially for better visualization
  if (!safeRoot.children || safeRoot.children.length === 0) {
    console.log('[DB1] Single node detected, adding special note');
    mermaidChart += `  Note["Function executed successfully"]:::note\n`;
    mermaidChart += `  ${safeRoot.id} -.-> Note\n`;
    mermaidChart += `  classDef note fill:#f0f0ff,stroke:#9090ff,stroke-width:1px,color:#333,border-radius:8px\n`;
  }
  
  return mermaidChart;
} 