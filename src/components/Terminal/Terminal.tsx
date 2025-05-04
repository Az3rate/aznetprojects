import React, { useState, useRef, useEffect } from 'react';
import { useTerminal } from '../../hooks/useTerminal';
import { testProjects } from '../../data/testProjects';
import { WelcomeMessage } from './WelcomeMessage';
import { ProjectDetails } from './ProjectDetails';
import { Project } from '../../types';
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
  DirectoryTree,
  DirectoryItem,
  DirectoryIcon,
  DirectoryName,
  SuggestionBox,
  SuggestionItem,
  ClickableText
} from './Terminal.styles';

function isProjectListOutput(output: string | { type: 'project-list'; projects: Project[] }): output is { type: 'project-list'; projects: Project[] } {
  return typeof output === 'object' && output !== null && (output as any).type === 'project-list';
}

export const Terminal: React.FC = () => {
  const {
    state,
    executeCommand,
    navigateHistory,
    getCommandSuggestions,
    openDetailsPanel,
    closeDetailsPanel
  } = useTerminal(testProjects);

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
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (command.startsWith('cat ')) {
      const projectName = command.split(' ')[1];
      const project = testProjects.find(p => p.name.toLowerCase() === projectName);
      if (project) {
        setSelectedProject(project);
        openDetailsPanel(project);
      }
    } else {
      executeCommand(command);
      setInput('');
      setSuggestions([]);
    }
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
    closeDetailsPanel();
  };

  return (
    <TerminalWrapper>
      <Sidebar>
        <DirectoryTree>
          <DirectoryItem $isActive={state.currentDirectory === '~'}>
            <DirectoryIcon>📁</DirectoryIcon>
            <DirectoryName>projects</DirectoryName>
          </DirectoryItem>
          <DirectoryItem $isActive={false}>
            <DirectoryIcon>📁</DirectoryIcon>
            <DirectoryName>about.txt</DirectoryName>
          </DirectoryItem>
        </DirectoryTree>
      </Sidebar>
      <TerminalContent>
        {state.history.length === 0 ? (
          <WelcomeMessage
            onCommandClick={handleCommandClick}
            isFirstTime={isFirstTime}
            projects={testProjects}
          />
        ) : (
          state.history.map((item, index) => (
            <React.Fragment key={index}>
              <CommandLine>
                <Prompt>user@aznet:~$</Prompt>
                {item.command}
              </CommandLine>
              {isProjectListOutput(item.output) ? (
                <Output type="info">
                  {item.output.projects.map((project: Project) => (
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
              ) : (
                <Output type={item.type === 'project-list' ? 'info' : item.type}>{item.output}</Output>
              )}
            </React.Fragment>
          ))
        )}
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
      </DetailsPanel>
    </TerminalWrapper>
  );
}; 