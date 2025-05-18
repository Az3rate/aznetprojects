import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { TerminalState, Project, CommandSuggestion, FileDetails } from '../types';
import { TerminalCommands } from '../services/commands';
import { projects } from '../data/projects';
import { useDirectory } from './DirectoryContext';

interface TerminalContextType {
  state: TerminalState;
  executeCommand: (input: string) => Promise<void>;
  navigateHistory: (direction: 'up' | 'down') => string;
  getCommandSuggestions: (input: string) => CommandSuggestion[];
  openDetailsPanel: (project: Project) => void;
  openFileDetails: (file: FileDetails) => void;
  closeDetailsPanel: () => void;
  addCommandOnly: (command: string) => void;
  changeDirectory: (path: string) => Promise<void>;
  commandsRef: React.MutableRefObject<TerminalCommands>;
  input: string;
  setInput: (input: string) => void;
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
  selectedSuggestion: number;
  setSelectedSuggestion: (value: number | ((prev: number) => number)) => void;
  tourOpen: boolean;
  setTourOpen: (open: boolean) => void;
  tourType: 'recruiter' | 'technical';
  setTourType: (type: 'recruiter' | 'technical') => void;
  detailsPanelWidth: number;
  setDetailsPanelWidth: (width: number) => void;
}

const TerminalContext = createContext<TerminalContextType | null>(null);

export const useTerminalContext = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminalContext must be used within a TerminalProvider');
  }
  return context;
};

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentDirectory, setDirectory, vfs } = useDirectory();
  const [state, setState] = useState<Omit<TerminalState, 'currentDirectory'>>(() => {
    const savedState = localStorage.getItem('terminal_state');
    return savedState ? JSON.parse(savedState) : {
      history: [],
      isDetailsPanelOpen: false,
      selectedProject: null,
      selectedFile: null
    };
  });

  const [historyIndex, setHistoryIndex] = useState(-1);
  const commandsRef = useRef<TerminalCommands>(new TerminalCommands(projects, vfs));

  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const handleSetSelectedSuggestion = useCallback((value: number | ((prev: number) => number)) => {
    if (typeof value === 'function') {
      setSelectedSuggestion(value);
    } else {
      setSelectedSuggestion(value);
    }
  }, []);

  const [tourOpen, setTourOpen] = useState(false);
  const [tourType, setTourType] = useState<'recruiter' | 'technical'>('recruiter');
  const [detailsPanelWidth, setDetailsPanelWidth] = useState(() => {
    const savedWidth = localStorage.getItem('terminal_details_width');
    return savedWidth ? parseInt(savedWidth, 10) : 720;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('terminal_state', JSON.stringify(state));
  }, [state]);

  // Save details panel width to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('terminal_details_width', detailsPanelWidth.toString());
  }, [detailsPanelWidth]);

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

  const value = {
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
    input,
    setInput,
    suggestions,
    setSuggestions,
    selectedSuggestion,
    setSelectedSuggestion: handleSetSelectedSuggestion,
    tourOpen,
    setTourOpen,
    tourType,
    setTourType,
    detailsPanelWidth,
    setDetailsPanelWidth
  };

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
}; 