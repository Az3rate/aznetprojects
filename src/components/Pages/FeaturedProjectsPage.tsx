import React, { useState } from 'react';
import styled from 'styled-components';
import { projects } from '../../data/projects';
import { AiFillStar } from 'react-icons/ai';

// Weighted & Anchored Design System - Runtime Playground Style
// Following the same design principles as Terminal and Runtime Playground

// Base weighted container pattern
const WeightedContainer = styled.div<{ gridArea?: string }>`
  position: relative;
  background: #0a0c10;
  border: 4px solid #1c2128;
  box-shadow: 
    0 0 0 1px #21262d,
    0 8px 24px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
  grid-area: ${({ gridArea }) => gridArea || 'auto'};
`;

// Main page container
const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "header"
    "projects";
  gap: 24px;
  padding: 24px;
  padding-top: 88px; /* Account for floating navigation + optimal breathing room */
  height: 100vh;
  max-width: 100vw;
  overflow: hidden;
  background: #010409;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  box-sizing: border-box;
`;

// Header Section
const HeaderSection = styled(WeightedContainer)`
  grid-area: header;
  padding: 24px 32px;
  text-align: center;
  background: linear-gradient(135deg, #0a0c10, #0d1117);
`;

const SectionTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #e6edf3;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 12px 0;
  text-shadow: 0 0 20px rgba(88, 166, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  
  svg {
    width: 28px;
    height: 28px;
    color: #ffd700;
    filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.6));
  }
`;

const SectionSubtitle = styled.p`
  font-size: 16px;
  color: #7d8590;
  font-family: 'SF Mono', monospace;
  margin: 0;
  line-height: 1.5;
  font-weight: 400;
`;

// Projects Section
const ProjectsSection = styled(WeightedContainer)`
  grid-area: projects;
  padding: 32px;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 24px;
  padding: 0;
  margin: 0;
`;

// Project Card using weighted design
const ProjectCard = styled(WeightedContainer)`
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #0a0c10, #0d1117);
  border: 4px solid #1c2128;
  display: flex;
  flex-direction: column;
  min-height: 280px;
  
  &:hover {
    border-color: #238636;
    transform: translateY(-4px);
    box-shadow: 
      0 0 0 1px #21262d,
      0 12px 32px rgba(0, 0, 0, 0.6),
      0 0 30px rgba(35, 134, 54, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

const ProjectImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 16px;
  border: 2px solid #21262d;
  background: #0d1117;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
`;

const ProjectName = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: #58a6ff;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px 0;
  text-shadow: 0 0 10px rgba(88, 166, 255, 0.3);
`;

const ProjectDescription = styled.p`
  font-size: 14px;
  color: #e6edf3;
  font-family: 'SF Mono', monospace;
  line-height: 1.5;
  margin: 0 0 16px 0;
  flex: 1;
  font-weight: 400;
`;

const ViewButton = styled.button`
  background: linear-gradient(135deg, #238636, #2ea043);
  color: #ffffff;
  border: 2px solid #238636;
  border-radius: 6px;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  margin-top: auto;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
  &:hover {
    background: linear-gradient(135deg, #2ea043, #34d058);
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

// Modal using weighted design
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(1, 4, 9, 0.85);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
`;

const ModalContent = styled(WeightedContainer)`
  background: linear-gradient(135deg, #0a0c10, #0d1117);
  padding: 32px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  border: 4px solid #238636;
  box-shadow: 
    0 0 0 1px #21262d,
    0 16px 48px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(35, 134, 54, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #f85149, #da3633);
  color: #ffffff;
  border: 2px solid #da3633;
  border-radius: 6px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3);
    
  &:hover {
    background: linear-gradient(135deg, #ff6b6b, #f85149);
    transform: translateY(-1px);
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 4px 8px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: #58a6ff;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 20px 0;
  text-shadow: 0 0 15px rgba(88, 166, 255, 0.4);
`;

const ModalSection = styled.div`
  margin-bottom: 24px;
  
  h3 {
    font-size: 16px;
    font-weight: 700;
    color: #e6edf3;
    font-family: 'SF Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 12px 0;
  }
  
  p {
    font-size: 14px;
    color: #7d8590;
    font-family: 'SF Mono', monospace;
    line-height: 1.6;
    margin: 0;
  }
`;

const ModalList = styled.ul`
  margin: 0;
  padding-left: 20px;
  
  li {
    font-size: 14px;
    color: #7d8590;
    font-family: 'SF Mono', monospace;
    line-height: 1.5;
    margin-bottom: 8px;
    
    &::marker {
      color: #238636;
    }
  }
`;

const ModalImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 20px;
  border: 2px solid #21262d;
  background: #0d1117;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
`;

const ExternalLink = styled.a`
  color: #58a6ff;
  text-decoration: none;
  font-family: 'SF Mono', monospace;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    color: #79c0ff;
    text-decoration: underline;
    text-shadow: 0 0 8px rgba(88, 166, 255, 0.4);
  }
`;

export const FeaturedProjectsPage: React.FC = () => {
  const featured = projects.filter(p => p.featured);
  const [selected, setSelected] = useState<typeof featured[0] | null>(null);

  return (
    <Container>
      <HeaderSection>
        <SectionTitle>
          <AiFillStar />
          Featured Projects
        </SectionTitle>
        <SectionSubtitle>
          Explore a curated selection of impactful, real-world projects showcasing 
          cutting-edge development practices and innovative solutions.
        </SectionSubtitle>
      </HeaderSection>

      <ProjectsSection>
        <ProjectsGrid>
          {featured.map(project => (
            <ProjectCard key={project.name} onClick={() => setSelected(project)}>
              {project.image && project.image.trim() !== '' && (
                <ProjectImage 
                  src={`/images/${project.image}`} 
                  alt={`${project.name} screenshot`} 
                />
              )}
              <ProjectName>{project.name}</ProjectName>
              <ProjectDescription>{project.description}</ProjectDescription>
              <ViewButton>View Details</ViewButton>
            </ProjectCard>
          ))}
        </ProjectsGrid>
      </ProjectsSection>

      {selected && (
        <ModalOverlay onClick={() => setSelected(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={() => setSelected(null)}>×</CloseButton>
            
            {selected.image && selected.image.trim() !== '' && (
              <ModalImage 
                src={`/images/${selected.image}`} 
                alt={`${selected.name} screenshot`} 
              />
            )}
            
            <ModalTitle>{selected.name}</ModalTitle>
            
            <ModalSection>
              <p>{selected.description}</p>
            </ModalSection>

            {selected.overview && (
              <ModalSection>
                <h3>Overview</h3>
                <p>{selected.overview}</p>
              </ModalSection>
            )}

            {selected.keyFeatures && selected.keyFeatures.length > 0 && (
              <ModalSection>
                <h3>Key Features</h3>
                <ModalList>
                  {selected.keyFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ModalList>
              </ModalSection>
            )}

            {selected.techStack && selected.techStack.length > 0 && (
              <ModalSection>
                <h3>Tech Stack</h3>
                <ModalList>
                  {selected.techStack.map((tech, index) => (
                    <li key={index}>
                      <strong>{tech.name}</strong>
                      {tech.version && ` (${tech.version})`} - {tech.description}
                    </li>
                  ))}
                </ModalList>
              </ModalSection>
            )}

            {selected.architectureImage && selected.architectureImage.trim() !== '' && (
              <ModalSection>
                <h3>Architecture Diagram</h3>
                <ModalImage 
                  src={`/images/${selected.architectureImage}`} 
                  alt={`${selected.name} architecture diagram`} 
                />
              </ModalSection>
            )}

            {selected.summary && (
              <ModalSection>
                <h3>Summary</h3>
                <p>{selected.summary}</p>
              </ModalSection>
            )}

            {selected.url && (
              <ModalSection>
                <ExternalLink 
                  href={selected.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  → View on GitHub
                </ExternalLink>
              </ModalSection>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}; 