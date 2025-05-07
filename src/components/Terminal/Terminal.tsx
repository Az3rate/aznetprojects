import React, { useState, useRef, useEffect, useCallback } from 'react';
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

export interface TerminalRef {
  startTour: (type: 'recruiter' | 'technical') => void;
}

const TerminalComponent: React.ForwardRefRenderFunction<TerminalRef, TerminalProps> = (props, ref) => {
  const { onOpenWelcome } = props;
  
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
  const [tourOpen, setTourOpen] = useState(false);
  const [tourType, setTourType] = useState<'recruiter' | 'technical'>('recruiter');

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

  const recruiterTourSteps: Step[] = [
    {
      target: 'body',
      content: (
        <div style={{ textAlign: 'left' }}>
          <b>Welcome to the HV Portfolio</b>
          <br /><br />
          This short tour will introduce you to the featured projects and show you how to explore them.
          <br /><br />
          Click <b>Next</b> to continue.
        </div>
      ),
      disableBeacon: true,
      placement: 'center',
    },
    {
      target: '[data-tour="project-list"]',
      content: (
        <div style={{ textAlign: 'left' }}>
          <b>Featured Projects</b>
          <br /><br />
          - Browse a curated list of impactful projects.<br />
          - Each project includes real user feedback and business results.<br />
          - Click a project to see its overview and details.
        </div>
      ),
      disableBeacon: true,
      placement: 'right',
    },
    {
      target: '[data-tour="sidebar"]',
      content: (
        <div style={{ textAlign: 'left' }}>
          <b>Directory Tree</b>
          <br /><br />
          - On the left, you'll find the real codebase structure.<br />
          - Click a folder to expand it.<br />
          - Click a file to view the actual code behind this application.
        </div>
      ),
      disableBeacon: true,
      placement: 'right',
    },
  ];

  const technicalTourSteps: Step[] = [
    {
      target: '[data-tour="sidebar"]',
      content: (
        <div style={{ textAlign: 'left' }}>
          <b>Directory Tree</b>
          <br /><br />
          - This sidebar shows the real file structure from GitHub.<br />
          - Browse all folders and files.<br />
          - Click a file to view its source code.
          <br /><br />
          Navigation is synced with the terminal.
        </div>
      ),
      disableBeacon: true,
      placement: 'right',
    },
    {
      target: '[data-tour="terminal-input"]',
      content: (
        <div style={{ textAlign: 'left' }}>
          <b>Interactive Terminal</b>
          <br /><br />
          - Run commands like <b>ls</b>, <b>cd</b>, <b>cat</b>, and <b>pwd</b>.<br />
          - Use <b>Tab</b> for autocomplete.<br />
          - Use <b>Arrow keys</b> for command history.
          <br /><br />
          The terminal and file explorer are fully integrated.
        </div>
      ),
      disableBeacon: true,
      placement: 'top',
    },
    {
      target: '[data-tour="details-panel"]',
      content: (
        <div style={{ textAlign: 'left' }}>
          <b>Code Viewer</b>
          <br /><br />
          - View syntax-highlighted code for every file.<br />
          - See component structure and state management.<br />
          - Directly inspect how features are implemented.
          <br /><br />
          Click a file or use <b>cat &lt;filename&gt;</b> in the terminal.
        </div>
      ),
      disableBeacon: true,
      placement: 'left',
    },
    {
      target: '[data-tour="project-d4ut"]',
      content: (
        <div style={{ textAlign: 'left' }}>
          <b>How It Works</b>
          <br /><br />
          - Files and folders are fetched live from GitHub.<br />
          - A virtual file system manages navigation and state.<br />
          - React context and hooks keep everything in sync.<br />
          - Terminal commands update the UI and file system in real time.
          <br /><br />
          Example: Type <b>cd src</b> to change directory. The sidebar updates instantly.
        </div>
      ),
      disableBeacon: true,
      placement: 'bottom',
    },
    {
      target: '[data-tour="quick-menu"]',
      content: (
        <div style={{ textAlign: 'left' }}>
          <b>Explore Further</b>
          <br /><br />
          - Try <b>ls</b> in different folders.<br />
          - Use <b>cat</b> to read any file.<br />
          - Open multiple files to see how everything connects.<br />
          - Check the terminal's own code in <b>src/components/Terminal/</b>.
        </div>
      ),
      disableBeacon: true,
      placement: 'bottom',
    },
  ];

  const handleStartTour = (type: 'recruiter' | 'technical') => {
    setTourType(type);
    setTourOpen(true);
  };

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

  const handleCommandClick = useCallback(async (command: string) => {
    const trimmedCommand = command.trim();
    if (trimmedCommand.startsWith('cat ')) {
      const fileName = trimmedCommand.split(' ')[1];
      const project = projects.find(p => p.name.toLowerCase() === fileName.toLowerCase());
      if (project) {
        openDetailsPanel(project);
        addCommandOnly(trimmedCommand);
        setInput('');
        setSuggestions([]);
        return;
      }
      try {
        const result = await commandsRef.current.execute('cat', [fileName]);
        if (result.type === 'success' && typeof result.output === 'string') {
          openFileDetails({ fileName, content: result.output });
          addCommandOnly(trimmedCommand);
        } else {
          await executeCommand(trimmedCommand);
        }
      } catch (error) {
        await executeCommand(trimmedCommand);
      }
      setInput('');
      setSuggestions([]);
      return;
    } else if (trimmedCommand.startsWith('cd ')) {
      const dirPath = trimmedCommand.split(' ')[1];
      try {
        await changeDirectory(dirPath);
        setInput('');
        setSuggestions([]);
      } catch (error) {
        await executeCommand(trimmedCommand);
        setInput('');
        setSuggestions([]);
      }
      return;
    }
    await executeCommand(trimmedCommand);
    setInput('');
    setSuggestions([]);
  }, [openDetailsPanel, addCommandOnly, openFileDetails, executeCommand, changeDirectory, setInput, setSuggestions, projects, commandsRef]);

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

  // Memoize handleFileClick so handleFileClick is also stable
  const handleFileClick = useCallback((filePath: string) => {
    handleCommandClick(`cat ${filePath.startsWith('/') ? filePath.slice(1) : filePath}`);
  }, [handleCommandClick]);

  const handleDirectoryClick = useCallback((dirPath: string) => {
    setDirectory(dirPath);
  }, [setDirectory]);

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

  const handleToggleBackground = useCallback(() => {
    setIsBackgroundMuted((m: boolean) => !m);
    toggleMute();
  }, [toggleMute]);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
  }, []);

  // Featured projects logic
  const featuredProjects = projects.filter(p => p.featured);

  const [featuredCollapsed, setFeaturedCollapsed] = useState(false);

  // Expose startTour method through ref
  React.useImperativeHandle(ref, () => ({
    startTour: (type: 'recruiter' | 'technical') => {
      setTourType(type);
      setTourOpen(true);
    }
  }));

  return (
    <TerminalWrapper $featuredCollapsed={featuredCollapsed}>
      <FeaturedSidebar data-tour="project-list" $collapsed={featuredCollapsed} style={{ position: 'relative' }}>
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
          onVolumeChange={handleVolumeChange}
          onToggleBackground={handleToggleBackground}
          isBackgroundMuted={isBackgroundMuted}
          onOpenWelcome={onOpenWelcome}
          fileTree={fileTree}
        />
      </Sidebar>
      <TerminalContent onClick={handleTerminalClick}>
        <div data-tour="quick-menu" style={{ width: '100%' }} />
        <Joyride
          steps={tourType === 'recruiter' ? recruiterTourSteps : technicalTourSteps}
          run={tourOpen}
          continuous
          showSkipButton={false}
          disableCloseOnEsc={true}
          disableOverlayClose={true}
          showProgress
          styles={{
            options: {
              zIndex: 10000,
              primaryColor: '#00ff99',
              backgroundColor: '#181825',
              textColor: '#fff',
              arrowColor: '#181825',
              overlayColor: 'rgba(10, 10, 20, 0.92)',
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
              display: 'none',
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

export const Terminal = React.forwardRef(TerminalComponent);