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
              content: 'Loading...'
            },
            'treeview.js': {
              name: 'treeview.js',
              type: 'file',
              content: 'Loading...'
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

  private async fetchFileContent(filePath: string): Promise<string> {
    // Check cache first
    if (this.fileCache.has(filePath)) {
      return this.fileCache.get(filePath)!;
    }

    try {
      // Remove leading slash if present for path mapping
      const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
      
      // Get the current directory path
      const currentDirPath = this.currentPath.slice(1).join('/');
      
      // Construct the full path based on current directory
      let fullPath: string;
      
      // If path already starts with src/, use it as is
      if (cleanPath.startsWith('src/')) {
        fullPath = cleanPath;
      } 
      // If we're in src directory or its subdirectories
      else if (currentDirPath.startsWith('src/')) {
        fullPath = `${currentDirPath}/${cleanPath}`;
      }
      // If we're in root and trying to access a file in src
      else if (currentDirPath === '') {
        // Check all possible src locations
        if (this.root.children?.['src']?.children?.[cleanPath]) {
          fullPath = `src/${cleanPath}`;
        }
        // Check src/components/Terminal
        else if (this.root.children?.['src']?.children?.['components']?.children?.['Terminal']?.children?.[cleanPath]) {
          fullPath = `src/components/Terminal/${cleanPath}`;
        }
        // Check src/data
        else if (this.root.children?.['src']?.children?.['data']?.children?.[cleanPath]) {
          fullPath = `src/data/${cleanPath}`;
        }
        // Check src/hooks
        else if (this.root.children?.['src']?.children?.['hooks']?.children?.[cleanPath]) {
          fullPath = `src/hooks/${cleanPath}`;
        }
        // Check src/services
        else if (this.root.children?.['src']?.children?.['services']?.children?.[cleanPath]) {
          fullPath = `src/services/${cleanPath}`;
        }
        // Check src/styles
        else if (this.root.children?.['src']?.children?.['styles']?.children?.[cleanPath]) {
          fullPath = `src/styles/${cleanPath}`;
        }
        // Check src/types
        else if (this.root.children?.['src']?.children?.['types']?.children?.[cleanPath]) {
          fullPath = `src/types/${cleanPath}`;
        }
        // Check src/utils
        else if (this.root.children?.['src']?.children?.['utils']?.children?.[cleanPath]) {
          fullPath = `src/utils/${cleanPath}`;
        }
        // Check src/__tests__
        else if (this.root.children?.['src']?.children?.['__tests__']?.children?.[cleanPath]) {
          fullPath = `src/__tests__/${cleanPath}`;
        }
        // Check public
        else if (this.root.children?.['public']?.children?.[cleanPath]) {
          fullPath = `public/${cleanPath}`;
        }
        // For root level files
        else {
          fullPath = cleanPath;
        }
      }
      // For other directories
      else {
        fullPath = `${currentDirPath}/${cleanPath}`;
      }
      
      const url = `${GITHUB_RAW_BASE}/${fullPath}`;
      console.debug(`Fetching from: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`File not found: ${fullPath}`);
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
    const projectsDir = this.root.children?.['projects'];
    if (!projectsDir || projectsDir.type !== 'directory' || !projectsDir.children) {
      // Create projects directory if it doesn't exist
      this.root.children = this.root.children || {};
      this.root.children['projects'] = {
        name: 'projects',
        type: 'directory',
        children: {}
      };
    }
    
    // Ensure projects directory exists and has children
    if (!this.root.children || !this.root.children['projects'] || 
        this.root.children['projects'].type !== 'directory' || 
        !this.root.children['projects'].children) {
      return; // Exit if directory structure is invalid
    }
    
    const currentProjectsDir = this.root.children['projects'];
    const children = currentProjectsDir.children as Record<string, FileSystemNode>;
    
    projects.forEach(project => {
      children[project.name.toLowerCase()] = {
        name: project.name.toLowerCase(),
        type: 'file',
        content: `${project.name}\n${project.description}\n${project.overview || ''}`
      };
    });
  }

  public listDirectory(): { name: string; type: 'file' | 'directory'; size: number }[] {
    const current = this.getCurrentDirectory();
    if (!current.children) return [];
    
    // Get the current path as a string for debugging
    const currentPath = this.currentPath.join('/');
    console.debug(`Listing directory: ${currentPath}`);
    
    // Convert children object to array and sort
    return Object.entries(current.children)
      .map(([name, item]) => ({
        name,
        type: item.type,
        size: item.type === 'file' ? (item.content?.length || 0) : 0
      }))
      .sort((a, b) => {
        // Directories first
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        // Then alphabetically
        return a.name.localeCompare(b.name);
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
    // Return the current path as a string, root is '/'
    if (this.currentPath.length === 1) {
      return '/';
    }
    return '/' + this.currentPath.slice(1).join('/');
  }

  public changeDirectory(path: string): boolean {
    console.debug(`Changing directory to: ${path} from ${this.currentPath.join('/')}`);

    if (path === '..') {
      if (this.currentPath.length > 1) {
        this.currentPath.pop();
        return true;
      }
      return false;
    }

    if (path === '/') {
      this.currentPath = ['/'];
      return true;
    }

    // Handle paths starting with src/
    if (path.startsWith('src/')) {
      const parts = path.split('/').filter(p => p !== '');
      this.currentPath = ['/', ...parts];
      return true;
    }

    // Get the current directory
    const current = this.getCurrentDirectory();
    
    // Check if the path exists in current directory
    if (current.children && current.children[path] && current.children[path].type === 'directory') {
      this.currentPath.push(path);
      return true;
    }

    // If we're in root and trying to access src or its subdirectories
    if (this.currentPath.length === 1 && path.startsWith('src/')) {
      const parts = path.split('/').filter(p => p !== '');
      this.currentPath = ['/', ...parts];
      return true;
    }

    console.debug(`Directory not found: ${path}`);
    return false;
  }

  public async getFileContent(path: string): Promise<string> {
    // Handle special case for project files
    if (this.currentPath.includes('projects')) {
      const projectName = path.toLowerCase();
      const projectsDir = this.root.children?.['projects'];
      if (projectsDir && projectsDir.type === 'directory' && projectsDir.children && 
          projectsDir.children[projectName] && projectsDir.children[projectName].type === 'file') {
        return projectsDir.children[projectName].content || '';
      }
    }
    
    try {
      // Build path based on current directory
      let fullPath: string;
      
      if (path.startsWith('/')) {
        // Absolute path
        fullPath = path.substring(1); // Remove leading slash
      } else if (this.currentPath.length === 1) {
        // Root directory
        fullPath = path;
      } else {
        // Relative path
        fullPath = [...this.currentPath.slice(1), path].join('/');
      }
      
      // Attempt to fetch content
      const content = await this.fetchFileContent(fullPath);
      return content;
    } catch (error) {
      console.error(`Error loading file ${path}:`, error);
      return `File not found: ${path}`;
    }
  }
}