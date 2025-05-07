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
    overflow: hidden;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.primary}; 
  }

  #root {
    height: 100%;
    width: 100%;
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
    border-radius: 4px;
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
    border-radius: 2px;
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
    border-radius: 2px;
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
`; 