import React from 'react';
import type { RuntimeProcessNode } from './types';
import styled from 'styled-components';

const TimelineContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
`;

const TimelineTitle = styled.h3`
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
    background-color: #2196F3;
    border-radius: 50%;
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

const Timeline = styled.div`
  position: relative;
  height: 80px;
  margin: ${({ theme }) => theme.spacing.md} 0;
  background: ${({ theme }) => theme.colors.background.glass};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
`;

const TimeLine = styled.div`
  position: absolute;
  height: 3px;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: ${({ theme }) => theme.colors.border};
`;

const TimePoint = styled.div<{left: string}>`
  position: absolute;
  left: ${props => props.left};
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #4CAF50;
  border-radius: 50%;
  z-index: 1;
`;

const TimeLabel = styled.div<{left: string, position: 'top' | 'bottom'}>`
  position: absolute;
  left: ${props => props.left};
  ${props => props.position === 'top' ? 'top: 10px;' : 'bottom: 10px;'}
  transform: translateX(-50%);
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
`;

const EventContainer = styled.div<{left: string}>`
  position: absolute;
  left: ${props => props.left};
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: translateX(-50%);
`;

const EventPoint = styled.div<{type: 'start' | 'end'}>`
  width: 16px;
  height: 16px;
  background: ${props => props.type === 'start' ? '#4CAF50' : '#F44336'};
  border-radius: 50%;
  margin-bottom: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const EventLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ExecutionStats = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.glass};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  display: flex;
  justify-content: space-around;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

interface RuntimeTimelineProps {
  node: RuntimeProcessNode;
}

export const RuntimeTimeline: React.FC<RuntimeTimelineProps> = ({ node }) => {
  // Calculate execution time in ms
  const executionTime = node.endTime && node.startTime 
    ? node.endTime - node.startTime 
    : 0;
  
  // For a single event, we'll place start at 20% and end at 80%
  const startPosition = "20%";
  const endPosition = "80%";
  
  return (
    <TimelineContainer>
      <TimelineTitle>Execution Timeline</TimelineTitle>
      <Timeline>
        <TimeLine />
        <EventContainer left={startPosition}>
          <EventPoint type="start" />
          <EventLabel>Start</EventLabel>
        </EventContainer>
        <EventContainer left={endPosition}>
          <EventPoint type="end" />
          <EventLabel>End</EventLabel>
        </EventContainer>
        <TimeLabel left={startPosition} position="bottom">
          {node.startTime ? new Date(node.startTime).toLocaleTimeString() : "--:--:--"}
        </TimeLabel>
        <TimeLabel left={endPosition} position="bottom">
          {node.endTime ? new Date(node.endTime).toLocaleTimeString() : "--:--:--"}
        </TimeLabel>
      </Timeline>
      
      <ExecutionStats>
        <StatItem>
          <StatValue>{node.name}()</StatValue>
          <StatLabel>Function Name</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{executionTime} ms</StatValue>
          <StatLabel>Execution Time</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{node.status}</StatValue>
          <StatLabel>Status</StatLabel>
        </StatItem>
      </ExecutionStats>
    </TimelineContainer>
  );
}; 