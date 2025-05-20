import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useProcessStore } from '../../../store/processStore';
import { useTheme } from 'styled-components';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.effects.borderRadius};
  box-shadow: ${({ theme }) => theme.effects.boxShadow};
`;

const ProcessList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ProcessItem = styled.li<{ $status: 'running' | 'stopped' | 'error' }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  margin: ${({ theme }) => theme.spacing.xs} 0;
  border-radius: ${({ theme }) => theme.effects.borderRadius};
  background: ${({ theme, $status }) => {
    switch ($status) {
      case 'running':
        return theme.colors.primary;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.background;
    }
  }};
  color: ${({ theme, $status }) => 
    $status === 'running' ? theme.colors.background : theme.colors.text};
  transition: all ${({ theme }) => theme.effects.transition};
`;

const StatusIndicator = styled.div<{ $status: 'running' | 'stopped' | 'error' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, $status }) => {
    switch ($status) {
      case 'running':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  }};
  transition: all ${({ theme }) => theme.effects.transition};
`;

const ProcessName = styled.span`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ProcessDuration = styled.span`
  margin-left: auto;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  opacity: 0.8;
`;

export const ProcessTreeInspector: React.FC = () => {
  const theme = useTheme();
  const { processes, activeProcessIds } = useProcessStore();
  const [localProcesses, setLocalProcesses] = useState(processes);

  // Update local state when processes change
  useEffect(() => {
    setLocalProcesses(processes);
  }, [processes]);

  // Sort processes by start time
  const sortedProcesses = [...localProcesses].sort((a, b) => {
    const aTime = a.startTime || 0;
    const bTime = b.startTime || 0;
    return aTime - bTime;
  });

  return (
    <Container>
      <ProcessList>
        {sortedProcesses.map((process) => (
          <ProcessItem key={process.id} $status={process.status}>
            <StatusIndicator $status={process.status} />
            <ProcessName>{process.name}</ProcessName>
            {process.duration && (
              <ProcessDuration>
                {process.duration.toFixed(2)}ms
              </ProcessDuration>
            )}
          </ProcessItem>
        ))}
      </ProcessList>
    </Container>
  );
}; 