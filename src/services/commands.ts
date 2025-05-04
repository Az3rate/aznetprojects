import { Project } from '../types';
import fileTree from '../data/fileTree.json';

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
  private fileTree: any = {
    src: {
      type: 'directory',
      children: {
        'App.tsx': { type: 'file', content: 'App component content' },
        components: { type: 'directory', children: {} },
        data: { type: 'directory', children: {} },
        hooks: { type: 'directory', children: {} },
        'index.tsx': { type: 'file', content: 'Index file content' },
        services: { type: 'directory', children: {} },
        'setupTests.ts': { type: 'file', content: 'Test setup content' },
        styles: { type: 'directory', children: {} },
        types: { type: 'directory', children: {} },
        __tests__: { type: 'directory', children: {} }
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
  private projects: Project[];

  constructor(projects: Project[]) {
    this.projects = projects;
  }

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

  private getCurrentNode(): any {
    if (this.currentDirectory === '~' || this.currentDirectory === '/') {
      return this.fileTree;
    }
    const parts = this.currentDirectory.split('/').filter(Boolean);
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
        if (command === 'exit') {
          return { output, type: 'info' };
        }
        return {
          output,
          type: 'success'
        };
      } catch (error) {
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
    if (this.currentDirectory === '~' || this.currentDirectory === '/') {
      return 'projects  about.txt  src';
    }
    const node = this.getCurrentNode();
    if (!node) throw new Error('Directory not found');
    const entries = Object.entries(node).map(([name, value]: [string, any]) => {
      if (value.type === 'directory') return name + '/';
      return name;
    });
    return entries.join('  ');
  };

  private cd = (args: string[]): string => {
    const dir = args[0];
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
      return '';
    }
    if (dir === 'projects') {
      this.currentDirectory = '~/projects';
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
    return this.currentDirectory === '/src' ? '~' : this.currentDirectory;
  };

  private cat = (args: string[]): string => {
    const file = args[0];
    if (!file) {
      throw new Error('Please specify a file');
    }

    // First check if it's a project name
    const project = this.projects.find(p => p.name.toLowerCase() === file.toLowerCase());
    if (project) {
      return JSON.stringify(project, null, 2);
    }

    // Then check if it's a special file
    if (file === 'about.txt') {
      return 'Welcome to my terminal interface\nA modern terminal interface built with React and TypeScript.';
    }

    const searchFile = (node: any, path: string[]): string | null => {
      if (path.length === 0) return null;
      const current = path[0];
      
      if (node[current]) {
        const n = node[current];
        if (path.length === 1) {
          if (n.type === 'file') return n.content;
          return null;
        }
        if (n.type === 'directory' && n.children) {
          return searchFile(n.children, path.slice(1));
        }
        return null;
      }

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
} 