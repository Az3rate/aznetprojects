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
      {project.image && (
        <img
          src={project.image.startsWith('http') ? project.image : `/images/${project.image}`}
          alt={`${project.name} screenshot`}
          style={{ width: '100%', maxWidth: 600, margin: '2rem auto', display: 'block', border: '1px solid #4CAF50', boxShadow: '0 0 10px #4CAF50', background: 'rgba(0,0,0,0.8)' }}
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
            style={{ width: '100%', maxWidth: 600, margin: '2rem auto', display: 'block', border: '1px solid #4CAF50', boxShadow: '0 0 10px #4CAF50', background: 'rgba(0,0,0,0.8)' }}
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