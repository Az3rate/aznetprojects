import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Project } from '../../types';

const DetailsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding-left: ${({ theme }) => theme.spacing.lg};
  position: relative;
  
  &:before {
    content: "•";
    color: ${({ theme }) => theme.colors.accent};
    position: absolute;
    left: 0;
  }
`;

const TechStack = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const TechItem = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const CloseButton = styled.button`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.md};
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`;

const ProjectImage = styled.img`
  width: 100%;
  max-width: 600px;
  margin: ${({ theme }) => theme.spacing.xl} auto;
  display: block;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 0 10px ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background.secondary};
`;

const ApiTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  box-shadow: 0 0 10px ${({ theme }) => theme.colors.accent};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const ApiTableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accent};
  text-align: left;
`;

const ApiTableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accent};
`;

const ApiTableContainer = styled.div`
  overflow-x: auto;
`;

const DirectoryEntry = styled.div`
  margin-left: ${({ theme }) => theme.spacing.md};
`;

interface ProjectDetailsProps {
  project: Project;
  onClose: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onClose }) => {
  const theme = useTheme();
  
  return (
    <DetailsContainer>
      <Title>{project.name}</Title>
      {project.image && (
        <ProjectImage
          src={project.image.startsWith('http') ? project.image : `/images/${project.image}`}
          alt={`${project.name} screenshot`}
        />
      )}
      <Section>
        <SectionTitle>Project Overview</SectionTitle>
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
      {project.architectureImage && (
        <Section>
          <SectionTitle>Architecture Flowchart</SectionTitle>
          <ProjectImage
            src={project.architectureImage.startsWith('http') ? project.architectureImage : `/images/${project.architectureImage}`}
            alt={`${project.name} architecture diagram`}
          />
        </Section>
      )}
      <Section>
        <SectionTitle>Technical Stack</SectionTitle>
        <TechStack>
          {project.techStack.map((tech, index) => (
            <TechItem key={index}>
              <strong>{tech.name}</strong> ({tech.version})<br />
              {tech.description}
            </TechItem>
          ))}
        </TechStack>
      </Section>
      <Section>
        <SectionTitle>Directory Structure (Key Parts)</SectionTitle>
        <List>
          {Object.entries(project.directoryStructure).map(([dir, contents]) => (
            <ListItem key={dir}>
              <strong>{dir}/</strong>
              <br />
              {Object.entries(contents).map(([subdir, files]) => (
                <DirectoryEntry key={subdir}>
                  {subdir}/: {files.join(', ')}
                </DirectoryEntry>
              ))}
            </ListItem>
          ))}
        </List>
      </Section>
      {project.apiEndpoints && project.apiEndpoints.length > 0 && (
        <Section>
          <SectionTitle>API Endpoints</SectionTitle>
          <ApiTableContainer>
            <ApiTable>
              <thead>
                <tr>
                  <ApiTableHeader>Method</ApiTableHeader>
                  <ApiTableHeader>Endpoint</ApiTableHeader>
                  <ApiTableHeader>Description</ApiTableHeader>
                </tr>
              </thead>
              <tbody>
                {project.apiEndpoints.map((endpoint, idx) => (
                  <tr key={idx}>
                    <ApiTableCell>{endpoint.method}</ApiTableCell>
                    <ApiTableCell>{endpoint.path}</ApiTableCell>
                    <ApiTableCell>{endpoint.description}</ApiTableCell>
                  </tr>
                ))}
              </tbody>
            </ApiTable>
          </ApiTableContainer>
        </Section>
      )}
      {project.workflow && project.workflow.length > 0 && (
        <Section>
          <SectionTitle>Development Workflow</SectionTitle>
          <List>
            {project.workflow.map((step, idx) => (
              <ListItem key={idx}>{step}</ListItem>
            ))}
          </List>
        </Section>
      )}
      {project.summary && (
        <Section>
          <SectionTitle>Summary</SectionTitle>
          <Description>{project.summary}</Description>
        </Section>
      )}
      <CloseButton onClick={onClose}>Close</CloseButton>
    </DetailsContainer>
  );
}; 