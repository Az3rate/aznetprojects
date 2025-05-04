# Project Planning Document

## Architecture Overview
This project is a modern web application with a React frontend and Express backend. The application features a terminal-like interface with file system navigation and command execution capabilities.

## Directory Structure
```
project/
├── src/                    # React frontend source
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API and service layer
│   ├── styles/           # Styling and themes
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
├── server/              # Express backend
└── config/              # Configuration files
```

## Style Guidelines
- Use TypeScript for type safety
- Follow React functional components with hooks
- Use styled-components for styling
- Maintain component files under 500 lines
- Use clear, descriptive naming conventions
- Document complex logic with inline comments

## Development Workflow
1. Create/update tasks in TASK.md
2. Implement features following the architecture
3. Update documentation as needed
4. Mark completed tasks in TASK.md

## Dependencies
- React 18+
- TypeScript
- Express
- styled-components
- Webpack
- Babel 