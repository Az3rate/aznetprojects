import React from 'react';
import styled from 'styled-components';

const AsciiArt = styled.pre`
  color: #00FFB2;
  margin: 0 0 1.5rem;
  white-space: pre;
  font-family: 'Fira Code', monospace;
  line-height: 1.2;
  font-size: 0.85rem;
`;

const Title = styled.h1`
  color: #FFFFFF;
  font-size: 1.8rem;
  margin: 1.5rem 0;
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.div`
  color: rgba(255, 255, 255, 0.7);
  margin: 0.75rem 0 2rem;
  font-size: 1rem;
`;

const WelcomeText = styled.div`
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.5rem;
  line-height: 1.6;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.div`
  color: #FFFFFF;
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #171A23; // Changed from rgba(0, 0, 0, 0.9) to solid
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  overflow-y: auto;
  padding: 2rem;
`;

const ModalContent = styled.div`
  position: relative;
  background: #171A23;
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  max-width: 1200px;
  width: 95vw;
  margin: auto;
  padding: 4rem 4rem 5rem;
  font-family: 'Fira Code', monospace;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const CloseButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.9rem;
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  transition: all 0.2s ease;
  font-family: 'Fira Code', monospace;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: #FFFFFF;
  }
`;

const TourButton = styled.button`
  background: #00FFB2;
  color: #171A23;
  border: none;
  border-radius: 6px;
  padding: 12px 28px;
  font-weight: 600;
  font-family: 'Fira Code', monospace;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #00E6A1;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const List = styled.ul`
  margin: 1rem 0 1rem 0;
  padding: 0 0 0 1.25rem;
  
  li {
    margin-bottom: 0.75rem;
    line-height: 1.5;
  }
  
  b {
    color: #00FFB2;
    font-weight: 600;
  }
`;

interface WelcomeModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onStartTour?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onRequestClose, onStartTour }) => {
  // Close on ESC key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onRequestClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onRequestClose]);

  // Prevent scroll when modal is open
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Click outside to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onRequestClose();
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <CloseButton onClick={onRequestClose} aria-label="Close Welcome Modal">Close</CloseButton>
        <AsciiArt>
          {`
.o.                  ooooo      ooo               .   
.888.                 ︻888b.     ︻8'             .o8   
.8"888.       oooooooo  8 ︻88b.    8   .ooooo.  .o888oo 
.8' ︻888.     d'""7d8P   8   ︻88b.  8  d88' ︻88b   888   
.88ooo8888.      .d8P'    8     ︻88b.8  888ooo888   888   
.8'     ︻888.   .d8P'  .P  8       ︻888  888    .o   888 . 
o88o     o8888o d8888888P  o8o        ︻8  ︻Y8bod8P'   "888"       
          `}
        </AsciiArt>
        <Title>Welcome to the AzNet Terminal Portfolio</Title>
        {onStartTour && (
          <TourButton onClick={onStartTour}>Start Guided Tour</TourButton>
        )}
        <Subtitle>Created by <b>Hugo Villeneuve</b></Subtitle>
        
        <Section>
          <SectionTitle>My Journey</SectionTitle>
          <WelcomeText>
            After years in corporate development, I made a deliberate choice to step back and invest in my growth as a developer. Using my savings, I dedicated myself to mastering new technologies and building practical solutions that solve real problems. This journey led me to create several successful web applications and bots that generate subscription revenue while allowing me to explore cutting-edge technologies.
          </WelcomeText>
        </Section>
        
        <Section>
          <SectionTitle>The Challenge</SectionTitle>
          <WelcomeText>
            Despite building and maintaining profitable applications, I noticed a disconnect between my entrepreneurial achievements and how they were perceived in traditional recruitment processes. While I had created real, working products that users paid for, these accomplishments often didn't translate effectively in interviews. This realization sparked the creation of this portfolio.
          </WelcomeText>
        </Section>
        
        <Section>
          <SectionTitle>Why This Portfolio?</SectionTitle>
          <WelcomeText>
            This isn't just another static portfolio. It's a living demonstration of my technical capabilities, built as a modern terminal interface that lets you explore my actual codebase, architecture decisions, and project implementations. Every file you see is real, every command works, and every project shown is a testament to my commitment to quality and innovation.
          </WelcomeText>
        </Section>
        
        <Section>
          <SectionTitle>What You'll Find Here</SectionTitle>
          <WelcomeText>
            <List>
              <li><b>Real Code:</b> Browse through actual project files and see how I structure and implement features.</li>
              <li><b>Architecture:</b> Explore the technical decisions behind each project, from frontend frameworks to backend services.</li>
              <li><b>Problem Solving:</b> Understand how I approach challenges and implement solutions that scale.</li>
              <li><b>Technical Depth:</b> See my expertise in action through working examples and detailed documentation.</li>
            </List>
          </WelcomeText>
        </Section>
      </ModalContent>
    </ModalOverlay>
  );
};
