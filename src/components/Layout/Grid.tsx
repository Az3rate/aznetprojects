import React from 'react';
import styled from 'styled-components';
import type { Theme } from '../../styles/theme';

type SpacingKey = keyof Theme['spacing'];

interface GridProps {
  columns?: number;
  gap?: SpacingKey;
  padding?: SpacingKey;
  children: React.ReactNode;
  background?: boolean;
}

const GridContainer = styled.div<{ 
  $columns: number; 
  $gap: SpacingKey; 
  $padding: SpacingKey;
  $background: boolean;
}>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, 1fr);
  gap: ${({ theme, $gap }) => theme.spacing[$gap]};
  padding: ${({ theme, $padding }) => theme.spacing[$padding]};
  width: 100%;
  height: 100%;
  background: ${({ theme, $background }) => 
    $background ? theme.colors.background.glass : 'transparent'};
  backdrop-filter: ${({ theme, $background }) => 
    $background ? `blur(${theme.effects.blur.md})` : 'none'};
`;

export const Grid: React.FC<GridProps> = ({
  columns = 1,
  gap = 'md',
  padding = 'md',
  background = false,
  children
}) => {
  return (
    <GridContainer $columns={columns} $gap={gap} $padding={padding} $background={background}>
      {children}
    </GridContainer>
  );
};

// Responsive grid breakpoints
export const GridBreakpoints = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 6
} as const;

// Responsive grid component
interface ResponsiveGridProps extends Omit<GridProps, 'columns'> {
  breakpoints?: typeof GridBreakpoints;
}

const ResponsiveGridContainer = styled(GridContainer)`
  @media (max-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
  }
  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1025px) and (max-width: 1440px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: 1441px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  gap = 'md',
  padding = 'md',
  background = false,
  children
}) => {
  return (
    <ResponsiveGridContainer $columns={4} $gap={gap} $padding={padding} $background={background}>
      {children}
    </ResponsiveGridContainer>
  );
}; 