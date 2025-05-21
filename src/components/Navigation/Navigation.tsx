import React from 'react';
import styled from 'styled-components';
import { SoundSettings } from './SoundSettings';

const NavContainer = styled.nav`
  width: 100%;
  height: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background.secondary};
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.effects.boxShadow.sm};
`;

const MenuList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const MenuItem = styled.li<{ $active?: boolean }>`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: ${({ $active }) => $active ? '100%' : '0'};
    height: 2px;
    background: ${({ theme }) => theme.colors.accent};
    transition: width ${({ theme }) => theme.effects.transition.normal};
  }

  &:hover::after {
    width: 100%;
  }
`;

const MenuLink = styled.a`
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  cursor: pointer;
  transition: color ${({ theme }) => theme.effects.transition.normal};

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

type Page = 'terminal' | 'api' | 'featured' | 'playground' | 'runtime-playground';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange, volume, onVolumeChange, isMuted, onToggleMute }) => {
  return (
    <NavContainer>
      <MenuList>
        <MenuItem $active={currentPage === 'terminal'}>
          <MenuLink onClick={() => onPageChange('terminal')}>Terminal</MenuLink>
        </MenuItem>
        <MenuItem $active={currentPage === 'api'}>
          <MenuLink onClick={() => onPageChange('api')}>API</MenuLink>
        </MenuItem>
        <MenuItem $active={currentPage === 'featured'}>
          <MenuLink onClick={() => onPageChange('featured')}>Featured</MenuLink>
        </MenuItem>
        <MenuItem $active={currentPage === 'playground'}>
          <MenuLink onClick={() => onPageChange('playground')}>Playground</MenuLink>
        </MenuItem>
        <MenuItem $active={currentPage === 'runtime-playground'}>
          <MenuLink onClick={() => onPageChange('runtime-playground')}>Runtime Playground</MenuLink>
        </MenuItem>
      </MenuList>
      <Spacer />
      <SoundSettings
        volume={volume}
        onVolumeChange={onVolumeChange}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
      />
    </NavContainer>
  );
}; 