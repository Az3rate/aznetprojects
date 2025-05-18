import React from 'react';
import styled from 'styled-components';

const TerminalContainer = styled.div<{ $detailsOpen: boolean; $detailsWidth: number }>`
  display: grid;
  grid-template-columns: 264px 1fr ${({ $detailsOpen, $detailsWidth }) => $detailsOpen ? `${$detailsWidth}px` : '0px'};
  gap: ${({ theme }) => theme.spacing.lg};
  height: 100%;
  min-height: 0;
  width: 100%;
  background: transparent;
  z-index: 1;
  transition: grid-template-columns 0.3s ease;
`;

const FeaturedSidebar = styled.div`
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  flex-shrink: 0;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 0;
`;

const Sidebar = styled.div`
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  flex-shrink: 0;
  border-radius: 0;
  box-sizing: border-box;
`;

const MainContent = styled.div`
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  min-width: 0;
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  gap: ${({ theme }) => theme.spacing.xs};
  border-radius: 0;
`;

const DetailsPanel = styled.div`
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: 0;
  transition: width 0.3s ease, opacity 0.3s ease;
  width: 100%;
`;

interface TerminalLayoutProps {
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
  detailsPanel?: React.ReactNode;
  isDetailsOpen?: boolean;
  detailsWidth?: number;
}

export const TerminalLayout: React.FC<TerminalLayoutProps> = ({
  sidebar,
  mainContent,
  detailsPanel,
  isDetailsOpen = false,
  detailsWidth = 400
}) => {
  return (
    <TerminalContainer $detailsOpen={!!detailsPanel && isDetailsOpen} $detailsWidth={detailsWidth}>
      <Sidebar>{sidebar}</Sidebar>
      <MainContent>{mainContent}</MainContent>
      {detailsPanel && isDetailsOpen ? (
        <DetailsPanel>{detailsPanel}</DetailsPanel>
      ) : null}
    </TerminalContainer>
  );
}; 