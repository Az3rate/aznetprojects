import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Project } from '../../types';

const DetailsContainer = styled.div`
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 2rem;
  margin-bottom: 2rem;
  font-weight: 600;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
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
  gap: 1rem;
`;

const TechItem = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 1rem;
  border-radius: 4px;
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
  const theme = useTheme();
  
  return (
    <DetailsContainer>
      <Title>{project.name}</Title>
      {project.image && (
        <img
          src={project.image.startsWith('http') ? project.image : `/images/${project.image}`}
          alt={`${project.name} screenshot`}
          style={{ 
            width: '100%', 
            maxWidth: 600, 
            margin: '2rem auto', 
            display: 'block', 
            border: `1px solid ${theme.colors.border}`, 
            boxShadow: `0 0 10px ${theme.colors.border}`, 
            background: 'rgba(0,0,0,0.8)' 
          }}
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
          <img
            src={project.architectureImage.startsWith('http') ? project.architectureImage : `/images/${project.architectureImage}`}
            alt={`${project.name} architecture diagram`}
            style={{ 
              width: '100%', 
              maxWidth: 600, 
              margin: '2rem auto', 
              display: 'block', 
              border: `1px solid ${theme.colors.border}`, 
              boxShadow: `0 0 10px ${theme.colors.border}`, 
              background: 'rgba(0,0,0,0.8)' 
            }}
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
                <div key={subdir}>
                  &nbsp;&nbsp;{subdir}/: {files.join(', ')}
                </div>
              ))}
            </ListItem>
          ))}
        </List>
      </Section>
      {project.apiEndpoints && project.apiEndpoints.length > 0 && (
        <Section>
          <SectionTitle>API Endpoints</SectionTitle>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(0,0,0,0.8)', border: '1px solid #4CAF50', boxShadow: '0 0 10px #4CAF50', margin: '1.5rem 0' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #4CAF50', color: '#4CAF50', textAlign: 'left' }}>Method</th>
                  <th style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #4CAF50', color: '#4CAF50', textAlign: 'left' }}>Endpoint</th>
                  <th style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #4CAF50', color: '#4CAF50', textAlign: 'left' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {project.apiEndpoints.map((endpoint, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #4CAF50', color: '#4CAF50' }}>{endpoint.method}</td>
                    <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #4CAF50', color: '#4CAF50' }}>{endpoint.path}</td>
                    <td style={{ padding: '0.7rem 1rem', borderBottom: '1px solid #4CAF50', color: '#4CAF50' }}>{endpoint.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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