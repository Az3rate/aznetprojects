import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react';
import type { RuntimeProcessNode } from './types';
import MermaidDiagram from '../components/MermaidDiagram';
import { RuntimeTimeline } from './RuntimeTimeline';
import styled, { keyframes, css } from 'styled-components';
import { RuntimeContext } from './context/RuntimeContext';

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
  cursor: ${({ zoom }) => zoom !== 1 ? 'grab' : 'default'};
  background: 
    radial-gradient(circle at 24px 24px, #1c2128 1px, transparent 0),
    radial-gradient(circle at 72px 72px, #1c2128 1px, transparent 0);
  background-size: 48px 48px;
  position: relative;
  
  &:active {
    cursor: ${({ zoom }) => zoom !== 1 ? 'grabbing' : 'default'};
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
  max-width: 1200px; /* Prevent excessive width */
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: stretch;
  margin: 0 auto; /* Center the content */
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
  border: 4px solid ${({ status, nodeType }) => {
    if (nodeType === 'async') return status === 'completed' ? '#00d448' : '#ffa500';
    if (nodeType === 'callback') return status === 'completed' ? '#8b5cf6' : '#ef4444';
    return status === 'completed' ? '#06b6d4' : '#71717a';
  }};
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 8px 16px rgba(0, 0, 0, 0.4),
    0 0 32px ${({ status, nodeType }) => {
      if (nodeType === 'async') return status === 'completed' ? 'rgba(0, 212, 72, 0.15)' : 'rgba(255, 165, 0, 0.15)';
      if (nodeType === 'callback') return status === 'completed' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)';
      return status === 'completed' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(113, 113, 122, 0.15)';
    }},
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  min-height: 56px;
  padding: 16px 20px;
  margin: 0;
  font-weight: 700;
  font-size: ${({ depth }) => 
    depth === 0 ? '18px' :
    depth === 1 ? '16px' :
    '14px'
  };
  color: #ffffff;
  cursor: pointer;
  transition: none;
  text-align: center;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  letter-spacing: 0;
  line-height: 1.2;
  backdrop-filter: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 12px 24px rgba(0, 0, 0, 0.5),
      0 0 48px ${({ status, nodeType }) => {
        if (nodeType === 'async') return status === 'completed' ? 'rgba(0, 212, 72, 0.25)' : 'rgba(255, 165, 0, 0.25)';
        if (nodeType === 'callback') return status === 'completed' ? 'rgba(139, 92, 246, 0.25)' : 'rgba(239, 68, 68, 0.25)';
        return status === 'completed' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(113, 113, 122, 0.25)';
      }},
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(0, 0, 0, 0.3);
    z-index: 10;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${({ status }) => status === 'running' && css`
    border-color: #fbbf24;
    box-shadow: 
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 8px 16px rgba(0, 0, 0, 0.4),
      0 0 32px rgba(251, 191, 36, 0.4),
      0 0 64px rgba(251, 191, 36, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  `}
  
  ${({ collapsed }) => collapsed && css`
    opacity: 0.6;
    border-style: dashed;
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

const Title = styled.h1`
  font-size: 20px;
  font-weight: 800;
  color: #e6edf3;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  
  &:before {
    content: '●';
    color: #00d448;
    margin-right: 12px;
    font-size: 16px;
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
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginLeft: `${Math.min(depth * 20, 100)}px`, // Limit max indentation to 100px
      position: 'relative'
    }}>
      {/* The main node */}
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
          maxWidth: `${Math.max(200, 500 - depth * 30)}px`, // Reduce width more gradually
          marginBottom: hasChildren && isExpanded ? '24px' : '0'
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
      
      {/* Connection line to children */}
      {hasChildren && isExpanded && (
        <div style={{
          width: '4px',
          height: '20px',
          background: nodeType === 'async' ? 
            'linear-gradient(180deg, #fbbf24, #f59e0b)' : 
            'linear-gradient(180deg, #3b82f6, #2563eb)',
          margin: '0 auto 16px auto',
          borderRadius: '2px',
          boxShadow: `0 0 8px ${nodeType === 'async' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`
        }} />
      )}
      
      {/* Children container */}
      {hasChildren && isExpanded && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingLeft: `${Math.min(20, 40 - depth * 5)}px`, // Reduce padding for deeper levels
          borderLeft: `2px solid ${depth < 4 ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}`,
          marginLeft: `${Math.min(15, 25 - depth * 3)}px` // Reduce margin for deeper levels
        }}>
          {node.children?.map((child, index) => (
            <GridLayoutNode
              key={child.id}
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
      
      {/* Collapsed children indicator */}
      {showCollapsed && (
        <div style={{
          textAlign: 'center',
          padding: '8px 16px',
          background: 'rgba(28, 33, 40, 0.5)',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#7d8590',
          fontFamily: 'SF Mono, monospace',
          margin: '16px auto 0 auto',
          maxWidth: '200px',
          border: '1px dashed #30363d'
        }}>
          {node.children?.length || 0} hidden {(node.children?.length || 0) === 1 ? 'child' : 'children'}
        </div>
      )}
    </div>
  );
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
    showMetrics: false
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

  // Calculate total nodes for performance info - moved before early return
  const totalNodes = useMemo(() => {
    if (!safeRoot) return 0;
    const count = (node: RuntimeProcessNode): number => {
      return 1 + (node.children?.reduce((sum, child) => sum + count(child), 0) || 0);
    };
    return count(safeRoot);
  }, [safeRoot, forceRender]); // Add forceRender to dependencies

  // Calculate execution metrics
  const executionMetrics = useMemo(() => {
    if (!safeRoot) return null;
    
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
    
    calculateMetrics(safeRoot, 0, true); // Mark root as true
    metrics.averageDuration = metrics.totalDuration / totalNodes;
    
    return metrics;
  }, [safeRoot, totalNodes, forceRender]);

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

  // Handle pan with optimized performance
  const handleMouseDown = (e: React.MouseEvent) => {
    if (visualizationState.zoom !== 1) {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
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

  // Add native wheel event listener for better scroll prevention
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const nativeWheelHandler = (e: WheelEvent) => {
      // Check if Ctrl is held for zoom, otherwise allow normal scroll
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        const rect = container.getBoundingClientRect();
        const centerX = e.clientX - rect.left;
        const centerY = e.clientY - rect.top;
        
        // Normalize wheel delta for consistent behavior across browsers
        const delta = -Math.sign(e.deltaY) * 0.1;
        handleZoom(delta, centerX, centerY);
      }
      // For normal scroll without Ctrl, let the browser handle it naturally
    };

    // Add listener with passive: false to ensure preventDefault works when needed
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
    if (container && safeRoot) {
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
    if (safeRoot) {
      const allNodeIds = new Set<string>();
      const collectIds = (node: RuntimeProcessNode) => {
        if (node.children && node.children.length > 0) {
          allNodeIds.add(node.id);
          node.children.forEach(collectIds);
        }
      };
      collectIds(safeRoot);
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
          <Title>Runtime Visualizer</Title>
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
              {safeRoot ? (
                <GridLayoutNode
                  node={safeRoot}
                  depth={0}
                  onCollapse={handleCollapse}
                  collapsed={visualizationState.collapsedNodes.has(safeRoot.id)}
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
                  <div style={{ 
                    fontSize: '48px', 
                    marginBottom: '16px',
                    opacity: '0.5'
                  }}>
                    ⚡
                  </div>
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
            Status: {safeRoot ? 'Active' : 'Idle'} • 
            Total Nodes: {totalNodes} • 
            Root Children: {safeRoot?.children?.length || 0} •
            Execution Time: {safeRoot?.endTime && safeRoot?.startTime 
              ? `${safeRoot.endTime - safeRoot.startTime}ms` 
              : 'N/A'}
          </div>
          <div>
            Zoom: {(visualizationState.zoom * 100).toFixed(0)}% • 
            Collapsed: {visualizationState.collapsedNodes.size} • 
            💡 Ctrl+Wheel: Zoom • Scroll: Navigate • Click: Expand/Collapse
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

      {/* Troubleshooting Section - Easy to copy with Ctrl+A */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        background: '#0d1117',
        border: '2px solid #1c2128',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}>
        <details open>
          <summary style={{ 
            color: '#e6edf3', 
            fontSize: '16px',
            margin: '0 0 16px 0',
            fontFamily: 'SF Mono, monospace',
            fontWeight: '700',
            cursor: 'pointer',
            padding: '8px 0',
            borderBottom: '1px solid #30363d'
          }}>
            🔧 Debug Tree Structure (Click to copy with Ctrl+A)
          </summary>
          <div style={{
            background: '#0a0c10',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '16px',
            marginTop: '16px',
            maxHeight: '600px',
            overflow: 'auto'
          }}>
            <pre style={{
              color: '#e6edf3',
              fontSize: '12px',
              fontFamily: 'SF Mono, monospace',
              lineHeight: '1.4',
              margin: '0',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              userSelect: 'text'
            }}>
              {safeRoot ? JSON.stringify(safeRoot, null, 2) : 'No tree data available'}
            </pre>
          </div>
          <div style={{ 
            marginTop: '12px',
            fontSize: '14px',
            color: '#7d8590',
            fontFamily: 'SF Mono, monospace',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '8px',
            background: 'rgba(30, 30, 30, 0.5)',
            borderRadius: '4px'
          }}>
            💡 Press Ctrl+A to select all text, then Ctrl+C to copy for troubleshooting
          </div>
        </details>
      </div>
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