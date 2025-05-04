import React, { useState, useRef, useEffect } from 'react';
import { useTerminal } from '../../hooks/useTerminal';
import { testProjects } from '../../data/testProjects';
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        if (selectedSuggestion >= 0 && selectedSuggestion < suggestions.length) {
          const selectedCommand = suggestions[selectedSuggestion];
          executeCommand(selectedCommand);
          setInput('');
          setSuggestions([]);
          setSelectedSuggestion(-1);
        } else {
          executeCommand(input);
          setInput('');
          setSuggestions([]);
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
        {state.history.map((item, index) => (
          <React.Fragment key={index}>
            <CommandLine>
              <Prompt>user@aznet:~$</Prompt>
              {item.command}
            </CommandLine>
            <Output type={item.type}>{item.output}</Output>
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
      <DetailsPanel $isOpen={state.isDetailsPanelOpen} />
    </TerminalWrapper>
  );
}; 