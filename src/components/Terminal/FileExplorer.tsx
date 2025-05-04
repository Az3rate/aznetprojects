import React, { useState } from 'react';
import fileTree from '../../data/fileTree.json';
import styled from 'styled-components';
import {
  DirectoryItem,
  DirectoryIcon,
  DirectoryName
} from './Terminal.styles';

const ExplorerContainer = styled.div`
  font-family: 'Fira Code', monospace;
  font-size: 0.95rem;
`;

const Folder = styled.div<{ $expanded: boolean }>`
  cursor: pointer;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-left: 0.5rem;
  user-select: none;
`;

const File = styled.div`
  cursor: pointer;
  color: ${({ theme }) => theme.colors.link};
  margin-left: 1.5rem;
  &:hover {
    color: ${({ theme }) => theme.colors.linkHover};
    text-decoration: underline;
  }
`;

interface FileNode {
  name: string;
  type: string;
  content?: string;
  children?: { [key: string]: FileNode };
}

interface FileExplorerProps {
  onFileClick: (filePath: string) => void;
  rootPath?: string;
}

const renderTree = (
  node: FileNode,
  onFileClick: (filePath: string) => void,
  path: string,
  expanded: { [key: string]: boolean },
  setExpanded: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>
) => {
  if (node.type === 'directory') {
    const isExpanded = expanded[path] || false;
    return (
      <div key={path}>
        <DirectoryItem $isActive={isExpanded} onClick={() => setExpanded(e => ({ ...e, [path]: !isExpanded }))}>
          <DirectoryIcon>{isExpanded ? '📂' : '📁'}</DirectoryIcon>
          <DirectoryName>{node.name}</DirectoryName>
        </DirectoryItem>
        {isExpanded && node.children && (
          <div style={{ marginLeft: '1rem' }}>
            {Object.values(node.children).map(child =>
              renderTree(child, onFileClick, path + '/' + child.name, expanded, setExpanded)
            )}
          </div>
        )}
      </div>
    );
  } else {
    return (
      <DirectoryItem $isActive={false} key={path} onClick={() => onFileClick(path)}>
        <DirectoryIcon>📄</DirectoryIcon>
        <DirectoryName>{node.name}</DirectoryName>
      </DirectoryItem>
    );
  }
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ onFileClick, rootPath = '' }) => {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({ '/src': true, '/public': false });
  return (
    <ExplorerContainer>
      {Object.values(fileTree).map((node: FileNode) =>
        renderTree(node, onFileClick, '/' + node.name, expanded, setExpanded)
      )}
    </ExplorerContainer>
  );
}; 