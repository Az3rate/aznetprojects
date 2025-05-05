import { useState, useCallback, useRef } from 'react';
import { TerminalState, Project, CommandSuggestion, FileDetails } from '../types';
import { TerminalCommands } from '../services/commands';
import { projects } from '../data/projects';

export const useTerminal = (projects: Project[]) => {
  const [state, setState] = useState<TerminalState>({
    history: [],
    currentDirectory: '~',
    isDetailsPanelOpen: false,
    selectedProject: null,
    selectedFile: null
  });

  const [historyIndex, setHistoryIndex] = useState(-1);
  const commandsRef = useRef<TerminalCommands>(new TerminalCommands(projects));

  const executeCommand = useCallback((input: string) => {
    const [command, ...args] = input.trim().split(' ');
    const result = commandsRef.current.execute(command, args);

    // Get the new directory path after command execution
    const newDirectory = commandsRef.current.getCurrentDirectory();

    setState(prev => ({
      ...prev,
      history: [
        ...prev.history,
        { 
          command: input, 
          output: result.output, 
          type: result.type,
          currentDirectory: prev.currentDirectory
        }
      ],
      currentDirectory: newDirectory  // Update current directory
    }));

    // Handle cat command for file viewing
    if (command === 'cat' && args.length > 0 && result.type === 'success') {
      // Find if we're trying to open a project
      const project = projects.find(p => p.name.toLowerCase() === args[0].toLowerCase());
      
      if (project) {
        openDetailsPanel(project);
      } else {
        // We're viewing a file
        openFileDetails({
          fileName: args[0],
          content: result.output as string
        });
      }
    }

    setHistoryIndex(-1);
  }, [projects]);

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

  const addCommandOnly = useCallback((command: string) => {
    setState(prev => ({
      ...prev,
      history: [
        ...prev.history,
        { 
          command, 
          output: '', 
          type: 'success',
          currentDirectory: prev.currentDirectory
        }
      ]
    }));
  }, []);

  const changeDirectory = useCallback((path: string) => {
    // Convert path to a format the commands service can understand
    let formattedPath = path;
    
    // If path is absolute (starts with /), convert it for the commands
    if (path.startsWith('/')) {
      formattedPath = path.substring(1); // Remove leading slash
    }
    
    // Execute the cd command to change directory
    commandsRef.current.execute('cd', [formattedPath]);
    
    // Get the updated directory
    const newDirectory = commandsRef.current.getCurrentDirectory();
    
    // Update state with the new directory
    setState(prev => ({
      ...prev,
      currentDirectory: newDirectory
    }));
    
    // Add the command to history
    addCommandOnly(`cd ${formattedPath}`);
  }, [addCommandOnly]);
  
  const openDetailsPanel = useCallback((project: Project) => {
    setState(prev => ({
      ...prev,
      isDetailsPanelOpen: true,
      selectedProject: project,
      selectedFile: null // Clear any selected file
    }));
  }, []);
  
  const openFileDetails = useCallback((file: FileDetails) => {
    setState(prev => ({
      ...prev,
      isDetailsPanelOpen: true,
      selectedFile: file,
      selectedProject: null // Clear any selected project
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

  return {
    state,
    executeCommand,
    navigateHistory,
    getCommandSuggestions,
    openDetailsPanel,
    openFileDetails,
    closeDetailsPanel,
    addCommandOnly,
    changeDirectory
  };
};