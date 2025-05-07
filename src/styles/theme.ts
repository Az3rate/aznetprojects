export const theme = {
  colors: {
    background: {
      primary: 'rgb(12,12,20)', // main background
      secondary: 'rgba(35, 13, 43, 0.32)', // extra, for panels/cards
      hover: 'rgba(110,40,120,0.08)' // subtle accent hover (darker)
    },
    text: {
      primary: '#fff', // white text
      secondary: 'rgba(255,255,255,0.7)'
    },
    accent: 'rgb(110,40,120)', // darker accent for scrollbars, highlights
    button: 'rgb(34, 8, 34)', // for buttons
    border: 'rgb(110,40,120)', // accent border (darker)
    command: 'rgb(110,40,120)', // accent for command prompt (darker)
    path: 'rgb(84,63,192)', // path color (button color)
    argument: 'rgb(110,40,120)', // accent for arguments (darker)
    dir: 'rgb(84,63,192)', // directory color (button color)
    file: '#fff', // file color (white)
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