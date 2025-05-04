import { Project } from '../types';

export const testProjects: Project[] = [
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
  }
]; 