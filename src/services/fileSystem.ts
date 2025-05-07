import { FileSystemNode, Project } from '../types';

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Az3rate/aznetprojects/main';

export class VirtualFileSystem {
  private root: FileSystemNode;
  private currentPath: string[];
  private fileCache: Map<string, string>;

  constructor() {
    this.fileCache = new Map();
    this.root = this.initializeFileSystem();
    this.currentPath = ['/'];
  }

  private initializeFileSystem(): FileSystemNode {
    console.log('[VFS] initializeFileSystem – pre‑fetch scaffold');
    return {
      name: '/',
      type: 'directory',
      children: {
        'src': {
          name: 'src',
          type: 'directory',
          children: {
            'components': {
              name: 'components',
              type: 'directory',
              children: {
                'Terminal': {
                  name: 'Terminal',
                  type: 'directory',
                  children: {
                    'FileExplorer.tsx': {
                      name: 'FileExplorer.tsx',
                      type: 'file',
                      content: 'Loading...'
                    },
                    'FileViewer.tsx': {
                      name: 'FileViewer.tsx',
                      type: 'file',
                      content: 'Loading...'
                    },
                    'ProjectDetails.tsx': {
                      name: 'ProjectDetails.tsx',
                      type: 'file',
                      content: 'Loading...'
                    },
                    'Terminal.styles.ts': {
                      name: 'Terminal.styles.ts',
                      type: 'file',
                      content: 'Loading...'
                    },
                    'Terminal.tsx': {
                      name: 'Terminal.tsx',
                      type: 'file',
                      content: 'Loading...'
                    },
                    'WelcomeMessage.tsx': {
                      name: 'WelcomeMessage.tsx',
                      type: 'file',
                      content: 'Loading...'
                    }
                  }
                }
              }
            },
            'data': {
              name: 'data',
              type: 'directory',
              children: {
                'fileTree.json': {
                  name: 'fileTree.json',
                  type: 'file',
                  content: 'Loading...'
                },
                'projects.ts': {
                  name: 'projects.ts',
                  type: 'file',
                  content: 'Loading...'
                }
              }
            },
            'hooks': {
              name: 'hooks',
              type: 'directory',
              children: {
                'useTerminal.ts': {
                  name: 'useTerminal.ts',
                  type: 'file',
                  content: 'Loading...'
                }
              }
            },
            'services': {
              name: 'services',
              type: 'directory',
              children: {
                'commands.ts': {
                  name: 'commands.ts',
                  type: 'file',
                  content: 'Loading...'
                },
                'fileSystem.ts': {
                  name: 'fileSystem.ts',
                  type: 'file',
                  content: 'Loading...'
                }
              }
            },
            'styles': {
              name: 'styles',
              type: 'directory',
              children: {
                'globalStyles.ts': {
                  name: 'globalStyles.ts',
                  type: 'file',
                  content: 'Loading...'
                },
                'styled.d.ts': {
                  name: 'styled.d.ts',
                  type: 'file',
                  content: 'Loading...'
                },
                'theme.ts': {
                  name: 'theme.ts',
                  type: 'file',
                  content: 'Loading...'
                },
                'ThemeProvider.tsx': {
                  name: 'ThemeProvider.tsx',
                  type: 'file',
                  content: 'Loading...'
                }
              }
            },
            'types': {
              name: 'types',
              type: 'directory',
              children: {
                'index.ts': {
                  name: 'index.ts',
                  type: 'file',
                  content: 'Loading...'
                }
              }
            },
            'utils': {
              name: 'utils',
              type: 'directory',
              children: {
                'debug.ts': {
                  name: 'debug.ts',
                  type: 'file',
                  content: 'Loading...'
                }
              }
            },
            '__tests__': {
              name: '__tests__',
              type: 'directory',
              children: {
                'commands.test.ts': {
                  name: 'commands.test.ts',
                  type: 'file',
                  content: 'Loading...'
                },
                'Terminal.test.tsx': {
                  name: 'Terminal.test.tsx',
                  type: 'file',
                  content: 'Loading...'
                },
                'useTerminal.test.ts': {
                  name: 'useTerminal.test.ts',
                  type: 'file',
                  content: 'Loading...'
                }
              }
            },
            'App.tsx': {
              name: 'App.tsx',
              type: 'file',
              content: 'Loading...'
            },
            'index.css': {
              name: 'index.css',
              type: 'file',
              content: 'Loading...'
            },
            'index.tsx': {
              name: 'index.tsx',
              type: 'file',
              content: 'Loading...'
            },
            'setupTests.ts': {
              name: 'setupTests.ts',
              type: 'file',
              content: 'Loading...'
            }
          }
        },
        'public': {
          name: 'public',
          type: 'directory',
          children: {
            'images': {
              name: 'images',
              type: 'directory',
              children: {
                'd4ut-mermaid.png': {
                  name: 'd4ut-mermaid.png',
                  type: 'file',
                  content: 'Loading...'
                },
                'd4ut.png': {
                  name: 'd4ut.png',
                  type: 'file',
                  content: 'Loading...'
                },
                'loot-manager-mermaid.png': {
                  name: 'loot-manager-mermaid.png',
                  type: 'file',
                  content: 'Loading...'
                },
                'lootmanager.png': {
                  name: 'lootmanager.png',
                  type: 'file',
                  content: 'Loading...'
                },
                'raid-alert-mermaid.png': {
                  name: 'raid-alert-mermaid.png',
                  type: 'file',
                  content: 'Loading...'
                },
                'raidalert.png': {
                  name: 'raidalert.png',
                  type: 'file',
                  content: 'Loading...'
                }
              }
            },
            'index.html': {
              name: 'index.html',
              type: 'file',
              content: 'Loading...'
            }
          }
        },
        'scripts': {
          name: 'scripts',
          type: 'directory',
          children: {
            'generateFileTree.js': {
              name: 'generateFileTree.js',
              type: 'file',
              content: 'Loading…'
            },
            'generateTypingSounds.js': { 
              name: 'generateTypingSounds.js',
              type: 'file',
              content: 'Loading…'
            },
            'treeview.js': {
              name: 'treeview.js',
              type: 'file',
              content: 'Loading…'
            }
          }
        },
        'server': {
          name: 'server',
          type: 'directory',
          children: {
            'app.js': {
              name: 'app.js',
              type: 'file',
              content: 'Loading...'
            }
          }
        },
        'vanilla': {
          name: 'vanilla',
          type: 'directory',
          children: {
            'js': {
              name: 'js',
              type: 'directory',
              children: {
                'debug.js': {
                  name: 'debug.js',
                  type: 'file',
                  content: 'Loading...'
                },
                'directory-panel.js': {
                  name: 'directory-panel.js',
                  type: 'file',
                  content: 'Loading...'
                },
                'terminal-commands.js': {
                  name: 'terminal-commands.js',
                  type: 'file',
                  content: 'Loading...'
                },
                'terminal-core.js': {
                  name: 'terminal-core.js',
                  type: 'file',
                  content: 'Loading...'
                },
                'terminal-details.js': {
                  name: 'terminal-details.js',
                  type: 'file',
                  content: 'Loading...'
                },
                'terminal-filesystem.js': {
                  name: 'terminal-filesystem.js',
                  type: 'file',
                  content: 'Loading...'
                },
                'terminal-ui.js': {
                  name: 'terminal-ui.js',
                  type: 'file',
                  content: 'Loading...'
                }
              }
            }
          }
        },
        '__mocks__': {
          name: '__mocks__',
          type: 'directory',
          children: {
            'fileMock.js': {
              name: 'fileMock.js',
              type: 'file',
              content: 'Loading...'
            }
          }
        },
        '.babelrc': {
          name: '.babelrc',
          type: 'file',
          content: 'Loading...'
        },
        'jest.config.js': {
          name: 'jest.config.js',
          type: 'file',
          content: 'Loading...'
        },
        'package-lock.json': {
          name: 'package-lock.json',
          type: 'file',
          content: 'Loading...'
        },
        'package.json': {
          name: 'package.json',
          type: 'file',
          content: 'Loading...'
        },
        'PLANNING.md': {
          name: 'PLANNING.md',
          type: 'file',
          content: 'Loading...'
        },
        'README.md': {
          name: 'README.md',
          type: 'file',
          content: 'Loading...'
        },
        'TASK.md': {
          name: 'TASK.md',
          type: 'file',
          content: 'Loading...'
        },
        'tsconfig.json': {
          name: 'tsconfig.json',
          type: 'file',
          content: 'Loading...'
        },
        'webpack.config.js': {
          name: 'webpack.config.js',
          type: 'file',
          content: 'Loading...'
        }
      }
    };
  }


  private getNodeByPath(path: string): FileSystemNode | null {
    const parts = path.split('/').filter(Boolean);
    let current = this.root;
    for (const part of parts) {
      if (!current.children) {
        console.log('[getNodeByPath] No children at', current.name, 'for part', part);
        return null;
      }
      console.log('[getNodeByPath] Looking for', part, 'in', Object.keys(current.children));
      if (!current.children[part]) return null;
      current = current.children[part];
    }
    return current;
  }

  private async fetchFileContent(filePath: string): Promise<string> {
    console.log('[fetchFileContent] Requested file path:', filePath);

    if (this.fileCache.has(filePath)) {
      return this.fileCache.get(filePath)!;
    }

    try {

      const fileNode = this.getNodeByPath(filePath);
      if (!fileNode || fileNode.type !== 'file') {
        throw new Error(`File not found: ${filePath}`);
      }


      const githubPath = (fileNode as any).path || filePath;
      const url = `${GITHUB_RAW_BASE}/${githubPath}`;
      console.debug(`Fetching from: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`File not found: ${githubPath}`);
      }

      const content = await response.text();
      this.fileCache.set(filePath, content);
      return content;
    } catch (error: any) {
      console.error(`Error fetching ${filePath}:`, error);
      return `// Error loading file: ${filePath}\n// Please check if the file exists in the repository.\n// Error details: ${error.message}`;
    }
  }

  public async loadFileContent(filePath: string): Promise<void> {
    const content = await this.fetchFileContent(filePath);
    const parts = filePath.split('/');
    let current = this.root;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (current.children && current.children[parts[i]]) {
        current = current.children[parts[i]];
      }
    }
    
    const fileName = parts[parts.length - 1];
    if (current.children && current.children[fileName]) {
      current.children[fileName].content = content;
    }
  }

  public addProjectFiles(projects: Project[]): void {
    // This function no longer injects a 'projects' directory into the VFS root.
    // If you want to display projects, do so via commands or UI, not the file tree.
    return;
  }

  public listDirectory(): { name: string; type: 'file' | 'directory'; size: number }[] {
    console.log('[VFS][listDirectory] currentPath:', this.currentPath, 'getPathString:', this.getPathString());

    const current = this.getCurrentDirectory();
    if (!current || !current.children) {
      console.debug('[listDirectory] No children in current directory:', this.getPathString());
      return [];
    }
    

    const currentPath = this.getPathString();
    console.debug(`[listDirectory] Listing directory: ${currentPath}`);
    

    return Object.entries(current.children)
      .map(([name, item]) => ({
        name,
        type: item.type,
        size: item.type === 'file' ? (item.content?.length || 0) : 0
      }))
      .sort((a, b) => {

        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
      });
  }

  public getCurrentDirectory(): FileSystemNode {
    let current = this.root;
    for (const dir of this.currentPath.slice(1)) {
      if (!current.children || !current.children[dir]) {
        console.debug(`[getCurrentDirectory] Directory not found: ${dir} in path ${this.currentPath.join('/')}`);
        return this.root; 
      }
      current = current.children[dir];
    }
    return current;
  }

  public getPathString(): string {

    if (this.currentPath.length === 1) {
      return '/';
    }
    return '/' + this.currentPath.slice(1).join('/');
  }

  public changeDirectory(path: string): boolean {
    console.log('[VFS][changeDirectory] called with path:', path, 'currentPath before:', this.currentPath);
    const result = (() => {
      if (path === '..') {
        if (this.currentPath.length > 1) {
          this.currentPath.pop();
        }
        console.debug(`Moved up to: ${this.getPathString()}`);
        return true;
      }

      if (path === '/' || path === '' || path === '~') {
        this.currentPath = ['/'];
        return true;
      }

      let cleanPath = path.trim();
      while (cleanPath.includes('//')) cleanPath = cleanPath.replace('//', '/');
      if (cleanPath.length > 1 && cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1);

      let parts: string[];
      if (cleanPath.startsWith('/')) {
        parts = cleanPath.split('/').filter(Boolean);
      } else {
        parts = [...this.currentPath.slice(1), ...cleanPath.split('/').filter(Boolean)];
      }
      let current = this.root;
      let newPath = ['/'];
      for (const part of parts) {
        if (current.children?.[part]?.type === 'directory') {
          current = current.children[part];
          newPath.push(part);
        } else {
          console.debug(`Directory not found: ${part} in ${newPath.join('/')}`);
          return false;
        }
      }
      this.currentPath = newPath;
      console.debug(`Successfully changed directory to: ${this.getPathString()}`);
      return true;
    })();
    console.log('[VFS][changeDirectory] currentPath after:', this.currentPath);
    return result;
  }
  
  

  public async getFileContent(path: string, isAbsolute = false): Promise<string> {
    try {

      console.log('[getFileContent] Current path:', this.getPathString());
      console.log('[getFileContent] Requested file:', path);
      
      let fullPath: string;
      
      if (isAbsolute || path.startsWith('/')) {
        fullPath = path.replace(/^\/+/, '');
      } 
      else if (path.startsWith(this.currentPath.slice(1).join('/'))) {
        fullPath = path;
      }

      else {
        const currentParts = this.currentPath.slice(1);
        const pathParts = path.split('/').filter(Boolean);
        fullPath = [...currentParts, ...pathParts].join('/');
      }
      
      console.log('[getFileContent] Resolved fullPath:', fullPath);
      
      const content = await this.fetchFileContent(fullPath);
      return content;
    } catch (error) {
      console.error(`Error loading file ${path}:`, error);
      return `File not found: ${path}`;
    }
  }
  
  
  
  
  
  

  public setRootFromGitHubTree(tree: FileSystemNode) {
    console.log('[VFS] setRootFromGitHubTree: replacing root');
    if (tree.children?.scripts && tree.children.scripts.children) {
      console.log('[VFS] scripts children in incoming tree:', Object.keys(tree.children.scripts.children));
    }
    this.root = tree;
    this.currentPath = ['/'];
  }
}