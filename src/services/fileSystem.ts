import { FileSystemNode, Project } from '../types';

export class VirtualFileSystem {
  private root: FileSystemNode;
  private currentPath: string[];

  constructor() {
    this.root = this.initializeFileSystem();
    this.currentPath = ['/'];
  }

  private initializeFileSystem(): FileSystemNode {
    return {
      name: '/',
      type: 'directory',
      children: {
        'projects': {
          name: 'projects',
          type: 'directory',
          children: {
            'web': {
              name: 'web',
              type: 'directory',
              children: {}
            },
            'ai': {
              name: 'ai',
              type: 'directory',
              children: {}
            },
            'data': {
              name: 'data',
              type: 'directory',
              children: {}
            }
          }
        },
        'about': {
          name: 'about.txt',
          type: 'file',
          content: 'Hugo Villeneuve - Full Stack Developer\nAzNet Projects Terminal Interface'
        }
      }
    };
  }

  public addProjectFiles(projects: Project[]): void {
    const projectsDir = this.root.children?.['projects']?.children;
    if (!projectsDir) return;

    projects.forEach(project => {
      projectsDir[project.name.toLowerCase()] = {
        name: project.name.toLowerCase(),
        type: 'file',
        content: `${project.name}\n${project.description}\n${project.overview || ''}`
      };
    });
  }

  public getCurrentDirectory(): FileSystemNode {
    let current = this.root;
    for (const dir of this.currentPath.slice(1)) {
      if (current.children && current.children[dir]) {
        current = current.children[dir];
      }
    }
    return current;
  }

  public getPathString(): string {
    return this.currentPath.join('/');
  }

  public listDirectory(): { name: string; type: 'file' | 'directory'; size: number }[] {
    const current = this.getCurrentDirectory();
    if (!current.children) return [];
    
    return Object.entries(current.children).map(([name, item]) => ({
      name,
      type: item.type,
      size: item.type === 'file' ? (item.content?.length || 0) : 0
    }));
  }

  public changeDirectory(path: string): boolean {
    if (path === '..') {
      if (this.currentPath.length > 1) {
        this.currentPath.pop();
      }
      return true;
    }

    if (path === '/') {
      this.currentPath = ['/'];
      return true;
    }

    const current = this.getCurrentDirectory();
    if (current.children && current.children[path] && current.children[path].type === 'directory') {
      this.currentPath.push(path);
      return true;
    }

    return false;
  }

  public getFileContent(path: string): string | null {
    const current = this.getCurrentDirectory();
    // Try current directory first
    if (current.children && current.children[path] && current.children[path].type === 'file') {
      return current.children[path].content || null;
    }
    // If not found, try /projects for project files
    const projectsDir = this.root.children?.['projects']?.children;
    if (projectsDir && projectsDir[path] && projectsDir[path].type === 'file') {
      return projectsDir[path].content || null;
    }
    return null;
  }
} 