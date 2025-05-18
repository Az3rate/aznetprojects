import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { glassEffect } from '../../../styles/mixins/glass';

const VisualizerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  ${glassEffect}
  border-radius: ${({ theme }) => theme.effects.borderRadius};
  box-shadow: ${({ theme }) => theme.effects.boxShadow};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NodeRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const ProcessNode = styled(motion.div)<{ type: string; async?: boolean; $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  min-height: 100px;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme, type, $active }) =>
    $active
      ? theme.colors.accent
      : type === 'async function'
      ? theme.colors.accent
      : type === 'timer'
      ? theme.colors.secondary
      : theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 50%;
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  box-shadow: ${({ theme, $active }) =>
    $active
      ? `${theme.colors.accent} 0px 0px 32px 8px, ${theme.colors.primary} 0px 0px 8px 2px`
      : theme.effects.boxShadow};
  ${glassEffect}
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 4px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.primary : theme.colors.background.glassLight};
`;

const NodeLabel = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const NodeType = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Placeholder = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  opacity: 0.7;
  text-align: center;
`;

interface ParsedProcess {
  id: string;
  name: string;
  type: string;
  async?: boolean;
}

interface ProcessVisualizerProps {
  parsedProcesses: ParsedProcess[];
  activeProcessIds?: string[];
}

const ProcessVisualizer: React.FC<ProcessVisualizerProps> = ({ parsedProcesses, activeProcessIds = [] }) => {
  if (!parsedProcesses.length) {
    return (
      <VisualizerContainer>
        <Placeholder>No processes detected. Run code with functions, async, or timers to visualize.</Placeholder>
      </VisualizerContainer>
    );
  }
  return (
    <VisualizerContainer>
      <NodeRow>
        {parsedProcesses.map((proc, i) => {
          const isActive = activeProcessIds.includes(proc.id);
          return (
            <ProcessNode
              key={proc.id}
              type={proc.type}
              async={proc.async}
              $active={isActive}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: isActive ? 1.3 : 1,
                boxShadow: undefined,
                filter: isActive ? 'brightness(1.3)' : 'none',
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              whileHover={{ scale: 1.1 }}
              title={proc.type}
            >
              <NodeLabel>{proc.name}</NodeLabel>
              <NodeType>{proc.type}</NodeType>
            </ProcessNode>
          );
        })}
      </NodeRow>
    </VisualizerContainer>
  );
};

export default ProcessVisualizer; 