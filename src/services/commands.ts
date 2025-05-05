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
  private static fileTree: any = null;
  private projects: Project[];

  constructor(projects: Project[]) {
    this.projects = projects;
    if (!TerminalCommands.fileTree) {
      TerminalCommands.initializeFileTree();
    }
  }

  private static initializeFileTree(): void {
    debug.log('Initializing file tree');
    TerminalCommands.fileTree = {
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
      'src': {
        type: 'directory',
        children: {
          'components': {
            type: 'directory',
            children: {
              'Terminal': {
                type: 'directory',
                children: {
                  'Terminal.tsx': {
                    type: 'file',
                    content: '// Terminal component implementation'
                  },
                  'Terminal.styles.ts': {
                    type: 'file',
                    content: '// Terminal styles'
                  }
                }
              },
              'ProjectDetails': {
                type: 'directory',
                children: {
                  'ProjectDetails.tsx': {
                    type: 'file',
                    content: '// Project details component'
                  }
                }
              }
            }
          },
          'services': {
            type: 'directory',
            children: {
              'commands.ts': {
                type: 'file',
                content: '// Terminal commands implementation'
              },
              'fileSystem.ts': {
                type: 'file',
                content: '// File system implementation'
              }
            }
          },
          'hooks': {
            type: 'directory',
            children: {
              'useTerminal.ts': {
                type: 'file',
                content: '// Terminal hook implementation'
              }
            }
          },
          'styles': {
            type: 'directory',
            children: {
              'globalStyles.ts': {
                type: 'file',
                content: '// Global styles'
              },
              'theme.ts': {
                type: 'file',
                content: '// Theme configuration'
              }
            }
          },
          'types': {
            type: 'directory',
            children: {
              'index.ts': {
                type: 'file',
                content: '// Type definitions'
              }
            }
          },
          'App.tsx': {
            type: 'file',
            content: '// Main App component'
          },
          'index.tsx': {
            type: 'file',
            content: '// Application entry point'
          }
        }
      },
      'public': {
        type: 'directory',
        children: {
          'index.html': {
            type: 'file',
            content: '<!DOCTYPE html><html><head><title>Terminal Interface</title></head><body><div id="root"></div></body></html>'
          }
        }
      },
      'projects': {
        type: 'directory',
        children: {
          'README.md': {
            type: 'file',
            content: '# Projects\nA collection of my personal projects.'
          }
        }
      },
      'about.txt': {
        type: 'file',
        content: 'Terminal Interface v1.0.0\nA modern terminal interface built with React and TypeScript.'
      }
    };
    debug.log('File tree initialized', TerminalCommands.fileTree);
  }

  private resolvePath(path: string): any {
    debug.log('Resolving path', { path });
    if (!path || path === '/') return TerminalCommands.fileTree;
    const parts = path.replace(/^\//, '').split('/');
    let node = TerminalCommands.fileTree;
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
      return TerminalCommands.fileTree;
    }
    const parts = this.currentDirectory.split('/').filter(Boolean);
    let node = TerminalCommands.fileTree;
    for (const part of parts) {
      debug.log('Checking current node part', { part, node });
      if (!node[part]) {
        debug.error('Current node part not found', { part, currentDirectory: this.currentDirectory });
        return null;
      }
      node = node[part];
      if (node.type === 'directory' && node.children) {
        node = node.children;
      }
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
    let node = TerminalCommands.fileTree;
    
    for (const part of parts) {
      debug.log('Checking directory part', { part, node });
      if (!node[part]) {
        debug.error('Directory not found', { part, targetPath });
        throw new Error('Directory not found');
      }
      node = node[part];
      if (node.type === 'directory' && node.children) {
        node = node.children;
      } else if (node.type !== 'directory') {
        debug.error('Not a directory', { part, targetPath });
        throw new Error('Not a directory');
      }
    }
    
    // Update current directory with the full path
    this.currentDirectory = targetPath;
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

    const content = searchFile(TerminalCommands.fileTree, file.split('/'));
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