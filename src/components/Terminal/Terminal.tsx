import React, { useState, useRef, useEffect } from 'react';
import { useTerminal } from '../../hooks/useTerminal';
import { projects } from '../../data/projects';
import { WelcomeMessage } from './WelcomeMessage';
import { ProjectDetails } from './ProjectDetails';
import { FileExplorer } from './FileExplorer';
import { Project } from '../../types';
import { TerminalCommands } from '../../services/commands';
import {
  TerminalWrapper,
  Sidebar,
  TerminalContent,
  CommandLine,
  Prompt,
  Input,
  Output,
  CommandInput,
  CommandOutput,
  DetailsPanel,
  SuggestionBox,
  SuggestionItem,
  ClickableText
} from './Terminal.styles';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const Terminal: React.FC = () => {
  const {
    state,
    executeCommand,
    navigateHistory,
    getCommandSuggestions,
    openDetailsPanel,
    closeDetailsPanel,
    addCommandOnly
  } = useTerminal(projects);

  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [isFirstTime, setIsFirstTime] = useState(() => {
    const visited = localStorage.getItem('aznet_terminal_visited');
    if (!visited) {
      localStorage.setItem('aznet_terminal_visited', 'true');
      return true;
    }
    return false;
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Create a local instance of TerminalCommands
  const terminalCommands = useRef(new TerminalCommands(projects));

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value.trim()) {
      const newSuggestions = getCommandSuggestions(value).map(s => s.command);
      setSuggestions(newSuggestions);
      setSelectedSuggestion(-1);
    } else {
      setSuggestions([]);
    }
  };

  const handleCommandClick = (command: string) => {
    const trimmedCommand = command.trim();
    
    if (trimmedCommand.startsWith('cat ')) {
      const fileName = trimmedCommand.split(' ')[1];
      // Check if it's a project name first
      const project = projects.find(p => p.name.toLowerCase() === fileName.toLowerCase());
      if (project) {
        setSelectedProject(project);
        setSelectedFileContent(null);
        setSelectedFileName(null);
        openDetailsPanel(project);
        // Add only the command to history
        addCommandOnly(trimmedCommand);
        setInput('');
        setSuggestions([]);
        return;
      }
      // Execute the cat command locally to get the file content
      try {
        const result = terminalCommands.current.execute('cat', [fileName]);
        if (result.type === 'success' && typeof result.output === 'string') {
          setSelectedFileContent(result.output);
          setSelectedFileName(fileName);
          setSelectedProject(null);
          openDetailsPanel({ name: fileName } as any);
          // Add only the command to history
          addCommandOnly(trimmedCommand);
        } else {
          // If error, use the normal executeCommand to show the error
          executeCommand(trimmedCommand);
        }
      } catch (error) {
        // Handle any errors
        executeCommand(trimmedCommand);
      }
      setInput('');
      setSuggestions([]);
      return;
    }
    // Execute the command normally for all other cases
    executeCommand(trimmedCommand);
    setInput('');
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        if (selectedSuggestion >= 0 && selectedSuggestion < suggestions.length) {
          const selectedCommand = suggestions[selectedSuggestion];
          handleCommandClick(selectedCommand);
        } else {
          handleCommandClick(input);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (suggestions.length > 0) {
          setSelectedSuggestion(prev =>
            prev <= 0 ? suggestions.length - 1 : prev - 1
          );
        } else {
          setInput(navigateHistory('up'));
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (suggestions.length > 0) {
          setSelectedSuggestion(prev =>
            prev >= suggestions.length - 1 ? 0 : prev + 1
          );
        } else {
          setInput(navigateHistory('down'));
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (suggestions.length > 0) {
          setInput(suggestions[0]);
          setSuggestions([]);
          setSelectedSuggestion(-1);
        }
        break;
      case 'Escape':
        setSuggestions([]);
        setSelectedSuggestion(-1);
        break;
    }
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
    setSelectedFileContent(null);
    setSelectedFileName(null);
    closeDetailsPanel();
  };

  // Only show history after the last clear marker
  const getVisibleHistory = () => {
    const lastClearIndex = state.history.map(h => h.type).lastIndexOf('clear');
    return lastClearIndex >= 0 ? state.history.slice(lastClearIndex + 1) : state.history;
  };

  return (
    <TerminalWrapper>
      <Sidebar>
        <FileExplorer onFileClick={(filePath) => handleCommandClick(`cat ${filePath.replace(/^\//, '')}`)} />
      </Sidebar>
      <TerminalContent>
        <WelcomeMessage
          onCommandClick={handleCommandClick}
          isFirstTime={isFirstTime}
          projects={projects}
        />
        {getVisibleHistory().map((item, index) => (
          <React.Fragment key={index}>
            <CommandLine>
              <Prompt>user@aznet:~$</Prompt>
              {item.command}
            </CommandLine>
            {typeof item.output === 'object' && item.output !== null && 'projects' in item.output ? (
              <Output type="info">
                {(item.output as { projects: Project[] }).projects.map((project: Project) => (
                  <div key={project.name}>
                    <ClickableText
                      onClick={() => handleCommandClick(`cat ${project.name.toLowerCase()}`)}
                      style={{ cursor: 'pointer', color: '#a78bfa', fontWeight: 600 }}
                    >
                      {project.name}
                    </ClickableText>
                    {': '}{project.description}
                  </div>
                ))}
              </Output>
            ) : typeof item.output === 'string' ? (
              <Output type={item.type === 'project-list' || item.type === 'welcome' || item.type === 'clear' ? 'info' : item.type as 'success' | 'error' | 'info'}>
                {item.output}
              </Output>
            ) : null}
          </React.Fragment>
        ))}
        <CommandInput>
          <Prompt>user@aznet:~$</Prompt>
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
          />
          {suggestions.length > 0 && (
            <SuggestionBox>
              {suggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={suggestion}
                  $isSelected={index === selectedSuggestion}
                  onClick={() => {
                    setInput(suggestion);
                    setSuggestions([]);
                    setSelectedSuggestion(-1);
                    inputRef.current?.focus();
                  }}
                >
                  {suggestion}
                </SuggestionItem>
              ))}
            </SuggestionBox>
          )}
        </CommandInput>
      </TerminalContent>
      <DetailsPanel $isOpen={state.isDetailsPanelOpen}>
        {selectedProject && (
          <ProjectDetails
            project={selectedProject}
            onClose={handleCloseProject}
          />
        )}
        {selectedFileContent && selectedFileName && !selectedProject && (
          <FileDetails
            fileName={selectedFileName}
            content={selectedFileContent}
            onClose={handleCloseProject}
          />
        )}
      </DetailsPanel>
    </TerminalWrapper>
  );
};

// FileDetails component for file content display
const FileDetails: React.FC<{ fileName: string; content: string; onClose: () => void }> = ({ fileName, content, onClose }) => {
  // Simple extension check for syntax highlighting
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
      <div style={{ maxHeight: 500, overflowY: 'auto', background: '#1e1e1e', borderRadius: 4, padding: 8 }}>
        <SyntaxHighlighter language={language} style={vscDarkPlus} showLineNumbers wrapLongLines>
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}; 