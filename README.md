# HV Portfolio Terminal

A sophisticated, interactive terminal interface built with React and TypeScript that serves as both a portfolio and a demonstration of technical expertise. This project showcases Hugo Villeneuve's journey from corporate development to entrepreneurial success, presenting his projects and achievements in an engaging, terminal-style interface.

## Overview

The HV Portfolio Terminal is more than just a portfolio - it's a living demonstration of technical capabilities and problem-solving approach. Born from the challenge of effectively communicating entrepreneurial achievements and technical expertise, this project showcases the ability to create engaging, interactive experiences while maintaining professional standards and technical excellence.

## Features

### Terminal Interface
- **Command-Line Interface**: Supports common terminal commands like `ls`, `cd`, `cat`, `clear`
- **Dynamic Prompt**: Color changes based on command status (success, error, or default)
- **Live Syntax Highlighting**: Real-time code highlighting as you type
- **Blinking Block Cursor**: A filled, blinking block cursor (█) at the end of your input
- **Colored Directory Listing**: Directories in blue, files in default color
- **Click-to-Focus Input**: Click anywhere in the terminal area to start typing
- **Command History**: Navigate through previous commands with arrow keys
- **Fuzzy Command Suggestions**: Intelligent command completion and suggestions

### Project Showcase
- **Featured Projects**: Curated list of impactful projects with detailed information
- **Interactive File Explorer**: Live, expandable file tree with folder expansion and file clicking
- **Project Details Panel**: Comprehensive project information including:
  - Architecture diagrams
  - Technical stack details
  - Key features
  - Implementation specifics
  - Directory structure

### User Experience
- **Guided Tours**: Two distinct tour modes:
  - Recruiter Tour: Focuses on project achievements and business impact
  - Technical Tour: Delves into implementation details and architecture
- **Responsive Design**: Seamless experience across all devices
- **Theme Support**: Dark mode with customizable accents
- **Audio Integration**: Optional keyboard sounds and background music

### AI Chat Companion
- **Conversational AI**: Use the `ai` command to chat with AzNet, your friendly AI companion. AzNet responds in a warm, conversational, and human-like way, avoiding technical or coding topics unless you specifically ask. All AI responses appear inline in the terminal, alternating between your input and AzNet's reply.
- **Usage**: Type `ai <your message>` (e.g., `ai How are you today?`). AzNet will reply directly in the terminal, and the chat alternates between you and AzNet, always ending with your prompt.

## Technical Stack

### Frontend
- **Framework**: React 18.2.0
- **Language**: TypeScript 4.9.5
- **Styling**: styled-components 6.0.7
- **Tour System**: React Joyride 2.5.1
- **Audio**: Howler.js 2.2.3

### Architecture
The application follows a modular architecture with clear separation of concerns:

```
src/
├── components/        # React components
│   ├── Terminal/     # Terminal interface components
│   ├── FileExplorer/ # File system navigation
│   └── ProjectDetails/ # Project information display
├── hooks/            # Custom React hooks
├── services/         # Command and file system services
├── styles/           # Theme and global styles
└── types/            # TypeScript type definitions
```

## Available Commands

### Navigation
- `ls` - List directory contents (directories in blue, files in default color)
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

### AI Chat Companion
- `ai <message>` - Chat with AzNet, your AI companion. Example: `ai Tell me a joke!`
  - AzNet responds in green text, inline in the terminal, and always in a friendly, conversational tone.

## Development Setup

1. Clone the repository:
```