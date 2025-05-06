import React, { useState, useEffect, useRef } from 'react';
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

const DebugPanel = styled.div`
  padding: 0.5rem;
  font-size: 0.8rem;
  color: #888;
  border-bottom: 1px solid #333;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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
  fileTree?: any;
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
  onProjectClick,
  fileTree
}) => {
  console.log('[FileExplorer] fileTree prop:', fileTree);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const lastProcessedDir = useRef<string>('');

  // Path normalization utility
  const normalizePath = (path: string): string => {
    if (!path || path === '' || path === '~') return '/';
    let cleaned = path;
    while (cleaned.includes('//')) cleaned = cleaned.replace('//', '/');
    if (!cleaned.startsWith('/')) cleaned = '/' + cleaned;
    if (cleaned.length > 1 && cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
    return cleaned;
  };

  // Handle directory expansion based on current path
  useEffect(() => {
    if (currentDirectory === lastProcessedDir.current) return;
    lastProcessedDir.current = currentDirectory;
    const cleanCurrentDir = normalizePath(currentDirectory);
    if (cleanCurrentDir === '/') {
      setExpanded({});
      return;
    }
    const parts = cleanCurrentDir.split('/').filter(Boolean);
    const newExpanded: { [key: string]: boolean } = {};
    let path = '';
    for (const part of parts) {
      path = path ? `${path}/${part}` : `/${part}`;
      newExpanded[path] = true;
    }
    setExpanded(prev => ({...prev, ...newExpanded}));
  }, [currentDirectory]);

  // Handle manual toggle of directory expansion
  const toggleExpansion = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPath = normalizePath(path);
    setExpanded(prev => {
      const newState = {...prev};
      newState[cleanPath] = !prev[cleanPath];
      return newState;
    });
  };

  // Handle directory click from FileExplorer
  const handleDirectoryClick = (dirPath: string) => {
    let cleanPath = dirPath;
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    while (cleanPath.includes('//')) cleanPath = cleanPath.replace('//', '/');
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1);
    onDirectoryClick(cleanPath);
  };

  // Render a directory node and its children
  const renderTree = (node: FileNode, path: string) => {
    if (!node) return null;
    const isDir = node.type === 'directory';
    const cleanNodePath = normalizePath(path);
    const cleanCurrentDir = normalizePath(currentDirectory);
    const isCurrentDir = cleanNodePath === cleanCurrentDir;
    const isExpanded = expanded[cleanNodePath] || false;
    if (isDir) {
      return (
        <div key={cleanNodePath}>
          <DirectoryItem 
            $isActive={isCurrentDir} 
            onClick={(e) => {
              e.stopPropagation();
              handleDirectoryClick(cleanNodePath);
            }}
          >
            <DirectoryIcon onClick={(e) => toggleExpansion(cleanNodePath, e)}>
              {isExpanded ? '📂' : '📁'}
            </DirectoryIcon>
            <DirectoryName>{node.name || path.split('/').pop()}</DirectoryName>
          </DirectoryItem>
          {isExpanded && node.children && (
            <div style={{ marginLeft: '1rem' }}>
              {Object.entries(node.children).map(([childName, childNode]) =>
                renderTree(childNode as FileNode, `${cleanNodePath}/${childName}`)
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <DirectoryItem 
          $isActive={isCurrentDir} 
          key={cleanNodePath} 
          onClick={(e) => {
            e.stopPropagation();
            onFileClick(cleanNodePath);
          }}
        >
          <DirectoryIcon>📄</DirectoryIcon>
          <DirectoryName>{node.name || path.split('/').pop()}</DirectoryName>
        </DirectoryItem>
      );
    }
  };

  // Render the root level items
  const renderRootLevelItems = () => {
    if (!fileTree) return null;
    console.log('[FileExplorer] renderRootLevelItems children:', fileTree.children);
    return Object.entries(fileTree.children).map(([name, node]) => 
      renderTree(node as FileNode, `/${name}`)
    );
  };

  const getDisplayDirectory = (): string => {
    if (!currentDirectory || currentDirectory === '~') return '/';
    return normalizePath(currentDirectory);
  };

  return (
    <ExplorerContainer>
      <DebugPanel>
        <div>Current: {getDisplayDirectory()}</div>
        <div>Expanded: {Object.keys(expanded).join(', ')}</div>
      </DebugPanel>
      <FileTree>
        {renderRootLevelItems()}
      </FileTree>
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