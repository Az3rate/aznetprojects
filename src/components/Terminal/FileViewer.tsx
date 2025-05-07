import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileCodeBlock } from './Terminal.styles';

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
    <div style={{ padding: '1rem', color: '#fff', fontFamily: 'Fira Mono, monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 600 }}>{fileName}</span>
        <button onClick={onClose} style={{ background: 'none', color: '#fff', border: '1px solid #444', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>Close</button>
      </div>
      <FileCodeBlock>
        <SyntaxHighlighter language={language} style={vscDarkPlus} showLineNumbers wrapLongLines>
          {content}
        </SyntaxHighlighter>
      </FileCodeBlock>
    </div>
  );
}; 