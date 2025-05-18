import React from 'react';
import styled from 'styled-components';

const WelcomeContainer = styled.div`
  margin-bottom: 2rem;
`;

const AsciiArt = styled.pre`
  color: ${({ theme }) => theme.colors.accent};
  margin: 0;
  white-space: pre;
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  line-height: 1.2;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  margin: ${({ theme }) => `${theme.spacing.md} 0`};
`;

const Subtitle = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: ${({ theme }) => `${theme.spacing.xs} 0`};
  
  .heart {
    color: #a8324a;
  }
`;

const WelcomeText = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: ${({ theme }) => `${theme.spacing.md} 0`};
`;

const QuickMenu = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => `${theme.spacing.md} 0`};
  flex-wrap: wrap;
`;

const ClickableItem = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: underline;
  }
`;

const FirstTimeHint = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  margin: ${({ theme }) => `${theme.spacing.md} 0`};
  
  ul {
    margin: ${({ theme }) => `${theme.spacing.xs} 0`};
    padding-left: ${({ theme }) => theme.spacing.lg};
  }
  
  li {
    margin: ${({ theme }) => `${theme.spacing.xs} 0`};
  }
  
  .highlight {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const ProjectsSection = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  margin: ${({ theme }) => `${theme.spacing.lg} 0`};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ProjectsTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ProjectItem = styled.div`
  margin: ${({ theme }) => `${theme.spacing.md} 0`};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.effects.boxShadow.projectHover};
  }
`;

const ProjectName = styled(ClickableItem)`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: 600;
  display: inline-block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ProjectDescription = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
`;

const StartTourButton = styled.button`
  background: ${({ theme }) => theme.colors.button};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 2px solid ${({ theme }) => theme.colors.button};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.lg}`};
  font-weight: 700;
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.effects.boxShadow.sm};
  transition: background 0.2s, color 0.2s;
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
        <div style={{ display: 'flex', justifyContent: 'flex-start', margin: undefined }}>
          <StartTourButton onClick={onStartTour}>
            Start Guided Tour
          </StartTourButton>
        </div>
      )}
      <Subtitle>
        Created by <b>Hugo Villeneuve</b>
      </Subtitle>
      <WelcomeText>
        <b>My Journey</b><br/>
        After years in corporate development, I made a deliberate choice to step back and invest in my growth as a developer. Using my savings, I dedicated myself to mastering new technologies and building practical solutions that solve real problems. This journey led me to create several successful web applications and bots that generate subscription revenue while allowing me to explore cutting-edge technologies.
      </WelcomeText>
      <WelcomeText>
        <b>The Challenge</b><br/>
        Despite building and maintaining profitable applications, I noticed a disconnect between my entrepreneurial achievements and how they were perceived in traditional recruitment processes. While I had created real, working products that users paid for, these accomplishments often didn't translate effectively in interviews. This realization sparked the creation of this portfolio.
      </WelcomeText>
      <WelcomeText>
        <b>Why This Portfolio?</b><br/>
        This isn't just another static portfolio. It's a living demonstration of my technical capabilities, built as a modern terminal interface that lets you explore my actual codebase, architecture decisions, and project implementations. Every file you see is real, every command works, and every project shown is a testament to my commitment to quality and innovation.
      </WelcomeText>
      <WelcomeText>
        <b>What You'll Find Here</b><br/>
        <ul style={{ margin: undefined, paddingLeft: undefined }}>
          <li><b>Real Code:</b> Browse through actual project files and see how I structure and implement features.</li>
          <li><b>Architecture:</b> Explore the technical decisions behind each project, from frontend frameworks to backend services.</li>
          <li><b>Problem Solving:</b> Understand how I approach challenges and implement solutions that scale.</li>
          <li><b>Technical Depth:</b> See my expertise in action through working examples and detailed documentation.</li>
        </ul>
      </WelcomeText>

      <ProjectsSection data-tour="project-list">
        <ProjectsTitle>Featured Projects</ProjectsTitle>
        {projects.length > 0 && (
          <>
            {projects.map((project) => (
              <ProjectItem key={project.name}>
                <ProjectName
                  onClick={handleClick(`cat ${project.name.toLowerCase()}`)}
                  {...(project.name === 'D4UT' ? { 'data-tour': 'project-d4ut' } : {})}
                  {...(project.name === 'LootManager' ? { 'data-tour': 'project-lootmanager' } : {})}
                  {...(project.name === 'RaidAlert' ? { 'data-tour': 'project-raidalert' } : {})}
                  {...(project.name === 'AzNet Terminal' ? { 'data-tour': 'project-terminal' } : {})}
                >
                  {project.name}
                </ProjectName>
                <ProjectDescription>{project.description}</ProjectDescription>
              </ProjectItem>
            ))}
          </>
        )}
      </ProjectsSection>

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