import React, { useState, useEffect } from 'react';
import fileTree from '../../data/fileTree.json';
import styled from 'styled-components';
import {
  DirectoryItem,
  DirectoryIcon,
  DirectoryName
} from './Terminal.styles';
import { OptionsPanel } from './OptionsPanel';

const ExplorerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: 'Fira Code', monospace;
  font-size: 0.95rem;
`;

const FileTree = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
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
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  onFileClick, 
  onDirectoryClick,
  currentDirectory,
  volume,
  onVolumeChange,
  onToggleBackground,
  isBackgroundMuted
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

  return (
    <ExplorerContainer>
      <FileTree>
        {renderRootLevelItems()}
      </FileTree>
      <OptionsPanel 
        volume={volume}
        onVolumeChange={onVolumeChange}
        onToggleBackground={onToggleBackground}
        isBackgroundMuted={isBackgroundMuted}
      />
    </ExplorerContainer>
  );
};