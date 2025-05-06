import { Project } from '../types';

export const projects: Project[] = [
  
    
  {
    name: 'D4UT',
    featured: true,
    description: 'Built with React, Zustand, and TailwindCSS, D4UT leverages a modern frontend stack for real-time build calculations and interactive UI. State management is handled by Zustand, while TailwindCSS and Styled Components provide a flexible, themeable design system. Data analysis and visualization are powered by Leaflet and React-Leaflet.',
    url: 'https://github.com/username/d4ut',
    image: 'd4ut.png',
    architectureImage: 'd4ut-mermaid.png',
    overview: 'A powerful web-based utility tool specifically designed for Diablo 4 players, offering advanced build optimization, damage calculations, and item comparison features. The tool helps players maximize their character\'s potential by analyzing stats, skills, and gear combinations.',
    keyFeatures: [
      'Character Optimization: Build calculations, stat analysis, gear optimization',
      'Data Analysis: Comprehensive stat tracking, performance metrics',
      'User Interface: Interactive maps, build planners, stat calculators',
      'Localization: Multi-language support, internationalization',
      'Data Management: State management, data persistence, real-time updates'
    ],
    architecture: {
      frontend: {
        framework: 'React',
        language: 'TypeScript',
        styling: 'TailwindCSS, SASS, PostCSS',
        stateManagement: 'Zustand'
      },
      backend: {
        framework: 'None',
        language: 'N/A',
        database: 'N/A'
      }
    },
    techStack: [
      { name: 'React', version: '18.2.0', description: 'Frontend framework' },
      { name: 'Zustand', version: '4.3.0', description: 'State management' },
      { name: 'TailwindCSS', version: '3.2.7', description: 'Styling' },
      { name: 'HeadlessUI', version: '-', description: 'UI components' },
      { name: 'HeroIcons', version: '-', description: 'Icons' },
      { name: 'React Icons', version: '-', description: 'Icons' },
      { name: 'Styled Components', version: '-', description: 'CSS-in-JS' },
      { name: 'Leaflet', version: '-', description: 'Maps & Visualization' },
      { name: 'React-Leaflet', version: '-', description: 'Maps & Visualization' },
      { name: 'React Intl Universal', version: '-', description: 'Internationalization' },
      { name: 'React Tour', version: '-', description: 'UI Enhancements' },
      { name: 'React Toastify', version: '-', description: 'UI Enhancements' },
      { name: 'React Input Slider', version: '-', description: 'UI Enhancements' },
      { name: 'Vite', version: '-', description: 'Development Tools' },
      { name: 'Yarn', version: '3.6.1', description: 'Package management' },
      { name: 'TypeScript', version: '5.0', description: 'Type checking' },
      { name: 'ESLint', version: '-', description: 'Linting' },
      { name: 'Lodash', version: '-', description: 'Utility' },
      { name: 'Immer', version: '-', description: 'Utility' },
      { name: 'Dayjs', version: '-', description: 'Utility' },
      { name: 'Axios', version: '-', description: 'HTTP client' },
      { name: 'Jimp', version: '-', description: 'Image processing' },
      { name: 'Tesseract.js', version: '-', description: 'OCR' },
      { name: 'Vercel Analytics', version: '-', description: 'Analytics' }
    ],
    directoryStructure: {
      src: {
        assets: ['static assets'],
        components: ['Reusable UI components'],
        calculation: ['build calculation logic'],
        locales: ['internationalization'],
        main: ['application entry point'],
        stats: ['statistics and analysis'],
        store: ['state management']
      }
    },
    apiEndpoints: [],
    workflow: [
      'Local development with Vite\'s hot module replacement',
      'TypeScript compilation and type checking',
      'ESLint for code quality',
      'Yarn for package management',
      'Vite for building and previewing'
    ],
    summary: 'D4UT started as a personal project to help me figure out which gear was actually better in Diablo 4. I kept getting frustrated trying to compare items and calculate damage, so I built something to do the math for me. It\'s grown into a tool that helps other players make better decisions about their builds and gear. I\'m always adding new features based on what players find useful.'
  },
  {
    name: 'LootManager',
    featured: true,
    description: 'LootManager combines React, Redux Toolkit, Zustand, and Material-UI for a robust, scalable frontend. Firebase Functions and Firestore provide a serverless backend, enabling real-time data sync and authentication. The stack is designed for modularity, rapid feature development, and seamless user experience.',
    url: 'https://github.com/username/lootmanager',
    image: 'lootmanager.png',
    architectureImage: 'loot-manager-mermaid.png',
    overview: 'A comprehensive guild management system specifically designed for Throne and Liberty, focusing on DKP (Dragon Kill Points) tracking, raid scheduling, and loot distribution. Built to handle the unique needs of T&L\'s guild system and progression mechanics.',
    keyFeatures: [
      'User Management: Authentication & Authorization, role-based access control, user profile management, guild selection and switching',
      'DKP Management: DKP tracking and distribution, session management, transaction history, user DKP balances',
      'Event Management: Event creation and scheduling, registration, attendance tracking, verification',
      'Guild Administration: User management, admin logs, team management, premium features',
      'Additional Features: Wishlist system, email notifications, privacy policy, premium upgrade system'
    ],
    architecture: {
      frontend: {
        framework: 'React',
        language: 'TypeScript',
        styling: 'Redux Toolkit, Zustand, Material-UI v6, TailwindCSS, DaisyUI, AG Grid, FullCalendar, Notistack, React Intl, Framer Motion',
        stateManagement: 'Redux Toolkit, Zustand'
      },
      backend: {
        framework: 'Firebase Functions',
        language: 'TypeScript',
        database: 'Firestore'
      }
    },
    techStack: [
      { name: 'React', version: '18.2.0', description: 'Frontend framework' },
      { name: 'Redux Toolkit', version: '1.9.1', description: 'State management' },
      { name: 'Zustand', version: '-', description: 'State management' },
      { name: 'Material-UI', version: '5.11.0', description: 'UI components' },
      { name: 'TailwindCSS', version: '-', description: 'Styling' },
      { name: 'DaisyUI', version: '-', description: 'Styling' },
      { name: 'AG Grid', version: '-', description: 'Data grid' },
      { name: 'FullCalendar', version: '-', description: 'Calendar' },
      { name: 'Notistack', version: '-', description: 'Notifications' },
      { name: 'React Intl', version: '-', description: 'Internationalization' },
      { name: 'Framer Motion', version: '-', description: 'Animation' },
      { name: 'Firebase', version: '9.17.1', description: 'Backend and database' },
      { name: 'Jest', version: '-', description: 'Testing' },
      { name: 'React Testing Library', version: '-', description: 'Testing' },
      { name: 'TypeScript', version: '-', description: 'Type checking' },
      { name: 'ESLint', version: '-', description: 'Linting' }
    ],
    directoryStructure: {
      src: {
        api: ['API integration'],
        components: ['Reusable UI components'],
        features: ['Feature-specific components'],
        hooks: ['Custom React hooks'],
        interfaces: ['TypeScript interfaces'],
        services: ['Business logic services'],
        store: ['Redux store configuration'],
        styles: ['Global styles'],
        themes: ['Theme customization'],
        types: ['TypeScript type definitions'],
        utils: ['Utility functions'],
        contexts: ['React contexts']
      }
    },
    apiEndpoints: [
      { method: 'POST', path: '/auth, /login, /select-guild', description: 'Authentication flow, user login, guild selection', response: '' },
      { method: 'GET', path: '/dkp-management, /sessions, /session/:sessionId', description: 'DKP admin, session management, session details', response: '' },
      { method: 'GET', path: '/events, /event/:eventId, /event-registration/:eventId', description: 'Event listing, details, registration', response: '' },
      { method: 'GET', path: '/user-management, /user-details, /teams', description: 'User admin, profile, team management', response: '' }
    ],
    workflow: [
      'Local development with Firebase emulators, hot reloading, TypeScript compilation',
      'Testing with Jest, React Testing Library, ESLint',
      'Deployment via Firebase Hosting and GitHub Actions'
    ],
    summary: 'LootManager started as a simple way to help my Throne and Liberty guild keep track of who got what loot. It\'s grown into a full-featured system that makes guild life easier - from scheduling raids to managing DKP. I built it to solve real problems we faced in our guild, and it\'s been great seeing other guilds find it useful too.'
  },
  {
    name: 'RaidAlert',
    featured: true,
    description: 'RaidAlert integrates Node.js, Express.js, and Firestore for backend services, with a Discord bot built on discord.js. The web dashboard uses static HTML/JS and custom CSS for lightweight status monitoring. The stack enables real-time notifications, persistent storage, and multi-platform integration.',
    url: 'https://github.com/username/raidalert',
    image: 'raidalert.png',
    architectureImage: 'raid-alert-mermaid.png',
    overview: 'To protect ARK Survival Evolved bases by providing real-time raid notifications and tribe management through Discord. The system monitors server activity, tracks tribe resources, and alerts players of potential threats, helping tribes maintain their dominance in the harsh ARK environment.',
    keyFeatures: [
      'Discord Bot: Monitors Discord channels for tribe-related activity, supports multi-tribe configurations per guild, handles commands and button interactions, provides real-time alerts, and logs activity/errors for audit and troubleshooting.',
      'Web Dashboard: Simple web interface for status monitoring, fetching and displaying tribe analytics and alert data.',
      'Backend API: RESTful endpoints for tribe configuration and license management, health check endpoint for uptime monitoring, centralized Firestore database for persistent storage.',
      'Licensing System: Supports tiered features and license expiration, admin endpoints for license management and auditing.'
    ],
    architecture: {
      frontend: {
        framework: 'Static HTML/JS',
        language: 'JavaScript',
        styling: 'Custom CSS',
        stateManagement: 'None'
      },
      backend: {
        framework: 'Express.js',
        language: 'JavaScript',
        database: 'Firestore'
      }
    },
    techStack: [
      { name: 'Node.js', version: '18.x', description: 'Backend runtime' },
      { name: 'Express.js', version: '4.18.2', description: 'Backend framework' },
      { name: 'discord.js', version: '14.7.1', description: 'Discord bot' },
      { name: 'Firestore', version: '9.17.1', description: 'Database' }
    ],
    directoryStructure: {
      backend: {
        routes: ['API route definitions for tribes and licenses'],
        utils: ['Shared utilities (Firestore, tribe config, licensing, analytics)'],
        logs: ['Log files for bot and server activity']
      },
      dashboard: {
        static: ['Web dashboard server and static files']
      }
    },
    apiEndpoints: [
      { method: 'POST', path: '/create-tribe-config', description: 'Create or update a tribe configuration', response: '' },
      { method: 'GET', path: '/get-tribe-config/:guildId', description: 'Fetch a tribe config for a guild', response: '' },
      { method: 'GET', path: '/check-license/:guildId', description: 'Check license status for a guild', response: '' },
      { method: 'POST', path: '/update-license', description: 'Update or assign a license', response: '' },
      { method: 'GET', path: '/all-licenses', description: '(Admin) List all active licenses', response: '' }
    ],
    workflow: [
      'Local development with nodemon, jest, concurrently, custom file-based logging',
      'Testing with Jest',
      'Deployment via custom scripts and monitoring'
    ],
    summary: 'RaidAlert came from a real need - we kept getting raided in ARK when no one was online. I built this bot to give us a fighting chance, and it\'s been a game-changer for our tribe. It\'s not perfect, but it helps us sleep better knowing we\'ll get a heads-up if someone\'s messing with our base. The Discord integration makes it easy for everyone to stay in the loop.'
  },
  {
    name: 'AzNet Terminal',
    description: 'A modern, interactive terminal interface built with React and TypeScript, designed to showcase my projects and technical capabilities in a unique and engaging way.',
    url: 'https://github.com/username/aznet-terminal',
    image: 'terminal.png',
    architectureImage: 'terminal-mermaid.png',
    overview: 'A sophisticated terminal interface that serves as both a portfolio and a demonstration of technical expertise. Built to address the challenge of effectively communicating entrepreneurial and technical achievements to recruiters and technical reviewers.',
    keyFeatures: [
      'Interactive Terminal: Real command-line interface with history, autocomplete, and command suggestions',
      'Live File Explorer: Browse actual project files and code structure',
      'Project Showcase: Detailed project information with architecture diagrams and tech stacks',
      'Guided Tour: Interactive walkthrough for first-time visitors',
      'Responsive Design: Seamless experience across all devices',
      'Theme Support: Dark mode with customizable accents',
      'Sound Effects: Optional keyboard sounds and background music'
    ],
    architecture: {
      frontend: {
        framework: 'React',
        language: 'TypeScript',
        styling: 'styled-components',
        stateManagement: 'React Hooks'
      },
      backend: {
        framework: 'None',
        language: 'N/A',
        database: 'N/A'
      }
    },
    techStack: [
      { name: 'React', version: '18.2.0', description: 'Frontend framework' },
      { name: 'TypeScript', version: '4.9.5', description: 'Programming language' },
      { name: 'styled-components', version: '6.0.7', description: 'CSS-in-JS styling' },
      { name: 'React Joyride', version: '2.5.1', description: 'Interactive tour' },
      { name: 'Howler.js', version: '2.2.3', description: 'Audio management' }
    ],
    directoryStructure: {
      src: {
        components: ['Terminal', 'FileExplorer', 'ProjectDetails'],
        hooks: ['useTerminal', 'useFileSystem'],
        services: ['commands', 'fileSystem'],
        styles: ['theme', 'globalStyles'],
        types: ['index']
      }
    },
    apiEndpoints: [],
    workflow: [
      'Local development with hot module replacement',
      'TypeScript compilation and type checking',
      'ESLint for code quality',
      'GitHub Actions for CI/CD'
    ],
    summary: 'The AzNet Terminal is more than just a portfolio - it\'s a demonstration of my approach to problem-solving and technical implementation. Born from the challenge of effectively communicating my entrepreneurial journey and technical achievements, this project showcases my ability to create engaging, interactive experiences while maintaining professional standards and technical excellence.'
  }
]; 