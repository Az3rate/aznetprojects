import { Project } from '../types';

export const projects: Project[] = [
  {
    name: 'Terminal Interface',
    description: 'A modern terminal interface built with React and TypeScript',
    url: 'https://github.com/username/terminal-interface',
    image: 'https://via.placeholder.com/400x300',
    architectureImage: 'https://via.placeholder.com/800x600',
    overview: 'A terminal interface that provides a modern and interactive way to browse and explore projects.',
    keyFeatures: [
      'Three-panel layout with directory tree, terminal, and details panel',
      'Command history and auto-completion',
      'Project details with architecture diagrams',
      'Responsive design with dark theme'
    ],
    architecture: {
      frontend: {
        framework: 'React',
        language: 'TypeScript',
        styling: 'styled-components',
        stateManagement: 'React Hooks'
      },
      backend: {
        framework: 'Express',
        language: 'TypeScript',
        database: 'MongoDB'
      }
    },
    techStack: [
      { name: 'React', version: '18.2.0', description: 'Frontend framework' },
      { name: 'TypeScript', version: '4.9.5', description: 'Programming language' },
      { name: 'styled-components', version: '6.0.7', description: 'CSS-in-JS styling' },
      { name: 'Express', version: '4.18.2', description: 'Backend framework' },
      { name: 'MongoDB', version: '6.0.5', description: 'Database' }
    ],
    directoryStructure: {
      src: {
        components: ['Terminal', 'Sidebar', 'DetailsPanel'],
        hooks: ['useTerminal', 'useFileSystem'],
        services: ['commands', 'fileSystem'],
        styles: ['theme', 'globalStyles'],
        types: ['index']
      }
    },
    apiEndpoints: [
      {
        path: '/api/projects',
        method: 'GET',
        description: 'Get all projects',
        response: 'Array of Project objects'
      },
      {
        path: '/api/projects/:id',
        method: 'GET',
        description: 'Get project by ID',
        response: 'Project object'
      }
    ],
    workflow: [
      'Clone repository',
      'Install dependencies',
      'Start development server',
      'Build for production'
    ],
    summary: 'A modern terminal interface that provides an interactive way to explore projects and their details.'
  },
  {
    name: 'D4UT',
    description: 'A web-based utility tool for Diablo 4 players, offering build optimization and stat analysis.',
    url: 'https://github.com/username/d4ut',
    image: 'https://via.placeholder.com/400x300',
    architectureImage: 'https://via.placeholder.com/800x600',
    overview: 'Helps Diablo 4 players maximize their character builds with advanced calculations and item comparison.',
    keyFeatures: [
      'Build calculations and stat analysis',
      'Gear optimization',
      'Interactive maps and planners',
      'Multi-language support'
    ],
    architecture: {
      frontend: {
        framework: 'React',
        language: 'TypeScript',
        styling: 'TailwindCSS',
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
      { name: 'TailwindCSS', version: '3.2.7', description: 'Styling' }
    ],
    directoryStructure: {
      src: {
        components: ['App', 'Stats', 'Map'],
        store: ['store'],
        calculation: ['calculation'],
        locales: ['locales']
      }
    },
    apiEndpoints: [],
    workflow: [
      'Clone repository',
      'Install dependencies',
      'Start development server',
      'Build for production'
    ],
    summary: 'D4UT helps Diablo 4 players optimize their builds and compare items.'
  },
  {
    name: 'LootManager',
    description: 'A comprehensive guild management system for Throne and Liberty, focusing on DKP tracking and raid scheduling.',
    url: 'https://github.com/username/lootmanager',
    image: 'https://via.placeholder.com/400x300',
    architectureImage: 'https://via.placeholder.com/800x600',
    overview: 'Tracks DKP, manages raids, and handles loot distribution for T&L guilds.',
    keyFeatures: [
      'User and guild management',
      'DKP tracking and distribution',
      'Event and raid scheduling',
      'Admin logs and premium features'
    ],
    architecture: {
      frontend: {
        framework: 'React',
        language: 'TypeScript',
        styling: 'Material-UI',
        stateManagement: 'Redux Toolkit'
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
      { name: 'Material-UI', version: '5.11.0', description: 'UI components' },
      { name: 'Firebase', version: '9.17.1', description: 'Backend and database' }
    ],
    directoryStructure: {
      src: {
        api: ['api'],
        components: ['Dashboard', 'RaidScheduler'],
        features: ['DKP', 'Events'],
        store: ['store'],
        services: ['dkpService']
      }
    },
    apiEndpoints: [
      {
        path: '/auth',
        method: 'POST',
        description: 'Authenticate user',
        response: 'User object'
      },
      {
        path: '/dkp-management',
        method: 'GET',
        description: 'Get DKP data',
        response: 'DKP data'
      }
    ],
    workflow: [
      'Clone repository',
      'Install dependencies',
      'Start development server',
      'Build for production'
    ],
    summary: 'LootManager helps T&L guilds manage DKP, raids, and loot.'
  },
  {
    name: 'RaidAlert',
    description: 'A Discord bot and web dashboard for ARK Survival Evolved, providing real-time raid notifications and tribe management.',
    url: 'https://github.com/username/raidalert',
    image: 'https://via.placeholder.com/400x300',
    architectureImage: 'https://via.placeholder.com/800x600',
    overview: 'Monitors Discord and ARK servers, alerts players of raids, and manages tribe resources.',
    keyFeatures: [
      'Discord bot for tribe activity',
      'Web dashboard for analytics',
      'RESTful API for tribe config',
      'Tiered licensing system'
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
        routes: ['tribes', 'licenses'],
        utils: ['firestore', 'analytics'],
        logs: ['bot.log', 'server.log']
      },
      dashboard: {
        static: ['index.html', 'dashboard.js']
      }
    },
    apiEndpoints: [
      {
        path: '/create-tribe-config',
        method: 'POST',
        description: 'Create or update a tribe configuration',
        response: 'Tribe config object'
      },
      {
        path: '/get-tribe-config/:guildId',
        method: 'GET',
        description: 'Fetch a tribe config for a guild',
        response: 'Tribe config object'
      }
    ],
    workflow: [
      'Clone repository',
      'Install dependencies',
      'Start Discord bot and web server',
      'Monitor tribe activity'
    ],
    summary: 'RaidAlert helps ARK tribes stay safe and manage resources.'
  }
]; 