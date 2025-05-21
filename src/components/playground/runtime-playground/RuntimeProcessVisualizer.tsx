import React, { useState, useEffect, useContext } from 'react';
import type { RuntimeProcessNode } from './types';
import MermaidDiagram from '../components/MermaidDiagram';
import { RuntimeTimeline } from './RuntimeTimeline';
import styled, { keyframes, css } from 'styled-components';
import { RuntimeContext } from './context/RuntimeContext';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 0, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 255, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 0, 0); }
`;

const flowDown = keyframes`
  0% { height: 0; opacity: 0; }
  100% { height: 30px; opacity: 1; }
`;

const flowDownArrow = keyframes`
  0% { opacity: 0; transform: translateY(-5px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const completionGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(73, 220, 73, 0.7); }
  50% { box-shadow: 0 0 15px rgba(73, 220, 73, 0.9); }
  100% { box-shadow: 0 0 5px rgba(73, 220, 73, 0.7); }
`;

const growWidth = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const pulseHighlight = keyframes`
  0% { background-color: rgba(255, 255, 200, 0.3); }
  50% { background-color: rgba(255, 255, 200, 0.7); }
  100% { background-color: rgba(255, 255, 200, 0.3); }
`;

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
  animation: ${fadeIn} 0.5s ease-out;
`;

const TreeNodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  animation: ${fadeIn} 0.5s ease-out;
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
  transition: all 0.3s ease-in-out;
  animation: ${fadeIn} 0.5s ease-out;
  
  ${({ status }) => status === 'running' && css`
    animation: ${pulse} 2s infinite;
  `}
  
  ${({ status }) => status === 'completed' && css`
    animation: ${completionGlow} 2s ease-in-out;
  `}
`;

const ConnectorLine = styled.div`
  width: 2px;
  height: 30px;
  background: #393;
  margin: 0 auto;
  position: relative;
  animation: ${flowDown} 0.5s ease-out;
  
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
    animation: ${flowDownArrow} 0.5s ease-out;
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
  animation: ${flowDown} 0.7s ease-out;
  
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
    animation: ${flowDownArrow} 0.7s ease-out;
  }
`;

const ChildrenContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 90vw;
  animation: ${fadeIn} 0.5s ease-out;
`;

const AsyncOperationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px dashed ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.md};
  animation: ${fadeIn} 0.7s ease-out;
`;

const AsyncChildrenContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 90vw;
  margin-top: ${({ theme }) => theme.spacing.md};
  animation: ${fadeIn} 0.7s ease-out;
`;

const AsyncLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.background.glass};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  animation: ${fadeIn} 0.5s ease-out;
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
  animation: ${fadeIn} 0.8s ease-out;
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
  animation: ${fadeIn} 0.8s ease-out;
`;

const NoVisualizationContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.glass};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;
`;

const NoVisualizationMessage = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-style: italic;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
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

const TimeBar = styled.div<{ percentage: number; status: string }>`
  height: 20px;
  background: ${({ status }) => status === 'completed' ? 
    'linear-gradient(to right, #4CAF50, #8BC34A)' : 
    'linear-gradient(to right, #FFC107, #FFEB3B)'};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  width: ${({ percentage }) => `${percentage}%`};
  position: relative;
  overflow: hidden;
  animation: ${growWidth} 1s ease-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0.1)
    );
    animation: ${({ status }) => status === 'running' ? pulseHighlight : 'none'} 2s infinite;
  }
`;

const SyncButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.accent};
  color: white;
  border: none;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all 0.2s ease-in-out;
  box-shadow: ${({ theme }) => theme.effects.boxShadow.md};
  z-index: 10;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.effects.boxShadow.lg};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SyncIcon = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  `} 1s linear infinite;
`;

const SyncMessage = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background.glass};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;
`;

// Recursive component to render a tree node and its children
const TreeNode: React.FC<{ 
  node: RuntimeProcessNode;
  isAsyncCallback?: boolean;
  depth?: number;
}> = ({ node, isAsyncCallback = false, depth = 0 }) => {
  // Safe default node to prevent errors
  const safeNode = node || { 
    id: 'unknown', 
    name: 'Unknown', 
    type: 'function' as const,
    children: [],
    status: 'running' as const,
    startTime: Date.now()
  };
  
  // Function to determine if a node is a callback
  const isCallback = safeNode.name.includes('callback') || 
                    safeNode.name === 'setTimeout' || 
                    safeNode.name === 'fetchData' ||
                    safeNode.name.includes('fetch') || 
                    isAsyncCallback;
  
  // For callbacks, we force completed status if they have startTime
  const displayStatus = isCallback && safeNode.startTime ? 'completed' : safeNode.status;
  
  // Calculate timing information if available
  const timing = safeNode.startTime && safeNode.endTime 
    ? `${((safeNode.endTime - safeNode.startTime) / 1000).toFixed(2)}s` 
    : '';
  
  // Choose the appropriate node component based on type
  const NodeComponent = isCallback ? CallbackNode : FunctionNode;

  // Add animated fade-in effect for nodes
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Small delay to trigger animation after component mounts
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Separate async and regular children
  const regularChildren = safeNode.children.filter(
    child => !(child.name.includes('callback') || 
             child.name === 'setTimeout' || 
             child.name === 'fetchData' ||
             child.name.includes('fetch'))
  );
  
  const asyncChildren = safeNode.children.filter(
    child => child.name.includes('callback') || 
             child.name === 'setTimeout' || 
             child.name === 'fetchData' ||
             child.name.includes('fetch')
  );
  
  // Add extra debugging info to node label if needed
  const debugLabel = process.env.NODE_ENV === 'development' 
    ? `${safeNode.name} (${safeNode.id.substring(0, 8)}${safeNode.parentId ? ` ← ${safeNode.parentId.substring(0, 8)}` : ''})`
    : safeNode.name;
  
  return (
    <TreeNodeContainer style={{ opacity: visible ? 1 : 0 }}>
      <NodeComponent status={displayStatus}>
        {debugLabel}
        {timing && <TimingBadge>{timing}</TimingBadge>}
      </NodeComponent>
      
      {/* Regular children with a solid connector line */}
      {regularChildren.length > 0 && (
        <>
          <ConnectorLine />
          <ChildrenContainer>
            {regularChildren.map(child => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </ChildrenContainer>
        </>
      )}
      
      {/* Async children with a dashed connector line */}
      {asyncChildren.length > 0 && (
        <AsyncOperationsContainer>
          <AsyncLabel>Asynchronous Operations</AsyncLabel>
          <AsyncConnectorLine />
          <AsyncChildrenContainer>
            {asyncChildren.map(child => (
              <TreeNode key={child.id} node={child} isAsyncCallback={true} depth={depth + 1} />
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
  const { syncVisualization } = useContext(RuntimeContext);
  const [syncClicked, setSyncClicked] = useState(false);
  
  // Add debug console output for root structure
  React.useEffect(() => {
    if (root) {
      console.log('[VISUALIZER] Current root:', root);
      console.log('[VISUALIZER] Children count:', root.children.length);
      console.log('[VISUALIZER] Children details:', root.children);
    }
  }, [root]);
  
  const handleSync = () => {
    setSyncClicked(true);
    if (syncVisualization) {
      syncVisualization();
    }
    // Reset the clicked state after a delay
    setTimeout(() => setSyncClicked(false), 3000);
  };
  
  if (!root) {
    return (
      <Container>
        <Title>Runtime Process Visualization</Title>
        <NoVisualizationContainer>
          <NoVisualizationMessage>No runtime data available. Run code to see visualization.</NoVisualizationMessage>
        </NoVisualizationContainer>
      </Container>
    );
  }

  // Make it safer by ensuring children exist
  const safeRoot = {
    ...root,
    children: Array.isArray(root.children) ? root.children : []
  };

  // Use MermaidChart for a quick overview
  const mermaidChart = generateMermaidChart(safeRoot);
  
  // Check if we have any running nodes when we should be done
  const isExecutionCompleted = !Object.values(safeRoot).some(
    (node: any) => node && node.status === 'running'
  );

  return (
    <Container>
      <Title>Runtime Process Visualization</Title>
      
      {/* Add sync button */}
      <SyncButton onClick={handleSync}>
        <SyncIcon /> Sync with Console Output
      </SyncButton>
      
      {syncClicked && (
        <SyncMessage>
          Visualization synced with console output. If you don't see the expected tree structure, 
          check the console for function call patterns.
        </SyncMessage>
      )}
      
      <TreeContainer>
        <TreeNode node={safeRoot} />
        {safeRoot.children.length === 0 && (
          <ExecutionMessage>
            This function did not call any other functions during execution.
          </ExecutionMessage>
        )}
      </TreeContainer>
      
      {/* Add the timeline visualization for better insights */}
      <RuntimeTimeline root={safeRoot} />
      
      <RawDataContainer>
        <details>
          <RawDataSummary>Show Runtime Process Tree (Raw Data)</RawDataSummary>
          <RawDataContent>
            {JSON.stringify(safeRoot, null, 2)}
          </RawDataContent>
        </details>
      </RawDataContainer>

      <RawDataContainer>
        <details>
          <RawDataSummary>Show Mermaid Diagram</RawDataSummary>
          <MermaidDiagram chart={mermaidChart} />
        </details>
      </RawDataContainer>
    </Container>
  );
};

// Helper function to generate Mermaid chart
function generateMermaidChart(root: RuntimeProcessNode): string {
  let mermaidChart = 'graph TD\n';

  // Ensure root has valid children array
  const safeRoot = {
    ...root,
    children: Array.isArray(root.children) ? root.children : []
  };

  // Track added nodes and connections to avoid duplicates
  const addedNodes = new Set<string>();
  const addedConnections = new Set<string>();

  // Add all nodes first, using recursive approach
  const addNodes = (node: RuntimeProcessNode) => {
    // Skip invalid nodes
    if (!node || !node.id) {
      console.log('[DB1] Skipping invalid node:', node);
      return;
    }
    
    // Skip if already added
    if (addedNodes.has(node.id)) {
      return;
    }
    
    // Add this node
    console.log(`[DB1] Adding node to chart: ${node.id} (${node.name})`);
    // Add more debug info to node label in development
    const nodeLabel = process.env.NODE_ENV === 'development' 
      ? `${node.name} (${node.id.substring(0, 8)})` 
      : node.name;
      
    mermaidChart += `  ${node.id}["${nodeLabel}"]\n`;
    addedNodes.add(node.id);
    
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
  
  // Add all connections based on parentId
  const addConnections = (nodes: RuntimeProcessNode[]) => {
    nodes.forEach(node => {
      // Only add connection if node has a parentId
      if (node.parentId && addedNodes.has(node.parentId)) {
        const connectionId = `${node.parentId}-->${node.id}`;
        if (!addedConnections.has(connectionId)) {
          console.log(`[DB1] Adding connection: ${node.parentId} --> ${node.id}`);
          
          // Check if this is an async/callback connection
          const isAsync = node.name.includes('callback') || 
                       node.name === 'setTimeout' || 
                       node.name.includes('fetch');
                       
          // Use different arrow style for async operations
          if (isAsync) {
            mermaidChart += `  ${node.parentId} -.-> ${node.id}\n`;
          } else {
            mermaidChart += `  ${node.parentId} --> ${node.id}\n`;
          }
          
          addedConnections.add(connectionId);
        }
      }
      
      // Recursively add connections for children
      if (node.children?.length) {
        addConnections(node.children);
      }
    });
  };
  
  // Build the chart by first adding all nodes, then all connections
  addNodes(safeRoot);
  
  // Get all nodes as flat array for connection processing
  const getAllNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
    const result: RuntimeProcessNode[] = [node];
    if (node.children?.length) {
      node.children.forEach(child => {
        result.push(...getAllNodes(child));
      });
    }
    return result;
  };
  
  const allNodes = getAllNodes(safeRoot);
  addConnections(allNodes);
  
  // Handle single-node case specially for better visualization
  if (!safeRoot.children || safeRoot.children.length === 0) {
    console.log('[DB1] Single node detected, adding special note');
    mermaidChart += `  Note["Function executed successfully"]:::note\n`;
    mermaidChart += `  ${safeRoot.id} -.-> Note\n`;
    mermaidChart += `  classDef note fill:#f0f0ff,stroke:#9090ff,stroke-width:1px,color:#333,border-radius:8px\n`;
  }
  
  return mermaidChart;
} 