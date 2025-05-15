import React, { useState, useRef } from 'react';
import { ThemeProvider } from './styles/ThemeProvider';
import { GlobalStyles } from './styles/globalStyles';
import styled from 'styled-components';
import { Terminal } from './components/Terminal/Terminal';
import { WelcomeModal, WelcomeModalRef } from './components/WelcomeModal';
import { DirectoryProvider } from './context/DirectoryContext';
import type { TerminalRef } from './components/Terminal/Terminal';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const App: React.FC = () => {
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const terminalRef = useRef<TerminalRef>(null);
  const welcomeModalRef = useRef<WelcomeModalRef>(null);

  const handleStartTour = (type: 'recruiter' | 'technical') => {
    setWelcomeOpen(false);
    setTimeout(() => {
      terminalRef.current?.startTour(type);
    }, 100);
  };

  const handleOpenWelcome = () => {
    welcomeModalRef.current?.resetStep();
    setWelcomeOpen(true);
  };

  return (
    <ThemeProvider>
      <GlobalStyles />
      <DirectoryProvider>
        <AppContainer>
          <Terminal
            ref={terminalRef}
            onOpenWelcome={handleOpenWelcome}
          />
          <WelcomeModal
            ref={welcomeModalRef}
            open={welcomeOpen}
            onClose={() => setWelcomeOpen(false)}
            onStartTour={handleStartTour}
          />
        </AppContainer>
      </DirectoryProvider>
    </ThemeProvider>
  );
}; 