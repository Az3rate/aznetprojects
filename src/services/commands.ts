import { Project } from '../types';

export class TerminalCommands {
  private projects: Project[];
  private currentDirectory: string = '~';

  constructor(projects: Project[]) {
    this.projects = projects;
  }

  execute(command: string, args: string[]): { output: string; type: 'success' | 'error' | 'info' } {
    const commandMap: { [key: string]: (args: string[]) => string } = {
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

    return {
      output: `Command not found: ${command}. Type 'help' for a list of available commands.`,
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
    return this.projects.map(project => `${project.name}: ${project.description}`).join('\n');
  };

  private contact = (): string => {
    return `GitHub: https://github.com/username
Email: user@example.com
LinkedIn: https://linkedin.com/in/username`;
  };

  private ls = (): string => {
    if (this.currentDirectory === '~') {
      return 'projects\nabout.txt';
    }
    if (this.currentDirectory === '~/projects') {
      return this.projects.map(project => project.name).join('\n');
    }
    throw new Error('Directory not found');
  };

  private cd = (args: string[]): string => {
    const dir = args[0];
    if (!dir) {
      this.currentDirectory = '~';
      return '';
    }
    if (dir === '~' || dir === '/') {
      this.currentDirectory = '~';
      return '';
    }
    if (dir === 'projects' && this.currentDirectory === '~') {
      this.currentDirectory = '~/projects';
      return '';
    }
    if (dir === '..' && this.currentDirectory === '~/projects') {
      this.currentDirectory = '~';
      return '';
    }
    throw new Error('Directory not found');
  };

  private pwd = (): string => {
    return this.currentDirectory;
  };

  private cat = (args: string[]): string => {
    const file = args[0];
    if (!file) {
      throw new Error('Please specify a file');
    }
    if (file === 'about.txt' && this.currentDirectory === '~') {
      return 'Welcome to my terminal interface\nA modern terminal interface built with React and TypeScript.';
    }
    if (this.currentDirectory === '~/projects') {
      const project = this.projects.find(p => p.name === file);
      if (project) {
        return `${project.name}\n${project.description}\n\n${project.overview}`;
      }
    }
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