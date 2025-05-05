/**
 * Git Repository Directory Tree Generator
 * 
 * This script recursively scans a Git repository and generates a structured directory tree
 * in a format that's easy for AI to understand.
 * 
 * Usage: node git-tree-generator.js [path-to-repository]
 */

const fs = require('fs');
const path = require('path');

// Git directories and files to ignore
const IGNORED_PATTERNS = [
  '.git',
  'node_modules',
  'dist',
  'build',
  '.DS_Store',
  '.env',
  '.env.local',
  '.vscode',
  'coverage'
];

/**
 * Checks if a path should be ignored
 */
function shouldIgnore(pathToCheck) {
  return IGNORED_PATTERNS.some(pattern => pathToCheck.includes(pattern));
}

/**
 * Recursively scans a directory and builds a tree structure
 */
function scanDirectory(directoryPath, relativePath = '') {
  const result = {
    name: path.basename(directoryPath),
    type: 'directory',
    children: {}
  };

  const entries = fs.readdirSync(directoryPath);

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry);
    const entryRelativePath = path.join(relativePath, entry);
    
    if (shouldIgnore(entryPath)) {
      continue;
    }

    const stats = fs.statSync(entryPath);
    
    if (stats.isDirectory()) {
      result.children[entry] = scanDirectory(entryPath, entryRelativePath);
    } else {
      // For files, include size and path
      result.children[entry] = {
        name: entry,
        type: 'file',
        size: stats.size,
        path: entryRelativePath
      };
    }
  }

  return result;
}

/**
 * Creates a visual representation of the directory tree
 */
function generateTreeView(tree, prefix = '', isLast = true, depth = 0) {
  // Limit depth to avoid excessively large outputs
  if (depth > 10) {
    return `${prefix}${isLast ? '└── ' : '├── '}${tree.name} [max depth reached]\n`;
  }
  
  const connector = isLast ? '└── ' : '├── ';
  const newPrefix = prefix + (isLast ? '    ' : '│   ');
  
  let result = `${prefix}${connector}${tree.name}${tree.type === 'directory' ? '/' : ''}\n`;
  
  if (tree.type === 'directory' && tree.children) {
    const childEntries = Object.entries(tree.children);
    childEntries.forEach(([childName, childTree], index) => {
      const isChildLast = index === childEntries.length - 1;
      result += generateTreeView(childTree, newPrefix, isChildLast, depth + 1);
    });
  }
  
  return result;
}

/**
 * Generates a structured JSON output
 */
function generateJsonOutput(tree) {
  return JSON.stringify(tree, null, 2);
}

/**
 * Main function
 */
function main() {
  // Get repository path from command line argument or use current directory
  const repoPath = process.argv[2] || process.cwd();
  console.log(`Scanning repository at: ${repoPath}`);
  
  try {
    // Generate the directory tree
    const tree = scanDirectory(repoPath);
    
    // Generate tree view
    const treeView = generateTreeView({ name: path.basename(repoPath), type: 'directory', children: tree.children });
    
    // Generate JSON output
    const jsonOutput = generateJsonOutput(tree);
    
    // Write outputs to files
    fs.writeFileSync('repo-tree.txt', treeView);
    fs.writeFileSync('repo-tree.json', jsonOutput);
    
    console.log('\nDirectory tree view:');
    console.log(treeView);
    console.log('\nFiles created:');
    console.log('- repo-tree.txt (visual tree view)');
    console.log('- repo-tree.json (structured JSON data)');
    
  } catch (error) {
    console.error('Error scanning repository:', error);
  }
}

// Run the script
main();