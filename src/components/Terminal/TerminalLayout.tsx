import React from 'react';
import styled from 'styled-components';

// Weighted & Anchored Design System - Runtime Playground Style
const TerminalContainer = styled.div<{ $detailsOpen: boolean; $detailsWidth: number }>`
  display: grid;
  grid-template-columns: 264px 1fr ${({ $detailsOpen, $detailsWidth }) => $detailsOpen ? `${$detailsWidth}px` : '0px'};
  grid-template-rows: 1fr;
  grid-template-areas:
    "featured-sidebar main-content details-panel";
  gap: 24px;
  padding: 24px;
  padding-top: 88px; /* Account for floating navigation + optimal breathing room */
  height: 100vh;
  max-width: 100vw;
  overflow: hidden;
  background: #010409;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  transition: grid-template-columns 0.3s ease;
  box-sizing: border-box;
`;

// Base weighted container pattern
const WeightedContainer = styled.div`
  position: relative;
  background: #0a0c10;
  border: 4px solid #1c2128;
  box-shadow: 
    0 0 0 1px #21262d,
    0 8px 24px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
`;

const FeaturedSidebar = styled(WeightedContainer)`
  grid-area: featured-sidebar;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

const Sidebar = styled(WeightedContainer)`
  grid-area: main-content;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

const MainContent = styled(WeightedContainer)`
  grid-area: main-content;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

const DetailsPanel = styled(WeightedContainer)`
  grid-area: details-panel;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  transition: opacity 0.3s ease;
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
      <FeaturedSidebar>{sidebar}</FeaturedSidebar>
      <MainContent>{mainContent}</MainContent>
      {detailsPanel && isDetailsOpen && (
        <DetailsPanel>{detailsPanel}</DetailsPanel>
      )}
    </TerminalContainer>
  );
}; 