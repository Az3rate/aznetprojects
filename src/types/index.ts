export interface Project {
  name: string;
  description: string;
  url: string;
  image: string;
  architectureImage: string;
  overview: string;
  keyFeatures: string[];
  architecture: Architecture;
  techStack: TechStackItem[];
  directoryStructure: DirectoryStructure;
  apiEndpoints: ApiEndpoint[];
  workflow: string[];
  summary: string;
  featured?: boolean;
}

export interface FileDetails {
  fileName: string;
  content: string;
}

export interface TechStackItem {
  name: string;
  version: string;
  description: string;
}

export interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  response: string;
}

export interface Architecture {
  frontend: {
    framework: string;
    language: string;
    styling: string;
    stateManagement: string;
  };
  backend: {
    framework: string;
    language: string;
    database: string;
  };
}

export interface DirectoryStructure {
  [key: string]: {
    [key: string]: string[];
  };
}

export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: { [key: string]: FileSystemNode };
}

export type TerminalCommandType = 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear';

export interface TerminalCommand {
  command: string;
  output: string | { type: 'project-list'; projects: Project[] } | { type: 'welcome' } | { type: 'clear' } | { type: 'aznet-loading' };
  type: TerminalCommandType;
  currentDirectory?: string; 
}

export interface TerminalState {
  history: TerminalCommand[];
  currentDirectory: string;
  isDetailsPanelOpen: boolean;
  selectedProject: Project | null;
  selectedFile: FileDetails | null;
}

export interface CommandSuggestion {
  command: string;
  score: number;
}