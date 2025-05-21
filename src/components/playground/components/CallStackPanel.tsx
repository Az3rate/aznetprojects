import React from 'react';
import styled from 'styled-components';
import { useTheme } from 'styled-components';
import type { CallStackEntry } from '../types';

const Panel = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  background: ${({ theme }) => theme.colors.background};
  /* border-left: 1px solid ${({ theme }) => theme.colors.accent}; */
  padding: ${({ theme }) => theme.spacing.md};
  overflow-y: auto;
  transition: transform 0.3s ease;
  z-index: ${({ theme }) => theme.zIndex.dropdown};
`;

const Entry = styled.div<{ status: 'running' | 'completed' }>`
  padding: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.effects.borderRadius};
  background: ${({ theme, status }) => 
    status === 'running' 
      ? theme.colors.primary 
      : theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(-4px);
    box-shadow: ${({ theme }) => theme.effects.boxShadow};
  }
`;

const FunctionName = styled.div`
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Details = styled.div`
  font-size: 0.9em;
  opacity: 0.8;
`;

interface CallStackPanelProps {
  entries: CallStackEntry[];
  onEntryClick: (entry: CallStackEntry) => void;
}

export const CallStackPanel: React.FC<CallStackPanelProps> = ({ 
  entries, 
  onEntryClick 
}) => {
  const theme = useTheme();

  return (
    <Panel>
      {entries.map((entry) => (
        <Entry 
          key={entry.id} 
          status={entry.status}
          onClick={() => onEntryClick(entry)}
        >
          <FunctionName>{entry.functionName}</FunctionName>
          <Details>
            <div>Call ID: {entry.callId}</div>
            <div>Duration: {entry.endTime 
              ? `${entry.endTime - entry.startTime}ms` 
              : 'Running...'}</div>
          </Details>
        </Entry>
      ))}
    </Panel>
  );
}; 