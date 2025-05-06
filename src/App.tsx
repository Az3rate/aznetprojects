import React from 'react';
import { ThemeProvider } from './styles/ThemeProvider';
import { Terminal } from './components/Terminal/Terminal';
import { GlobalStyles } from './styles/globalStyles';
import { WelcomeModal } from './components/WelcomeModal';

export const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = React.useState(false);

  React.useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('aznet_seen_welcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      localStorage.setItem('aznet_seen_welcome', '1');
    }
  }, []);

  const handleStartTour = () => {
    setShowWelcome(false);
  };

  return (
    <ThemeProvider>
      <GlobalStyles />
      <WelcomeModal
        isOpen={showWelcome}
        onRequestClose={() => setShowWelcome(false)}
        onStartTour={handleStartTour}
      />
      <Terminal onOpenWelcome={() => setShowWelcome(true)} />
    </ThemeProvider>
  );
}; 