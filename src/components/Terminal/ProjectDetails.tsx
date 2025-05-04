import React from 'react';
import styled from 'styled-components';
import { Project } from '../../types';

const DetailsContainer = styled.div`
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Fira Code', monospace;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.prompt};
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.link};
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 0.5rem;
`;

const Description = styled.p`
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const List = styled.ul`
  list-style-type: none;
  padding-left: 1rem;
  margin-bottom: 1rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
  &:before {
    content: "•";
    color: ${({ theme }) => theme.colors.prompt};
    margin-right: 0.5rem;
  }
`;

const TechStack = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TechItem = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: 0.5rem;
  border-radius: 4px;
`;

const CloseButton = styled.button`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-top: 1rem;
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`;

interface ProjectDetailsProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onClose }) => {
  return (
    <DetailsContainer>
      <Title>{project.name}</Title>
      
      <Section>
        <SectionTitle>Overview</SectionTitle>
        <Description>{project.overview}</Description>
      </Section>

      <Section>
        <SectionTitle>Key Features</SectionTitle>
        <List>
          {project.keyFeatures.map((feature, index) => (
            <ListItem key={index}>{feature}</ListItem>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>Architecture</SectionTitle>
        <Description>
          <strong>Frontend:</strong> {project.architecture.frontend.framework} ({project.architecture.frontend.language})
          <br />
          <strong>Backend:</strong> {project.architecture.backend.framework} ({project.architecture.backend.language})
        </Description>
      </Section>

      <Section>
        <SectionTitle>Tech Stack</SectionTitle>
        <TechStack>
          {project.techStack.map((tech, index) => (
            <TechItem key={index}>
              <strong>{tech.name}</strong> ({tech.version})
              <br />
              {tech.description}
            </TechItem>
          ))}
        </TechStack>
      </Section>

      <Section>
        <SectionTitle>Directory Structure</SectionTitle>
        <List>
          {Object.entries(project.directoryStructure).map(([dir, contents]) => (
            <ListItem key={dir}>
              <strong>{dir}/</strong>
              <br />
              {Object.entries(contents).map(([subdir, files]) => (
                <div key={subdir}>
                  &nbsp;&nbsp;{subdir}/: {files.join(', ')}
                </div>
              ))}
            </ListItem>
          ))}
        </List>
      </Section>

      <Section>
        <SectionTitle>API Endpoints</SectionTitle>
        <List>
          {project.apiEndpoints.map((endpoint, index) => (
            <ListItem key={index}>
              <strong>{endpoint.method} {endpoint.path}</strong>
              <br />
              {endpoint.description}
            </ListItem>
          ))}
        </List>
      </Section>

      <CloseButton onClick={onClose}>Close</CloseButton>
    </DetailsContainer>
  );
}; 