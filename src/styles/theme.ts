export const theme = {
  colors: {
    background: {
      primary: 'rgb(12,12,20)', // main background
      secondary: 'rgba(35, 13, 43, 0.32)', // extra, for panels/cards
      glass: 'rgba(28, 28, 30, 0.8)',
      glassLight: 'rgba(28, 28, 30, 0.6)',
      hover: 'rgba(110,40,120,0.08)' // subtle accent hover (darker)
    },
    text: {
      primary: '#fff', // white text
      secondary: 'rgba(255,255,255,0.7)'
    },
    primary: 'rgb(84,63,192)', // primary color for gradients
    secondary: 'rgb(110,40,120)', // secondary color for gradients
    accent: 'rgb(110,40,120)', // darker accent for scrollbars, highlights
    button: 'rgb(34, 8, 34)', // for buttons
    border: 'rgb(110,40,120)', // accent border (darker)
    command: 'rgb(110,40,120)', // accent for command prompt (darker)
    path: 'rgb(84,63,192)', // path color (button color)
    argument: 'rgb(110,40,120)', // accent for arguments (darker)
    dir: 'rgb(84,63,192)', // directory color (button color)
    file: '#fff', // file color (white)
    success: '#50FA7B',
    error: '#FF5555'
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
      primary: "'Inter', sans-serif",
      monospace: "'Fira Code', monospace",
      sans: "'Inter', sans-serif"
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem'
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  effects: {
    blur: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px'
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px'
    },
    boxShadow: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
      projectHover: '0 4px 12px rgba(0, 0, 0, 0.1)' // For project cards or similar UI elements
    },
    transition: {
      fast: '150ms ease',
      normal: '300ms ease',
      slow: '500ms ease'
    }
  },
  zIndex: {
    base: 1,
    dropdown: 1000,
    modal: 2000,
    tooltip: 3000
  },
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease'
  }
};

export type Theme = typeof theme; 