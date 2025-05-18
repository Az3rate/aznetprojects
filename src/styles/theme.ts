import { DefaultTheme } from 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: {
        primary: string;
        secondary: string;
        glass: string;
        glassLight: string;
        hover: string;
      };
      text: {
        primary: string;
        secondary: string;
      };
      primary: string;
      secondary: string;
      accent: string;
      success: string;
      warning: string;
      error: string;
      border: string;
      button: string;
      command: string;
      path: string;
      argument: string;
      dir: string;
      file: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    typography: {
      fontFamily: {
        monospace: string;
        sans: string;
      };
      fontSize: {
        xs: string;
        sm: string;
        base: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;
      };
      fontWeight: {
        light: number;
        normal: number;
        medium: number;
        bold: number;
      };
    };
    effects: {
      blur: {
        sm: string;
        md: string;
        lg: string;
      };
      borderRadius: {
        sm: string;
        md: string;
        lg: string;
      };
      boxShadow: {
        sm: string;
        md: string;
        lg: string;
        projectHover: string;
      };
      transition: {
        fast: string;
        normal: string;
        slow: string;
      };
    };
    zIndex: {
      base: number;
      dropdown: number;
      modal: number;
      tooltip: number;
    };
  }
}

export const theme: DefaultTheme = {
  colors: {
    background: {
      primary: '#1a1a1a',
      secondary: '#2a2a2a',
      glass: 'rgba(26, 26, 26, 0.8)',
      glassLight: 'rgba(26, 26, 26, 0.6)',
      hover: '#3a3a3a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
    },
    primary: '#4a9eff',
    secondary: '#6c757d',
    accent: '#00ff9d',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    border: '#404040',
    button: '#4a9eff',
    command: '#4a9eff',
    path: '#4a9eff',
    argument: '#00ff9d',
    dir: '#4a9eff',
    file: '#ffffff',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: {
      monospace: "'Fira Code', monospace",
      sans: "'Inter', sans-serif",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      md: '1.125rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },
  effects: {
    blur: {
      sm: '4px',
      md: '8px',
      lg: '12px',
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
    },
    boxShadow: {
      sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
      md: '0 4px 8px rgba(0, 0, 0, 0.1)',
      lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
      projectHover: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    transition: {
      fast: '0.2s ease',
      normal: '0.3s ease',
      slow: '0.5s ease',
    },
  },
  zIndex: {
    base: 1,
    dropdown: 100,
    modal: 1000,
    tooltip: 2000,
  },
}; 