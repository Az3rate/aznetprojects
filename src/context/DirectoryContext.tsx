import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { VirtualFileSystem } from '../services/fileSystem';

// Moved outside component for better memoization and reuse
export async function fetchGitHubTree(
  owner: string,
  repo: string,
  path = ''
): Promise<any> {
  console.log('[fetchGitHubTree] start', { owner, repo, path });

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const token = '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';
  const headers: Record<string, string> = token ? { Authorization: `token ${token}` } : {};

  try {
    const res = await fetch(url, { headers });
    const items = await res.json();

    if (!Array.isArray(items)) {
      console.error('[fetchGitHubTree] GitHub API error:', items);
      return {};
    }

    const tree: any = {};
    for (const item of items) {
      if (path === 'scripts') {
        console.log('[fetchGitHubTree] scripts dir item:', item.name, item);
      }
      if (item.type === 'dir') {
        tree[item.name] = {
          type: 'directory',
          path: item.path,
          children: await fetchGitHubTree(owner, repo, item.path)
        };
      } else {
        tree[item.name] = {
          type: 'file',
          size: item.size,
          path: item.path,
          content: '' // Will be loaded on demand
        };
      }
    }

    console.log('[fetchGitHubTree] end', {
      path,
      childCount: Object.keys(tree).length
    });
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
  console.log('[DirectoryProvider] Mounted');
  const vfsRef = useRef<VirtualFileSystem>(new VirtualFileSystem());
  const [currentDirectory, setCurrentDirectory] = useState<string>('/');
  const [fileTree, setFileTree] = useState<any>(null);

  // Convert GitHub API tree to FileSystemNode tree
  const convertGitHubTreeToFSNode = (tree: any, name = '', parentPath = ''): any => {
    const currentPath = parentPath && name ? `${parentPath}/${name}`.replace('//', '/') : name || '/';
    console.log('[DirectoryProvider] Converting GitHub tree to FSNode:', currentPath);
    return {
      name: name || '/',
      type: 'directory',
      children: Object.entries(tree).reduce((acc, [key, value]) => {
        const v = value as any;
        if (v.type === 'directory') {
          acc[key] = convertGitHubTreeToFSNode(v.children, key, currentPath);
        } else {
          acc[key] = {
            name: key,
            type: 'file',
            path: v.path, // This should already be the full path from GitHub
            content: '',
          };
        }
        // Debug: log after adding each child
        if (currentPath === '/scripts') {
          console.log('[convertGitHubTreeToFSNode] scripts acc after adding', key, Object.keys(acc));
        }
        return acc;
      }, {} as { [key: string]: any }),
    };
  };

  useEffect(() => {
    const fetchAndSetTree = async () => {
      console.log('[DirectoryProvider] Refreshing tree…');

      const tree   = await fetchGitHubTree('Az3rate', 'aznetprojects');
      const fsTree = convertGitHubTreeToFSNode(tree, '');

      // ⬆️ set the VFS root *before* wiring it into React‑state
      vfsRef.current.setRootFromGitHubTree(fsTree);
      setFileTree(fsTree);

      // extra visibility for the missing‑file issue
      if (fsTree.children?.scripts) {
        console.log(
          '[DirectoryProvider] scripts children after root set:',
          Object.keys(fsTree.children.scripts.children)
        );
      }
      console.log('[DirectoryProvider] Tree refreshed ✅');
    };
    fetchAndSetTree();
  }, []); // Empty deps since fetchGitHubTree is now outside component

  const setDirectory = async (path: string) => {
    console.log('[DirectoryProvider] Setting directory to:', path);
    vfsRef.current.changeDirectory(path);
    setCurrentDirectory(vfsRef.current.getPathString());
  };

  // Provide a dummy refreshTree for compatibility
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