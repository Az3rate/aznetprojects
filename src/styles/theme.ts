export const theme = {
  colors: {
    background: {
      primary: '#1e1e1e',
      secondary: '#2d2d2d',
      hover: '#3d3d3d'
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc'
    },
    prompt: '#4CAF50',
    success: '#4CAF50',
    error: '#f44336',
    info: '#2196F3',
    link: '#64B5F6',
    linkHover: '#90CAF9',
    border: '#3d3d3d'
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