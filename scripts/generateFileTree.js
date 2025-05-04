const fs = require('fs');
const path = require('path');

// Configurable root folders and top-level files to include
const INCLUDE_DIRS = ['src', 'public'];
const INCLUDE_FILES = ['README.md', 'package.json', 'tsconfig.json'];
const OUTPUT_FILE = path.join(__dirname, '../src/data/fileTree.json');

// Helper: check if file is binary (very basic)
function isBinaryFileSync(filepath) {
  const textExtensions = [
    '.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.css', '.scss', '.html', '.txt', '.env', '.yml', '.yaml', '.gitignore', '.lock', '.svg', '.xml', '.sh', '.bat', '.conf', '.ini', '.properties', '.toml', '.cjs', '.mjs', '.eslintrc', '.prettierrc', '.babelrc', '.editorconfig', '.dockerfile', '.npmrc', '.nvmrc', '.plopfile.js', '.config.js', '.config.ts', '.sample', '.example'
  ];
  const ext = path.extname(filepath).toLowerCase();
  if (textExtensions.includes(ext)) return false;
  // Check for common binary extensions
  const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.exe', '.dll', '.bin', '.pdf', '.zip', '.tar', '.gz', '.7z', '.mp3', '.mp4', '.mov', '.avi', '.webm', '.woff', '.woff2', '.ttf', '.eot', '.otf', '.class', '.jar', '.so', '.dylib', '.node'];
  if (binaryExtensions.includes(ext)) return true;
  // Fallback: check for non-printable chars in first 512 bytes
  try {
    const buf = fs.readFileSync(filepath);
    for (let i = 0; i < Math.min(buf.length, 512); i++) {
      if (buf[i] === 0) return true;
    }
  } catch (e) { return true; }
  return false;
}

function scanDir(dir, root) {
  const absDir = path.join(root, dir);
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  const children = {};
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'build' || entry.name === 'dist' || entry.name === '.git') continue;
    const relPath = path.join(dir, entry.name);
    const absPath = path.join(root, relPath);
    if (entry.isDirectory()) {
      children[entry.name] = {
        name: entry.name,
        type: 'directory',
        children: scanDir(relPath, root)
      };
    } else if (!isBinaryFileSync(absPath)) {
      children[entry.name] = {
        name: entry.name,
        type: 'file',
        content: fs.readFileSync(absPath, 'utf8')
      };
    } else {
      // Ignore binary files
    }
  }
  return children;
}

function buildFileTree() {
  const root = process.cwd();
  const tree = {};
  for (const dir of INCLUDE_DIRS) {
    if (fs.existsSync(path.join(root, dir))) {
      tree[dir] = {
        name: dir,
        type: 'directory',
        children: scanDir(dir, root)
      };
    }
  }
  for (const file of INCLUDE_FILES) {
    const absPath = path.join(root, file);
    if (fs.existsSync(absPath) && !isBinaryFileSync(absPath)) {
      tree[file] = {
        name: file,
        type: 'file',
        content: fs.readFileSync(absPath, 'utf8')
      };
    }
  }
  return tree;
}

const fileTree = buildFileTree();
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fileTree, null, 2), 'utf8');
console.log(`File tree written to ${OUTPUT_FILE}`); 