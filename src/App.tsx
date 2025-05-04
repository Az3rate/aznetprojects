import React from 'react';
import { ThemeProvider } from './styles/ThemeProvider';
import { Terminal } from './components/Terminal/Terminal';
import { GlobalStyles } from './styles/globalStyles';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <Terminal />
    </ThemeProvider>
  );
}; 