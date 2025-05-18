import React from 'react';
import styled from 'styled-components';

const ApiContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  height: 100%;
  overflow-y: auto;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const ApiPage: React.FC = () => {
  return (
    <ApiContainer>
      <Title>API Documentation</Title>
      <p>API documentation coming soon...</p>
    </ApiContainer>
  );
}; 