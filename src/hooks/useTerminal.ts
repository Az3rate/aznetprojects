import { useState, useCallback, useRef } from 'react';
import { TerminalState, Project, CommandSuggestion, FileDetails } from '../types';
import { TerminalCommands } from '../services/commands';
import { projects } from '../data/projects';
import { useDirectory } from '../context/DirectoryContext';

export const useTerminal = (projects: Project[]) => {
  const { currentDirectory, setDirectory, vfs } = useDirectory();
  const [state, setState] = useState<Omit<TerminalState, 'currentDirectory'>>({
    history: [],
    isDetailsPanelOpen: false,
    selectedProject: null,
    selectedFile: null
  });

  const [historyIndex, setHistoryIndex] = useState(-1);
  const commandsRef = useRef<TerminalCommands>(new TerminalCommands(projects, vfs));

  const executeCommand = useCallback(async (input: string) => {
    const [command, ...args] = input.trim().split(' ');
    const result = await commandsRef.current.execute(command, args);
    setState(prev => ({
      ...prev,
      history: [
        ...prev.history,
        { 
          command: input, 
          output: result.output, 
          type: result.type,
          currentDirectory: currentDirectory
        }
      ]
    }));
    if (command === 'cat' && args.length > 0 && result.type === 'success') {
      const project = projects.find(p => p.name.toLowerCase() === args[0].toLowerCase());
      if (project) {
        openDetailsPanel(project);
      } else {
        openFileDetails({
          fileName: args[0],
          content: result.output as string
        });
      }
    }
    setHistoryIndex(-1);
  }, [projects, currentDirectory, vfs]);

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
      'exit',
      'ai'
    ];
    return availableCommands
      .filter(cmd => cmd.startsWith(input.toLowerCase()))
      .map(command => ({ command, score: 1 }));
  }, []);

  const addCommandOnly = useCallback((command: string) => {
    setState(prev => ({
      ...prev,
      history: [
        ...prev.history,
        { 
          command, 
          output: '', 
          type: 'success',
          currentDirectory: currentDirectory
        }
      ]
    }));
  }, [currentDirectory]);

  const changeDirectory = useCallback(async (path: string) => {
    await setDirectory(path);
    addCommandOnly(`cd ${path}`);
  }, [setDirectory, addCommandOnly]);

  const openDetailsPanel = useCallback((project: Project) => {
    setState(prev => ({
      ...prev,
      isDetailsPanelOpen: true,
      selectedProject: project,
      selectedFile: null
    }));
  }, []);

  const openFileDetails = useCallback((file: FileDetails) => {
    setState(prev => ({
      ...prev,
      isDetailsPanelOpen: true,
      selectedFile: file,
      selectedProject: null
    }));
  }, []);

  const closeDetailsPanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDetailsPanelOpen: false,
      selectedProject: null,
      selectedFile: null
    }));
  }, []);

  const removeLastHistoryEntry = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: prev.history.slice(0, -1)
    }));
  }, []);

  const replaceLastHistoryEntry = useCallback((output: string) => {
    setState(prev => {
      if (prev.history.length === 0) return prev;
      const newHistory = prev.history.slice();
      newHistory[newHistory.length - 1] = {
        ...newHistory[newHistory.length - 1],
        output
      };
      return {
        ...prev,
        history: newHistory
      };
    });
  }, []);

  return {
    state: { ...state, currentDirectory },
    executeCommand,
    navigateHistory,
    getCommandSuggestions,
    openDetailsPanel,
    openFileDetails,
    closeDetailsPanel,
    addCommandOnly,
    changeDirectory,
    commandsRef,
    removeLastHistoryEntry,
    replaceLastHistoryEntry
  };
};