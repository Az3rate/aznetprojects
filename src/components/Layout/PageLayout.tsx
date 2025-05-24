import React from 'react';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: ${({ theme }) => theme.colors.background.primary};
  height: 100vh;
  overflow: hidden;
`;

const Header = styled.header`
  height: auto;
  min-height: 48px;
  background: #010409;
  border-bottom: 1px solid #21262d;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  padding: 8px 16px;
`;

const Main = styled.main<{ $noPadding?: boolean }>`
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme, $noPadding }) => $noPadding ? '0' : theme.spacing.lg};
  padding: ${({ theme, $noPadding }) => $noPadding ? '0' : theme.spacing.lg};
  background: transparent;
  overflow: ${({ $noPadding }) => $noPadding ? 'hidden' : 'auto'};
`;

const Footer = styled.footer`
  height: auto;
  min-height: 32px;
  background: #010409;
  border-top: 1px solid #21262d;
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  padding: 4px 16px;
`;

interface PageLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  noPadding?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ header, children, footer, noPadding }) => {
  return (
    <LayoutContainer>
      <Header>{header}</Header>
      <Main $noPadding={noPadding}>{children}</Main>
      <Footer>{footer}</Footer>
    </LayoutContainer>
  );
}; 