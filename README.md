# AZNET Terminal Interface

A modern, recruiter-friendly terminal interface in React/TypeScript that allows users to browse and view the actual project directory and files, similar to a real shell.

## Features
- **Terminal UI**: Supports `ls`, `cd`, `cat`, `clear`, fuzzy command suggestions, and a persistent welcome message.
- **Sidebar File Explorer**: Live, expandable file tree (from `fileTree.json`), supports folder expansion and file clicking.
- **Project Metadata**: Uses a real `projects` array for project details.
- **File System Integration**: Node.js script generates a filtered file tree at build time.
- **File Viewing**: When running `cat <file>`, the file content is shown in the right details panel (with syntax highlighting), not in the terminal output/history. The terminal history only shows the command, not the file content.
- **Project Details**: When running `cat <project>`, the right panel shows project details.
- **Command History**: Improved separation of terminal history and details panel content. The new `addCommandOnly` helper allows adding a command to history without output.
- **User Experience**: Clean, recruiter-friendly interface for browsing code and project info.
- **Interactive Tour**: Guided tour feature to help users understand the interface.
- **Command Suggestions**: Intelligent command suggestions with fuzzy matching.
- **Syntax Highlighting**: Code files are displayed with proper syntax highlighting.
- **File Tree Navigation**: Real-time file tree updates with directory changes.

## Usage
- Use the terminal to navigate directories and view files/projects.
- Click files in the sidebar or type `cat <file>` to view file content in the right panel.
- Type `cat <project>` to view project details in the right panel.
- Use Tab for command completion and arrow keys for command history.
- Press Escape to clear command suggestions.

## Development
- See `src/hooks/useTerminal.ts` for the `addCommandOnly` helper and state management.
- See `src/components/Terminal/Terminal.tsx` for the main UI logic and details panel handling.
- See `src/services/commands.ts` for command implementations and file system operations.

## Available Commands

### Navigation Commands
- `ls` - List directory contents
- `cd` - Change directory (supports `..`, `~`, `/`, and project names)
- `pwd` - Print working directory

### File Operations
- `cat` - Read file contents (supports both files and project names)
- `echo` - Print text to terminal

### System Commands
- `help` - Show available commands
- `clear` - Clear the terminal
- `about` - Show information about the terminal
- `projects` - List available projects
- `contact` - Show contact information
- `neofetch` - Display system information
- `exit` - Close the terminal

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/terminal-interface.git
cd terminal-interface
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run tests:
```bash
npm test
```

5. Run tests in watch mode:
```bash
npm run test:watch
```

6. Generate test coverage report:
```bash
npm run test:coverage
```

## Project Structure

```
src/
├── components/
│   └── Terminal/
│       ├── Terminal.tsx
│       ├── Terminal.styles.ts
│       ├── WelcomeMessage.tsx
│       ├── ProjectDetails.tsx
│       └── FileExplorer.tsx
├── hooks/
│   └── useTerminal.ts
├── services/
│   └── commands.ts
├── styles/
│   ├── theme.ts
│   ├── ThemeProvider.tsx
│   └── globalStyles.ts
├── types/
│   └── index.ts
├── data/
│   ├── projects.ts
│   └── fileTree.json
└── __tests__/
    ├── Terminal.test.tsx
    ├── commands.test.ts
    └── useTerminal.test.ts
```

## Key Functions

### Terminal Commands (`src/services/commands.ts`)
- `execute(command, args)` - Main command execution handler
- `getCommandSuggestions(input, commands)` - Fuzzy command matching
- `resolvePath(path)` - Resolves file system paths
- `getCurrentNode()` - Gets current directory node
- `getCurrentDirectory()` - Returns current directory path

### Terminal Component (`src/components/Terminal/Terminal.tsx`)
- `handleInputChange(e)` - Handles command input changes
- `handleCommandClick(command)` - Executes commands from clicks
- `handleKeyDown(e)` - Handles keyboard navigation
- `handleCloseProject()` - Closes project details panel
- `getVisibleHistory()` - Filters terminal history

### Terminal Hook (`src/hooks/useTerminal.ts`)
- `executeCommand(command)` - Executes terminal commands
- `navigateHistory(direction)` - Handles command history navigation
- `getCommandSuggestions(input)` - Gets command suggestions
- `addCommandOnly(command)` - Adds command to history without output
- `openDetailsPanel(project)` - Opens project details panel
- `closeDetailsPanel()` - Closes details panel

## CI/CD

The project uses GitHub Actions for continuous integration:
- Tests run automatically on each push to main branch
- Tests run on pull requests to main branch
- Uses Node.js 18.x
- Caches npm dependencies for faster builds

## License

MIT 