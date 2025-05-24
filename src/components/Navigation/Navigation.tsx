import React from 'react';
import styled from 'styled-components';
import { SoundSettings } from './SoundSettings';

const NavContainer = styled.nav<{ $isFloating?: boolean }>`
  width: 100%;
  height: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme, $isFloating }) => $isFloating ? '#010409' : theme.colors.background.secondary};
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme, $isFloating }) => $isFloating ? '#21262d' : theme.colors.border};
  box-shadow: ${({ theme }) => theme.effects.boxShadow.sm};
  position: ${({ $isFloating }) => $isFloating ? 'fixed' : 'static'};
  top: ${({ $isFloating }) => $isFloating ? '0' : 'auto'};
  left: ${({ $isFloating }) => $isFloating ? '0' : 'auto'};
  z-index: ${({ theme, $isFloating }) => $isFloating ? theme.zIndex.modal + 1 : 'auto'};
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

type Page = 'terminal' | 'featured' | 'runtime-studio';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFloating?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange, volume, onVolumeChange, isMuted, onToggleMute, isFloating }) => {
  return (
    <NavContainer $isFloating={isFloating}>
      <MenuList>
        <MenuItem $active={currentPage === 'terminal'}>
          <MenuLink onClick={() => onPageChange('terminal')}>Terminal</MenuLink>
        </MenuItem>
        <MenuItem $active={currentPage === 'featured'}>
          <MenuLink onClick={() => onPageChange('featured')}>Featured</MenuLink>
        </MenuItem>
        <MenuItem $active={currentPage === 'runtime-studio'}>
          <MenuLink onClick={() => onPageChange('runtime-studio')}>JavaScript Runtime Studio</MenuLink>
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