import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Project } from '../../types';
import { VscFile, VscLinkExternal } from 'react-icons/vsc';

// Weighted & Anchored Design System - Runtime Playground Style
const DetailsContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DetailsHeader = styled.div`
  background: #0d1117;
  border-bottom: 2px solid #1c2128;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
`;

const DetailsBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 20px;
  font-family: 'SF Mono', monospace;
  background: #0a0c10;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: #e6edf3;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    width: 20px;
    height: 20px;
    color: #58a6ff;
    filter: drop-shadow(0 0 8px rgba(88, 166, 255, 0.4));
  }
`;

const Title = styled.h1`
  color: #58a6ff;
  font-size: 24px;
  font-weight: 900;
  margin: 0 0 24px 0;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 20px rgba(88, 166, 255, 0.3);
`;

const Section = styled.div`
  margin-bottom: 32px;
  font-family: 'SF Mono', monospace;
`;

const SubSectionTitle = styled.h3`
  color: #00d448;
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:before {
    content: '▶';
    color: #238636;
    margin-right: 8px;
    font-size: 14px;
  }
`;

const Description = styled.p`
  color: #e6edf3;
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 14px;
  font-family: 'SF Mono', monospace;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  color: #e6edf3;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: #161b22;
  border: 2px solid #21262d;
  border-radius: 6px;
  position: relative;
  font-size: 13px;
  line-height: 1.4;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3);
  
  &:before {
    content: '✓';
    color: #00d448;
    position: absolute;
    left: -8px;
    top: 8px;
    background: #238636;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 0 10px rgba(35, 134, 54, 0.3);
  }
`;

const TechStack = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const TechItem = styled.div`
  background: #161b22;
  border: 2px solid #21262d;
  border-radius: 8px;
  padding: 16px;
  font-family: 'SF Mono', monospace;
  transition: all 0.2s ease;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3);
  
  &:hover {
    border-color: #1f6feb;
    transform: translateY(-1px);
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(31, 111, 235, 0.2);
  }
`;

const TechName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #58a6ff;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TechDescription = styled.div`
  font-size: 12px;
  color: #7d8590;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #f85149, #da3633);
  color: #ffffff;
  border: 2px solid #da3633;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
  &:hover {
    background: linear-gradient(135deg, #ff6b6b, #f85149);
    transform: translateY(-1px);
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 4px 8px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ImageContainer = styled.div`
  margin: 16px 0;
  border: 2px solid #21262d;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.3);
`;

const ProjectImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  filter: brightness(0.9);
  transition: filter 0.2s ease;
  
  &:hover {
    filter: brightness(1);
  }
`;

const UrlLink = styled.a`
  color: #8b5cf6;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  border: 2px solid #8b5cf6;
  padding: 8px 16px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  &:hover {
    background: #8b5cf6;
    color: #ffffff;
    transform: translateY(-1px);
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(139, 92, 246, 0.3);
  }
`;

interface ProjectDetailsProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onClose }) => {
  return (
    <DetailsContainer>
      <DetailsHeader>
        <SectionTitle>
          <VscFile />
          Project Details
        </SectionTitle>
        <CloseButton onClick={onClose}>✕ Close</CloseButton>
      </DetailsHeader>
      
      <DetailsBody>
        <Title>{project.name}</Title>
        
        <Section>
          <Description>{project.description}</Description>
          {project.url && (
            <UrlLink href={project.url} target="_blank" rel="noopener noreferrer">
              <VscLinkExternal />
              View Project
            </UrlLink>
          )}
        </Section>

        {project.image && (
          <Section>
            <ImageContainer>
              <ProjectImage src={project.image} alt={`${project.name} screenshot`} />
            </ImageContainer>
          </Section>
        )}

        <Section>
          <SubSectionTitle>Overview</SubSectionTitle>
          <Description>{project.overview}</Description>
        </Section>

        <Section>
          <SubSectionTitle>Key Features</SubSectionTitle>
          <List>
            {project.keyFeatures.map((feature, index) => (
              <ListItem key={index}>{feature}</ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <SubSectionTitle>Technology Stack</SubSectionTitle>
          <TechStack>
            {project.techStack.map((tech, index) => (
              <TechItem key={index}>
                <TechName>{tech.name}</TechName>
                <TechDescription>{tech.description}</TechDescription>
              </TechItem>
            ))}
          </TechStack>
        </Section>

        {project.workflow && project.workflow.length > 0 && (
          <Section>
            <SubSectionTitle>Workflow</SubSectionTitle>
            <List>
              {project.workflow.map((step, index) => (
                <ListItem key={index}>{step}</ListItem>
              ))}
            </List>
          </Section>
        )}

        <Section>
          <SubSectionTitle>Summary</SubSectionTitle>
          <Description>{project.summary}</Description>
        </Section>
      </DetailsBody>
    </DetailsContainer>
  );
}; 