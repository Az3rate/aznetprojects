import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import type { RuntimeProcessNode } from './types';
import MermaidDiagram from '../components/MermaidDiagram';
import { RuntimeTimeline } from './RuntimeTimeline';
import styled, { keyframes, css } from 'styled-components';
import { RuntimeContext } from './context/RuntimeContext';
import { VscGroupByRefType, VscPlay, VscTools } from 'react-icons/vsc';

// Enhanced animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 0, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(255, 255, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 0, 0); }
`;

const zoomIn = keyframes`
  from { transform: scale(0.95); opacity: 0.8; }
  to { transform: scale(1); opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const completionGlow = keyframes`
  0% { box-shadow: 0 0 3px rgba(73, 220, 73, 0.6); }
  50% { box-shadow: 0 0 12px rgba(73, 220, 73, 0.8); }
  100% { box-shadow: 0 0 3px rgba(73, 220, 73, 0.6); }
`;

// Weighted & Anchored: Grid-based layout system
const VisualizationContainer = styled.div`
  position: relative;
  background: #0a0c10;
  border: 2px solid #1c2128;
  box-shadow: 
    0 0 0 1px #21262d,
    0 8px 24px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  min-height: 700px;
  max-height: 800px;
  overflow: hidden;
  flex-shrink: 0;
  width: 100%;
  touch-action: none;
  user-select: none;
  border-radius: 0;
  display: grid;
  grid-template-columns: 1fr 280px;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "toolbar sidebar"
    "canvas sidebar"
    "statusbar statusbar";
`;

const ZoomableContainer = styled.div<{ zoom: number; panX: number; panY: number }>`
  grid-area: canvas;
  overflow: auto;
  width: 100%;
  height: 100%;
  cursor: grab;
  position: relative;
  
  &:active {
    cursor: grabbing;
  }
`;

const ScrollableContent = styled.div<{ zoom: number; panX: number; panY: number }>`
  transform: scale(${({ zoom }) => zoom}) translate(${({ panX }) => panX}px, ${({ panY }) => panY}px);
  transform-origin: 0 0;
  transition: none;
  min-width: 100%;
  min-height: 100%;
  will-change: transform;
`;

const TreeCanvas = styled.div`
  position: relative;
  padding: 40px;
  min-width: 100%;
  min-height: 100%;
  max-width: 1400px; /* Increase max width for better tree layout */
  display: flex;
  flex-direction: column;
  gap: 24px; /* Reduced gap for tighter tree structure */
  align-items: flex-start; /* Align to start for tree layout */
  margin: 0 auto;
`;

// Substantial, weighted tree nodes
const TreeNode = styled.div<{ 
  status?: string; 
  depth: number; 
  collapsed?: boolean;
  nodeType?: 'sync' | 'async' | 'callback';
  gridColumn?: string;
}>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  grid-column: ${({ gridColumn }) => gridColumn || 'span 2'};
  background: ${({ status, nodeType }) => {
    if (nodeType === 'async') return status === 'completed' ? '#0d1b0d' : '#1a1400';
    if (nodeType === 'callback') return status === 'completed' ? '#0d0d1b' : '#1a0a00';
    return status === 'completed' ? '#001a1a' : '#0f0f0f';
  }};
  border: 3px solid ${({ status, nodeType, depth }) => {
    // Use the same enhanced color system for borders
    const getLineColor = (depth: number, nodeType: 'sync' | 'async' | 'callback') => {
      const baseColors = {
        async: { h: 45, s: 85, l: 65 },
        callback: { h: 270, s: 75, l: 70 },
        sync: { h: 210, s: 85, l: 65 }
      };
      
      const base = baseColors[nodeType || 'sync'];
      const hueShift = (depth || 0) * 40;
      const saturationBoost = Math.min(95, base.s + (depth || 0) * 5);
      const lightnessAdjust = status === 'completed' 
        ? Math.min(75, base.l + 10) // Brighter for completed
        : Math.max(45, base.l - (depth || 0) * 3);
      const newHue = (base.h + hueShift) % 360;
      
      return `hsl(${newHue}, ${saturationBoost}%, ${lightnessAdjust}%)`;
    };
    
    return getLineColor(depth || 0, nodeType || 'sync');
  }};
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 6px 12px rgba(0, 0, 0, 0.4),
    0 0 20px ${({ status, nodeType, depth }) => {
      // Use the same enhanced color system for glow
      const getLineColor = (depth: number, nodeType: 'sync' | 'async' | 'callback') => {
        const baseColors = {
          async: { h: 45, s: 85, l: 65 },
          callback: { h: 270, s: 75, l: 70 },
          sync: { h: 210, s: 85, l: 65 }
        };
        
        const base = baseColors[nodeType || 'sync'];
        const hueShift = (depth || 0) * 40;
        const saturationBoost = Math.min(95, base.s + (depth || 0) * 5);
        const lightnessAdjust = Math.max(45, base.l - (depth || 0) * 3);
        const newHue = (base.h + hueShift) % 360;
        
        return `hsl(${newHue}, ${saturationBoost}%, ${lightnessAdjust}%, 0.15)`;
      };
      
      return getLineColor(depth || 0, nodeType || 'sync');
    }},
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  min-height: 56px;
  max-height: 56px; /* Fixed height for consistent tree alignment */
  padding: 12px 20px;
  margin: 0;
  font-weight: 700;
  font-size: ${({ depth }) => 
    depth === 0 ? '16px' :
    depth === 1 ? '15px' :
    '14px'
  };
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  letter-spacing: 0;
  line-height: 1.2;
  backdrop-filter: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  
  /* Add connector alignment guide */
  &::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${({ status, nodeType, depth }) => {
      // Use the same enhanced color system
      const getLineColor = (depth: number, nodeType: 'sync' | 'async' | 'callback') => {
        const baseColors = {
          async: { h: 45, s: 85, l: 65 },
          callback: { h: 270, s: 75, l: 70 },
          sync: { h: 210, s: 85, l: 65 }
        };
        
        const base = baseColors[nodeType || 'sync'];
        const hueShift = (depth || 0) * 40;
        const saturationBoost = Math.min(95, base.s + (depth || 0) * 5);
        const lightnessAdjust = Math.max(45, base.l - (depth || 0) * 3);
        const newHue = (base.h + hueShift) % 360;
        
        return `hsl(${newHue}, ${saturationBoost}%, ${lightnessAdjust}%)`;
      };
      
      return getLineColor(depth || 0, nodeType || 'sync');
    }};
    transform: translateY(-50%);
    box-shadow: 0 0 4px currentColor;
    z-index: 3;
  }
  
  /* Hide connector dot for root node */
  ${({ depth }) => depth === 0 && `
    &::before {
      display: none;
    }
  `}
  
  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 12px 24px rgba(0, 0, 0, 0.5),
      0 0 32px ${({ status, nodeType, depth }) => {
        // Use the same enhanced color system for hover glow
        const getLineColor = (depth: number, nodeType: 'sync' | 'async' | 'callback') => {
          const baseColors = {
            async: { h: 45, s: 85, l: 65 },
            callback: { h: 270, s: 75, l: 70 },
            sync: { h: 210, s: 85, l: 65 }
          };
          
          const base = baseColors[nodeType || 'sync'];
          const hueShift = (depth || 0) * 40;
          const saturationBoost = Math.min(95, base.s + (depth || 0) * 5);
          const lightnessAdjust = Math.max(45, base.l - (depth || 0) * 3);
          const newHue = (base.h + hueShift) % 360;
          
          return `hsl(${newHue}, ${saturationBoost}%, ${lightnessAdjust}%, 0.25)`;
        };
        
        return getLineColor(depth || 0, nodeType || 'sync');
      }},
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3);
    z-index: 10;
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
  }
  
  ${({ status }) => status === 'running' && css`
    border-color: #fbbf24;
    animation: ${pulse} 2s infinite;
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 6px 12px rgba(0, 0, 0, 0.4),
      0 0 24px rgba(251, 191, 36, 0.4),
      0 0 48px rgba(251, 191, 36, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  `}
  
  ${({ collapsed }) => collapsed && css`
    opacity: 0.7;
    border-style: dashed;
    &::before {
      opacity: 0.5;
    }
  `}
`;

// Anchored connection system with precise anchor points
const ConnectorContainer = styled.div<{ depth: number }>`
    position: absolute;
  top: ${({ depth }) => 40 + depth * 120}px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  pointer-events: none;
`;

const ConnectorLine = styled.div<{ 
  isAsync?: boolean; 
  length: number;
  startX: number;
  endX: number;
}>`
  position: absolute;
  width: 4px;
  height: ${({ length }) => length}px;
  left: ${({ startX }) => startX}px;
  background: ${({ isAsync }) => 
    isAsync 
      ? 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
      : 'linear-gradient(180deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)'
  };
  border-radius: 2px;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 0 8px ${({ isAsync }) => isAsync ? 'rgba(251, 191, 36, 0.4)' : 'rgba(59, 130, 246, 0.4)'};
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 12px solid ${({ isAsync }) => 
      isAsync ? '#d97706' : '#1d4ed8'
    };
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  }
`;

// Anchored UI system
const ToolbarArea = styled.div`
  grid-area: toolbar;
  background: #0d1117;
  border-bottom: 2px solid #1c2128;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const SidebarPanel = styled.div`
  grid-area: sidebar;
  background: #0d1117;
  border-left: 2px solid #1c2128;
  padding: 20px;
  overflow-y: auto;
  box-shadow: inset 2px 0 8px rgba(0, 0, 0, 0.2);
`;

const StatusBar = styled.div`
  grid-area: statusbar;
  background: #0d1117;
  border-top: 2px solid #1c2128;
  padding: 8px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-family: 'SF Mono', monospace;
  color: #7d8590;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.2);
`;

// Weighted control elements
const ControlGroup = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(33, 38, 45, 0.6);
  border: 1px solid #30363d;
  border-radius: 8px;
  backdrop-filter: blur(8px);
`;

const WeightedButton = styled.button<{ active?: boolean; variant?: 'primary' | 'secondary' }>`
  background: ${({ active, variant }) => {
    if (active) return 'linear-gradient(135deg, #238636, #2ea043)';
    if (variant === 'primary') return 'linear-gradient(135deg, #1f6feb, #0969da)';
    return 'rgba(33, 38, 45, 0.9)';
  }};
  color: ${({ active }) => active ? '#ffffff' : '#e6edf3'};
  border: 2px solid ${({ active, variant }) => {
    if (active) return '#238636';
    if (variant === 'primary') return '#1f6feb';
    return '#30363d';
  }};
  border-radius: 6px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: 'SF Mono', monospace;
  transition: none;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: ${({ active, variant }) => {
      if (active) return 'linear-gradient(135deg, #2ea043, #34d058)';
      if (variant === 'primary') return 'linear-gradient(135deg, #388bfd, #1f6feb)';
      return 'rgba(48, 54, 61, 0.9)';
    }};
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

const SearchField = styled.input`
  background: #21262d;
  border: 2px solid #30363d;
  border-radius: 6px;
  padding: 8px 12px;
  color: #e6edf3;
  font-size: 13px;
  font-family: 'SF Mono', monospace;
  width: 200px;
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 0, 0, 0.8);
  
  &::placeholder {
    color: #7d8590;
  }
  
  &:focus {
    outline: none;
    border-color: #1f6feb;
    box-shadow: 
      inset 0 1px 2px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 0 0 3px rgba(31, 111, 235, 0.3);
  }
`;

// Substantial status indicator
const WeightedStatusIndicator = styled.div<{ status: string }>`
  position: absolute;
  top: -12px;
  right: -12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ status }) => 
    status === 'completed' ? 'radial-gradient(circle, #00d448, #00a836)' :
    status === 'running' ? 'radial-gradient(circle, #fbbf24, #f59e0b)' :
    'radial-gradient(circle, #71717a, #52525b)'
  };
  border: 3px solid #0a0c10;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 0 16px ${({ status }) => 
      status === 'completed' ? 'rgba(0, 212, 72, 0.4)' :
      status === 'running' ? 'rgba(251, 191, 36, 0.4)' :
      'rgba(113, 113, 122, 0.2)'
    };
  z-index: 15;
  
  &:after {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    background: ${({ status }) => 
      status === 'completed' ? '#ffffff' :
      status === 'running' ? '#ffffff' :
      'transparent'
    };
    opacity: ${({ status }) => status !== 'pending' ? '0.4' : '0'};
  }
`;

// Grid-based layout containers
const NodeLane = styled.div<{ depth: number }>`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  margin-bottom: 48px;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    left: -40px;
    right: -40px;
    top: -12px;
    bottom: -12px;
    background: rgba(28, 33, 40, 0.3);
    border-radius: 8px;
    z-index: -1;
  }
`;

const EmptyStateIcon = styled(VscPlay)`
  width: 48px;
  height: 48px;
  color: #7d8590;
  opacity: 0.5;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 20px;
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
    color: #00d448;
    filter: drop-shadow(0 0 8px rgba(0, 212, 72, 0.4));
    animation: ${pulse} 2s infinite;
  }
`;

// Type definitions for component state
interface VisualizationState {
  zoom: number;
  panX: number;
  panY: number;
  collapsedNodes: Set<string>;
  searchTerm: string;
  layout: 'compact' | 'spacious' | 'grid';
  showMetrics: boolean;
  // Promise method display options
  showPromiseMethods: boolean;
  groupPromiseChains: boolean;
  showOnlyUserPromises: boolean;
  promiseDetailLevel: 'summary' | 'detailed' | 'full';
}

interface EnhancedTreeNodeProps {
  node: RuntimeProcessNode;
  depth?: number;
  onCollapse?: (nodeId: string) => void;
  collapsed?: boolean;
  collapsedNodes?: Set<string>;
  searchTerm?: string;
  showMetrics?: boolean;
}

interface Props {
  root: RuntimeProcessNode | null;
}

// Enhanced Tree Node Component with sophisticated features
const EnhancedTreeNode: React.FC<EnhancedTreeNodeProps> = ({ 
  node, 
  depth = 0, 
  onCollapse, 
  collapsed = false, 
  searchTerm = '', 
  showMetrics = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  // Determine node type based on characteristics
  const nodeType = useMemo(() => {
    if (node.name.includes('async') || node.name.includes('fetch') || node.name.includes('promise')) {
      return 'async';
    }
    if (node.name.includes('callback') || node.name.includes('setTimeout')) {
      return 'callback';
    }
    return 'sync';
  }, [node.name]);

  // Check for potential loops (same function called multiple times)
  const hasLoop = useMemo(() => {
    if (!node.children) return false;
    const functionNames = new Set<string>();
    const checkLoop = (currentNode: RuntimeProcessNode): boolean => {
      if (functionNames.has(currentNode.name)) return true;
      functionNames.add(currentNode.name);
      return currentNode.children?.some((child: RuntimeProcessNode) => checkLoop(child)) || false;
    };
    return checkLoop(node);
  }, [node]);

  // Calculate execution metrics
  const duration = node.startTime && node.endTime 
    ? node.endTime - node.startTime 
    : 0;
  const durationPercent = Math.min(100, (duration / 1000) * 10); // Scale for visualization

  // Highlight matching search terms
  const isSearchMatch = searchTerm && node.name.toLowerCase().includes(searchTerm.toLowerCase());

  // Handle collapse/expand
  const handleToggle = () => {
    if (node.children && node.children.length > 0) {
      setIsExpanded(!isExpanded);
      onCollapse?.(node.id);
    }
  };

  const hasChildren = node.children && node.children.length > 0;
  const showCollapsed = hasChildren && !isExpanded;
  const isAsync = nodeType === 'async' || nodeType === 'callback';
  const isParallelExecution = hasChildren && node.children.length > 2;
  
  return (
    <TreeNode
      status={node.status}
      depth={depth}
      collapsed={showCollapsed}
      nodeType={nodeType}
      gridColumn={depth === 0 ? "2 / 10" : depth === 1 ? "span 2" : "span 1"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleToggle}
      style={{
        outline: isSearchMatch ? '3px solid #ffc107' : 'none',
        filter: isSearchMatch ? 'brightness(1.2)' : 'none'
      }}
    >
      {node.name}
      
      {/* Weighted status indicator */}
      <WeightedStatusIndicator status={node.status || 'running'} />
      
      {/* Metrics overlay when showMetrics is true */}
      {showMetrics && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '-8px',
          right: '-8px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#e6edf3',
          padding: '8px',
          borderRadius: '6px',
          fontSize: '10px',
          fontFamily: 'SF Mono, monospace',
          zIndex: 25,
          border: '1px solid #30363d',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div>ID: {node.id.substring(3)}</div>
          <div>Type: {nodeType}</div>
          <div>Children: {node.children?.length || 0}</div>
          {duration > 0 && <div>Duration: {duration < 1000 ? `${duration}ms` : `${(duration/1000).toFixed(2)}s`}</div>}
          {node.parentId && <div>Parent: {node.parentId.substring(3)}</div>}
        </div>
      )}
      
      {/* Timing badge on hover (only if not showing metrics) */}
      {isHovered && duration > 0 && !showMetrics && (
        <div style={{
          position: 'absolute',
          top: '-35px',
          right: '0',
          background: 'rgba(0,0,0,0.9)',
          color: '#e6edf3',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'SF Mono, monospace',
          whiteSpace: 'nowrap',
          zIndex: 20,
          border: '1px solid #30363d',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)'
        }}>
          {duration < 1000 ? `${duration}ms` : `${(duration/1000).toFixed(2)}s`}
        </div>
      )}
    </TreeNode>
  );
};

const GridLayoutNode: React.FC<EnhancedTreeNodeProps> = ({ 
  node, 
  depth = 0, 
  onCollapse, 
  collapsed = false, 
  collapsedNodes = new Set(),
  searchTerm = '', 
  showMetrics = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const [isHovered, setIsHovered] = useState(false);
  
  // Update isExpanded when collapse state changes globally
  useEffect(() => {
    const shouldBeCollapsed = collapsedNodes.has(node.id);
    console.log(`[COLLAPSE_STATE] Node ${node.id} should be collapsed: ${shouldBeCollapsed}, current expanded: ${isExpanded}`);
    setIsExpanded(!shouldBeCollapsed);
  }, [collapsedNodes, node.id]);
  
  // Debug logging
  useEffect(() => {
    console.log(`[GRID_NODE] Rendering ${node.name} at depth ${depth}, children: ${node.children?.length || 0}, expanded: ${isExpanded}`);
  }, [node.name, depth, node.children?.length, isExpanded]);
  
  const nodeType = node.name.includes('artificialDelay') ? 'async' :
                  node.name.includes('callback') ? 'callback' : 'sync';
  const hasLoop = node.children?.some(child => child.name === node.name) || false;
  
  const duration = node.startTime && node.endTime 
    ? node.endTime - node.startTime 
    : 0;
  
  const isSearchMatch = searchTerm && node.name.toLowerCase().includes(searchTerm.toLowerCase());
  
  const handleToggle = () => {
    if (node.children && node.children.length > 0) {
      console.log(`[GRID_NODE] Toggle clicked for ${node.id}, current expanded: ${isExpanded}`);
      setIsExpanded(!isExpanded);
      onCollapse?.(node.id);
    }
  };

  const hasChildren = node.children && node.children.length > 0;
  const showCollapsed = hasChildren && !isExpanded;
  const INDENT_SIZE = 40; // Consistent indentation
  const NODE_HEIGHT = 68; // Height per node including margins
  
  // Enhanced color system based on depth and node type
  const getLineColor = (depth: number, nodeType: 'sync' | 'async' | 'callback') => {
    // Base colors for different node types
    const baseColors = {
      async: { h: 45, s: 85, l: 65 },    // Yellow-orange base
      callback: { h: 270, s: 75, l: 70 }, // Purple base  
      sync: { h: 210, s: 85, l: 65 }     // Blue base
    };
    
    const base = baseColors[nodeType];
    
    // Rotate hue and adjust saturation/lightness based on depth
    const hueShift = depth * 40; // 40 degree rotation per level
    const saturationBoost = Math.min(95, base.s + depth * 5); // Increase saturation slightly
    const lightnessAdjust = Math.max(45, base.l - depth * 3); // Slightly darker for deeper levels
    
    const newHue = (base.h + hueShift) % 360;
    
    return `hsl(${newHue}, ${saturationBoost}%, ${lightnessAdjust}%)`;
  };
  
  const LINE_COLOR = getLineColor(depth, nodeType);
  
  // Calculate total height of all descendants when expanded
  const calculateSubtreeHeight = (node: RuntimeProcessNode, isExpanded: boolean): number => {
    if (!node.children || node.children.length === 0 || !isExpanded) {
      return NODE_HEIGHT; // Just this node
    }
    
    let totalHeight = NODE_HEIGHT; // This node
    
    for (const child of node.children) {
      const childExpanded = !collapsedNodes.has(child.id);
      totalHeight += calculateSubtreeHeight(child, childExpanded);
    }
    
    return totalHeight;
  };
  
  const subtreeHeight = calculateSubtreeHeight(node, isExpanded);
  const childrenHeight = subtreeHeight - NODE_HEIGHT; // Height of just the children portion
  
  return (
    <div style={{
      position: 'relative',
      width: '100%'
    }}>
      {/* Only draw connector line if this is not the root node */}
      {depth > 0 && (
        <div style={{
          position: 'absolute',
          left: `${(depth - 1) * INDENT_SIZE + 18}px`, // Connect to parent's vertical line
          top: '30px', // Align with center of node
          width: `${INDENT_SIZE - 18}px`, // Horizontal line to node
          height: '3px',
          background: LINE_COLOR,
          borderRadius: '1px',
          zIndex: 1
        }} />
      )}
      
      {/* Draw vertical line for nodes that have children (and are expanded) */}
      {hasChildren && isExpanded && childrenHeight > 0 && (
        <div style={{
          position: 'absolute',
          left: `${depth * INDENT_SIZE + 18}px`, // Vertical line position for this node
          top: '64px', // Start below the node
          width: '3px',
          height: `${childrenHeight - 12}px`, // Dynamic height based on actual children
          background: LINE_COLOR,
          borderRadius: '1px',
          zIndex: 1
        }} />
      )}
      
      {/* The main node */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginLeft: `${depth * INDENT_SIZE}px`,
        marginBottom: '12px',
        position: 'relative',
        zIndex: 2
      }}>
        <TreeNode
          status={node.status}
          depth={depth}
          collapsed={showCollapsed}
          nodeType={nodeType}
          gridColumn="1 / -1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleToggle}
          style={{
            outline: isSearchMatch ? '3px solid #ffc107' : 'none',
            filter: isSearchMatch ? 'brightness(1.2)' : 'none',
            maxWidth: `${Math.max(300, 700 - depth * 50)}px`
          }}
        >
          {node.name}
          <WeightedStatusIndicator status={node.status || 'running'} />
          
          {/* Metrics overlay when showMetrics is true */}
          {showMetrics && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              left: '-8px',
              right: '-8px',
              background: 'rgba(0, 0, 0, 0.9)',
              color: '#e6edf3',
              padding: '8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontFamily: 'SF Mono, monospace',
              zIndex: 25,
              border: '1px solid #30363d',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <div>ID: {node.id.substring(3)}</div>
              <div>Type: {nodeType}</div>
              <div>Children: {node.children?.length || 0}</div>
              {duration > 0 && <div>Duration: {duration < 1000 ? `${duration}ms` : `${(duration/1000).toFixed(2)}s`}</div>}
              {node.parentId && <div>Parent: {node.parentId.substring(3)}</div>}
            </div>
          )}
          
          {/* Timing badge on hover (only if not showing metrics) */}
          {isHovered && duration > 0 && !showMetrics && (
            <div style={{
              position: 'absolute',
              top: '-35px',
              right: '0',
              background: 'rgba(0,0,0,0.9)',
              color: '#e6edf3',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'SF Mono, monospace',
              whiteSpace: 'nowrap',
              zIndex: 20,
              border: '1px solid #30363d',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)'
            }}>
              {duration < 1000 ? `${duration}ms` : `${(duration/1000).toFixed(2)}s`}
            </div>
          )}
        </TreeNode>
      </div>
      
      {/* Render children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child, index) => (
            <GridLayoutNode
              key={child.id || `child-${index}`}
              node={child}
              depth={depth + 1}
              onCollapse={onCollapse}
              collapsed={collapsedNodes.has(child.id)}
              collapsedNodes={collapsedNodes}
              searchTerm={searchTerm}
              showMetrics={showMetrics}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #7d8590;
  font-size: 12px;
  font-family: 'SF Mono', monospace;
  margin-bottom: 8px;
  
  input {
    margin-right: 8px;
    accent-color: #238636;
    cursor: pointer;
  }
  
  &:hover {
    color: #e6edf3;
  }
`;

const ControlSubsection = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #30363d;
`;

const SubsectionTitle = styled.h4`
  color: #7d8590;
  fontSize: '12px';
  margin: 0 0 12px 0;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 11px;
`;

// Helper functions for Promise method detection and filtering
const isPromiseMethod = (functionName: string): boolean => {
  const promiseMethods = ['then', 'catch', 'finally', 'resolve', 'reject', 'all', 'race', 'allSettled'];
  return promiseMethods.some(method => 
    functionName.includes(`.${method}`) || 
    functionName.includes(`Promise.${method}`) ||
    functionName === method
  );
};

const isFrameworkPromise = (functionName: string): boolean => {
  const frameworkPatterns = [
    'fetch', 'axios', 'jquery', '$http', 'XMLHttpRequest',
    'react', 'vue', 'angular', 'lodash', 'ramda',
    'zone.js', 'scheduler', 'webpack', 'babel'
  ];
  return frameworkPatterns.some(pattern => 
    functionName.toLowerCase().includes(pattern.toLowerCase())
  );
};

const shouldShowNode = (
  node: RuntimeProcessNode, 
  options: {
    showPromiseMethods: boolean;
    showOnlyUserPromises: boolean;
  }
): boolean => {
  // Always show non-Promise methods
  if (!isPromiseMethod(node.name)) {
    return true;
  }
  
  // Hide Promise methods if disabled
  if (!options.showPromiseMethods) {
    return false;
  }
  
  // Hide framework Promises if user-only is enabled
  if (options.showOnlyUserPromises && isFrameworkPromise(node.name)) {
    return false;
  }
  
  return true;
};

const groupPromiseChain = (node: RuntimeProcessNode): RuntimeProcessNode => {
  if (!node.children || node.children.length === 0) {
    return node;
  }
  
  // Look for consecutive Promise method children
  const promiseChildren = node.children.filter(child => isPromiseMethod(child.name));
  const nonPromiseChildren = node.children.filter(child => !isPromiseMethod(child.name));
  
  if (promiseChildren.length > 1) {
    // Create a grouped Promise chain node
    const chainNode: RuntimeProcessNode = {
      id: `${node.id}-promise-chain`,
      name: `Promise Chain (${promiseChildren.length} steps)`,
      type: 'promise-chain',
      status: promiseChildren.every(c => c.status === 'completed') ? 'completed' : 'running',
      startTime: Math.min(...promiseChildren.map(c => c.startTime)),
      endTime: promiseChildren.every(c => c.endTime) ? Math.max(...promiseChildren.map(c => c.endTime!)) : undefined,
      children: promiseChildren,
      parentId: node.id
    };
    
    return {
      ...node,
      children: [...nonPromiseChildren, chainNode]
    };
  }
  
  return {
    ...node,
    children: node.children.map(groupPromiseChain)
  };
};

const filterNodeTree = (
  node: RuntimeProcessNode,
  options: {
    showPromiseMethods: boolean;
    showOnlyUserPromises: boolean;
    groupPromiseChains: boolean;
  }
): RuntimeProcessNode | null => {
  // First check if this node should be shown
  if (!shouldShowNode(node, options)) {
    return null;
  }
  
  // Process children recursively
  const filteredChildren = (node.children || [])
    .map(child => filterNodeTree(child, options))
    .filter((child): child is RuntimeProcessNode => child !== null);
  
  let processedNode: RuntimeProcessNode = {
    ...node,
    children: filteredChildren
  };
  
  // Apply Promise chain grouping if enabled
  if (options.groupPromiseChains && isPromiseMethod(node.name)) {
    processedNode = groupPromiseChain(processedNode);
  }
  
  return processedNode;
};

export const RuntimeProcessVisualizer: React.FC<Props> = ({ root }) => {
  const { syncVisualization } = useContext(RuntimeContext);
  const [syncClicked, setSyncClicked] = useState(false);
  const [forceRender, setForceRender] = useState(0); // Force re-render trigger
  
  // Enhanced visualization state
  const [visualizationState, setVisualizationState] = useState<VisualizationState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    collapsedNodes: new Set(),
    searchTerm: '',
    layout: 'compact',
    showMetrics: false,
    // Promise method display options
    showPromiseMethods: false,
    groupPromiseChains: false,
    showOnlyUserPromises: false,
    promiseDetailLevel: 'summary'
  });

  // Refs for pan and zoom functionality
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomableRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number>();

  // Safe root with proper children array - do this before useMemo
  const safeRoot = root ? {
    ...root,
    children: Array.isArray(root.children) ? root.children : []
  } : null;

  // Apply Promise filtering to the tree
  const filteredRoot = useMemo(() => {
    if (!safeRoot) return null;
    
    return filterNodeTree(safeRoot, {
      showPromiseMethods: visualizationState.showPromiseMethods,
      showOnlyUserPromises: visualizationState.showOnlyUserPromises,
      groupPromiseChains: visualizationState.groupPromiseChains
    });
  }, [safeRoot, visualizationState.showPromiseMethods, visualizationState.showOnlyUserPromises, visualizationState.groupPromiseChains, forceRender]);

  // Calculate total nodes for performance info - moved before early return
  const totalNodes = useMemo(() => {
    if (!filteredRoot) return 0;
    const count = (node: RuntimeProcessNode): number => {
      return 1 + (node.children?.reduce((sum, child) => sum + count(child), 0) || 0);
    };
    return count(filteredRoot);
  }, [filteredRoot, forceRender]); // Add forceRender to dependencies

  // Calculate execution metrics
  const executionMetrics = useMemo(() => {
    if (!filteredRoot) return null;
    
    const metrics = {
      totalDuration: 0,
      longestFunction: { name: '', duration: 0 },
      asyncFunctions: 0,
      syncFunctions: 0,
      averageDuration: 0,
      deepestNesting: 0
    };
    
    const calculateMetrics = (node: RuntimeProcessNode, depth: number = 0, isRoot: boolean = false) => {
      metrics.deepestNesting = Math.max(metrics.deepestNesting, depth);
      
      if (node.startTime && node.endTime) {
        const duration = node.endTime - node.startTime;
        metrics.totalDuration += duration;
        
        // Don't count main/root function for "longest function" since it always contains everything
        if (!isRoot && duration > metrics.longestFunction.duration) {
          metrics.longestFunction = { name: node.name, duration };
        }
      }
      
      if (node.name.includes('async') || node.name.includes('fetch') || node.name.includes('callback')) {
        metrics.asyncFunctions++;
      } else {
        metrics.syncFunctions++;
      }
      
      node.children?.forEach(child => calculateMetrics(child, depth + 1, false));
    };
    
    calculateMetrics(filteredRoot, 0, true); // Mark root as true
    metrics.averageDuration = metrics.totalDuration / totalNodes;
    
    return metrics;
  }, [filteredRoot, totalNodes, forceRender]);

  // Debug logging
  useEffect(() => {
    if (root) {
      console.log('[ENHANCED_VISUALIZER] Root updated:', root);
      console.log('[ENHANCED_VISUALIZER] Children count:', root.children?.length || 0);
    }
  }, [root]);
  
  // Update visualization state
  const updateState = (updates: Partial<VisualizationState>) => {
    setVisualizationState(prev => ({ ...prev, ...updates }));
  };

  // Optimized transform update using direct DOM manipulation for smooth panning
  const updateTransform = useCallback((zoom: number, panX: number, panY: number) => {
    const scrollableContent = containerRef.current?.querySelector('[data-scrollable="true"]') as HTMLElement;
    if (scrollableContent) {
      scrollableContent.style.transform = `scale(${zoom}) translate(${panX}px, ${panY}px)`;
      scrollableContent.style.transformOrigin = '0 0';
      console.log(`[TRANSFORM] Applied: scale(${zoom}) translate(${panX}px, ${panY}px)`);
    }
  }, []);

  // Handle zoom
  const handleZoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    const newZoom = Math.min(3, Math.max(0.1, visualizationState.zoom + delta));
    console.log(`[ZOOM] Current: ${visualizationState.zoom}, New: ${newZoom}, Delta: ${delta}`);
    
    let newPanX = visualizationState.panX;
    let newPanY = visualizationState.panY;
    
    if (centerX !== undefined && centerY !== undefined) {
      // Zoom towards cursor position
      const zoomFactor = newZoom / visualizationState.zoom;
      newPanX = centerX - (centerX - visualizationState.panX) * zoomFactor;
      newPanY = centerY - (centerY - visualizationState.panY) * zoomFactor;
    }
    
    // Update state first
    updateState({ zoom: newZoom, panX: newPanX, panY: newPanY });
    
    // Then apply transform immediately
    updateTransform(newZoom, newPanX, newPanY);
  }, [visualizationState.zoom, visualizationState.panX, visualizationState.panY, updateState, updateTransform]);

  // Handle pan with optimized performance - Allow panning at any zoom level
  const handleMouseDown = (e: React.MouseEvent) => {
    // Allow panning at any zoom level, not just when zoomed out
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      
      // Cancel previous animation frame
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      
      // Use requestAnimationFrame for smooth updates
      animationFrame.current = requestAnimationFrame(() => {
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        
        const newPanX = visualizationState.panX + deltaX;
        const newPanY = visualizationState.panY + deltaY;
        
        // Update DOM directly for smooth panning
        updateTransform(visualizationState.zoom, newPanX, newPanY);
        
        // Update state less frequently
        updateState({
          panX: newPanX,
          panY: newPanY
        });
        
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
  };

  // Prevent context menu on right click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Enhanced wheel event handler - Disable all wheel scrolling, only allow Ctrl+wheel for zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const nativeWheelHandler = (e: WheelEvent) => {
      // Always prevent default wheel behavior in the visualizer
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Only allow zoom when Ctrl/Cmd is held
      if (e.ctrlKey || e.metaKey) {
        const rect = container.getBoundingClientRect();
        const centerX = e.clientX - rect.left;
        const centerY = e.clientY - rect.top;
        
        // Normalize wheel delta for consistent behavior across browsers
        const delta = -Math.sign(e.deltaY) * 0.1;
        handleZoom(delta, centerX, centerY);
      }
      // For all other wheel events, do nothing (disabled)
    };

    // Add listener with passive: false to ensure preventDefault works
    container.addEventListener('wheel', nativeWheelHandler, { 
      passive: false, 
      capture: true 
    });

    return () => {
      container.removeEventListener('wheel', nativeWheelHandler);
    };
  }, [handleZoom]);

  // Handle node collapse
  const handleCollapse = (nodeId: string) => {
    console.log(`[COLLAPSE] Toggling collapse for node: ${nodeId}`);
    const newCollapsed = new Set(visualizationState.collapsedNodes);
    if (newCollapsed.has(nodeId)) {
      newCollapsed.delete(nodeId);
      console.log(`[COLLAPSE] Expanding node: ${nodeId}`);
    } else {
      newCollapsed.add(nodeId);
      console.log(`[COLLAPSE] Collapsing node: ${nodeId}`);
    }
    updateState({ collapsedNodes: newCollapsed });
    
    // Force a re-render to ensure collapse state is applied
    setForceRender(prev => prev + 1);
  };

  // Control handlers
  const handleSync = () => {
    console.log('[VISUALIZER] Sync button clicked - triggering sync and force render');
    setSyncClicked(true);
    
    // Call the sync function from context
        if (syncVisualization) {
          syncVisualization();
        }
    
    // Force a re-render to ensure UI updates
    setForceRender(prev => prev + 1);
    
    // Reset the sync clicked state
    setTimeout(() => setSyncClicked(false), 3000);
  };

  const resetView = () => {
    console.log('[VISUALIZER] Reset view clicked');
    
    // Update state
    updateState({ zoom: 1, panX: 0, panY: 0 });
    
    // Apply transform immediately
    updateTransform(1, 0, 0);
    
    // Force re-render
    setForceRender(prev => prev + 1);
  };

  const fitToScreen = () => {
    console.log('[VISUALIZER] Fit to screen clicked');
    
    // Calculate optimal zoom to fit content
    const container = containerRef.current;
    if (container && filteredRoot) {
      const containerRect = container.getBoundingClientRect();
      const contentWidth = Math.max(800, totalNodes * 150); // Estimate content width
      const contentHeight = Math.max(600, totalNodes * 100); // Estimate content height
      
      const optimalZoom = Math.min(
        containerRect.width / contentWidth,
        containerRect.height / contentHeight,
        1
      );
      
      console.log(`[FIT_TO_SCREEN] Container: ${containerRect.width}x${containerRect.height}, Content: ${contentWidth}x${contentHeight}, Optimal zoom: ${optimalZoom}`);
      
      // Update state
      updateState({ zoom: optimalZoom, panX: 0, panY: 0 });
      
      // Apply transform immediately
      updateTransform(optimalZoom, 0, 0);
      
      // Force re-render
      setForceRender(prev => prev + 1);
    }
  };

  const toggleMetrics = () => {
    console.log('[VISUALIZER] Metrics button clicked - toggling metrics display');
    updateState({ showMetrics: !visualizationState.showMetrics });
    
    // Force re-render to ensure metrics are shown/hidden
    setForceRender(prev => prev + 1);
  };

  const expandAll = () => {
    console.log('[VISUALIZER] Expand All clicked');
    updateState({ collapsedNodes: new Set() });
    
    // Force re-render
    setForceRender(prev => prev + 1);
  };

  const collapseAll = () => {
    console.log('[VISUALIZER] Collapse All clicked');
    if (filteredRoot) {
      const allNodeIds = new Set<string>();
      const collectIds = (node: RuntimeProcessNode) => {
        if (node.children && node.children.length > 0) {
          allNodeIds.add(node.id);
          node.children.forEach(collectIds);
        }
      };
      collectIds(filteredRoot);
      console.log(`[COLLAPSE_ALL] Collected ${allNodeIds.size} node IDs to collapse:`, Array.from(allNodeIds));
      updateState({ collapsedNodes: allNodeIds });
      
      // Force re-render
      setForceRender(prev => prev + 1);
    }
  };

  // Apply transform on state changes
  useEffect(() => {
    updateTransform(visualizationState.zoom, visualizationState.panX, visualizationState.panY);
  }, [visualizationState.zoom, visualizationState.panX, visualizationState.panY, updateTransform]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  // NOW handle the conditional rendering AFTER all hooks
  return (
    <>
      <VisualizationContainer>
        {/* Anchored Toolbar */}
        <ToolbarArea>
          <Title>
            <VscGroupByRefType />
            Runtime Visualizer
          </Title>
          <SearchField
            placeholder="Search nodes..."
            value={visualizationState.searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              updateState({ searchTerm: e.target.value })
            }
          />
          <ControlGroup>
            <WeightedButton 
              variant="primary"
              onClick={handleSync}
              title="Sync visualization with runtime state"
            >
              Sync
            </WeightedButton>
            <WeightedButton 
              onClick={() => handleZoom(0.2)}
              title="Zoom In (or use Ctrl+Wheel)"
            >
              🔍+
            </WeightedButton>
            <WeightedButton 
              onClick={() => handleZoom(-0.2)}
              title="Zoom Out (or use Ctrl+Wheel)"
            >
              🔍−
            </WeightedButton>
            <WeightedButton 
              active={visualizationState.showMetrics}
              onClick={toggleMetrics}
              title="Toggle detailed metrics overlay on nodes"
            >
              Metrics
            </WeightedButton>
            <WeightedButton 
              onClick={resetView}
              title="Reset zoom and pan to default"
            >
              Reset
            </WeightedButton>
          </ControlGroup>
        </ToolbarArea>

        {/* Anchored Controls Sidebar */}
        <SidebarPanel>
          <h3 style={{ 
            color: '#e6edf3', 
            fontSize: '14px', 
            fontWeight: '600',
            margin: '0 0 16px 0',
            fontFamily: 'SF Mono, monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Controls
          </h3>
          
          <ControlGroup style={{ flexDirection: 'column', gap: '8px' }}>
            <WeightedButton onClick={fitToScreen}>Fit to Screen</WeightedButton>
            <WeightedButton onClick={expandAll}>Expand All</WeightedButton>
            <WeightedButton onClick={collapseAll}>Collapse All</WeightedButton>
          </ControlGroup>

          {/* Execution Statistics */}
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ 
              color: '#7d8590', 
              fontSize: '12px',
              margin: '0 0 8px 0',
              fontFamily: 'SF Mono, monospace',
              textTransform: 'uppercase'
            }}>
              Execution Stats
            </h4>
            <div style={{ 
              color: '#e6edf3', 
              fontSize: '11px',
              fontFamily: 'SF Mono, monospace',
              lineHeight: '1.6'
            }}>
              <div>Nodes: {totalNodes}</div>
              <div>Zoom: {(visualizationState.zoom * 100).toFixed(0)}%</div>
              <div>Collapsed: {visualizationState.collapsedNodes.size}</div>
              {executionMetrics && (
                <>
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #30363d' }}>
                    <div>Total Duration: {executionMetrics.totalDuration < 1000 ? `${executionMetrics.totalDuration}ms` : `${(executionMetrics.totalDuration/1000).toFixed(2)}s`}</div>
                    <div>Avg Duration: {executionMetrics.averageDuration < 1000 ? `${Math.round(executionMetrics.averageDuration)}ms` : `${(executionMetrics.averageDuration/1000).toFixed(2)}s`}</div>
                    <div>Longest: {executionMetrics.longestFunction.name ? 
                      `${executionMetrics.longestFunction.name.substring(0, 12)}...` : 
                      'Only main function'
                    }</div>
                    <div>Async: {executionMetrics.asyncFunctions} | Sync: {executionMetrics.syncFunctions}</div>
                    <div>Max Depth: {executionMetrics.deepestNesting}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Control Hints */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ 
              color: '#7d8590', 
              fontSize: '12px',
              margin: '0 0 8px 0',
              fontFamily: 'SF Mono, monospace',
              textTransform: 'uppercase'
            }}>
              Controls Guide
            </h4>
            <div style={{ 
              color: '#7d8590', 
              fontSize: '10px',
              fontFamily: 'SF Mono, monospace',
              lineHeight: '1.5'
            }}>
              <div>• <strong>Sync:</strong> Force refresh visualization state</div>
              <div>• <strong>Metrics:</strong> Show detailed node information</div>
              <div>• <strong>Ctrl+Wheel:</strong> Zoom in/out</div>
              <div>• <strong>Click Node:</strong> Expand/collapse children</div>
              <div>• <strong>Search:</strong> Highlight matching nodes</div>
            </div>
          </div>

          {/* Promise Method Controls */}
          <ControlSubsection>
            <SubsectionTitle>Promise Tracking</SubsectionTitle>
            
            <CheckboxWrapper>
              <input 
                type="checkbox" 
                checked={visualizationState.showPromiseMethods} 
                onChange={(e) => updateState({ showPromiseMethods: e.target.checked })}
              />
              Show Promise Methods (.then, .catch, .finally)
            </CheckboxWrapper>
            
            <CheckboxWrapper>
              <input 
                type="checkbox" 
                checked={visualizationState.groupPromiseChains} 
                onChange={(e) => updateState({ groupPromiseChains: e.target.checked })}
                disabled={!visualizationState.showPromiseMethods}
              />
              Group Promise Chains
            </CheckboxWrapper>
            
            <CheckboxWrapper>
              <input 
                type="checkbox" 
                checked={visualizationState.showOnlyUserPromises} 
                onChange={(e) => updateState({ showOnlyUserPromises: e.target.checked })}
                disabled={!visualizationState.showPromiseMethods}
              />
              Hide Framework/Library Promises
            </CheckboxWrapper>

            <div style={{ marginTop: '12px' }}>
              <label style={{ 
                color: '#7d8590', 
                fontSize: '11px',
                fontFamily: 'SF Mono, monospace',
                marginBottom: '6px',
                display: 'block'
              }}>
                Detail Level:
              </label>
              <select 
                value={visualizationState.promiseDetailLevel}
                onChange={(e) => updateState({ promiseDetailLevel: e.target.value as 'summary' | 'detailed' | 'full' })}
                disabled={!visualizationState.showPromiseMethods}
                style={{
                  background: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: '#e6edf3',
                  fontSize: '11px',
                  fontFamily: 'SF Mono, monospace',
                  cursor: visualizationState.showPromiseMethods ? 'pointer' : 'not-allowed',
                  opacity: visualizationState.showPromiseMethods ? 1 : 0.5,
                  width: '100%'
                }}
              >
                <option value="summary">Summary (collapsed chains)</option>
                <option value="detailed">Detailed (show main methods)</option>
                <option value="full">Full (show everything)</option>
              </select>
            </div>
            
            <div style={{
              marginTop: '8px',
              padding: '8px',
              background: 'rgba(88, 166, 255, 0.1)',
              border: '1px solid rgba(88, 166, 255, 0.3)',
              borderRadius: '4px',
              fontSize: '10px',
              color: '#58a6ff',
              fontFamily: 'SF Mono, monospace',
              lineHeight: '1.4'
            }}>
              <strong>💡 Tip:</strong> Enable Promise tracking for debugging async flows. Use "Summary" mode to avoid clutter in Promise-heavy code.
            </div>
          </ControlSubsection>
        </SidebarPanel>

        {/* Main Canvas Area */}
        <ZoomableContainer
          ref={containerRef}
          zoom={visualizationState.zoom}
          panX={visualizationState.panX}
          panY={visualizationState.panY}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu}
        >
          <ScrollableContent
            data-scrollable="true"
            zoom={visualizationState.zoom}
            panX={visualizationState.panX}
            panY={visualizationState.panY}
          >
            <TreeCanvas>
              {filteredRoot ? (
                <GridLayoutNode
                  node={filteredRoot}
                  depth={0}
                  onCollapse={handleCollapse}
                  collapsed={visualizationState.collapsedNodes.has(filteredRoot.id)}
                  collapsedNodes={visualizationState.collapsedNodes}
                  searchTerm={visualizationState.searchTerm}
                  showMetrics={visualizationState.showMetrics}
                />
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '300px',
                  color: '#7d8590',
                  fontFamily: 'SF Mono, monospace',
                  fontSize: '16px',
                  textAlign: 'center'
                }}>
                  <EmptyStateIcon />
                  <div>No runtime data available</div>
                  <div style={{ 
                    fontSize: '14px', 
                    marginTop: '8px',
                    opacity: '0.7'
                  }}>
                    Execute code to see the function call tree
                  </div>
                </div>
              )}
            </TreeCanvas>
          </ScrollableContent>
        </ZoomableContainer>

        {/* Anchored Status Bar */}
        <StatusBar>
          <div>
            Status: {filteredRoot ? 'Active' : 'Idle'} • 
            Total Nodes: {totalNodes} • 
            Root Children: {filteredRoot?.children?.length || 0} •
            Execution Time: {filteredRoot?.endTime && filteredRoot?.startTime 
              ? `${filteredRoot.endTime - filteredRoot.startTime}ms` 
              : 'N/A'}
          </div>
          <div>
            Zoom: {(visualizationState.zoom * 100).toFixed(0)}% • 
            Collapsed: {visualizationState.collapsedNodes.size} • 
            ℹ️ Ctrl+Wheel: Zoom • Scroll: Navigate • Click: Expand/Collapse
          </div>
        </StatusBar>

        {/* Sync confirmation message */}
        {syncClicked && (
          <div style={{
            position: 'absolute',
            top: '80px',
            right: '300px',
            background: 'linear-gradient(135deg, #238636, #2ea043)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'SF Mono, monospace',
            zIndex: 100,
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '280px',
            boxShadow: '0 4px 16px rgba(35, 134, 54, 0.3)',
            border: '1px solid #2ea043'
          }}>
            ✓ Visualization synced with runtime state
          </div>
        )}
      </VisualizationContainer>
    </>
  );
};

// Helper function to generate Mermaid chart
function generateMermaidChart(root: RuntimeProcessNode): string {
  let mermaidChart = 'graph TD\n';

  // Ensure root has valid children array
  const safeRoot = {
    ...root,
    children: Array.isArray(root.children) ? root.children : []
  };

  // Track added nodes and connections to avoid duplicates
  const addedNodes = new Set<string>();
  const addedConnections = new Set<string>();

  // Add all nodes first, using recursive approach
  const addNodes = (node: RuntimeProcessNode) => {
    // Skip invalid nodes
    if (!node || !node.id) {
      console.log('[DB1] Skipping invalid node:', node);
      return;
    }
    
    // Skip if already added
    if (addedNodes.has(node.id)) {
      return;
    }
    
    // Add this node
    console.log(`[DB1] Adding node to chart: ${node.id} (${node.name})`);
    // Add more debug info to node label in development
    const nodeLabel = process.env.NODE_ENV === 'development' 
      ? `${node.name} (${node.id.substring(0, 8)})` 
      : node.name;
      
    mermaidChart += `  ${node.id}["${nodeLabel}"]\n`;
    addedNodes.add(node.id);
    
    // Add style for this node based on status
    if (node.status === 'completed') {
      mermaidChart += `  style ${node.id} fill:#9f9,stroke:#393\n`;
    } else {
      mermaidChart += `  style ${node.id} fill:#ff9,stroke:#993\n`;
    }
    
    // Process all children
    if (node.children && node.children.length > 0) {
      console.log(`[DB1] Node ${node.id} has ${node.children.length} children`);
      node.children.forEach(child => addNodes(child));
    } else {
      console.log(`[DB1] Node ${node.id} has no children`);
    }
  };
  
  // Add all connections based on parentId
  const addConnections = (nodes: RuntimeProcessNode[]) => {
    nodes.forEach(node => {
      // Only add connection if node has a parentId
      if (node.parentId && addedNodes.has(node.parentId)) {
        const connectionId = `${node.parentId}-->${node.id}`;
        if (!addedConnections.has(connectionId)) {
          console.log(`[DB1] Adding connection: ${node.parentId} --> ${node.id}`);
          
          // Check if this is an async/callback connection
          const isAsync = node.name.includes('callback') || 
                       node.name === 'setTimeout' || 
                       node.name.includes('fetch');
                       
          // Use different arrow style for async operations
          if (isAsync) {
            mermaidChart += `  ${node.parentId} -.-> ${node.id}\n`;
          } else {
            mermaidChart += `  ${node.parentId} --> ${node.id}\n`;
          }
          
          addedConnections.add(connectionId);
        }
      }
      
      // Recursively add connections for children
      if (node.children?.length) {
        addConnections(node.children);
      }
    });
  };
  
  // Build the chart by first adding all nodes, then all connections
  addNodes(safeRoot);
  
  // Get all nodes as flat array for connection processing
  const getAllNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
    const result: RuntimeProcessNode[] = [node];
    if (node.children?.length) {
      node.children.forEach(child => {
        result.push(...getAllNodes(child));
      });
    }
    return result;
  };
  
  const allNodes = getAllNodes(safeRoot);
  addConnections(allNodes);
  
  // Handle single-node case specially for better visualization
  if (!safeRoot.children || safeRoot.children.length === 0) {
    console.log('[DB1] Single node detected, adding special note');
    mermaidChart += `  Note["Function executed successfully"]:::note\n`;
    mermaidChart += `  ${safeRoot.id} -.-> Note\n`;
    mermaidChart += `  classDef note fill:#f0f0ff,stroke:#9090ff,stroke-width:1px,color:#333,border-radius:8px\n`;
  }
  
  return mermaidChart;
}
