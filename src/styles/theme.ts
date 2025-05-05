export const theme = {
  colors: {
    background: {
      primary: '#181825',
      secondary: '#232634',
      hover: '#313244'
    },
    text: {
      primary: '#cdd6f4',
      secondary: '#a6adc8'
    },
    prompt: '#a78bfa',
    success: '#50fa7b',
    error: '#ff5555',
    info: '#8be9fd',
    link: '#8be9fd',
    linkHover: '#b4befe',
    border: '#45475a',
    command: '#00ff99',
    path: '#a78bfa',
    argument: '#ffb86c',
    promptDefault: '#8be9fd',
    dir: '#00bfff',
    file: '#cdd6f4',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  typography: {
    fontFamily: {
      monospace: "'Fira Code', monospace",
      sans: "'Inter', sans-serif"
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    }
  }
};

export type Theme = typeof theme; 