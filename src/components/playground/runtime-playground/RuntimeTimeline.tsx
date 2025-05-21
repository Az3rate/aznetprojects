import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { RuntimeProcessNode } from './types';

// Animation keyframes
const slideIn = keyframes`
  from { opacity: 0.9; }
  to { opacity: 1; }
`;

const growWidth = keyframes`
  from { width: 10%; }
  to { width: 100%; }
`;

const pulseHighlight = keyframes`
  0% { background-color: rgba(255, 255, 200, 0.2); }
  50% { background-color: rgba(255, 255, 200, 0.5); }
  100% { background-color: rgba(255, 255, 200, 0.2); }
`;

const TimelineContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  box-shadow: ${({ theme }) => theme.effects.boxShadow.sm};
  min-height: 200px;
`;

const TimelineTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TimelineTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const TableHead = styled.thead`
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  th {
    padding: ${({ theme }) => theme.spacing.sm};
    text-align: left;
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }
`;

const TableRow = styled.tr<{ isCallback?: boolean; highlighted?: boolean }>`
  &:nth-child(even) {
    background: ${({ theme }) => theme.colors.background.glass};
  }
  
  ${({ isCallback }) => isCallback && css`
    background: rgba(240, 240, 255, 0.3) !important;
    font-style: italic;
  `}
  
  ${({ highlighted }) => highlighted && css`
    background-color: rgba(255, 255, 200, 0.3);
  `}
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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
  transition: width 0.5s ease-out;
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
  }
`;

const TimelineBarContainer = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.background.glass};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  overflow: hidden;
`;

const TimingBadge = styled.span<{ status: string }>`
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.8em;
  color: white;
  background: ${({ status }) => status === 'completed' ? '#4CAF50' : '#FFC107'};
  margin-left: ${({ theme }) => theme.spacing.xs};
  white-space: nowrap;
`;

const TimelineLegend = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const LegendColor = styled.span<{ color: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  background: ${({ color }) => color};
  border-radius: 50%;
`;

// Helper to format time in ms to readable format
const formatTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

// Function to flatten the node tree into a list
const flattenNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
  if (!node) return [];
  const result: RuntimeProcessNode[] = [node];
  
  if (node.children?.length) {
    node.children.forEach(child => {
      result.push(...flattenNodes(child));
    });
  }
  
  return result;
};

// Calculate the timeline scale
const calculateTimeRange = (nodes: RuntimeProcessNode[]): { min: number; max: number } => {
  if (!nodes.length) return { min: 0, max: 1000 };
  
  let min = Infinity;
  let max = -Infinity;
  
  nodes.forEach(node => {
    if (node.startTime < min) min = node.startTime;
    if (node.endTime && node.endTime > max) max = node.endTime;
    if (!node.endTime && node.startTime > max) max = node.startTime + 1000; // Estimate for running functions
  });
  
  // Add some padding
  const padding = (max - min) * 0.1;
  return { min: min - padding, max: max + padding };
};

interface TimelineProps {
  root: RuntimeProcessNode | null;
}

export const RuntimeTimeline: React.FC<TimelineProps> = ({ root }) => {
  if (!root) {
    return null;
  }
  
  const nodes = flattenNodes(root);
  const timeRange = calculateTimeRange(nodes);
  
  // Sort nodes by start time
  nodes.sort((a, b) => a.startTime - b.startTime);
  
  const totalTimespan = timeRange.max - timeRange.min;
  
  return (
    <TimelineContainer>
      <TimelineTitle>Execution Timeline</TimelineTitle>
      
      <TimelineTable>
        <TableHead>
          <tr>
            <th>Function</th>
            <th>Started At</th>
            <th>Duration</th>
            <th>Timeline</th>
          </tr>
        </TableHead>
        <tbody>
          {nodes.map((node, index) => {
            const isCallback = node.name.includes('callback') || 
                               node.name === 'setTimeout' || 
                               node.name === 'fetchData' ||
                               node.name.includes('fetch');
                               
            const startOffset = node.startTime - timeRange.min;
            const startPercentage = (startOffset / totalTimespan) * 100;
            
            const duration = node.endTime 
              ? node.endTime - node.startTime 
              : totalTimespan * 0.1; // Placeholder for running functions
              
            const durationPercentage = Math.min((duration / totalTimespan) * 100, 100 - startPercentage);
            
            // Check if this is a long-running function
            const isLongRunning = duration > totalTimespan * 0.3;
            
            return (
              <TableRow 
                key={node.id} 
                isCallback={isCallback}
                highlighted={isLongRunning && node.status === 'running'}
              >
                <TableCell>
                  {node.name}
                  <TimingBadge status={node.status}>
                    {node.status}
                  </TimingBadge>
                </TableCell>
                <TableCell>
                  {new Date(node.startTime).toLocaleTimeString([], { hour12: false, 
                                                                 hour: '2-digit', 
                                                                 minute: '2-digit', 
                                                                 second: '2-digit',
                                                                 fractionalSecondDigits: 3 })}
                </TableCell>
                <TableCell>
                  {node.endTime 
                    ? formatTime(node.endTime - node.startTime)
                    : 'Running...'}
                </TableCell>
                <TableCell style={{ width: '40%' }}>
                  <TimelineBarContainer style={{ paddingLeft: `${startPercentage}%` }}>
                    <TimeBar 
                      percentage={durationPercentage} 
                      status={node.status}
                    />
                  </TimelineBarContainer>
                </TableCell>
              </TableRow>
            );
          })}
        </tbody>
      </TimelineTable>
      
      <TimelineLegend>
        <LegendItem>
          <LegendColor color="#4CAF50" />
          Completed
        </LegendItem>
        <LegendItem>
          <LegendColor color="#FFC107" />
          Running
        </LegendItem>
        <LegendItem>
          <LegendColor color="rgba(240, 240, 255, 0.3)" />
          Async Callback
        </LegendItem>
      </TimelineLegend>
    </TimelineContainer>
  );
}; 