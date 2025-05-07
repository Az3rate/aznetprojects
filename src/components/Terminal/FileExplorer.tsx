import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import {
  DirectoryItem,
  DirectoryIcon,
  DirectoryName
} from './Terminal.styles';
import { OptionsPanel } from './OptionsPanel';
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

function areEqual(prevProps: FileExplorerProps, nextProps: FileExplorerProps) {
  return (
    prevProps.fileTree === nextProps.fileTree &&
    prevProps.currentDirectory === nextProps.currentDirectory &&
    prevProps.volume === nextProps.volume &&
    prevProps.isBackgroundMuted === nextProps.isBackgroundMuted &&
    prevProps.onFileClick === nextProps.onFileClick &&
    prevProps.onDirectoryClick === nextProps.onDirectoryClick &&
    prevProps.onVolumeChange === nextProps.onVolumeChange &&
    prevProps.onToggleBackground === nextProps.onToggleBackground &&
    prevProps.onOpenWelcome === nextProps.onOpenWelcome &&
    prevProps.onProjectClick === nextProps.onProjectClick
  );
}

export const FileExplorer: React.FC<FileExplorerProps> = React.memo(({ 
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
  console.log('[FileExplorer] Re-rendered');
  console.log('[FileExplorer] fileTree prop:', fileTree);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const lastProcessedDir = useRef<string>('');

  const normalizePath = useCallback((path: string): string => {
    if (!path || path === '' || path === '~') return '/';
    let cleaned = path;
    while (cleaned.includes('//')) cleaned = cleaned.replace('//', '/');
    if (!cleaned.startsWith('/')) cleaned = '/' + cleaned;
    if (cleaned.length > 1 && cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
    return cleaned;
  }, []);

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
  }, [currentDirectory, normalizePath]);


  const toggleExpansion = useCallback((path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPath = normalizePath(path);
    setExpanded(prev => {
      const newState = {...prev};
      newState[cleanPath] = !prev[cleanPath];
      return newState;
    });
  }, [normalizePath]);


  const handleDirectoryClick = useCallback((dirPath: string) => {
    let cleanPath = dirPath;
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    while (cleanPath.includes('//')) cleanPath = cleanPath.replace('//', '/');
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1);
    onDirectoryClick(cleanPath);
  }, [onDirectoryClick]);


  const renderTree = useCallback(
    (node: FileNode, path: string): React.ReactNode => {
      if (!node) return null;
      const isDir = node.type === 'directory';
      const cleanNodePath = normalizePath(path);
      const cleanCurrent = normalizePath(currentDirectory);
      const isCurrentDir = cleanNodePath === cleanCurrent;
      const isExpanded = expanded[cleanNodePath] || false;


      console.log('[FileExplorer][renderTree]', { path: cleanNodePath, isExpanded });

      if (isDir) {
        return (
          <div key={cleanNodePath}>
            <DirectoryItem
              $isActive={isCurrentDir}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpansion(cleanNodePath, e);
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
      }

      return (
        <DirectoryItem
          $isActive={isCurrentDir}
          key={cleanNodePath}
          onClick={(e) => {
            e.stopPropagation();

            const segments = cleanNodePath.split('/');
            const parentDir = '/' + segments.slice(1, -1).join('/');
            onDirectoryClick(parentDir); 

            onFileClick('/' + cleanNodePath.replace(/^\/+/, ''));
          }}
        >
          <DirectoryIcon>📄</DirectoryIcon>
          <DirectoryName>{node.name || path.split('/').pop()}</DirectoryName>
        </DirectoryItem>
      );
    },
    [expanded, currentDirectory, onFileClick, normalizePath, handleDirectoryClick, toggleExpansion]
  );


  const renderRootLevelItems = useCallback(() => {

    interface WindowWithDebugFlag extends Window {
      __fileTreeNullLogged?: boolean;
    }
    const debugWindow = window as WindowWithDebugFlag;
  
    if (fileTree === null) {
      if (!debugWindow.__fileTreeNullLogged) {
        console.log('[FileExplorer] fileTree is null – loading…');
        debugWindow.__fileTreeNullLogged = true;
      }
      return <div>Loading file tree…</div>;
    }
  
    if (fileTree === undefined) {
      console.log('[FileExplorer] Error UI rendered');
      return (
        <div>
          Error loading file tree.&nbsp;
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      );
    }
  
    if (!fileTree?.children || Object.keys(fileTree.children).length === 0) {
      console.log('[FileExplorer] Empty state rendered');
      return <div>No files found.</div>;
    }
  
    console.log('[FileExplorer] renderRootLevelItems children:', fileTree.children);
    return Object.entries(fileTree.children).map(([name, node]) =>
      renderTree(node as FileNode, `/${name}`)
    );
  }, [fileTree, renderTree]);
  

  


  const getDisplayDirectory = useCallback((): string => {
    if (!currentDirectory || currentDirectory === '~') return '/';
    return normalizePath(currentDirectory);
  }, [currentDirectory, normalizePath]);

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
        onOpenWelcome={onOpenWelcome}
      />
    </ExplorerContainer>
  );
}, areEqual);