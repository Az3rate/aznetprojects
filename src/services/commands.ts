import { Project } from '../types';
import fileTree from '../data/fileTree.json';

function getCommandSuggestions(input: string, commands: string[]): string[] {
  // Simple fuzzy match: startsWith, includes, Levenshtein (optional)
  const inputLower = input.toLowerCase();
  const scored = commands.map(cmd => {
    if (cmd === inputLower) return { cmd, score: 1 };
    if (cmd.startsWith(inputLower)) return { cmd, score: 0.9 };
    if (cmd.includes(inputLower)) return { cmd, score: 0.7 };
    // Levenshtein distance (optional, for now skip)
    return { cmd, score: 0 };
  });
  return scored.filter(s => s.score > 0.5).sort((a, b) => b.score - a.score).map(s => s.cmd);
}

export class TerminalCommands {
  private projects: Project[];
  private currentDirectory: string = '/src';
  private fileTree: any;

  constructor(projects: Project[]) {
    this.projects = projects;
    this.fileTree = fileTree;
  }

  // Helper to resolve a path in the file tree
  private resolvePath(path: string): any {
    if (!path || path === '/') return this.fileTree;
    const parts = path.replace(/^\//, '').split('/');
    let node = this.fileTree;
    for (const part of parts) {
      if (!node[part]) return null;
      node = node[part].children || node[part];
    }
    return node;
  }

  // Helper to get node at current directory
  private getCurrentNode(): any {
    const parts = this.currentDirectory.replace(/^\//, '').split('/').filter(Boolean);
    let node = this.fileTree;
    for (const part of parts) {
      if (!node[part]) return null;
      node = node[part];
      if (node.type === 'directory') node = node.children;
    }
    return node;
  }

  execute(command: string, args: string[]): { output: any; type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear' } {
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
      exit: this.exit
    };

    if (!command) {
      return {
        output: 'Command not found: Empty command',
        type: 'error'
      };
    }

    if (command in commandMap) {
      try {
        const output = commandMap[command].call(this, args);
        if (command === 'projects' && typeof output === 'object' && output.type === 'project-list') {
          return {
            output: output,
            type: 'project-list'
          };
        }
        if (command === 'clear') {
          return { output: { type: 'clear' }, type: 'clear' };
        }
        return {
          output,
          type: command === 'exit' ? 'info' : 'success'
        };
      } catch (error) {
        return {
          output: error instanceof Error ? error.message : 'An error occurred',
          type: 'error'
        };
      }
    }

    // Fuzzy match for unknown commands
    const suggestions = getCommandSuggestions(command, Object.keys(commandMap));
    let message = `Command not found: ${command}`;
    if (suggestions.length > 0) {
      message += `\nDid you mean: ${suggestions[0]}?`;
      if (suggestions.length > 1) {
        message += `\nOther possibilities: ${suggestions.slice(1).join(', ')}`;
      }
    }
    message += `\nType 'help' for a list of available commands.`;
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
  exit        - Close the terminal`;
  };

  private clear = (): { type: 'clear' } => {
    return { type: 'clear' };
  };

  private about = (): string => {
    return 'Welcome to my terminal interface\nA modern terminal interface built with React and TypeScript.';
  };

  private projectsList = (): { type: 'project-list'; projects: Project[] } => {
    return { type: 'project-list', projects: this.projects };
  };

  private contact = (): string => {
    return `GitHub: https://github.com/username
Email: user@example.com
LinkedIn: https://linkedin.com/in/username`;
  };

  private ls = (): string => {
    const node = this.getCurrentNode();
    if (!node) throw new Error('Directory not found');
    return Object.keys(node).join('  ');
  };

  private cd = (args: string[]): string => {
    const dir = args[0];
    if (!dir || dir === '~' || dir === '/') {
      this.currentDirectory = '/src';
      return '';
    }
    let targetPath = dir.startsWith('/') ? dir : (this.currentDirectory + '/' + dir).replace(/\\/g, '/');
    targetPath = targetPath.replace(/\\/g, '/');
    const parts = targetPath.split('/').filter(Boolean);
    let node = this.fileTree;
    for (const part of parts) {
      if (!node[part]) throw new Error('Directory not found');
      node = node[part];
      if (node.type === 'directory') node = node.children;
    }
    this.currentDirectory = '/' + parts.join('/');
    return '';
  };

  private pwd = (): string => {
    return this.currentDirectory;
  };

  private cat = (args: string[]): string => {
    const file = args[0];
    console.log('cat command called with file:', file);
    
    if (!file) {
      console.log('No file specified');
      throw new Error('Please specify a file');
    }

    // Try to resolve the file in the current directory, case-insensitive
    let node = this.getCurrentNode();
    console.log('Current directory node:', node);
    
    if (!node) {
      console.log('Current directory not found');
      throw new Error('Directory not found');
    }

    // Try exact match first
    if (node[file]) {
      console.log('Found exact match in current directory:', node[file]);
      const n = node[file];
      if (n.type === 'file') {
        console.log('File content found:', n.content);
        return n.content;
      }
      console.log('Found match but not a file:', n);
      throw new Error('Not a file');
    }

    // Try case-insensitive match
    const found = Object.values(node).find(
      (n: any) => n.type === 'file' && n.name.toLowerCase() === file.toLowerCase()
    );
    if (found) {
      console.log('Found case-insensitive match:', found);
      return (found as any).content;
    }

    // If not found in current directory, try searching in the file tree
    const searchFile = (node: any, path: string[]): string | null => {
      console.log('Searching file tree:', { currentPath: path, currentNode: node });
      if (path.length === 0) return null;
      const current = path[0];
      const next = path.slice(1);
      
      if (node[current]) {
        console.log('Found path segment:', current, node[current]);
        if (next.length === 0 && node[current].type === 'file') {
          console.log('Found file at end of path:', node[current]);
          return node[current].content;
        }
        if (node[current].type === 'directory' && node[current].children) {
          console.log('Found directory, searching children:', node[current].children);
          return searchFile(node[current].children, next);
        }
      }
      console.log('Path segment not found:', current);
      return null;
    };

    const path = file.split('/');
    console.log('Searching file tree with path:', path);
    console.log('Full file tree:', this.fileTree);
    const content = searchFile(this.fileTree, path);
    if (content) {
      console.log('File content found in file tree:', content);
      return content;
    }

    console.log('File not found in any location');
    throw new Error('File not found');
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
} 