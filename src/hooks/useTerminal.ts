import { useState, useCallback } from 'react';
import { TerminalState, Project, CommandSuggestion } from '../types';
import { TerminalCommands } from '../services/commands';

export const useTerminal = (projects: Project[]) => {
  const [state, setState] = useState<TerminalState>({
    history: [],
    currentDirectory: '~',
    isDetailsPanelOpen: false,
    selectedProject: null
  });

  const [historyIndex, setHistoryIndex] = useState(-1);
  const commands = new TerminalCommands(projects);

  const executeCommand = useCallback((input: string) => {
    const [command, ...args] = input.trim().split(' ');
    const result = commands.execute(command, args);

    setState(prev => ({
      ...prev,
      history: [
        ...prev.history,
        { command: input, output: result.output, type: result.type }
      ],
      currentDirectory: commands.getCurrentDirectory()
    }));

    setHistoryIndex(-1);
  }, [commands]);

  const navigateHistory = useCallback((direction: 'up' | 'down'): string => {
    if (state.history.length === 0) return '';

    let newIndex = historyIndex;
    if (direction === 'up') {
      newIndex = historyIndex === -1 ? state.history.length - 1 : Math.max(0, historyIndex - 1);
    } else {
      newIndex = Math.min(state.history.length - 1, historyIndex + 1);
    }
    setHistoryIndex(newIndex);
    return state.history[newIndex].command;
  }, [state.history, historyIndex]);

  const getCommandSuggestions = useCallback((input: string): CommandSuggestion[] => {
    if (!input.trim()) return [];

    const availableCommands = [
      'help',
      'clear',
      'about',
      'projects',
      'contact',
      'ls',
      'cd',
      'pwd',
      'cat',
      'echo',
      'neofetch',
      'exit'
    ];

    return availableCommands
      .filter(cmd => cmd.startsWith(input.toLowerCase()))
      .map(command => ({ command, score: 1 }));
  }, []);

  const openDetailsPanel = useCallback((project: Project) => {
    setState(prev => ({
      ...prev,
      isDetailsPanelOpen: true,
      selectedProject: project
    }));
  }, []);

  const closeDetailsPanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDetailsPanelOpen: false,
      selectedProject: null
    }));
  }, []);

  return {
    state,
    executeCommand,
    navigateHistory,
    getCommandSuggestions,
    openDetailsPanel,
    closeDetailsPanel
  };
}; 