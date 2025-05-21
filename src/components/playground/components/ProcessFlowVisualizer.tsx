import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useTheme } from 'styled-components';
import { CallStackPanel } from './CallStackPanel';
import { ExecutionTimeline } from './ExecutionTimeline';
import type { ProcessFlowState, CallStackEntry, TimelineEntry, ProcessNodeState } from '../types';
import type { ProcessTreeNode } from '../utils/parseProcessesWithAcorn';
import { FaCode, FaStackOverflow } from 'react-icons/fa';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const GraphContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const Node = styled.div<{
  isActive: boolean;
  isCompleted: boolean;
  callStackDepth: number;
  isCallNode: boolean;
  isStackActive: boolean;
}>`
  position: absolute;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.effects.borderRadius};
  background: ${({ theme, isActive, isCallNode, isStackActive }) =>
    isActive
      ? theme.colors.primary
      : isCallNode && isStackActive
        ? theme.colors.accent
        : isCallNode
          ? theme.colors.background
          : theme.colors.secondary};
  border: ${({ theme, isCallNode, isStackActive }) =>
    isCallNode
      ? `2px dashed ${isStackActive ? theme.colors.primary : theme.colors.accent}`
      : `2px solid ${theme.colors.primary}`};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;
  transform: translateY(${({ callStackDepth }) => callStackDepth * 20}px);
  opacity: ${({ isCompleted }) => (isCompleted ? 0.7 : 1)};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  box-shadow: ${({ theme, isStackActive }) =>
    isStackActive ? theme.effects.boxShadow : 'none'};

  &:hover {
    box-shadow: ${({ theme }) => theme.effects.boxShadow};
    transform: translateY(${({ callStackDepth }) => callStackDepth * 20}px) scale(1.05);
  }
`;

interface ProcessFlowVisualizerProps {
  // New props
  state?: ProcessFlowState;
  onNodeClick?: (nodeId: string) => void;
  // Legacy props
  processTree?: ProcessTreeNode[];
  activeProcessIds?: string[];
}

const NODE_VERTICAL_SPACING = 80;
const NODE_HORIZONTAL_OFFSET = 40;

const ProcessFlowVisualizer: React.FC<ProcessFlowVisualizerProps> = ({
  state,
  onNodeClick,
  processTree,
  activeProcessIds = [],
}) => {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(0);

  // Convert legacy props to new state format if needed
  const processState = useMemo(() => {
    if (state) return state;

    // Convert legacy format to new format
    const nodeStates: Record<string, ProcessNodeState> = {};
    const callStack: CallStackEntry[] = [];
    const timeline: TimelineEntry[] = [];
    const activePath: string[] = [];

    if (processTree) {
      processTree.forEach(node => {
        nodeStates[node.id] = {
          isActive: activeProcessIds.includes(node.id),
          isCompleted: false,
          callStackDepth: 0,
          relatedCalls: [],
        };
      });
    }

    return {
      callStack,
      timeline,
      activePath,
      nodeStates,
    };
  }, [state, processTree, activeProcessIds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prev => prev + 100);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const handleCallStackEntryClick = (entry: CallStackEntry) => {
    onNodeClick?.(entry.id);
  };

  const handleTimelineMarkerClick = (entry: TimelineEntry) => {
    setCurrentTime(entry.timestamp);
    onNodeClick?.(entry.nodeId);
  };

  // Determine the current call stack (active path)
  const currentCallStackIds = processState.callStack
    .filter(e => e.status === 'running')
    .map(e => e.id);

  return (
    <Container>
      <GraphContainer>
        {Object.entries(processState.nodeStates).map(([nodeId, nodeState], idx) => {
          const isCallNode = nodeId.startsWith('call-');
          const isStackActive = isCallNode && currentCallStackIds.includes(nodeId);
          return (
            <Node
              key={nodeId}
              isActive={nodeState.isActive}
              isCompleted={nodeState.isCompleted}
              callStackDepth={nodeState.callStackDepth}
              isCallNode={isCallNode}
              isStackActive={isStackActive}
              style={{
                top: NODE_VERTICAL_SPACING * idx + NODE_HORIZONTAL_OFFSET,
                left: NODE_HORIZONTAL_OFFSET + nodeState.callStackDepth * 60,
              }}
              onClick={() => onNodeClick?.(nodeId)}
            >
              {isCallNode ? <FaStackOverflow size={18} /> : <FaCode size={18} />}
              <span>{nodeId}</span>
            </Node>
          );
        })}
      </GraphContainer>
      
      <CallStackPanel 
        entries={processState.callStack}
        onEntryClick={handleCallStackEntryClick}
      />
      
      <ExecutionTimeline
        entries={processState.timeline}
        currentTime={currentTime}
        onMarkerClick={handleTimelineMarkerClick}
      />
    </Container>
  );
};

export default ProcessFlowVisualizer; 