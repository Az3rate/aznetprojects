# Terminal Interface

A modern terminal interface built with React and TypeScript that provides an interactive way to browse and explore projects.

## Features

- Three-panel layout with directory tree, terminal, and details panel
- Command history and auto-completion
- Project details with architecture diagrams
- Responsive design with dark theme

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