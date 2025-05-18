import React, { useRef, useEffect, useCallback } from 'react';
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
  FeaturedSidebar,
  ResizerBar
} from './Terminal.styles';
import Joyride, { Step } from 'react-joyride';
import { useBackgroundAudio } from '../../hooks/useBackgroundAudio';
import { useDirectory } from '../../context/DirectoryContext';
import { SwirlBackground } from './SwirlBackground';
import { useTheme } from 'styled-components';
import { TerminalLayout } from './TerminalLayout';
import { useTerminalContext } from '../../context/TerminalContext';
import styled from 'styled-components';

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
  onTourComplete?: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
}

export interface TerminalRef {
  startTour: (type: 'recruiter' | 'technical') => void;
}

const TerminalComponent: React.ForwardRefRenderFunction<TerminalRef, TerminalProps> = (props, ref) => {
  const { onOpenWelcome, onTourComplete, volume, isMuted, onVolumeChange, onToggleMute } = props;
  
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
    commandsRef,
    input,
    setInput,
    suggestions,
    setSuggestions,
    selectedSuggestion,
    setSelectedSuggestion,
    tourOpen,
    setTourOpen,
    tourType,
    setTourType,
    detailsPanelWidth,
    setDetailsPanelWidth
  } = useTerminalContext();

  const {
    vfs,
    currentDirectory,
    setDirectory,
    fileTree,
    refreshTree
  } = useDirectory();

  const playTypingSound = useTypingSound(volume);
  const inputRef = useRef<HTMLInputElement>(null);
  const endOfTerminalRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const detailsPanelRef = useRef<HTMLDivElement>(null);
  const dragData = useRef<{right: number, startX: number, startWidth: number} | null>(null);

  const { toggleMute } = useBackgroundAudio(isMuted ? 0 : volume);

  const theme = useTheme();

  const knownCommands = [
    'help', 'clear', 'about', 'projects', 'contact', 'ls', 'cd', 'pwd', 'cat', 'echo', 'neofetch', 'exit'
  ];
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
          setSelectedSuggestion((prev: number) =>
            prev <= 0 ? suggestions.length - 1 : prev - 1
          );
        } else {
          setInput(navigateHistory('up'));
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (suggestions.length > 0) {
          setSelectedSuggestion((prev: number) =>
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

  const handleFileClick = useCallback((filePath: string) => {
    handleCommandClick(`cat ${filePath.startsWith('/') ? filePath.slice(1) : filePath}`);
  }, [handleCommandClick]);

  const handleDirectoryClick = useCallback((dirPath: string) => {
    setDirectory(dirPath);
  }, [setDirectory]);

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
    onToggleMute();
    toggleMute();
  }, [onToggleMute, toggleMute]);

  const handleVolumeChange = useCallback((v: number) => {
    onVolumeChange(v);
  }, [onVolumeChange]);

  const featuredProjects = projects.filter(p => p.featured);

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

  const handleTourCallback = (data: any) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      setTourOpen(false);
      onTourComplete?.();
    }
  };

  // Add interface for $collapsed prop
  interface FeaturedHeaderProps {
    $collapsed: boolean;
  }

  const FeaturedHeader = styled.div<FeaturedHeaderProps>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${({ $collapsed, theme }) => $collapsed ? 0 : theme.spacing.lg};
    height: ${({ $collapsed }) => $collapsed ? '100%' : 'auto'};
  `;

  const FeaturedTitle = styled.span`
    font-weight: 700;
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    color: ${({ theme }) => theme.colors.text.primary};
    letter-spacing: -0.01em;
  `;

  const CollapseButton = styled.button`
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.text.primary};
    cursor: pointer;
    font-size: 18px;
    transition: transform 0.2s;
    margin-left: ${({ theme }) => theme.spacing.xs};
    padding: 0;
    line-height: 1;
    align-self: center;
  `;

  const ProjectCard = styled.div`
    background: ${({ theme }) => theme.colors.background.primary}CC;
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid ${({ theme }) => theme.colors.border};
    margin-bottom: 18px;
    padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.sm}`};
    cursor: pointer;
    font-weight: 600;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    box-sizing: border-box;
    overflow: hidden;
  `;

  const ProjectName = styled.div`
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-weight: 700;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;

  const ProjectDescription = styled.div`
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: 400;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  `;

  const QuickMenuDiv = styled.div`
    width: 100%;
  `;

  const StyledPre = styled.pre`
    margin: 0;
    font-family: inherit;
    background: none;
    color: inherit;
    white-space: pre-wrap;
  `;

  const OutputRow = styled.div`
    display: flex;
    align-items: center;
  `;

  const OutputTypeSpan = styled.span`
    min-width: 20px;
  `;

  const OutputNameSpan = styled.span`
    min-width: 40px;
    text-align: right;
    margin-right: 8px;
  `;

  const ClickableProjectText = styled(ClickableText)`
    cursor: pointer;
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 600;
  `;

  const InputOverlay = styled.input`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: text;
  `;

  const HighlightInputSpan = styled.span`
    pointer-events: none;
    min-width: 2px;
    min-height: 1em;
    display: inline-block;
  `;

  return (
    <TerminalLayout
      sidebar={
      <Sidebar data-tour="sidebar">
        <FileExplorer 
          onFileClick={handleFileClick} 
          onDirectoryClick={handleDirectoryClick}
          currentDirectory={currentDirectory}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onToggleBackground={handleToggleBackground}
            isBackgroundMuted={isMuted}
          onOpenWelcome={onOpenWelcome}
          fileTree={fileTree}
        />
      </Sidebar>
      }
      mainContent={
      <TerminalContent onClick={handleTerminalClick}>
          <QuickMenuDiv data-tour="quick-menu" />
        <Joyride
          steps={tourType === 'recruiter' ? recruiterTourSteps : technicalTourSteps}
          run={tourOpen}
          continuous
            showSkipButton
            callback={handleTourCallback}
          styles={{
            options: {
                primaryColor: theme.colors.accent,
              backgroundColor: theme.colors.background.primary,
              textColor: theme.colors.text.primary,
              arrowColor: theme.colors.background.primary,
              }
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
                      <ClickableProjectText
                      onClick={() => handleCommandClick(`cat ${project.name.toLowerCase()}`)}
                    >
                      {project.name}
                      </ClickableProjectText>
                    {': '}{project.description}
                  </div>
                ))}
              </Output>
            ) : typeof item.output === 'string' ? (
              <Output type={item.type === 'project-list' || item.type === 'welcome' || item.type === 'clear' ? 'info' : item.type as 'success' | 'error' | 'info'}>
                {item.command === 'ls' ? (
                    <StyledPre>
                    {item.output.split('\n').map((line, i) => {
                      const match = line.match(/^([d-])\s+\d+\s+(.+)$/);
                      if (match) {
                        const [, type, name] = match;
                        return (
                            <OutputRow key={i}>
                              <OutputTypeSpan>{type}</OutputTypeSpan>
                              <OutputNameSpan>{line.split(/\s+/)[1]}</OutputNameSpan>
                            {type === 'd' ? <DirSpan>{name}</DirSpan> : <FileSpan>{name}</FileSpan>}
                            </OutputRow>
                        );
                      }
                      return <div key={i}>{line}</div>;
                    })}
                    </StyledPre>
                ) : (
                    <StyledPre>{item.output}</StyledPre>
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
              <HighlightInputSpan>
              {highlightInput(input, knownCommands, lastStatus === 'error')}
              </HighlightInputSpan>
              <InputOverlay
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
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
      }
      detailsPanel={state.isDetailsPanelOpen ? (
        <>
        <ResizerBar
          ref={resizerRef}
          onMouseDown={e => {
            e.preventDefault();
            isResizing.current = true;
            if (detailsPanelRef.current) {
              const rect = detailsPanelRef.current.getBoundingClientRect();
              dragData.current = {
                right: rect.right,
                startX: e.clientX,
                startWidth: rect.width
              };
            }
            document.body.style.cursor = 'ew-resize';
          }}
        />
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
        </>
      ) : null}
      isDetailsOpen={state.isDetailsPanelOpen}
      detailsWidth={detailsPanelWidth}
    />
  );
};

export const Terminal = React.forwardRef(TerminalComponent);