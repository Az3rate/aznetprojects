import React from 'react';
import styled from 'styled-components';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { VscCode } from 'react-icons/vsc';

// Weighted & Anchored Design System - Runtime Playground Style
const ViewerContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ViewerHeader = styled.div`
  background: #0d1117;
  border-bottom: 2px solid #1c2128;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: #e6edf3;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    width: 20px;
    height: 20px;
    color: #58a6ff;
    filter: drop-shadow(0 0 8px rgba(88, 166, 255, 0.4));
  }
`;

const FileName = styled.span`
  color: #58a6ff;
  font-family: 'SF Mono', monospace;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 12px;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #f85149, #da3633);
  color: #ffffff;
  border: 2px solid #da3633;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
  &:hover {
    background: linear-gradient(135deg, #ff6b6b, #f85149);
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

const CodeContainer = styled.div`
  flex: 1;
  overflow: auto;
  background: #0a0c10;
  position: relative;
  
  .token.comment {
    color: #7d8590 !important;
  }
  
  .token.keyword {
    color: #ff7b72 !important;
  }
  
  .token.string {
    color: #a5d6ff !important;
  }
  
  .token.function {
    color: #d2a8ff !important;
  }
  
  .token.number {
    color: #79c0ff !important;
  }
  
  .token.operator {
    color: #ff7b72 !important;
  }
  
  .token.punctuation {
    color: #e6edf3 !important;
  }
  
  .token.tag {
    color: #7ee787 !important;
  }
  
  .token.attr-name {
    color: #79c0ff !important;
  }
  
  .token.attr-value {
    color: #a5d6ff !important;
  }
  
  pre {
    margin: 0 !important;
    padding: 20px !important;
    background: transparent !important;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace !important;
    font-size: 13px !important;
    line-height: 1.5 !important;
  }
  
  code {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace !important;
    background: transparent !important;
  }
  
  .linenumber {
    color: #7d8590 !important;
    background: #161b22 !important;
    border-right: 2px solid #21262d !important;
    padding-right: 16px !important;
    margin-right: 16px !important;
    user-select: none;
    min-width: 40px !important;
    text-align: right !important;
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
    ext === 'scss' ? 'scss' :
    ext === 'md' ? 'markdown' :
    ext === 'html' ? 'html' :
    ext === 'py' ? 'python' :
    'text';

  return (
    <ViewerContainer>
      <ViewerHeader>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SectionTitle>
            <VscCode />
            File Viewer
          </SectionTitle>
          <FileName>{fileName}</FileName>
        </div>
        <CloseButton onClick={onClose}>✕ Close</CloseButton>
      </ViewerHeader>
      
      <CodeContainer>
        <SyntaxHighlighter 
          language={language} 
          style={vscDarkPlus} 
          showLineNumbers 
          wrapLongLines
          customStyle={{
            background: 'transparent',
            padding: '20px',
            margin: 0,
            fontSize: '13px',
            fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace"
          }}
          lineNumberStyle={{
            color: '#7d8590',
            backgroundColor: '#161b22',
            borderRight: '2px solid #21262d',
            paddingRight: '16px',
            marginRight: '16px',
            userSelect: 'none',
            minWidth: '40px',
            textAlign: 'right'
          }}
        >
          {content}
        </SyntaxHighlighter>
      </CodeContainer>
    </ViewerContainer>
  );
}; 