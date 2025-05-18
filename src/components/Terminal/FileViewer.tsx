import React from 'react';
import styled from 'styled-components';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileCodeBlock } from './Terminal.styles';

const ViewerContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FileName = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const CloseButton = styled.button`
  background: none;
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  cursor: pointer;
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  transition: ${({ theme }) => theme.effects.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
  }
`;

interface FileViewerProps {
  fileName: string;
  content: string;
  onClose: () => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({ fileName, content, onClose }) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const language =
    ext === 'js' ? 'javascript' :
    ext === 'ts' ? 'typescript' :
    ext === 'tsx' ? 'tsx' :
    ext === 'json' ? 'json' :
    ext === 'css' ? 'css' :
    ext === 'md' ? 'markdown' :
    'text';

  return (
    <ViewerContainer>
      <Header>
        <FileName>{fileName}</FileName>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </Header>
      <FileCodeBlock>
        <SyntaxHighlighter language={language} style={vscDarkPlus} showLineNumbers wrapLongLines>
          {content}
        </SyntaxHighlighter>
      </FileCodeBlock>
    </ViewerContainer>
  );
}; 