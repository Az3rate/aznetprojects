import React from 'react';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: grid;
  grid-template-rows: 3vh 94vh 3vh; /* # Reason: Minimal header/footer (3vh) and main (94vh) */
  background: ${({ theme }) => theme.colors.background.primary};
  overflow: hidden;
`;

const Header = styled.header`
  height: 3vh;
  /* No background, no border for super minimal look */
  z-index: ${({ theme }) => theme.zIndex.modal};
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  border-radius: 0;
  display: flex;
  align-items: center;
`;

const Main = styled.main`
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background: transparent;
  overflow: auto;
`;

const Footer = styled.footer`
  height: 3vh;
  /* No background, no border for super minimal look */
  z-index: ${({ theme }) => theme.zIndex.modal};
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  border-radius: 0;
  display: flex;
  align-items: center;
`;

interface PageLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ header, children, footer }) => {
  return (
    <LayoutContainer>
      <Header>{header}</Header>
      <Main>{children}</Main>
      <Footer>{footer}</Footer>
    </LayoutContainer>
  );
}; 