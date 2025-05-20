import React from 'react';
import styled from 'styled-components';
import { codeExamples } from '../data/codeExamples';

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.effects.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

interface CodeExamplesProps {
  onSelect: (code: string) => void;
}

export const CodeExamples: React.FC<CodeExamplesProps> = ({ onSelect }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = codeExamples[event.target.value as keyof typeof codeExamples];
    if (selectedCode) {
      onSelect(selectedCode);
    }
  };

  return (
    <Select onChange={handleChange} defaultValue="">
      <option value="" disabled>Select an example...</option>
      <option value="processVisualizationTest">Process Visualization Test</option>
      {/* Add other examples here */}
    </Select>
  );
}; 