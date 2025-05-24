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

The project is organized into several key components:

### Terminal Component
- Handles command input and execution
- Manages terminal history and state
- Provides command suggestions
- Controls the details panel

### File Explorer
- Displays the project's file structure
- Handles directory navigation
- Manages file selection and viewing

### Project Details
- Shows comprehensive project information
- Displays architecture diagrams
- Lists technical stack and features

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

## Development Workflow

1. Local development with hot module replacement
2. TypeScript compilation and type checking
3. ESLint for code quality
4. GitHub Actions for CI/CD

## Styling Guidelines

- Use styled-components for component styling
- Follow the established theme system
- Maintain consistent spacing and typography
- Ensure responsive design across all components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Hugo Villeneuve - [GitHub Profile](https://github.com/Az3rate)

## 🚀 Features

- **Interactive Terminal Interface**: Authentic terminal experience with command execution
- **Project Showcase**: Detailed technical project displays with architecture diagrams
- **Responsive Design**: Optimized for all devices and screen sizes
- **TypeScript**: Full type safety throughout the application
- **Styled Components**: Component-based styling with theme support
- **Runtime Code Visualization**: Advanced JavaScript execution tracking and visualization

## 🛠️ Runtime Visualization System

### **What It Can Do:**

The runtime visualization system is a sophisticated JavaScript instrumentation tool that can track and visualize:

#### ✅ **Fully Supported Patterns:**
- **Function Declarations**: `function myFunc() {}`
- **Arrow Functions**: `const fn = () => {}`, `const fn = (a, b) => a + b`
- **Function Expressions**: `const fn = function() {}`
- **Async Functions**: `async function myFunc() {}`, `const fn = async () => {}`
- **Generator Functions**: `function* myGenerator() {}`
- **Nested Functions**: Functions defined inside other functions
- **Promise Chains**: `.then()`, `.catch()`, `.finally()` callbacks
- **Async/Await Patterns**: Complex async operation tracking
- **setTimeout/setInterval**: Asynchronous timer callbacks
- **Object Methods**: Basic object method detection
- **String/Comment Safety**: Ignores function patterns in strings and comments
- **Template Literals**: Properly handles template strings with embedded expressions
- **Regex Literals**: Context-aware regex pattern detection

#### ⚡ **Performance Characteristics:**
- **High Volume**: Successfully tested with 250+ function executions
- **Complex Async**: Handles deeply nested async operations
- **Memory Efficient**: Optimized for enterprise-grade applications
- **Error Resilient**: Graceful degradation when parsing fails

### **Current Limitations:**

#### 🚧 **Partially Supported:**
- **Class Methods**: Basic detection, may miss complex inheritance patterns
- **Dynamic Functions**: `new Function()` and `eval()` created functions (runtime discovery helps)
- **Module Imports**: ES6 `import/export` statements need enhancement
- **Destructuring**: Complex destructuring assignments with functions
- **HOF Patterns**: Higher-order functions may lose context tracking

#### ❌ **Not Yet Supported:**
- **Minified Code**: Compressed JavaScript is difficult to parse reliably
- **Framework-Specific**: React hooks, Vue composables need specialized handling
- **WebAssembly**: WASM function calls are outside JavaScript scope
- **Worker Threads**: Cross-thread function calls not tracked
- **Proxy/Reflect**: Dynamic function creation via Proxy traps

### **Making It Production-Ready:**

#### **For Enterprise Use:**
```typescript
// Recommended patterns that work best:
async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

const processData = (data: any[]) => {
  return data.map(item => transformItem(item));
};

function transformItem(item: any) {
  // Simple, direct function calls work best
  return { ...item, processed: true };
}

// Avoid complex patterns like:
const dynamicFunction = new Function('return 42'); // ❌ Not tracked
eval('function evalFunc() {}'); // ❌ Not tracked
```

#### **Performance Optimization:**
1. **Code Splitting**: Use static analysis for large codebases
2. **Selective Instrumentation**: Only instrument critical execution paths
3. **Runtime Toggles**: Enable/disable tracking in production
4. **Memory Management**: Clear tracking data for long-running applications

#### **Robustness Enhancements:**
1. **AST Parser**: Uses tokenized parsing instead of naive regex
2. **Context Awareness**: Understands JavaScript syntax context
3. **Fallback Systems**: Multiple parsing strategies for resilience
4. **Error Recovery**: Graceful handling of malformed code
5. **Runtime Discovery**: Detects functions missed by static analysis

### **Real-World Usage:**

The system excels at:
- **Development Debugging**: Understanding complex async flows
- **Performance Analysis**: Identifying function execution bottlenecks  
- **Code Education**: Visualizing how JavaScript executes
- **Testing Scenarios**: Verifying async operation completion
- **Architecture Review**: Understanding system execution patterns

It's particularly powerful for demonstrating JavaScript concepts, debugging complex async flows, and providing visual feedback on code execution patterns.

## 🏗️ Tech Stack

- **React** - Component framework
- **TypeScript** - Type safety
- **Styled Components** - CSS-in-JS styling
- **Context API** - State management
- **Web Workers** - Background code execution
- **AST Parsing** - JavaScript code analysis

## 📦 Installation

```bash
npm install
npm run dev
```

## 🚀 Deployment

```bash
npm run build
npm run preview
```

## 📱 Responsive Design

Optimized for:
- Desktop (1920px+)
- Laptop (1024px - 1919px)  
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 Theme System

The application uses a comprehensive theme system supporting:
- Dark/Light mode variants
- Consistent color palette
- Responsive typography
- Spacing system
- Component theming

## 🔧 Development

### Project Structure
```
src/
├── components/     # React components
├── styles/         # Global styles and themes
├── types/          # TypeScript definitions
├── context/        # React context providers
├── data/           # Static data and content
└── utils/          # Utility functions
```

### Code Quality
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Component testing
- Accessibility compliance

## 📄 License

MIT License - feel free to use this project as inspiration for your own portfolio!

---

*Built with ❤️ and lots of ☕*
