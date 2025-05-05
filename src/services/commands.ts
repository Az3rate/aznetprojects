import { Project } from '../types';
import { debug } from '../utils/debug';
import { VirtualFileSystem } from './fileSystem';
import * as path from 'path';

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
  private fileSystem: VirtualFileSystem;
  private currentDirectory: string[];
  private projects: Project[];

  constructor(projects: Project[]) {
    this.fileSystem = new VirtualFileSystem();
    this.currentDirectory = ['/'];
    this.projects = projects;
    this.fileSystem.addProjectFiles(projects);
  }

  private ls(args: string[]): Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> {
    const entries = this.fileSystem.listDirectory();
    if (entries.length === 0) {
      return Promise.resolve({
        type: 'success',
        output: 'Directory is empty'
      });
    }

    return Promise.resolve({
      type: 'success',
      output: entries
        .map(entry => {
          const type = entry.type === 'directory' ? 'd' : '-';
          const size = entry.size.toString().padStart(8);
          return `${type} ${size} ${entry.name}`;
        })
        .join('\n')
    });
  }

  private cd(args: string[]): Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> {
    if (args.length === 0) {
      return Promise.resolve({
        type: 'error',
        output: 'Usage: cd <directory>'
      });
    }

    const success = this.fileSystem.changeDirectory(args[0]);
    return Promise.resolve({
      type: success ? 'success' : 'error',
      output: success ? '' : `Directory not found: ${args[0]}`
    });
  }

  private async cat(args: string[]): Promise<{ type: 'success' | 'error'; output: string }> {
    if (args.length === 0) {
      return { type: 'error', output: 'Usage: cat <filename>' };
    }

    const path = args[0];
    const content = await this.fileSystem.getFileContent(path);
    
    if (content.startsWith('File not found:')) {
      return { type: 'error', output: content };
    }
    
    return { type: 'success', output: content };
  }

  private help(args: string[]): Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> {
    return Promise.resolve({
      type: 'success',
      output: `Available commands:
  help        - Show this help message
  clear       - Clear the terminal
about       - Show about information
projects    - List all projects
  contact     - Show contact information
  ls          - List directory contents
  cd          - Change directory
  pwd         - Print working directory
cat         - Display file contents
  echo        - Print text
  neofetch    - Display system information
exit        - Exit the terminal`
    });
  }

  private clear(args: string[]): Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> {
    return Promise.resolve({ type: 'clear', output: '' });
  }

  private getCurrentNode(): any {
    let current = this.fileSystem.getCurrentDirectory();
    for (const dir of this.currentDirectory.slice(1)) {
      if (current.children && current.children[dir]) {
        current = current.children[dir];
      }
    }
    return current;
    }

  getCurrentDirectory(): string {
    return this.currentDirectory.join('/');
  }

  private about(args: string[]): Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> {
    return Promise.resolve({
      type: 'success',
      output: `Welcome to my terminal interface!
This is a portfolio website showcasing my projects and skills.
Use the commands above to navigate and explore.`
    });
  }

  private pwd(args: string[]): Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> {
    return Promise.resolve({
      type: 'success',
      output: this.fileSystem.getPathString()
    });
  }

  public async execute(command: string, args: string[]): Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> {
    console.debug('[DEBUG] Executing command', { command, args });

    const commandMap: { [key: string]: (args: string[]) => Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> } = {
      help: this.help.bind(this),
      clear: this.clear.bind(this),
      about: this.about.bind(this),
      projects: this.projectsList.bind(this),
      contact: this.contact.bind(this),
      ls: this.ls.bind(this),
      cd: this.cd.bind(this),
      pwd: this.pwd.bind(this),
      cat: this.cat.bind(this),
      echo: this.echo.bind(this),
      neofetch: this.neofetch.bind(this),
      exit: this.exit.bind(this)
    };

    const commandFn = commandMap[command.toLowerCase()];
    if (!commandFn) {
      return { type: 'error', output: `Command not found: ${command}` };
    }

    try {
      const result = await commandFn(args);
      console.debug('[DEBUG] Command executed successfully', { command, output: result.output });
      return result;
    } catch (error) {
      console.error('[ERROR] Command execution failed', { command, error });
      return { type: 'error', output: `Error executing command: ${error}` };
    }
  }

  private projectsList(args: string[]): Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> {
    return Promise.resolve({
      type: 'project-list',
      output: { projects: this.projects }
    });
  }

  private contact(args: string[]): Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> {
    return Promise.resolve({
      type: 'success',
      output: `GitHub: https://github.com/Az3rate
LinkedIn: https://linkedin.com/in/az3rate
Email: az3rate@gmail.com`
    });
      }

  private echo(args: string[]): Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> {
    return Promise.resolve({
      type: 'success',
      output: args.join(' ')
    });
  }

  private neofetch(args: string[]): Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> {
    return Promise.resolve({
      type: 'success',
      output: `OS: Windows 10
Host: Portfolio Terminal
Kernel: React 18.2.0
Shell: TypeScript 5.0.0
Terminal: Custom Terminal Interface
CPU: Intel i7-12700K
Memory: 32GB DDR4
GPU: NVIDIA RTX 3080
Resolution: 1920x1080`
    });
  }

  private exit(args: string[]): Promise<{ type: 'success' | 'error' | 'info' | 'project-list' | 'welcome' | 'clear'; output: any }> {
    return Promise.resolve({
      type: 'info',
      output: 'Goodbye! Thanks for visiting.'
    });
  }
} 