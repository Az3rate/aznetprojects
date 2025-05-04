import React from 'react';
import styled from 'styled-components';

const WelcomeContainer = styled.div`
  margin-bottom: 2rem;
`;

const AsciiArt = styled.pre`
  color: ${({ theme }) => theme.colors.prompt};
  font-family: 'Fira Code', monospace;
  white-space: pre;
  margin: 1rem 0;
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
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ 
  onCommandClick, 
  isFirstTime,
  projects 
}) => {
  const handleClick = (command: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onCommandClick(command);
  };

  return (
    <WelcomeContainer>
      <AsciiArt>
        {`
    █████╗ ███████╗███╗   ██╗███████╗████████╗
   ██╔══██╗╚══███╔╝████╗  ██║██╔════╝╚══██╔══╝
   ███████║  ███╔╝ ██╔██╗ ██║█████╗     ██║   
   ██╔══██║ ███╔╝  ██║╚██╗██║██╔══╝     ██║   
   ██║  ██║███████╗██║ ╚████║███████╗   ██║   
   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚══════╝   ╚═╝   
`}
      </AsciiArt>
      
      <Title>Welcome to AZNET Terminal Interface</Title>
      <Subtitle>
        Created with <span className="heart">♥</span> by <b>Hugo Villeneuve</b>
      </Subtitle>
      
      <WelcomeText>
        Type <ClickableItem onClick={handleClick('help')}>help</ClickableItem> or click a command below to get started.
      </WelcomeText>
      
      <WelcomeText>Quick Menu:</WelcomeText>
      <QuickMenu>
        <ClickableItem onClick={handleClick('about')}>about</ClickableItem>
        <ClickableItem onClick={handleClick('projects')}>projects</ClickableItem>
        <ClickableItem onClick={handleClick('contact')}>contact</ClickableItem>
        <ClickableItem onClick={handleClick('ls')}>ls</ClickableItem>
        <ClickableItem onClick={handleClick('neofetch')}>neofetch</ClickableItem>
      </QuickMenu>
      
      {projects.length > 0 && (
        <>
          <WelcomeText>Projects:</WelcomeText>
          {projects.map((project) => (
            <div key={project.name}>
              <ClickableItem onClick={handleClick(`cat ${project.name.toLowerCase()}`)}>
                {project.name}
              </ClickableItem>
              {' '}– {project.description}
            </div>
          ))}
        </>
      )}
      
      <WelcomeText>
        You can also type commands directly, just like a real terminal.
      </WelcomeText>
      
      {isFirstTime && (
        <FirstTimeHint>
          <b>First time here?</b>
          <ul>
            <li>Try typing <ClickableItem onClick={handleClick('help')}>help</ClickableItem> to see all available commands.</li>
            <li>Click any <span className="highlight">purple</span> command or project name to run it instantly.</li>
            <li>Use <b>Tab</b> for autocomplete and <b>Arrow keys</b> for command history.</li>
            <li>Type <ClickableItem onClick={handleClick('about')}>about</ClickableItem> to learn more about this project.</li>
          </ul>
        </FirstTimeHint>
      )}
    </WelcomeContainer>
  );
}; 