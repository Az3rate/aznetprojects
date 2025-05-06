import React, { useState, useRef, useEffect } from 'react';
import { useTerminal } from '../../hooks/useTerminal';
import { useTypingSound } from '../../hooks/useTypingSound';
import { projects } from '../../data/projects';
import { ProjectDetails } from './ProjectDetails';
import { FileExplorer } from './FileExplorer';
import { FileViewer } from './FileViewer';
import { Project } from '../../types';
import type { FileDetails } from '../../types';
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
  CommandSpan,
  PathSpan,
  ArgSpan,
  ErrorSpan,
  DirSpan,
  FileSpan,
  BlinkingCursor,
  FeaturedSidebar
} from './Terminal.styles';
import Joyride, { Step } from 'react-joyride';
import { useBackgroundAudio } from '../../hooks/useBackgroundAudio';
import { useDirectory } from '../../context/DirectoryContext';

function formatPromptPath(path: string) {
  if (!path || path === '~' || path === '/' || path === '') return '/';
  if (path.startsWith('/')) return path;
  return '/' + path;
}

function highlightInput(input: string, knownCommands: string[], lastError: boolean) {
  if (!input) return <><BlinkingCursor>&#9608;</BlinkingCursor></>;
  const [cmd, ...args] = input.split(' ');
  const isKnown = knownCommands.includes(cmd);
  return (
    <>
      <CommandSpan>{cmd}</CommandSpan>
      {args.map((arg, i) => {
        if (arg.startsWith('/')) {
          return <PathSpan key={i}> {arg}</PathSpan>;
        }
        return <ArgSpan key={i}> {arg}</ArgSpan>;
      })}
      <BlinkingCursor>&#9608;</BlinkingCursor>
      {!isKnown && cmd && <ErrorSpan> ← unknown command</ErrorSpan>}
      {lastError && <ErrorSpan> ← error</ErrorSpan>}
    </>
  );
}

interface TerminalProps {
  onOpenWelcome: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onOpenWelcome }) => {
  const {
    state,
    executeCommand,
    navigateHistory,
    getCommandSuggestions,
    openDetailsPanel,
    openFileDetails,
    closeDetailsPanel,
    addCommandOnly,
    changeDirectory,
    commandsRef
  } = useTerminal(projects);

  const {
    vfs,
    currentDirectory,
    setDirectory,
    fileTree,
    refreshTree
  } = useDirectory();

  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('terminal_volume');
    return savedVolume ? parseFloat(savedVolume) : 0.15;
  });

  const playTypingSound = useTypingSound(volume);
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
  const inputRef = useRef<HTMLInputElement>(null);
  const endOfTerminalRef = useRef<HTMLDivElement>(null);
  // Create a local instance of TerminalCommands
  const terminalCommands = useRef(new TerminalCommands(projects));
  const [tourOpen, setTourOpen] = useState(false);
  
  const [isBackgroundMuted, setIsBackgroundMuted] = useState(() => {
    const savedMute = localStorage.getItem('terminal_background_muted');
    return savedMute ? JSON.parse(savedMute) : false;
  });

  const { toggleMute } = useBackgroundAudio(volume);

  // Save volume to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('terminal_volume', volume.toString());
  }, [volume]);

  // Save background mute state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('terminal_background_muted', JSON.stringify(isBackgroundMuted));
  }, [isBackgroundMuted]);

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

  const knownCommands = [
    'help', 'clear', 'about', 'projects', 'contact', 'ls', 'cd', 'pwd', 'cat', 'echo', 'neofetch', 'exit'
  ];
  // Track last command status for prompt color
  const lastStatus = state.history.length > 0 ? state.history[state.history.length - 1].type : 'default';

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
    playTypingSound();
    if (value.trim()) {
      const newSuggestions = getCommandSuggestions(value).map(s => s.command);
      setSuggestions(newSuggestions);
      setSelectedSuggestion(-1);
    } else {
      setSuggestions([]);
    }
  };

  const handleCommandClick = async (command: string) => {
    const trimmedCommand = command.trim();
    
    if (trimmedCommand.startsWith('cat ')) {
      const fileName = trimmedCommand.split(' ')[1];
      // Check if it's a project name first
      const project = projects.find(p => p.name.toLowerCase() === fileName.toLowerCase());
      if (project) {
        // Use the openDetailsPanel from the hook
        openDetailsPanel(project);
        // Add only the command to history
        addCommandOnly(trimmedCommand);
        setInput('');
        setSuggestions([]);
        return;
      }
      // Execute the cat command locally to get the file content
      try {
        const result = await terminalCommands.current.execute('cat', [fileName]);
        if (result.type === 'success' && typeof result.output === 'string') {
          // Use the openFileDetails from the hook
          openFileDetails({
            fileName: fileName,
            content: result.output
          });
          // Add only the command to history
          addCommandOnly(trimmedCommand);
        } else {
          // If error, use the normal executeCommand to show the error
          await executeCommand(trimmedCommand);
        }
      } catch (error) {
        // Handle any errors
        await executeCommand(trimmedCommand);
      }
      setInput('');
      setSuggestions([]);
      return;
    } else if (trimmedCommand.startsWith('cd ')) {
      // Handle directory changes directly
      const dirPath = trimmedCommand.split(' ')[1];
      try {
        await changeDirectory(dirPath);
        setInput('');
        setSuggestions([]);
      } catch (error) {
        // Fall back to normal command execution if there's an error
        await executeCommand(trimmedCommand);
        setInput('');
        setSuggestions([]);
      }
      return;
    }
    // Execute the command normally for all other cases
    await executeCommand(trimmedCommand);
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

  // Handle file click from FileExplorer
  const handleFileClick = (filePath: string) => {
    // Pass the full file path to the cat command
    handleCommandClick(`cat ${filePath.startsWith('/') ? filePath.slice(1) : filePath}`);
  };

  // Handle directory click from FileExplorer
  const handleDirectoryClick = (dirPath: string) => {
    setDirectory(dirPath);
  };

  // Only show history after the last clear marker
  const getVisibleHistory = () => {
    const lastClearIndex = state.history.map(h => h.type).lastIndexOf('clear');
    return lastClearIndex >= 0 ? state.history.slice(lastClearIndex + 1) : state.history;
  };

  const handleTerminalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if ([
      'a', 'button', 'input', 'textarea', 'select', 'svg', 'path', 'pre', 'code'
    ].includes(tag)) return;
    if ((e.target as HTMLElement).getAttribute('tabindex')) return;
    inputRef.current?.focus();
  };

  const handleToggleBackground = () => {
    setIsBackgroundMuted(!isBackgroundMuted);
    toggleMute();
  };

  // Featured projects logic
  const featuredProjects = projects.filter(p => p.featured);

  const [featuredCollapsed, setFeaturedCollapsed] = useState(false);

  return (
    <TerminalWrapper $featuredCollapsed={featuredCollapsed}>
      <FeaturedSidebar $collapsed={featuredCollapsed} style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: featuredCollapsed ? 0 : '1.5rem', height: featuredCollapsed ? '100%' : undefined }}>
          {!featuredCollapsed && (
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.01em' }}>Featured Projects</span>
          )}
          <button
            aria-label={featuredCollapsed ? 'Expand featured projects' : 'Collapse featured projects'}
            onClick={() => setFeaturedCollapsed(c => !c)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 18,
              transition: 'transform 0.2s',
              marginLeft: 8,
              padding: 0,
              lineHeight: 1,
              alignSelf: featuredCollapsed ? 'center' : undefined,
            }}
          >
            {featuredCollapsed ? '▶' : '◀'}
          </button>
        </div>
        {!featuredCollapsed && featuredProjects.map(project => (
          <div
            key={project.name}
            style={{
              background: 'var(--background-primary, #181825)',
              color: 'var(--text-primary, #cdd6f4)',
              border: '1px solid var(--border, #45475a)',
              marginBottom: 18,
              padding: '1rem 0.75rem',
              cursor: 'pointer',
              fontWeight: 600,
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
            onClick={() => openDetailsPanel(project)}
          >
            <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.name}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 400, flex: 1, overflowY: 'auto', minHeight: 0 }}>{project.description}</div>
          </div>
        ))}
      </FeaturedSidebar>
      <Sidebar data-tour="sidebar">
        <FileExplorer 
          onFileClick={handleFileClick} 
          onDirectoryClick={handleDirectoryClick}
          currentDirectory={currentDirectory}
          volume={volume}
          onVolumeChange={setVolume}
          onToggleBackground={handleToggleBackground}
          isBackgroundMuted={isBackgroundMuted}
          onOpenWelcome={onOpenWelcome}
          fileTree={fileTree}
        />
      </Sidebar>
      <TerminalContent onClick={handleTerminalClick}>
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
        {getVisibleHistory().map((item, index) => (
          <React.Fragment key={index}>
            <CommandLine>
              <Prompt $status={item.type === 'success' ? 'success' : item.type === 'error' ? 'error' : 'default'}>
                user@aznet:{formatPromptPath(String(item.currentDirectory))}$
              </Prompt>
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
                {item.command === 'ls' ? (
                  <pre style={{ margin: 0, fontFamily: 'inherit', background: 'none', color: 'inherit', whiteSpace: 'pre-wrap' }}>
                    {item.output.split('\n').map((line, i) => {
                      // d or - at start, then size, then name
                      const match = line.match(/^([d-])\s+\d+\s+(.+)$/);
                      if (match) {
                        const [, type, name] = match;
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ minWidth: 20 }}>{type}</span>
                            <span style={{ minWidth: 40, textAlign: 'right', marginRight: 8 }}>{line.split(/\s+/)[1]}</span>
                            {type === 'd' ? <DirSpan>{name}</DirSpan> : <FileSpan>{name}</FileSpan>}
                          </div>
                        );
                      }
                      return <div key={i}>{line}</div>;
                    })}
                  </pre>
                ) : (
                  <pre style={{ margin: 0, fontFamily: 'inherit', background: 'none', color: 'inherit', whiteSpace: 'pre-wrap' }}>{item.output}</pre>
                )}
              </Output>
            ) : null}
          </React.Fragment>
        ))}
        <CommandInput data-tour="terminal-input">
          <Prompt $status="default">
            user@aznet:{formatPromptPath(currentDirectory)}$
          </Prompt>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <span style={{ pointerEvents: 'none', minWidth: '2px', minHeight: '1em', display: 'inline-block' }}>
              {highlightInput(input, knownCommands, lastStatus === 'error')}
            </span>
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'text'
              }}
              tabIndex={0}
              autoFocus
            />
          </div>
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
        {state.selectedProject && (
          <ProjectDetails
            project={state.selectedProject}
            onClose={closeDetailsPanel}
          />
        )}
        {state.selectedFile && (
          <FileViewer
            fileName={state.selectedFile.fileName}
            content={state.selectedFile.content}
            onClose={closeDetailsPanel}
          />
        )}
      </DetailsPanel>
    </TerminalWrapper>
  );
};