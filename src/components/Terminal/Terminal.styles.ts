import styled from 'styled-components';
import type { DefaultTheme } from 'styled-components';
import { glassEffect, glassEffectLight } from '../../styles/mixins/glass';
import { blink } from '../../styles/mixins/animations';

// Common styles that can be reused
const glassEffectMixin = glassEffect;
const glassEffectLightMixin = glassEffectLight;

export const TerminalWrapper = styled.div<{ $featuredCollapsed: boolean }>`
  display: flex;
  height: calc(100vh - 120px);
  width: 100%;
  overflow: hidden;
  position: relative;
  background: transparent;
  z-index: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const Sidebar = styled.div`
  width: 250px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  flex-shrink: 0;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 0;
`;

export const FeaturedSidebar = styled.div<{ $collapsed: boolean }>`
  width: ${({ $collapsed }) => $collapsed ? '40px' : '280px'};
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  flex-shrink: 0;
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  border-radius: 0;
`;

export const TerminalContent = styled.div`
  flex: 1;
  height: 100%;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  min-width: 0;
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  gap: ${({ theme }) => theme.spacing.xs};
  border-radius: 0;
`;

export const CommandLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

export const Prompt = styled.span<{ $status: 'success' | 'error' | 'default' }>`
  color: ${({ theme, $status }) =>
    $status === 'success' ? theme.colors.success :
    $status === 'error' ? theme.colors.error :
    theme.colors.text.primary
  };
  margin-right: ${({ theme }) => theme.spacing.sm};
  white-space: nowrap;
`;

export const Input = styled.input`
  background: none;
  border: none;
  color: transparent;
  caret-color: transparent;
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  width: 100%;
  outline: none;
  padding: 0;
  margin: 0;
`;

export const Output = styled.div<{ type: 'success' | 'error' | 'info' }>`
  color: ${({ theme, type }) => 
    type === 'success' ? theme.colors.success :
    type === 'error' ? theme.colors.error :
    theme.colors.text.primary
  };
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  white-space: pre-wrap;
  line-height: 1.2;
`;

export const CommandInput = styled.div`
  display: flex;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  position: relative;
  ${glassEffectLightMixin}
`;

export const CommandOutput = styled.div`
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

export const SuggestionBox = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  ${glassEffectMixin}
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: ${({ theme }) => theme.spacing.xs};
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
`;

export const SuggestionItem = styled.div<{ $isSelected: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  background: ${({ theme, $isSelected }) => 
    $isSelected ? theme.colors.background.hover : 'transparent'
  };

  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
  }
`;

export const ClickableText = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  text-decoration: underline;
`;

export const CommandSpan = styled.span`
  color: ${({ theme }) => theme.colors.command};
`;

export const PathSpan = styled.span`
  color: ${({ theme }) => theme.colors.path};
`;

export const ArgSpan = styled.span`
  color: ${({ theme }) => theme.colors.argument};
`;

export const ErrorSpan = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-style: italic;
`;

export const DirSpan = styled.span`
  color: ${({ theme }) => theme.colors.dir};
`;

export const FileSpan = styled.span`
  color: ${({ theme }) => theme.colors.file};
`;

export const BlinkingCursor = styled.span`
  animation: ${blink} 1s step-end infinite;
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ResizerBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  cursor: ew-resize;
  background: transparent;
  transition: background-color 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;

export const DirectoryTree = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export const DirectoryItem = styled.div<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  background-color: ${({ theme, $isActive }) => 
    $isActive ? theme.colors.background.hover : 'transparent'
  };
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`;

export const DirectoryIcon = styled.span`
  margin-right: ${({ theme }) => theme.spacing.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

export const DirectoryName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

export const Title = styled.h1`
  color: ${({ theme }) => theme.colors.command};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

export const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

export const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

export const Description = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.5;
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

export const List = styled.ul`
  list-style-type: none;
  padding-left: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

export const ListItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  &:before {
    content: "•";
    color: ${({ theme }) => theme.colors.command};
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
`;

export const TechStack = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

export const TechItem = styled.div`
  ${glassEffectLightMixin}
  padding: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

export const CloseButton = styled.button`
  ${glassEffectLightMixin}
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  &:hover {
    background: ${({ theme }) => theme.colors.background.hover};
  }
`;

export const FileCodeBlock = styled.div`
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  ${glassEffectLightMixin}
  padding: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.5;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.text.primary};
`; 