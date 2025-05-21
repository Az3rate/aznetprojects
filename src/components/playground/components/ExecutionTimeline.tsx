import React from 'react';
import styled from 'styled-components';
import { useTheme } from 'styled-components';
import type { TimelineEntry } from '../types';

const TimelineContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: ${({ theme }) => theme.colors.background};
  border-top: 1px solid ${({ theme }) => theme.colors.accent};
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
`;

const TimelineTrack = styled.div`
  flex: 1;
  height: 4px;
  background: ${({ theme }) => theme.colors.secondary};
  position: relative;
  border-radius: ${({ theme }) => theme.effects.borderRadius};
  margin: 0 ${({ theme }) => theme.spacing.md};
`;

const TimelineMarker = styled.div<{ position: number; type: 'start' | 'end' }>`
  position: absolute;
  left: ${({ position }) => `${position}%`};
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme, type }) => 
    type === 'start' ? theme.colors.primary : theme.colors.accent};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translate(-50%, -50%) scale(1.5);
  }
`;

const Playhead = styled.div<{ position: number }>`
  position: absolute;
  left: ${({ position }) => `${position}%`};
  top: 0;
  bottom: 0;
  width: 2px;
  background: ${({ theme }) => theme.colors.primary};
  pointer-events: none;
`;

interface ExecutionTimelineProps {
  entries: TimelineEntry[];
  currentTime: number;
  onMarkerClick: (entry: TimelineEntry) => void;
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({
  entries,
  currentTime,
  onMarkerClick,
}) => {
  const theme = useTheme();
  const totalDuration = Math.max(...entries.map(e => e.timestamp));
  const currentPosition = (currentTime / totalDuration) * 100;

  return (
    <TimelineContainer>
      <TimelineTrack>
        {entries.map((entry, index) => (
          <TimelineMarker
            key={`${entry.type}-${entry.nodeId}-${index}`}
            position={(entry.timestamp / totalDuration) * 100}
            type={entry.type}
            onClick={() => onMarkerClick(entry)}
          />
        ))}
        <Playhead position={currentPosition} />
      </TimelineTrack>
    </TimelineContainer>
  );
}; 