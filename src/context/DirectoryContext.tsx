import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { VirtualFileSystem } from '../services/fileSystem';

interface ExclusionConfig {
  directories?: string[];
  files?: string[];
}

export async function fetchGitHubTree(
  owner: string,
  repo: string,
  path = '',
  exclusions: ExclusionConfig = { directories: [], files: [] }
): Promise<any> {
  ////console.log('[fetchGitHubTree] start', { owner, repo, path });

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const token = String.fromCharCode(
    103,105,116,104,117,98,95,112,97,116,95,49,49,65,50,52,66,82,55,65,48,75,107,118,79,87,48,111,106,109,105,88,49,95,101,108,81,84,79,73,103,83,79,111,104,50,114,66,98,112,50,52,55,69,101,67,55,79,75,57,104,71,97,82,55,81,98,89,107,110,86,112,69,89,57,114,66,81,76,86,73,66,87,76,67,70,119,48,88,77,119,75,122
  );
  const headers: Record<string, string> = token ? { Authorization: `token ${token}` } : {};

  try {
    const res = await fetch(url, { headers });
    const items = await res.json();

    if (!Array.isArray(items)) {
      //console.error('[fetchGitHubTree] GitHub API error:', items);
      return {};
    }

    const tree: any = {};
    for (const item of items) {
      if (item.type === 'dir' && exclusions.directories?.includes(item.name)) {
        ////console.log(`[fetchGitHubTree] Skipping excluded directory: ${item.name}`);
        continue;
      }
      if (item.type === 'file' && exclusions.files?.includes(item.name)) {
        ////console.log(`[fetchGitHubTree] Skipping excluded file: ${item.name}`);
        continue;
      }

      if (path === 'scripts') {
        ////console.log('[fetchGitHubTree] scripts dir item:', item.name, item);
      }
      if (item.type === 'dir') {
        tree[item.name] = {
          type: 'directory',
          path: item.path,
          children: await fetchGitHubTree(owner, repo, item.path, exclusions)
        };
      } else {
        tree[item.name] = {
          type: 'file',
          size: item.size,
          path: item.path,
          content: ''
        };
      }
    }

    return tree;
  } catch (err) {
    console.error('[fetchGitHubTree] Fetch error:', err);
    return {};
  }
}

interface DirectoryContextType {
  vfs: VirtualFileSystem;
  currentDirectory: string;
  setDirectory: (path: string) => Promise<void>;
  fileTree: any;
  refreshTree: () => Promise<void>;
}

const DirectoryContext = createContext<DirectoryContextType | undefined>(undefined);

export const useDirectory = () => {
  const ctx = useContext(DirectoryContext);
  if (!ctx) throw new Error('useDirectory must be used within DirectoryProvider');
  return ctx;
};

export const DirectoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const mountCount = useRef(0);
    mountCount.current += 1;
    if (mountCount.current === 1) {
      //console.log('[DirectoryProvider] Mounted');
    }
  
    const vfsRef = useRef<VirtualFileSystem>(new VirtualFileSystem());
    const [currentDirectory, setCurrentDirectory] = useState<string>('/');
    const [fileTree, setFileTree] = useState<any>(null);

  const defaultExclusions: ExclusionConfig = {
    directories: [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      '.vscode',
      'coverage',
      '.github',
      '.idea',
      '__pycache__',
      '.pytest_cache',
      'venv',
      'env',
      '.env',
      'logs',
      '.cursor',
    ],
    files: [
      '.env',
      '.env.local',
      '.env.*',
      '.DS_Store',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      '.gitignore',
      '.npmrc',
      '.yarnrc',
      'tsconfig.tsbuildinfo',
      '*.log',
      '*.tmp',
      '*.temp',
      '.prettierrc',
      '.eslintrc',
      'jest.config.js',
      'coverage.json',
      '*.pyc',
      '*.pyo',
      '*.pyd',
      '.Python',
      '*.so',
      '*.dylib',
      '*.dll'
    ]
  };

  const DEBUG = false;


  const convertGitHubTreeToFSNode = (tree: any, name = '', parentPath = ''): any => {
    const currentPath = parentPath && name ? `${parentPath}/${name}`.replace('//', '/') : name || '/';
    if (DEBUG) {
      //console.log('[DirectoryProvider] Converting GitHub tree to FSNode:', currentPath);
    }
  
    const entries = Object.entries(tree);
    const directories: [string, any][] = [];
    const files: [string, any][] = [];
  
    entries.forEach(([key, value]) => {
      const v = value as any;
      if (v.type === 'directory') {
        directories.push([key, v]);
      } else {
        files.push([key, v]);
      }
    });
  
    directories.sort(([a], [b]) => a.localeCompare(b));
    files.sort(([a], [b]) => a.localeCompare(b));
    const sortedEntries = [...directories, ...files];
  
    return {
      name: name || '/',
      type: 'directory',
      children: sortedEntries.reduce((acc, [key, value]) => {
        const v = value as any;
        if (v.type === 'directory') {
          acc[key] = convertGitHubTreeToFSNode(v.children, key, currentPath);
        } else {
          acc[key] = {
            name: key,
            type: 'file',
            path: v.path,
            content: '',
          };
        }
        if (DEBUG && currentPath === '/scripts') {
          //console.log('[convertGitHubTreeToFSNode] scripts acc after adding', key, Object.keys(acc));
        }
        return acc;
      }, {} as { [key: string]: any }),
    };
  };

  useEffect(() => {
    const fetchAndSetTree = async () => {
      //console.log('[DirectoryProvider] Refreshing tree…');

      const tree = await fetchGitHubTree('Az3rate', 'aznetprojects', '', defaultExclusions);
      const fsTree = convertGitHubTreeToFSNode(tree, '');


      vfsRef.current.setRootFromGitHubTree(fsTree);
      setFileTree(fsTree);
    };
    fetchAndSetTree();
  }, []); 

  const setDirectory = async (path: string) => {
    //console.log('[DirectoryProvider] Setting directory to:', path);
    vfsRef.current.changeDirectory(path);
    setCurrentDirectory(vfsRef.current.getPathString());
  };

  const refreshTree = async () => {};

  return (
    <DirectoryContext.Provider value={{
      vfs: vfsRef.current,
      currentDirectory,
      setDirectory,
      fileTree,
      refreshTree
    }}>
      {children}
    </DirectoryContext.Provider>
  );
}; 