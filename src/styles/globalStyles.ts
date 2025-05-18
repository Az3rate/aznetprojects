import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.primary}; 
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
  }

  #root {
    height: 100vh;
    width: 100vw;
    position: relative; /* # Reason: Ensures absolutely positioned SwirlBackground canvas is visible and not clipped */
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.primary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.accent};
    border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.accent};
  }

  /* Joyride global overrides to enforce theme colors */
  .react-joyride__button, .react-joyride__button--next, .react-joyride__button--back, .react-joyride__button--primary {
    background: ${({ theme }) => theme.colors.button} !important;
    color: ${({ theme }) => theme.colors.text.primary} !important;
    border: 2px solid ${({ theme }) => theme.colors.button} !important;
    font-family: 'Fira Code', monospace !important;
    font-weight: 600;
    border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  }
  .react-joyride__button--back {
    background: none !important;
    color: ${({ theme }) => theme.colors.button} !important;
    border: none !important;
  }
  .react-joyride__tooltip {
    background: ${({ theme }) => theme.colors.background.primary} !important;
    color: ${({ theme }) => theme.colors.text.primary} !important;
    border: 2px solid ${({ theme }) => theme.colors.button} !important;
    font-family: 'Fira Code', monospace !important;
    border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  }
  .react-joyride__tooltip .react-joyride__tooltip-content {
    color: ${({ theme }) => theme.colors.text.primary} !important;
  }
  .react-joyride__tooltip .react-joyride__tooltip-arrow {
    border-top-color: ${({ theme }) => theme.colors.button} !important;
    border-bottom-color: ${({ theme }) => theme.colors.button} !important;
  }
  .react-joyride__beacon {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.button} !important;
  }

  :root {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    line-height: 1.5;
    font-weight: 400;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`; 