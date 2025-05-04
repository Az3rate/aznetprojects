import React from 'react';
import styled from 'styled-components';

const WelcomeContainer = styled.div`
  margin-bottom: 2rem;
`;

const AsciiArt = styled.pre`
  color: ${({ theme }) => theme.colors.prompt};
  margin: 0;
  white-space: pre;
  font-family: 'Fira Code', monospace;
  line-height: 1.2;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  margin: 1rem 0;
`;

const Subtitle = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0.5rem 0;
  
  .heart {
    color: ${({ theme }) => theme.colors.error};
  }
`;

const WelcomeText = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 1rem 0;
`;

const QuickMenu = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
`;

const ClickableItem = styled.span`
  color: ${({ theme }) => theme.colors.link};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.linkHover};
    text-decoration: underline;
  }
`;

const FirstTimeHint = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  
  ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  
  li {
    margin: 0.5rem 0;
  }
  
  .highlight {
    color: ${({ theme }) => theme.colors.link};
  }
`;

interface WelcomeMessageProps {
  onCommandClick: (command: string) => void;
  isFirstTime: boolean;
  projects: Array<{
    name: string;
    description: string;
  }>;
  onStartTour?: () => void;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ 
  onCommandClick, 
  isFirstTime,
  projects,
  onStartTour
}) => {
  const handleClick = (command: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onCommandClick(command);
  };

  return (
    <WelcomeContainer>
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
        <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '12px 0 20px 0' }}>
          <button
            onClick={onStartTour}
            style={{
              background: '#00ff99',
              color: '#181825',
              border: '2px solid #00ff99',
              borderRadius: 2,
              padding: '8px 22px',
              fontWeight: 700,
              fontFamily: 'Fira Code, monospace',
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 0 8px #00ff9955',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            Start Guided Tour
          </button>
        </div>
      )}
      <Subtitle>
        Created by <b>Hugo Villeneuve</b>
      </Subtitle>
      <WelcomeText>
        <b>This interactive page is designed for recruiters and technical reviewers to easily explore my work and coding skills.</b>
      </WelcomeText>
      <WelcomeText>
        <b>What is this?</b><br/>
        This is a modern, web-based terminal interface that lets you browse real project files, view code, and read about my featured projects—all in one place. No coding experience is required!
      </WelcomeText>
      <WelcomeText>
        <b>What can you do here?</b>
        <ul style={{ margin: '0.5rem 0 0.5rem 1.5rem' }}>
          <li><b>The panel on the left is a real file explorer.</b> What you see there is the actual working code and structure of this web application—just like a developer would see in their editor.</li>
          <li>Click on any file or folder in the sidebar to instantly view its contents and code.</li>
          <li>Click on a project name below to see a detailed overview, key features, and tech stack.</li>
          <li>Type or click commands (like <ClickableItem onClick={handleClick('help')}>help</ClickableItem>, <ClickableItem onClick={handleClick('ls')}>ls</ClickableItem>, <ClickableItem onClick={handleClick('cat App.tsx')}>cat</ClickableItem>) to interact with the terminal—just like a real developer would.</li>
          <li>Use the <b>Quick Menu</b> for one-click access to project lists, contact info, and more.</li>
        </ul>
      </WelcomeText>
      <WelcomeText data-tour="project-list">
        <b>Featured Projects:</b>
      </WelcomeText>
      {projects.length > 0 && (
        <div data-tour="project-list">
          {projects.map((project) => (
            <div key={project.name} style={{ marginBottom: 4 }}>
              <ClickableItem
                onClick={handleClick(`cat ${project.name.toLowerCase()}`)}
                {...(project.name === 'D4UT' ? { 'data-tour': 'project-d4ut' } : {})}
                {...(project.name === 'LootManager' ? { 'data-tour': 'project-lootmanager' } : {})}
                {...(project.name === 'RaidAlert' ? { 'data-tour': 'project-raidalert' } : {})}
              >
                {project.name}
              </ClickableItem>
              {' '}– {project.description}
            </div>
          ))}
        </div>
      )}
      <QuickMenu data-tour="quick-menu">
        <ClickableItem onClick={handleClick('help')}>Help</ClickableItem>
        <ClickableItem onClick={handleClick('about')}>About</ClickableItem>
        <ClickableItem onClick={handleClick('ls')}>List Files</ClickableItem>
        <ClickableItem onClick={handleClick('clear')}>Clear</ClickableItem>
      </QuickMenu>
      <WelcomeText>
        <b>Tip:</b> You can also type commands directly, just like a real terminal. Try <ClickableItem onClick={handleClick('help')}>help</ClickableItem> to see all available options.
      </WelcomeText>
      {isFirstTime && (
        <FirstTimeHint>
          <b>First time here?</b>
          <ul>
            <li>Click any <span className="highlight">purple</span> command or project name to run it instantly.</li>
            <li>Use <b>Tab</b> for autocomplete and <b>Arrow keys</b> for command history.</li>
            <li>Type <ClickableItem onClick={handleClick('about')}>about</ClickableItem> to learn more about this project.</li>
          </ul>
        </FirstTimeHint>
      )}
    </WelcomeContainer>
  );
}; 