import styled from 'styled-components';
import type { DefaultTheme } from 'styled-components';
import { blink } from '../../styles/mixins/animations';

// Weighted & Anchored Design System - Runtime Playground Style
// Following the same design principles as the Runtime Playground

// Base weighted container pattern
const WeightedContainer = styled.div`
  position: relative;
  background: #0a0c10;
  border: 4px solid #1c2128;
  box-shadow: 
    0 0 0 1px #21262d,
    0 8px 24px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
`;

export const TerminalWrapper = styled.div<{ $featuredCollapsed: boolean }>`
  display: grid;
  grid-template-columns: 264px 1fr ${({ $featuredCollapsed }) => $featuredCollapsed ? '0px' : '400px'};
  grid-template-rows: 1fr;
  grid-template-areas:
    "sidebar terminal details";
  gap: 24px;
  padding: 24px;
  padding-top: 88px;
  height: 100vh;
  max-width: 100vw;
  overflow: hidden;
  background: #010409;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  box-sizing: border-box;
`;

export const Sidebar = styled(WeightedContainer)`
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

export const TerminalContent = styled(WeightedContainer)`
  grid-area: terminal;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

export const DetailsPanel = styled(WeightedContainer)`
  grid-area: details;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

export const TerminalHeader = styled.div`
  background: #0d1117;
  border-bottom: 2px solid #1c2128;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
`;

export const TerminalBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 20px;
  font-family: 'SF Mono', monospace;
  background: #0a0c10;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: #e6edf3;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    width: 20px;
    height: 20px;
    color: #58a6ff;
    filter: drop-shadow(0 0 8px rgba(88, 166, 255, 0.4));
  }
`;

export const CommandLine = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-family: 'SF Mono', monospace;
  font-size: 14px;
  line-height: 1.4;
`;

export const Prompt = styled.span<{ $status: 'success' | 'error' | 'default'; $isFocused?: boolean }>`
  color: ${({ $status }) =>
    $status === 'success' ? '#00d448' :
    $status === 'error' ? '#f85149' :
    '#58a6ff'
  };
  margin-right: 8px;
  white-space: nowrap;
  font-weight: 600;
  text-shadow: ${({ $isFocused }) => $isFocused 
    ? '0 0 15px currentColor' 
    : '0 0 10px currentColor'
  };
  transition: all 0.3s ease;
  
  ${({ $isFocused }) => $isFocused && `
    transform: scale(1.02);
    filter: brightness(1.2);
  `}
`;

export const Input = styled.input`
  background: none;
  border: none;
  color: transparent;
  caret-color: transparent;
  font-family: 'SF Mono', monospace;
  font-size: 14px;
  width: 100%;
  outline: none;
  padding: 0;
  margin: 0;
`;

export const Output = styled.div<{ type: 'success' | 'error' | 'info' }>`
  color: ${({ type }) => 
    type === 'success' ? '#00d448' :
    type === 'error' ? '#f85149' :
    '#e6edf3'
  };
  margin-bottom: 12px;
  font-family: 'SF Mono', monospace;
  white-space: pre-wrap;
  line-height: 1.4;
  font-size: 13px;
  padding-left: 16px;
  border-left: 2px solid ${({ type }) => 
    type === 'success' ? '#238636' :
    type === 'error' ? '#da3633' :
    '#1f6feb'
  };
`;

export const CommandInput = styled.div<{ $isFocused?: boolean }>`
  display: flex;
  align-items: center;
  margin-top: auto;
  padding: 16px 20px;
  font-family: 'SF Mono', monospace;
  position: relative;
  background: #0d1117;
  border-top: 2px solid ${({ $isFocused }) => $isFocused ? '#238636' : '#1c2128'};
  box-shadow: ${({ $isFocused }) => $isFocused 
    ? '0 -2px 8px rgba(0, 0, 0, 0.2), 0 0 20px rgba(35, 134, 54, 0.3)' 
    : '0 -2px 8px rgba(0, 0, 0, 0.2)'
  };
  flex-shrink: 0;
  transition: all 0.3s ease;
  
  ${({ $isFocused }) => $isFocused && `
    background: linear-gradient(135deg, #0d1117, #0f1419);
  `}
`;

export const InputContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
`;

export const HighlightInputSpan = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  font-family: 'SF Mono', monospace;
  font-size: 14px;
  color: #e6edf3;
  white-space: pre;
  z-index: 2;
`;

export const InputOverlay = styled.input`
  background: none;
  border: none;
  color: transparent;
  caret-color: transparent;
  font-family: 'SF Mono', monospace;
  font-size: 14px;
  width: 100%;
  outline: none;
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 3;
`;

export const SuggestionBox = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: #161b22;
  border: 2px solid #21262d;
  border-radius: 8px;
  margin-bottom: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 20;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 8px 24px rgba(0, 0, 0, 0.5);
`;

export const SuggestionItem = styled.div<{ $isSelected: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  background: ${({ $isSelected }) => $isSelected ? '#238636' : 'transparent'};
  color: ${({ $isSelected }) => $isSelected ? '#ffffff' : '#e6edf3'};
  border-bottom: 1px solid #21262d;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $isSelected }) => $isSelected ? '#2ea043' : '#21262d'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

export const OutputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
`;

export const OutputTypeSpan = styled.span`
  width: 20px;
  color: #7d8590;
  font-weight: 600;
`;

export const OutputNameSpan = styled.span`
  width: 60px;
  color: #7d8590;
  font-weight: 600;
`;

export const DirSpan = styled.span`
  color: #58a6ff;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    color: #388bfd;
    text-decoration: underline;
  }
`;

export const FileSpan = styled.span`
  color: #00d448;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    color: #2ea043;
    text-decoration: underline;
  }
`;

export const ClickableProjectText = styled.span`
  color: #8b5cf6;
  cursor: pointer;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    color: #c084fc;
    text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
  }
`;

export const BlinkingCursor = styled.span<{ $isFocused?: boolean }>`
  animation: ${blink} ${({ $isFocused }) => $isFocused ? '0.8s' : '1.2s'} step-end infinite;
  color: ${({ $isFocused }) => $isFocused ? '#00d448' : '#00d448'};
  font-weight: 700;
  text-shadow: ${({ $isFocused }) => $isFocused 
    ? '0 0 12px currentColor' 
    : '0 0 6px currentColor'
  };
  transition: all 0.3s ease;
  
  ${({ $isFocused }) => $isFocused && `
    transform: scale(1.1);
    filter: brightness(1.3);
  `}
`;

export const QuickMenuDiv = styled.div`
  /* Hidden div for tour targeting */
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
`;

export const DirectoryName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'SF Mono', monospace;
  font-weight: 600;
  color: #e6edf3;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

export const DirectoryItem = styled.div<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 2px;
  cursor: pointer;
  background: ${({ $isActive }) => $isActive ? '#238636' : 'transparent'};
  border: 2px solid ${({ $isActive }) => $isActive ? '#2ea043' : 'transparent'};
  border-radius: 6px;
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $isActive }) => $isActive ? '#ffffff' : '#e6edf3'};
  transition: all 0.2s ease;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  
  &:hover {
    background: ${({ $isActive }) => $isActive ? '#2ea043' : '#21262d'};
    border-color: ${({ $isActive }) => $isActive ? '#238636' : '#30363d'};
    transform: translateX(2px);
  }
  
  &:active {
    transform: translateX(0);
  }
`;

export const DirectoryIcon = styled.span`
  margin-right: 8px;
  font-family: 'SF Mono', monospace;
  font-weight: 700;
  color: #58a6ff;
  font-size: 14px;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
`;

export const Title = styled.h1`
  color: #e6edf3;
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 16px 0;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const Section = styled.div`
  margin-bottom: 24px;
  font-family: 'SF Mono', monospace;
`;

export const Description = styled.p`
  margin-bottom: 16px;
  line-height: 1.5;
  font-family: 'SF Mono', monospace;
  color: #7d8590;
  font-size: 13px;
`;

export const List = styled.ul`
  list-style-type: none;
  padding-left: 16px;
  margin-bottom: 16px;
  font-family: 'SF Mono', monospace;
`;

export const ListItem = styled.li`
  margin-bottom: 8px;
  color: #e6edf3;
  font-size: 13px;
  position: relative;
  
  &:before {
    content: '▶';
    color: #238636;
    margin-right: 8px;
    font-weight: 700;
  }
`;

export const TechItem = styled.div`
  background: #161b22;
  border: 2px solid #21262d;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 8px;
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #e6edf3;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3);
`;

export const CloseButton = styled.button`
  background: linear-gradient(135deg, #f85149, #da3633);
  color: #ffffff;
  border: 2px solid #da3633;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  margin-top: 16px;
  font-family: 'SF Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
    
  &:hover {
    background: linear-gradient(135deg, #ff6b6b, #f85149);
    transform: translateY(-1px);
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 4px 8px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const FeaturedSection = styled.div`
  margin-bottom: 24px;
`;

export const FeaturedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 2px solid #1c2128;
  background: #0d1117;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

export const FeaturedTitle = styled.span`
  font-weight: 800;
  font-size: 16px;
  color: #e6edf3;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:before {
    content: '★';
    color: #ffd700;
    font-size: 14px;
    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
  }
`;

export const CollapseButton = styled.button`
  background: rgba(33, 38, 45, 0.9);
  border: 2px solid #30363d;
  border-radius: 6px;
  color: #e6edf3;
  cursor: pointer;
  font-size: 16px;
  padding: 8px 12px;
  transition: all 0.2s ease;
  font-weight: 600;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3);
    
  &:hover {
    background: rgba(48, 54, 61, 0.9);
    transform: translateY(-1px);
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 4px 8px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const ProjectCard = styled.div`
  background: #161b22;
  border: 2px solid #21262d;
  border-radius: 8px;
  color: #e6edf3;
  margin-bottom: 12px;
  padding: 16px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3);
  
  &:hover {
    border-color: #238636;
    transform: translateY(-1px);
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 4px 8px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(35, 134, 54, 0.2);
  }
`;

export const ProjectName = styled.div`
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #58a6ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ProjectDescription = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: #7d8590;
  line-height: 1.4;
  overflow: hidden;
`;

export const StyledPre = styled.pre`
  margin: 0;
  font-family: 'SF Mono', monospace;
  background: none;
  color: inherit;
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.4;
`;

export const ResizerBar = styled.div`
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  background: rgba(31, 111, 235, 0.1);
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.2s ease;
  z-index: 30;
  
  &:hover {
    background: rgba(31, 111, 235, 0.3);
    border-color: #1f6feb;
    box-shadow: 0 0 10px rgba(31, 111, 235, 0.5);
  }
  
  &:active {
    background: rgba(31, 111, 235, 0.5);
    border-color: #58a6ff;
  }
`; 