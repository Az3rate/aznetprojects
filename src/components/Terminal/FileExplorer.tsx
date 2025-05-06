import React, { useState, useEffect } from 'react';
import fileTree from '../../data/fileTree.json';
import styled from 'styled-components';
import {
  DirectoryItem,
  DirectoryIcon,
  DirectoryName
} from './Terminal.styles';
import { OptionsPanel } from './OptionsPanel';
import { projects } from '../../data/projects';
import { Project } from '../../types';

const ExplorerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100vh;
  font-family: 'Fira Code', monospace;
`;


const FileTree = styled.div`
  flex: 1 1 0;
  overflow-y: auto;
  min-height: 0;
  padding: 1rem;
`;


const FeaturedProjectsContainer = styled.div`
  height: 240px;
  overflow-y: auto;
  padding: 0 1rem 1rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;


const FeaturedTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const FeaturedProject = styled.div`
  margin-bottom: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.background.primary};
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
  }
`;

const FeaturedProjectName = styled.div`
  color: ${({ theme }) => theme.colors.link};
  font-weight: 600;
  font-size: 1rem;
`;

const FeaturedProjectDesc = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.92rem;
`;

const ScrollableArea = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

interface FileNode {
  name: string;
  type: string;
  content?: string;
  children?: { [key: string]: FileNode };
}

interface FileExplorerProps {
  onFileClick: (filePath: string) => void;
  onDirectoryClick: (dirPath: string) => void;
  currentDirectory: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onToggleBackground: () => void;
  isBackgroundMuted: boolean;
  onOpenWelcome: () => void;
  onProjectClick?: (project: Project) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  onFileClick, 
  onDirectoryClick,
  currentDirectory,
  volume,
  onVolumeChange,
  onToggleBackground,
  isBackgroundMuted,
  onOpenWelcome,
  onProjectClick
}) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  
  // Update expanded state based on current directory
  useEffect(() => {
    // Parse the current directory path to determine which folders should be expanded
    if (currentDirectory) {
      const pathParts = currentDirectory.replace(/^~\//, '').split('/').filter(Boolean);
      
      // Create a new expanded state by setting each path segment to true
      const newExpanded = { ...expanded };
      let currentPath = '';
      
      pathParts.forEach(part => {
        currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;
        newExpanded[currentPath] = true;
      });
      
      setExpanded(newExpanded);
    }
  }, [currentDirectory]);

  const renderTree = (
    node: FileNode,
    path: string,
  ) => {
    if (!node) return null;
    
    const isCurrentDirectory = currentDirectory.replace(/^~/, '') === path;
    const isExpanded = expanded[path] || false;
    
    if (node.type === 'directory') {
      // Check if the current directory matches this path
      return (
        <div key={path}>
          <DirectoryItem 
            $isActive={isCurrentDirectory} 
            onClick={() => {
              // When directory is clicked, perform cd operation
              onDirectoryClick(path);
              // Toggle expanded state
              setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
            }}
          >
            <DirectoryIcon>{isExpanded ? '📂' : '📁'}</DirectoryIcon>
            <DirectoryName>{node.name}</DirectoryName>
          </DirectoryItem>
          
          {/* Show children if expanded */}
          {(isExpanded || isCurrentDirectory) && node.children && (
            <div style={{ marginLeft: '1rem' }}>
              {Object.values(node.children).map(child => 
                renderTree(
                  child,
                  `${path}/${child.name}`
                )
              )}
            </div>
          )}
        </div>
      );
    } else {
      // File node
      return (
        <DirectoryItem $isActive={false} key={path} onClick={() => onFileClick(path)}>
          <DirectoryIcon>📄</DirectoryIcon>
          <DirectoryName>{node.name}</DirectoryName>
        </DirectoryItem>
      );
    }
  };

  const normalizePath = (path: string) => {
    return path.replace(/^\//, '');
  };

  const renderRootLevelItems = () => {
    return Object.values(fileTree).map((node: FileNode) => 
      renderTree(node, `/${node.name}`)
    );
  };

  // Featured projects logic
  const featuredProjects = projects.filter(p => p.featured);

  const handleProjectClick = (projectName: string) => {
    const project = projects.find(p => p.name === projectName);
    if (project && onProjectClick) {
      onProjectClick(project);
    }
  };

  return (
    <ExplorerContainer>
      <FileTree>
        {renderRootLevelItems()}
      </FileTree>
      <FeaturedProjectsContainer>
        <FeaturedTitle>Featured Projects</FeaturedTitle>
        {featuredProjects.map(project => (
          <FeaturedProject key={project.name} onClick={() => handleProjectClick(project.name)}>
            <FeaturedProjectName>{project.name}</FeaturedProjectName>
            <FeaturedProjectDesc>{project.description}</FeaturedProjectDesc>
          </FeaturedProject>
        ))}
      </FeaturedProjectsContainer>
      <OptionsPanel 
        volume={volume}
        onVolumeChange={onVolumeChange}
        onToggleBackground={onToggleBackground}
        isBackgroundMuted={isBackgroundMuted}
        onOpenWelcome={onOpenWelcome}
      />
    </ExplorerContainer>
  );
};