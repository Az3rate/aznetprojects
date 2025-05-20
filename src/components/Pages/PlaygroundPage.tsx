import React from 'react';
import styled from 'styled-components';
import PlaygroundContainer from '../playground/components/PlaygroundContainer';
import { PlaygroundProvider } from '../playground/context/PlaygroundContext';
import { useTheme } from 'styled-components';
import type { PlaygroundState } from '../playground/types';

const PageContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const PlaygroundPage: React.FC = () => {
  const theme = useTheme();

  const handleStateChange = (state: PlaygroundState) => {
    //console.log('Playground state changed:', state);
  };

  return (
    <PlaygroundProvider>
      <PageContainer>
        <PlaygroundContainer
          mode="node"
          theme={theme}
          onStateChange={handleStateChange}
        />
      </PageContainer>
    </PlaygroundProvider>
  );
};

export default PlaygroundPage; 