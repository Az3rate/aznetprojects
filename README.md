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

## Usage
- Use the terminal to navigate directories and view files/projects.
- Click files in the sidebar or type `cat <file>` to view file content in the right panel.
- Type `cat <project>` to view project details in the right panel.

## Development
- See `src/hooks/useTerminal.ts` for the `addCommandOnly` helper and state management.
- See `src/components/Terminal/Terminal.tsx` for the main UI logic and details panel handling.

---
For more, see PLANNING.md and TASK.md for architecture and task tracking.

## Available Commands

- `help` - Show available commands
- `clear` - Clear the terminal
- `about` - Show information about the terminal
- `projects` - List available projects
- `contact` - Show contact information
- `ls` - List directory contents
- `cd` - Change directory
- `pwd` - Print working directory
- `cat` - Read file contents
- `echo` - Print text
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
│       └── Terminal.styles.ts
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
│   └── testProjects.ts
└── __tests__/
    ├── Terminal.test.tsx
    ├── commands.test.ts
    └── useTerminal.test.ts
```

## CI/CD

The project uses GitHub Actions for continuous integration:
- Tests run automatically on each push to main branch
- Tests run on pull requests to main branch
- Uses Node.js 18.x
- Caches npm dependencies for faster builds

## License

MIT 