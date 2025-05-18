import React, { useState, useRef, useEffect } from 'react';
import { ThemeProvider } from './styles/ThemeProvider';
import { GlobalStyles } from './styles/globalStyles';
import { SwirlBackground } from './components/Terminal/SwirlBackground';
import { Terminal } from './components/Terminal/Terminal';
import { WelcomeModal, WelcomeModalRef } from './components/WelcomeModal';
import { DirectoryProvider } from './context/DirectoryContext';
import { UserPreferencesProvider, useUserPreferences } from './context/UserPreferencesContext';
import type { TerminalRef } from './components/Terminal/Terminal';
import { Navigation } from './components/Navigation/Navigation';
import { ApiPage } from './components/Pages/ApiPage';
import { FeaturedProjectsPage } from './components/Pages/FeaturedProjectsPage';
import { Footer } from './components/Navigation/Footer';
import { PageLayout } from './components/Layout/PageLayout';

type Page = 'terminal' | 'api' | 'featured';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('terminal');
  const terminalRef = useRef<TerminalRef>(null);
  const welcomeModalRef = useRef<WelcomeModalRef>(null);
  const { preferences, setUserType, markTourCompleted } = useUserPreferences();

  // Sound state lifted here
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('terminal_volume');
    return savedVolume ? parseFloat(savedVolume) : 0.15;
  });
  const [isMuted, setIsMuted] = useState(() => {
    const savedMute = localStorage.getItem('terminal_background_muted');
    return savedMute ? JSON.parse(savedMute) : false;
  });
  useEffect(() => {
    localStorage.setItem('terminal_volume', volume.toString());
  }, [volume]);
  useEffect(() => {
    localStorage.setItem('terminal_background_muted', JSON.stringify(isMuted));
  }, [isMuted]);
  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (v === 0) setIsMuted(true);
    else setIsMuted(false);
  };
  const handleToggleMute = () => {
    setIsMuted((m: boolean) => !m);
  };

  const handleStartTour = (type: 'recruiter' | 'technical') => {
    setUserType(type);
    setTimeout(() => {
      terminalRef.current?.startTour(type);
    }, 100);
  };

  const handleOpenWelcome = () => {
    welcomeModalRef.current?.resetStep();
  };

  const handleTourComplete = () => {
    markTourCompleted();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'terminal':
  return (
          <Terminal
            ref={terminalRef}
            onOpenWelcome={handleOpenWelcome}
            onTourComplete={handleTourComplete}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
          />
        );
      case 'api':
        return <ApiPage />;
      case 'featured':
        return <FeaturedProjectsPage />;
      default:
        return null;
    }
  };

  return (
    <PageLayout
      header={<Navigation currentPage={currentPage} onPageChange={setCurrentPage} volume={volume} onVolumeChange={handleVolumeChange} isMuted={isMuted} onToggleMute={handleToggleMute} />}
      footer={<Footer />}
    >
      {renderPage()}
          <WelcomeModal
            ref={welcomeModalRef}
        open={!preferences.hasVisited}
        onClose={() => setUserType('technical')}
            onStartTour={handleStartTour}
          />
    </PageLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <SwirlBackground />
      <UserPreferencesProvider>
        <DirectoryProvider>
          <AppContent />
      </DirectoryProvider>
      </UserPreferencesProvider>
    </ThemeProvider>
  );
}; 