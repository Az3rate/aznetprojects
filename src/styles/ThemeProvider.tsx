import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from './theme';
import type { Theme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StyledThemeProvider theme={theme}>
      {children}
    </StyledThemeProvider>
  );
}; 