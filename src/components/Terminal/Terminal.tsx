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
  ClickableText,
  FileCodeBlock
} from './Terminal.styles';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Joyride, { Step } from 'react-joyride';

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
  const endOfTerminalRef = useRef<HTMLDivElement>(null);
  // Create a local instance of TerminalCommands
  const terminalCommands = useRef(new TerminalCommands(projects));
  const [tourOpen, setTourOpen] = useState(false);
  const tourSteps: Step[] = [
    {
      target: '[data-tour="sidebar"]',
      content: (
        <div>
          <b>File Explorer (Sidebar)</b><br/>
          This is the <b>live file explorer</b>. Browse the real project directory, just like a developer would. <br/>
          <ul style={{ margin: '0.5rem 0 0.5rem 1.5rem', padding: 0, listStylePosition: 'inside', textAlign: 'left' }}>
            <li>Click any <b>folder</b> to expand and see its contents.</li>
            <li>Click any <b>file</b> to instantly view its code or content in the details panel.</li>
          </ul>
          <i>Recruiter tip: This is a real file tree, not a mockup!</i>
        </div>
      ),
      disableBeacon: true,
      placement: 'right',
    },
    {
      target: '[data-tour="terminal-input"]',
      content: (
        <div>
          <b>Terminal Input</b><br/>
          This is the <b>interactive terminal</b>. Type or click commands here, just like a real developer.<br/>
          <ul style={{ margin: '0.5rem 0 0.5rem 1.5rem', padding: 0, listStylePosition: 'inside', textAlign: 'left' }}>
            <li>Try <b>ls</b> to list files, <b>cd</b> to change directory, or <b>cat</b> to view file contents.</li>
            <li>Use <b>Tab</b> for autocomplete and <b>Arrow keys</b> for command history.</li>
            <li>Click suggested commands for a quick demo.</li>
          </ul>
          <i>No coding experience required!</i>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="details-panel"]',
      content: (
        <div>
          <b>Details Panel</b><br/>
          This panel displays <b>project overviews, code, images, and architecture diagrams</b>.<br/>
          <ul style={{ margin: '0.5rem 0 0.5rem 1.5rem', padding: 0, listStylePosition: 'inside', textAlign: 'left' }}>
            <li>When you select a project or file, its details appear here.</li>
            <li>See screenshots, flowcharts, and code with syntax highlighting.</li>
          </ul>
          <i>Perfect for technical reviewers and recruiters alike.</i>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="project-d4ut"]',
      content: (
        <div>
          <b>D4UT</b><br/>
          A powerful web-based utility tool for Diablo 4 players, offering advanced build optimization, damage calculations, and item comparison.<br/>
          <i>Click to see a deep-dive overview, features, and code.</i>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="project-lootmanager"]',
      content: (
        <div>
          <b>LootManager</b><br/>
          A comprehensive guild management system for Throne and Liberty, focusing on DKP tracking, raid scheduling, and loot distribution.<br/>
          <i>Click to see a deep-dive overview, features, and code.</i>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="project-raidalert"]',
      content: (
        <div>
          <b>RaidAlert</b><br/>
          A Discord bot and web dashboard for ARK Survival Evolved, providing real-time raid notifications and tribe management.<br/>
          <i>Click to see a deep-dive overview, features, and code.</i>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="quick-menu"]',
      content: (
        <div>
          <b>Quick Menu</b><br/>
          Use these shortcuts for common actions:<br/>
          <ul style={{ margin: '0.5rem 0 0.5rem 1.5rem', padding: 0, listStylePosition: 'inside', textAlign: 'left' }}>
            <li><b>Help</b>: See all available commands.</li>
            <li><b>About</b>: Learn more about this portfolio.</li>
            <li><b>List Files</b>: Instantly list all files in the current directory.</li>
            <li><b>Clear</b>: Clear the terminal output.</li>
          </ul>
          <i>You can restart this tour anytime from here!</i>
        </div>
      ),
      placement: 'bottom',
    },
  ];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (endOfTerminalRef.current) {
      endOfTerminalRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.history]);

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
      <Sidebar data-tour="sidebar">
        <FileExplorer onFileClick={(filePath) => handleCommandClick(`cat ${filePath.replace(/^\//, '')}`)} />
      </Sidebar>
      <TerminalContent>
        <Joyride
          steps={tourSteps}
          run={tourOpen}
          continuous
          showSkipButton
          showProgress
          styles={{
            options: {
              zIndex: 10000,
              primaryColor: '#00ff99',
              backgroundColor: '#181825',
              textColor: '#fff',
              arrowColor: '#181825',
              overlayColor: 'rgba(40, 40, 60, 0.7)',
              spotlightShadow: '0 0 0 2px #00ff99',
              width: 420,
            },
            tooltip: {
              backgroundColor: '#181825',
              color: '#fff',
              fontFamily: 'Fira Code, monospace',
              fontSize: 16,
              border: '2px solid #00ff99',
              boxShadow: '0 0 12px #00ff9955',
              textAlign: 'left',
              padding: '24px',
              width: 420,
              minWidth: 320,
              maxWidth: 480,
              borderRadius: 2,
            },
            buttonNext: {
              backgroundColor: '#00ff99',
              color: '#181825',
              fontWeight: 600,
              borderRadius: 2,
              border: '2px solid #00ff99',
              fontFamily: 'Fira Code, monospace',
            },
            buttonBack: {
              color: '#00ff99',
              fontFamily: 'Fira Code, monospace',
            },
            buttonSkip: {
              color: '#fff',
              background: 'none',
              fontFamily: 'Fira Code, monospace',
            },
            buttonClose: {
              color: '#fff',
              background: 'none',
              fontFamily: 'Fira Code, monospace',
            },
          }}
          callback={data => {
            if (data.status === 'finished' || data.status === 'skipped') setTourOpen(false);
          }}
        />
        <WelcomeMessage
          onCommandClick={handleCommandClick}
          isFirstTime={isFirstTime}
          projects={projects}
          data-tour-project-list
          onStartTour={() => setTourOpen(true)}
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
                <pre style={{ margin: 0, fontFamily: 'inherit', background: 'none', color: 'inherit', whiteSpace: 'pre-wrap' }}>{item.output}</pre>
              </Output>
            ) : null}
          </React.Fragment>
        ))}
        <CommandInput data-tour="terminal-input">
          <Prompt>user@aznet:~$</Prompt>
          <Input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
          />
          {suggestions.length > 0 && (
            <SuggestionBox role="list" aria-label="command suggestions">
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
                  role="listitem"
                  aria-label={suggestion}
                >
                  {suggestion}
                </SuggestionItem>
              ))}
            </SuggestionBox>
          )}
        </CommandInput>
        <div ref={endOfTerminalRef} />
      </TerminalContent>
      <DetailsPanel $isOpen={state.isDetailsPanelOpen} data-tour="details-panel">
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
      <FileCodeBlock>
        <SyntaxHighlighter language={language} style={vscDarkPlus} showLineNumbers wrapLongLines>
          {content}
        </SyntaxHighlighter>
      </FileCodeBlock>
    </div>
  );
}; 