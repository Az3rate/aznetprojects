import React from 'react';
import { ThemeProvider } from './styles/ThemeProvider';
import { Terminal } from './components/Terminal/Terminal';
import { GlobalStyles } from './styles/globalStyles';
import { WelcomeModal } from './components/WelcomeModal';
import { DirectoryProvider } from './context/DirectoryContext';

export const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = React.useState(true);

  const handleStartTour = () => {
    setShowWelcome(false);
  };

  return (
    <ThemeProvider>
      <GlobalStyles />
      <DirectoryProvider>
        <WelcomeModal
          isOpen={showWelcome}
          onRequestClose={() => setShowWelcome(false)}
          onStartTour={handleStartTour}
        />
        <Terminal onOpenWelcome={() => setShowWelcome(true)} />
      </DirectoryProvider>
    </ThemeProvider>
  );
}; 