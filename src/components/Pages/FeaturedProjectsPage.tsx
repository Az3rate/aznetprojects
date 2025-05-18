import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { projects } from '../../data/projects';

const PageContainer = styled.div`
  min-height: 94vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl} 0;
  position: relative;
  z-index: 1;
`;

const Hero = styled.section`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const HeroTitle = styled.h1`
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const HeroSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-bottom: 0;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProjectCard = styled.div`
  background: ${({ theme }) => theme.colors.background.glass};
  border: 1.5px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  box-shadow: 0 2px 16px 0 ${({ theme }) => theme.colors.background.glassLight};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: box-shadow 0.2s, border 0.2s, transform 0.2s;
  cursor: pointer;
  min-height: 220px;
  &:hover {
    box-shadow: 0 4px 32px 0 ${({ theme }) => theme.colors.accent}33;
    border: 2px solid ${({ theme }) => theme.colors.accent};
    transform: translateY(-4px) scale(1.03);
  }
`;

const ProjectImage = styled.img`
  width: 100%;
  max-width: 320px;
  max-height: 160px;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  box-shadow: 0 2px 12px 0 ${({ theme }) => theme.colors.accent}22;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.primary};
`;

const ProjectName = styled.h2`
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ProjectDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ViewButton = styled.button`
  background: ${({ theme }) => theme.colors.accent};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: auto;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.7);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.background.glass};
  border: 2px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  box-shadow: 0 8px 48px 0 ${({ theme }) => theme.colors.accent}33;
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 700px;
  width: 90vw;
  color: ${({ theme }) => theme.colors.text.primary};
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 2rem;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ModalSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ModalList = styled.ul`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  padding-left: 1.2em;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ModalListItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ModalImage = styled.img`
  width: 100%;
  max-width: 400px;
  max-height: 220px;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  box-shadow: 0 4px 24px 0 ${({ theme }) => theme.colors.accent}33;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.primary};
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

export const FeaturedProjectsPage: React.FC = () => {
  const theme = useTheme();
  const featured = projects.filter(p => p.featured);
  const [selected, setSelected] = useState(null as null | typeof featured[0]);

  return (
    <PageContainer>
      <Hero>
        <HeroTitle>Featured Projects</HeroTitle>
        <HeroSubtitle>Explore a curated selection of impactful, real-world projects.</HeroSubtitle>
      </Hero>
      <ProjectsGrid>
        {featured.map(project => (
          <ProjectCard key={project.name}>
            {project.image && project.image.trim() !== '' && (
              <ProjectImage src={`/images/${project.image}`} alt={project.name + ' screenshot'} />
            )}
            <ProjectName>{project.name}</ProjectName>
            <ProjectDescription>{project.description}</ProjectDescription>
            <ViewButton onClick={() => setSelected(project)}>View Details</ViewButton>
          </ProjectCard>
        ))}
      </ProjectsGrid>
      {selected && (
        <ModalOverlay onClick={() => setSelected(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={() => setSelected(null)}>&times;</CloseButton>
            {selected.image && selected.image.trim() !== '' && (
              <ModalImage src={`/images/${selected.image}`} alt={selected.name + ' screenshot'} />
            )}
            <ModalTitle>{selected.name}</ModalTitle>
            <ModalSection>{selected.description}</ModalSection>
            {selected.keyFeatures && (
              <ModalSection>
                <strong>Key Features:</strong>
                <ModalList>
                  {selected.keyFeatures.map((f, i) => <ModalListItem key={i}>{f}</ModalListItem>)}
                </ModalList>
              </ModalSection>
            )}
            {selected.techStack && (
              <ModalSection>
                <strong>Tech Stack:</strong>
                <ModalList>
                  {selected.techStack.map((t, i) => <ModalListItem key={i}>{t.name} {t.version && `(${t.version})`} - {t.description}</ModalListItem>)}
                </ModalList>
              </ModalSection>
            )}
            {selected.overview && (
              <ModalSection>
                <strong>Overview:</strong>
                <div>{selected.overview}</div>
              </ModalSection>
            )}
            {selected.architectureImage && selected.architectureImage.trim() !== '' && (
              <ModalSection>
                <strong>Architecture Diagram:</strong>
                <ModalImage src={`/images/${selected.architectureImage}`} alt={selected.name + ' architecture diagram'} />
              </ModalSection>
            )}
            {selected.summary && (
              <ModalSection>
                <strong>Summary:</strong>
                <div>{selected.summary}</div>
              </ModalSection>
            )}
            {selected.url && (
              <ModalSection>
                <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{ color: theme.colors.accent, textDecoration: 'underline' }}>View on GitHub</a>
              </ModalSection>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
}; 