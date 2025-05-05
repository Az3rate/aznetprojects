import { Project } from '../types';
import { debug } from '../utils/debug';

function getCommandSuggestions(input: string, commands: string[]): string[] {
  const inputLower = input.toLowerCase();
  const scored = commands.map(cmd => {
    if (cmd === inputLower) return { cmd, score: 1 };
    if (cmd.startsWith(inputLower)) return { cmd, score: 0.9 };
    if (cmd.includes(inputLower)) return { cmd, score: 0.7 };
    return { cmd, score: 0 };
  });
  return scored.filter(s => s.score > 0.5).sort((a, b) => b.score - a.score).map(s => s.cmd);
}

export class TerminalCommands {
  private currentDirectory: string = '~';
  private fileTree: any;
  private projects: Project[];

  constructor(projects: Project[]) {
    this.projects = projects;
    this.initializeFileTree();
  }

  private initializeFileTree() {
    debug.log('Initializing file tree');
    this.fileTree = {
      'package.json': {
        type: 'file',
        content: `{
  "name": "terminal-interface",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-joyride": "^2.6.1",
    "styled-components": "^6.1.1",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}`
      },
      'tsconfig.json': {
        type: 'file',
        content: `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}`
      },
      'README.md': {
        type: 'file',
        content: `# Terminal Interface

A modern terminal interface built with React and TypeScript.

## Features

- Interactive terminal commands
- File system navigation
- Project exploration
- Syntax highlighting
- Command history
- Auto-completion

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Start the development server: \`npm start\`

## Available Commands

- \`help\`: Show available commands
- \`ls\`: List directory contents
- \`cd\`: Change directory
- \`cat\`: View file contents
- \`clear\`: Clear the terminal
- \`about\`: Show information about the terminal
- \`projects\`: List available projects
- \`debug\`: Toggle debug mode`
      },
      public: {
        type: 'directory',
        children: {
          'index.html': {
            type: 'file',
            content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Terminal Interface - A modern terminal interface built with React" />
    <title>Terminal Interface</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`
          }
        }
      },
      src: {
        type: 'directory',
        children: {
          'App.tsx': { type: 'file', content: 'App component content' },
          components: { 
            type: 'directory', 
            children: {
              Terminal: {
                type: 'directory',
                children: {
                  'Terminal.tsx': { type: 'file', content: 'Terminal component content' },
                  'FileViewer.tsx': { type: 'file', content: 'FileViewer component content' },
                  'FileExplorer.tsx': { type: 'file', content: 'FileExplorer component content' },
                  'Terminal.styles.ts': { type: 'file', content: 'Terminal styles content' },
                  'WelcomeMessage.tsx': { type: 'file', content: 'WelcomeMessage component content' },
                  'ProjectDetails.tsx': { type: 'file', content: 'ProjectDetails component content' }
                }
              }
            }
          },
          data: { 
            type: 'directory', 
            children: {
              'projects.ts': {
                type: 'file',
                content: `import { Project } from '../types';

export const projects: Project[] = [
  {
    name: 'D4UT',
    description: 'A powerful web-based utility tool for Diablo 4 players',
    features: ['Build optimization', 'Damage calculations', 'Item comparison'],
    technologies: ['React', 'TypeScript', 'Node.js'],
    github: 'https://github.com/username/d4ut'
  },
  {
    name: 'LootManager',
    description: 'A comprehensive guild management system for Throne and Liberty',
    features: ['DKP tracking', 'Raid scheduling', 'Loot distribution'],
    technologies: ['React', 'TypeScript', 'Express'],
    github: 'https://github.com/username/lootmanager'
  },
  {
    name: 'RaidAlert',
    description: 'A Discord bot and web dashboard for ARK Survival Evolved',
    features: ['Real-time raid notifications', 'Tribe management', 'Discord integration'],
    technologies: ['Node.js', 'Discord.js', 'React'],
    github: 'https://github.com/username/raidalert'
  }
];`
              }
            }
          },
          hooks: { 
            type: 'directory', 
            children: {
              'useTerminal.ts': {
                type: 'file',
                content: `import { useState, useCallback } from 'react';
import { Project } from '../types';
import { TerminalCommands } from '../services/commands';

export const useTerminal = (projects: Project[]) => {
  const [history, setHistory] = useState<Array<{
    command: string;
    output: any;
    type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear';
    currentDirectory: string;
  }>>([]);
  const [currentDirectory, setCurrentDirectory] = useState('~');
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ fileName: string; content: string } | null>(null);

  const terminalCommands = new TerminalCommands(projects);

  const executeCommand = useCallback((command: string) => {
    const [cmd, ...args] = command.split(' ');
    const result = terminalCommands.execute(cmd, args);
    setHistory(prev => [...prev, { command, output: result.output, type: result.type, currentDirectory }]);
    setCurrentDirectory(terminalCommands.getCurrentDirectory());
  }, [currentDirectory]);

  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    // Implementation for command history navigation
    return '';
  }, []);

  const getCommandSuggestions = useCallback((input: string) => {
    // Implementation for command suggestions
    return [];
  }, []);

  const openDetailsPanel = useCallback((project: Project) => {
    setSelectedProject(project);
    setSelectedFile(null);
    setIsDetailsPanelOpen(true);
  }, []);

  const openFileDetails = useCallback((file: { fileName: string; content: string }) => {
    setSelectedFile(file);
    setSelectedProject(null);
    setIsDetailsPanelOpen(true);
  }, []);

  const closeDetailsPanel = useCallback(() => {
    setIsDetailsPanelOpen(false);
    setSelectedProject(null);
    setSelectedFile(null);
  }, []);

  const addCommandOnly = useCallback((command: string) => {
    setHistory(prev => [...prev, { command, output: '', type: 'info', currentDirectory }]);
  }, [currentDirectory]);

  const changeDirectory = useCallback((dir: string) => {
    executeCommand(\`cd \${dir}\`);
  }, [executeCommand]);

  return {
    state: {
      history,
      currentDirectory,
      isDetailsPanelOpen,
      selectedProject,
      selectedFile
    },
    executeCommand,
    navigateHistory,
    getCommandSuggestions,
    openDetailsPanel,
    openFileDetails,
    closeDetailsPanel,
    addCommandOnly,
    changeDirectory
  };
};`
              }
            }
          },
          'index.tsx': { type: 'file', content: 'Index file content' },
          services: { 
            type: 'directory', 
            children: {
              'commands.ts': { type: 'file', content: 'TerminalCommands class implementation' },
              'fileSystem.ts': {
                type: 'file',
                content: `import { Project } from '../types';

export interface FileSystemNode {
  type: 'file' | 'directory';
  content?: string;
  children?: { [key: string]: FileSystemNode };
}

export class FileSystem {
  private fileTree: FileSystemNode;
  private currentDirectory: string = '~';

  constructor(projects: Project[]) {
    this.initializeFileTree(projects);
  }

  private initializeFileTree(projects: Project[]) {
    // Implementation of file tree initialization
  }

  public getCurrentDirectory(): string {
    return this.currentDirectory;
  }

  public listDirectory(path: string): string[] {
    // Implementation of directory listing
    return [];
  }

  public readFile(path: string): string {
    // Implementation of file reading
    return '';
  }

  public changeDirectory(path: string): void {
    // Implementation of directory change
  }
}`
              }
            }
          },
          'setupTests.ts': { type: 'file', content: 'Test setup content' },
          styles: { 
            type: 'directory', 
            children: {
              'globalStyles.ts': {
                type: 'file',
                content: `import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle\`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Fira Code', monospace;
    background-color: #181825;
    color: #fff;
  }

  #root {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
\`;`
              },
              'styled.d.ts': {
                type: 'file',
                content: `import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      text: string;
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      monospace: string;
    };
  }
}`
              },
              'theme.ts': {
                type: 'file',
                content: `import { DefaultTheme } from 'styled-components';

export const theme: DefaultTheme = {
  colors: {
    background: '#181825',
    text: '#fff',
    primary: '#00ff99',
    secondary: '#a78bfa',
    accent: '#ff79c6'
  },
  fonts: {
    monospace: "'Fira Code', monospace"
  }
};`
              },
              'ThemeProvider.tsx': {
                type: 'file',
                content: `import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from './theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StyledThemeProvider theme={theme}>
      {children}
    </StyledThemeProvider>
  );
};`
              }
            }
          },
          types: { 
            type: 'directory', 
            children: {
              'index.ts': {
                type: 'file',
                content: `export interface Project {
  name: string;
  description: string;
  features: string[];
  technologies: string[];
  github: string;
}

export interface FileDetails {
  fileName: string;
  content: string;
}`
              }
            }
          },
          __tests__: { 
            type: 'directory', 
            children: {
              'commands.test.ts': {
                type: 'file',
                content: `import { TerminalCommands } from '../services/commands';
import { projects } from '../data/projects';

describe('TerminalCommands', () => {
  let commands: TerminalCommands;

  beforeEach(() => {
    commands = new TerminalCommands(projects);
  });

  test('should initialize with correct directory', () => {
    expect(commands.getCurrentDirectory()).toBe('~');
  });

  test('should execute ls command', () => {
    const result = commands.execute('ls', []);
    expect(result.type).toBe('success');
  });

  test('should execute cd command', () => {
    commands.execute('cd', ['src']);
    expect(commands.getCurrentDirectory()).toBe('/src');
  });
});`
              },
              'Terminal.test.tsx': {
                type: 'file',
                content: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { Terminal } from '../components/Terminal/Terminal';
import { projects } from '../data/projects';

describe('Terminal', () => {
  test('renders terminal interface', () => {
    render(<Terminal />);
    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
  });
});`
              },
              'useTerminal.test.ts': {
                type: 'file',
                content: `import { renderHook, act } from '@testing-library/react-hooks';
import { useTerminal } from '../hooks/useTerminal';
import { projects } from '../data/projects';

describe('useTerminal', () => {
  test('should initialize with correct state', () => {
    const { result } = renderHook(() => useTerminal(projects));
    expect(result.current.state.currentDirectory).toBe('~');
    expect(result.current.state.history).toHaveLength(0);
  });

  test('should execute command', () => {
    const { result } = renderHook(() => useTerminal(projects));
    act(() => {
      result.current.executeCommand('ls');
    });
    expect(result.current.state.history).toHaveLength(1);
  });
});`
              }
            }
          }
        }
      },
      projects: {
        type: 'directory',
        children: {}
      },
      'about.txt': {
        type: 'file',
        content: 'Welcome to my terminal interface\nA modern terminal interface built with React and TypeScript.'
      }
    };
    debug.log('File tree initialized', this.fileTree);
  }

  private resolvePath(path: string): any {
    debug.log('Resolving path', { path });
    if (!path || path === '/') return this.fileTree;
    const parts = path.replace(/^\//, '').split('/');
    let node = this.fileTree;
    for (const part of parts) {
      debug.log('Checking path part', { part, node });
      if (!node[part]) {
        debug.error('Path part not found', { part, path });
        return null;
      }
      node = node[part].children || node[part];
    }
    debug.log('Path resolved', { path, node });
    return node;
  }

  private getCurrentNode(): any {
    debug.log('Getting current node', { currentDirectory: this.currentDirectory });
    if (this.currentDirectory === '~' || this.currentDirectory === '/') {
      return this.fileTree;
    }
    const parts = this.currentDirectory.split('/').filter(Boolean);
    let node = this.fileTree;
    for (const part of parts) {
      debug.log('Checking current node part', { part, node });
      if (!node[part]) {
        debug.error('Current node part not found', { part, currentDirectory: this.currentDirectory });
        return null;
      }
      node = node[part];
      if (node.type === 'directory') node = node.children;
    }
    debug.log('Current node found', { currentDirectory: this.currentDirectory, node });
    return node;
  }

  execute(command: string, args: string[]): { output: any; type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear' } {
    debug.log('Executing command', { command, args });
    const commandMap: { [key: string]: (args: string[]) => any } = {
      help: this.help,
      clear: this.clear,
      about: this.about,
      projects: this.projectsList,
      contact: this.contact,
      ls: this.ls,
      cd: this.cd,
      pwd: this.pwd,
      cat: this.cat,
      echo: this.echo,
      neofetch: this.neofetch,
      exit: this.exit,
      debug: this.toggleDebug
    };

    if (!command) {
      debug.error('Empty command');
      return {
        output: 'Command not found: Empty command',
        type: 'error'
      };
    }

    if (command in commandMap) {
      try {
        const output = commandMap[command].call(this, args);
        debug.log('Command executed successfully', { command, output });
        if (command === 'exit') {
          return { output, type: 'info' };
        }
        return {
          output,
          type: 'success'
        };
      } catch (error) {
        debug.error('Command execution error', { command, error });
        return {
          output: error instanceof Error ? error.message : 'An error occurred',
          type: 'error'
        };
      }
    }

    const suggestions = getCommandSuggestions(command, Object.keys(commandMap));
    let message = `Command not found: ${command}`;
    if (suggestions.length > 0) {
      message += `\nDid you mean: ${suggestions[0]}?`;
      if (suggestions.length > 1) {
        message += `\nOther possibilities: ${suggestions.slice(1).join(', ')}`;
      }
    }
    message += `\nType 'help' for a list of available commands.`;
    debug.error('Command not found', { command, suggestions });
    return {
      output: message,
      type: 'error'
    };
  }

  getCurrentDirectory(): string {
    return this.currentDirectory;
  }

  private help = (): string => {
    return `Available commands:
  help        - Show this help message
  clear       - Clear the terminal
  about       - Show information about the terminal
  projects    - List available projects
  contact     - Show contact information
  ls          - List directory contents
  cd          - Change directory
  pwd         - Print working directory
  cat         - Read file contents
  echo        - Print text
  neofetch    - Display system information
  debug       - Toggle debug mode
  exit        - Close the terminal`;
  };

  private clear = (): string => {
    return '';
  };

  private about = (): string => {
    return 'Welcome to my terminal interface\nA modern terminal interface built with React and TypeScript.';
  };

  private projectsList = (): string => {
    return 'Terminal Interface: A modern terminal interface\n' + this.projects.map(p => `${p.name}: ${p.description}`).join('\n');
  };

  private contact = (): string => {
    return `GitHub: https://github.com/username
Email: user@example.com
LinkedIn: https://linkedin.com/in/username`;
  };

  private ls = (): string => {
    debug.log('Executing ls command', { currentDirectory: this.currentDirectory });
    if (this.currentDirectory === '~' || this.currentDirectory === '/') {
      return 'projects  about.txt  src';
    }
    const node = this.getCurrentNode();
    if (!node) {
      debug.error('Directory not found for ls', { currentDirectory: this.currentDirectory });
      throw new Error('Directory not found');
    }
    const entries = Object.entries(node).map(([name, value]: [string, any]) => {
      if (value.type === 'directory') return name + '/';
      return name;
    });
    debug.log('ls result', { entries });
    return entries.join('  ');
  };

  private cd = (args: string[]): string => {
    const dir = args[0];
    debug.log('Executing cd command', { dir, currentDirectory: this.currentDirectory });
    
    if (!dir || dir === '~') {
      this.currentDirectory = '~';
      return '';
    }
    
    if (dir === '/') {
      this.currentDirectory = '/';
      return '';
    }
    
    if (dir === '..') {
      if (this.currentDirectory === '~' || this.currentDirectory === '/') {
        return '';
      }
      const parts = this.currentDirectory.split('/').filter(Boolean);
      parts.pop();
      this.currentDirectory = parts.length > 0 ? '/' + parts.join('/') : '~';
      debug.log('Changed to parent directory', { newDirectory: this.currentDirectory });
      return '';
    }

    // Handle relative paths
    let targetPath = dir;
    if (!dir.startsWith('/')) {
      if (this.currentDirectory === '~') {
        targetPath = '/' + dir;
      } else {
        targetPath = this.currentDirectory + '/' + dir;
      }
    }
    targetPath = targetPath.replace(/\\/g, '/');

    // Remove leading slash for root directory
    const parts = targetPath.replace(/^\//, '').split('/').filter(Boolean);
    let node = this.fileTree;
    
    for (const part of parts) {
      debug.log('Checking directory part', { part, node });
      if (!node[part]) {
        debug.error('Directory not found', { part, targetPath });
        throw new Error('Directory not found');
      }
      node = node[part];
      if (node.type === 'directory') {
        node = node.children;
      } else {
        debug.error('Not a directory', { part, targetPath });
        throw new Error('Not a directory');
      }
    }
    
    this.currentDirectory = '/' + parts.join('/');
    debug.log('Changed directory', { newDirectory: this.currentDirectory });
    return '';
  };

  private pwd = (): string => {
    return this.currentDirectory === '/src' ? '~' : this.currentDirectory;
  };

  private cat = (args: string[]): string => {
    const file = args[0];
    debug.log('Executing cat command', { file, currentDirectory: this.currentDirectory });
    if (!file) {
      throw new Error('Please specify a file');
    }

    // First check if it's a project name
    const project = this.projects.find(p => p.name.toLowerCase() === file.toLowerCase());
    if (project) {
      debug.log('Found project', { project });
      return JSON.stringify(project, null, 2);
    }

    // Then check if it's a special file
    if (file === 'about.txt') {
      return 'Welcome to my terminal interface\nA modern terminal interface built with React and TypeScript.';
    }

    // First try to find the file in the current directory
    const currentNode = this.getCurrentNode();
    if (currentNode && currentNode[file] && currentNode[file].type === 'file') {
      debug.log('File found in current directory', { file, content: currentNode[file].content });
      return currentNode[file].content;
    }

    // If not found in current directory, search the entire file tree
    const searchFile = (node: any, path: string[]): string | null => {
      if (path.length === 0) return null;
      const current = path[0];
      debug.log('Searching file', { current, path, node });
      
      if (node[current]) {
        const n = node[current];
        if (path.length === 1) {
          if (n.type === 'file') {
            debug.log('File found', { file: current, content: n.content });
            return n.content;
          }
          return null;
        }
        if (n.type === 'directory' && n.children) {
          return searchFile(n.children, path.slice(1));
        }
        return null;
      }

      // Search in all directories
      for (const key in node) {
        if (node[key].type === 'directory' && node[key].children) {
          const result = searchFile(node[key].children, path);
          if (result) return result;
        }
      }
      return null;
    };

    const content = searchFile(this.fileTree, file.split('/'));
    if (!content) {
      debug.error('File not found', { file });
      throw new Error('File not found');
    }
    return content;
  };

  private echo = (args: string[]): string => {
    return args.join(' ');
  };

  private neofetch = (): string => {
    return `OS: ${window.navigator.platform}
Browser: ${window.navigator.userAgent}
Terminal: v1.0.0
Theme: Dark
Shell: React Terminal
Resolution: ${window.innerWidth}x${window.innerHeight}`;
  };

  private exit = (): string => {
    return 'Goodbye! Thanks for visiting.';
  };

  private toggleDebug = (): string => {
    if (debug.isEnabled()) {
      debug.disable();
      return 'Debug mode disabled';
    } else {
      debug.enable();
      return 'Debug mode enabled';
    }
  };
} 