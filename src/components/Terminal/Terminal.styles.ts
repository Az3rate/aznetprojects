import styled from 'styled-components';

export const TerminalWrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Fira Code', monospace;
`;

export const Sidebar = styled.aside`
  width: 250px;
  padding: 1rem;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  overflow-y: auto;
`;

export const TerminalContent = styled.main`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

export const CommandLine = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
`;

export const Prompt = styled.span`
  color: ${({ theme }) => theme.colors.prompt};
  margin-right: 0.5rem;
`;

export const Input = styled.input`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: inherit;
  font-size: inherit;
  flex: 1;
  outline: none;
  padding: 0;
  margin: 0;
`;

export const Output = styled.div<{ type: 'success' | 'error' | 'info' }>`
  color: ${({ theme, type }) => {
    switch (type) {
      case 'error':
        return theme.colors.error;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.text.primary;
    }
  }};
  white-space: pre-wrap;
  margin: 0.5rem 0;
`;

export const CommandInput = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
`;

export const CommandOutput = styled.div`
  margin-top: 0.5rem;
`;

export const DetailsPanel = styled.aside<{ $isOpen: boolean }>`
  width: ${({ $isOpen }) => ($isOpen ? '400px' : '0')};
  padding: ${({ $isOpen }) => ($isOpen ? '1rem' : '0')};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  overflow-y: auto;
  transition: width 0.3s ease;
`;

export const DirectoryTree = styled.div`
  margin-top: 1rem;
`;

export const DirectoryItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.25rem;
  cursor: pointer;
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.background.hover : 'transparent'};
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`;

export const DirectoryIcon = styled.span`
  margin-right: 0.5rem;
`;

export const DirectoryName = styled.span`
  flex: 1;
`;

export const SuggestionBox = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

export const SuggestionItem = styled.div<{ $isSelected: boolean }>`
  padding: 0.5rem;
  cursor: pointer;
  background-color: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.background.hover : 'transparent'};
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`;

export const ClickableText = styled.span`
  color: ${({ theme }) => theme.colors.link};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.linkHover};
    text-decoration: underline;
  }
`; 