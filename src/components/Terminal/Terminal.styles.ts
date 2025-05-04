import styled from 'styled-components';

export const TerminalWrapper = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr 700px;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Fira Code', monospace;
`;

export const Sidebar = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: 1rem;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
`;

export const TerminalContent = styled.div`
  padding: 1rem;
  overflow-y: auto;
  font-family: 'Fira Code', monospace;
`;

export const CommandLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

export const Prompt = styled.span`
  color: ${({ theme }) => theme.colors.prompt};
  margin-right: 0.5rem;
`;

export const Input = styled.input`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Fira Code', monospace;
  font-size: 1rem;
  width: 100%;
  outline: none;
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

export const Output = styled.div<{ type: 'success' | 'error' | 'info' }>`
  margin-bottom: 1rem;
  color: ${({ theme, type }) => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'info':
        return theme.colors.text.primary;
    }
  }};
`;

export const CommandInput = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

export const CommandOutput = styled.div`
  margin-bottom: 1rem;
`;

export const DetailsPanel = styled.div<{ $isOpen: boolean }>`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: 1rem;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : '100%')});
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
`;

export const DirectoryTree = styled.div`
  margin-top: 1rem;
`;

export const DirectoryItem = styled.div<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
  background-color: ${({ theme, $isActive }) => 
    $isActive ? theme.colors.background.hover : 'transparent'};
  font-family: 'Fira Code', monospace;
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`;

export const DirectoryIcon = styled.span`
  margin-right: 0.5rem;
  font-family: 'Fira Code', monospace;
`;

export const DirectoryName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Fira Code', monospace;
`;

export const SuggestionBox = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: none;
  z-index: 1;
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
    text-decoration: underline;
  }
`;

export const FileCodeBlock = styled.div`
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  background: #1e1e1e;
  border-radius: 4px;
  padding: 8px;
  font-family: 'Fira Code', monospace;
`;

export const TerminalInput = styled.input`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Fira Code', monospace;
  width: 100%;
  &:focus {
    outline: none;
  }
`;

export const DetailsContainer = styled.div`
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: 'Fira Code', monospace;
`;

export const Title = styled.h1`
  color: ${({ theme }) => theme.colors.prompt};
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-family: 'Fira Code', monospace;
`;

export const Section = styled.div`
  margin-bottom: 1.5rem;
  font-family: 'Fira Code', monospace;
`;

export const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.link};
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 0.5rem;
  font-family: 'Fira Code', monospace;
`;

export const Description = styled.p`
  margin-bottom: 1rem;
  line-height: 1.5;
  font-family: 'Fira Code', monospace;
`;

export const List = styled.ul`
  list-style-type: none;
  padding-left: 1rem;
  margin-bottom: 1rem;
  font-family: 'Fira Code', monospace;
`;

export const ListItem = styled.li`
  margin-bottom: 0.5rem;
  font-family: 'Fira Code', monospace;
  &:before {
    content: "•";
    color: ${({ theme }) => theme.colors.prompt};
    margin-right: 0.5rem;
  }
`;

export const TechStack = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  font-family: 'Fira Code', monospace;
`;

export const TechItem = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: 0.5rem;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
`;

export const CloseButton = styled.button`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-top: 1rem;
  font-family: 'Fira Code', monospace;
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`; 