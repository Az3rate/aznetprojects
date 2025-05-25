import React, { useMemo, useState, useEffect } from 'react';
import styled from 'styled-components';
import type { RuntimeProcessNode } from './types';
import { createAIAnalysisService, type AIAnalysisResponse } from '../../../services/aiAnalysisService';
import { 
  VscGraph, 
  VscRobot,
  VscFlame,
  VscEye,
  VscShield,
  VscError,
  VscLightbulb,
  VscWarning,
  VscTools,
  VscBug,
  VscGraphLine,
  VscTriangleUp,
  VscTriangleDown,
  VscArrowRight,
  VscTarget,
  VscComment,
  VscRocket,
  VscBeaker,
  VscCheck,
  VscPlay,
  VscCircleFilled,
  VscWatch,
  VscSymbolStructure,
  VscClose,
  VscRefresh,
  VscLoading,
  VscQuestion,
  VscOutput,
  VscSync
} from 'react-icons/vsc';
import { 
  FaBrain, 
  FaBalanceScale, 
  FaCog,
  FaClock,
  FaStar
} from 'react-icons/fa';

// Get API key from environment variables
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';

// Enhanced Runtime Analyzer with GPT optimization insights and educational trade-off analysis

// Weighted design system components
const AnalyzerContainer = styled.div`
  position: relative;
  background: #0a0c10;
  border: 4px solid #1c2128;
  box-shadow: 
    0 0 0 1px #21262d,
    0 8px 24px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: visible;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  max-height: none;
`;

const AnalyzerHeader = styled.div`
  background: #0d1117;
  border-bottom: 2px solid #1c2128;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
`;

const SectionTitle = styled.h2`
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

const AnalysisContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 20px;
  font-family: 'SF Mono', monospace;
`;

const TabContainer = styled.div`
  display: flex;
  background: #161b22;
  border-bottom: 2px solid #1c2128;
  overflow-x: auto;
`;

const Tab = styled.button<{ active: boolean }>`
  background: ${({ active }) => active ? '#238636' : 'transparent'};
  color: ${({ active }) => active ? '#ffffff' : '#e6edf3'};
  border: none;
  padding: 12px 16px;
  font-family: 'SF Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  border-bottom: 2px solid ${({ active }) => active ? '#238636' : 'transparent'};
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  &:hover {
    background: ${({ active }) => active ? '#238636' : 'rgba(48, 54, 61, 0.5)'};
  }
`;

const TabContent = styled.div`
  padding: 20px 0;
`;

const MetricCard = styled.div<{ glow?: boolean }>`
  background: #161b22;
  border: 2px solid #21262d;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  transition: all 0.3s ease;
  
  ${({ glow }) => glow && `
    border-color: #238636;
    box-shadow: 0 0 20px rgba(35, 134, 54, 0.3);
    
    &:before {
      content: '⚡';
      position: absolute;
      top: -8px;
      right: -8px;
      background: #238636;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `}
`;

const MetricTitle = styled.h3`
  color: #58a6ff;
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 8px 0;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricValue = styled.div<{ highlight?: boolean }>`
  color: ${({ highlight }) => highlight ? '#00d448' : '#e6edf3'};
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
  font-family: 'SF Mono', monospace;
  ${({ highlight }) => highlight && 'text-shadow: 0 0 10px rgba(0, 212, 72, 0.5);'}
`;

const MetricSubtext = styled.div`
  color: #7d8590;
  font-size: 12px;
  font-family: 'SF Mono', monospace;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const ScoreCard = styled.div<{ score: number }>`
  background: linear-gradient(135deg, #161b22, #0d1117);
  border: 2px solid ${({ score }) => {
    if (score >= 90) return '#238636';
    if (score >= 70) return '#1f6feb';
    if (score >= 50) return '#d29922';
    return '#f85149';
  }};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ score }) => {
      if (score >= 90) return 'linear-gradient(90deg, #238636, #2ea043)';
      if (score >= 70) return 'linear-gradient(90deg, #1f6feb, #388bfd)';
      if (score >= 50) return 'linear-gradient(90deg, #d29922, #fb8500)';
      return 'linear-gradient(90deg, #f85149, #da3633)';
    }};
  }
`;

const ScoreValue = styled.div<{ score: number }>`
  font-size: 42px;
  font-weight: 900;
  font-family: 'SF Mono', monospace;
  color: ${({ score }) => {
    if (score >= 90) return '#00d448';
    if (score >= 70) return '#58a6ff';
    if (score >= 50) return '#d29922';
    return '#f85149';
  }};
  text-shadow: 0 0 20px currentColor;
`;

const ScoreLabel = styled.div`
  color: #e6edf3;
  font-size: 14px;
  font-weight: 700;
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const WeightedButton = styled.button<{ active?: boolean; variant?: 'primary' | 'secondary' | 'success' }>`
  background: ${({ active, variant }) => {
    if (active) return 'linear-gradient(135deg, #238636, #2ea043)';
    if (variant === 'primary') return 'linear-gradient(135deg, #1f6feb, #0969da)';
    if (variant === 'success') return 'linear-gradient(135deg, #238636, #2ea043)';
    return 'rgba(33, 38, 45, 0.9)';
  }};
  color: ${({ active }) => active ? '#ffffff' : '#e6edf3'};
  border: 2px solid ${({ active, variant }) => {
    if (active) return '#238636';
    if (variant === 'primary') return '#1f6feb';
    if (variant === 'success') return '#238636';
    return '#30363d';
  }};
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: 'SF Mono', monospace;
  transition: all 0.2s ease;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover:not(:disabled) {
    background: ${({ active, variant }) => {
      if (active) return 'linear-gradient(135deg, #2ea043, #34d058)';
      if (variant === 'primary') return 'linear-gradient(135deg, #388bfd, #1f6feb)';
      if (variant === 'success') return 'linear-gradient(135deg, #2ea043, #34d058)';
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FlameGraphContainer = styled.div`
  background: #0d1117;
  border: 2px solid #21262d;
  border-radius: 8px;
  padding: 20px;
  margin: 16px 0;
  min-height: 200px;
`;

const FlameBlock = styled.div<{ width: number; depth: number; color: string }>`
  background: ${({ color }) => color};
  height: 20px;
  margin: 1px 0;
  margin-left: ${({ depth }) => depth * 20}px;
  width: ${({ width }) => width}%;
  border-radius: 2px;
  font-size: 10px;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-family: 'SF Mono', monospace;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    filter: brightness(1.2);
    transform: translateX(4px);
  }
`;

const InsightCard = styled.div<{ type: 'success' | 'warning' | 'info' | 'error' | 'ai' }>`
  background: #161b22;
  border: 2px solid ${({ type }) => {
    switch (type) {
      case 'success': return '#238636';
      case 'warning': return '#d29922';
      case 'error': return '#da3633';
      case 'ai': return '#8b5cf6';
      default: return '#1f6feb';
    }
  }};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
  
  ${({ type }) => type === 'ai' && `
    background: linear-gradient(135deg, #161b22, #1a1129);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
    
    &:after {
      content: '';
      position: absolute;
      top: 16px;
      right: 16px;
      width: 16px;
      height: 16px;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%238b5cf6' d='M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM5.78 8.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm4.44 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z'/%3E%3C/svg%3E") no-repeat center;
      background-size: contain;
      animation: glow 3s ease-in-out infinite alternate;
    }
    
    @keyframes glow {
      from { filter: brightness(1); }
      to { filter: brightness(1.5) drop-shadow(0 0 10px #8b5cf6); }
    }
  `}
  
  &:before {
    content: ${({ type }) => {
      switch (type) {
        case 'success': return '"✓"';
        case 'warning': return '"⚠"';
        case 'error': return '"✗"';
        case 'ai': return '""';
        default: return '"ℹ"';
      }
    }};
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 16px;
  }
`;

const InsightTitle = styled.h4<{ type?: string }>`
  color: ${({ type }) => type === 'ai' ? '#c084fc' : '#e6edf3'};
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 8px 0;
  font-family: 'SF Mono', monospace;
  ${({ type }) => type === 'ai' && 'text-shadow: 0 0 10px rgba(192, 132, 252, 0.3);'}
`;

const InsightText = styled.p`
  color: #7d8590;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  font-family: 'SF Mono', monospace;
`;

const ComplexityVisualization = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 20px 0;
`;

const ComplexityMeter = styled.div<{ complexity: number }>`
  background: #161b22;
  border: 2px solid #21262d;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  
  .complexity-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: conic-gradient(
      ${({ complexity }) => {
        if (complexity <= 1) return '#238636';
        if (complexity <= 2) return '#1f6feb';
        if (complexity <= 3) return '#d29922';
        return '#f85149';
      }} ${({ complexity }) => Math.min(complexity * 25, 100)}%,
      #21262d 0
    );
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
    font-size: 14px;
    font-weight: 900;
    color: white;
  }
`;

const HeatmapContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  gap: 2px;
  margin: 16px 0;
  padding: 16px;
  background: #161b22;
  border-radius: 8px;
  border: 2px solid #21262d;
`;

const HeatmapCell = styled.div<{ intensity: number }>`
  width: 12px;
  height: 12px;
  background: ${({ intensity }) => {
    if (intensity === 0) return '#21262d';
    if (intensity <= 0.3) return '#0d4429';
    if (intensity <= 0.6) return '#00d448';
    if (intensity <= 0.8) return '#ffcc02';
    return '#f85149';
  }};
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.5);
    z-index: 10;
    position: relative;
  }
`;

const PredictiveChart = styled.div`
  background: #0d1117;
  border: 2px solid #21262d;
  border-radius: 8px;
  padding: 20px;
  margin: 16px 0;
  min-height: 150px;
  position: relative;
  
  .chart-line {
    stroke: #238636;
    stroke-width: 2;
    fill: none;
  }
  
  .chart-area {
    fill: url(#gradient);
    opacity: 0.3;
  }
  
  .prediction-line {
    stroke: #8b5cf6;
    stroke-width: 2;
    stroke-dasharray: 5,5;
    fill: none;
  }
`;

const CodeSpoiler = styled.div<{ expanded: boolean }>`
  margin-top: 16px;
  border: 2px solid #30363d;
  border-radius: 8px;
  overflow: hidden;
  background: #0d1117;
  transition: all 0.3s ease;
  
  ${({ expanded }) => expanded && `
    border-color: #238636;
    box-shadow: 0 0 12px rgba(35, 134, 54, 0.2);
  `}
`;

const SpoilerHeader = styled.button`
  width: 100%;
  background: #161b22;
  border: none;
  padding: 12px 16px;
  color: #e6edf3;
  font-family: 'SF Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s ease;
  
  &:hover {
    background: #21262d;
  }
  
  .icon {
    font-size: 14px;
    transition: transform 0.2s ease;
  }
  
  &[data-expanded="true"] .icon {
    transform: rotate(90deg);
  }
`;

const SpoilerContent = styled.div<{ expanded: boolean }>`
  max-height: ${({ expanded }) => expanded ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: #0a0c10;
`;

const CodeBlock = styled.pre`
  margin: 0;
  padding: 20px;
  background: #0a0c10;
  color: #e6edf3;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  
  .comment { color: #7d8590; }
  .keyword { color: #ff7b72; }
  .string { color: #a5d6ff; }
  .function { color: #d2a8ff; }
`;

const CodeDescription = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #21262d;
  color: #7d8590;
  font-size: 12px;
  line-height: 1.4;
  font-family: 'SF Mono', monospace;
  background: #161b22;
`;

const CopyButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 4px;
  color: #e6edf3;
  padding: 6px 8px;
  font-size: 10px;
  font-family: 'SF Mono', monospace;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 1;
    background: #30363d;
  }
`;

interface CodeSpoilerComponentProps {
  title: string;
  description: string;
  code: string;
  explanation?: string;
}

const CodeSpoilerComponent: React.FC<CodeSpoilerComponentProps> = ({ 
  title, 
  description, 
  code, 
  explanation 
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CodeSpoiler expanded={expanded}>
      <SpoilerHeader 
        onClick={() => setExpanded(!expanded)}
        data-expanded={expanded}
      >
        <span>
          <VscLightbulb style={{ marginRight: '8px' }} />
          <strong>{title}</strong>
          <span style={{ color: '#7d8590', fontWeight: 400, marginLeft: '8px' }}>
            (Click to {expanded ? 'hide' : 'view'} improved code)
          </span>
        </span>
        <span className="icon">▶</span>
      </SpoilerHeader>
      
      <SpoilerContent expanded={expanded}>
        <CodeDescription>
          {description}
        </CodeDescription>
        
        <div style={{ position: 'relative' }}>
          <CopyButton onClick={handleCopy}>
            {copied ? (
              <>
                <VscCheck style={{ marginRight: '4px' }} />
                Copied!
              </>
            ) : (
              <>
                <VscOutput style={{ marginRight: '4px' }} />
                Copy
              </>
            )}
          </CopyButton>
          <CodeBlock>{code}</CodeBlock>
        </div>
        
        {explanation && (
          <CodeDescription style={{ borderTop: '1px solid #21262d', borderBottom: 'none' }}>
            <strong>
              <VscComment style={{ marginRight: '6px', color: '#58a6ff' }} />
              Explanation:
            </strong> {explanation}
          </CodeDescription>
        )}
      </SpoilerContent>
    </CodeSpoiler>
  );
};

interface AdvancedAnalysisData {
  // Basic metrics
  totalFunctions: number;
  totalExecutionTime: number;
  successRate: number;
  nestingDepth: number;
  asyncOperations: number;
  errors: number;
  
  // Advanced scores
  performanceScore: number;
  complexityScore: number;
  maintainabilityScore: number;
  securityScore: number;
  overallScore: number;
  
  // AI-powered insights
  aiInsights: {
    type: 'ai';
    title: string;
    message: string;
    confidence: number;
  }[];
  
  // Complexity analysis
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  bigOEstimate: string;
  
  // Performance patterns
  hotFunctions: string[];
  memoryLeakRisk: number;
  scalabilityPrediction: string;
  
  // Security analysis
  securityIssues: string[];
  antiPatterns: string[];
  
  // Predictive analytics
  performanceTrend: 'improving' | 'degrading' | 'stable';
  resourceUsageForecast: number[];
  scalabilityBottlenecks: string[];
  
  // Error analysis
  errorAnalysis: {
    totalErrors: number;
    errorTypes: { [key: string]: number };
    criticalErrors: string[];
    warnings: string[];
    errorInsights: {
      type: 'error' | 'warning';
      title: string;
      message: string;
      suggestion: string;
    }[];
  };
  
  // Performance heatmap data
  functionPerformanceMap: { name: string; executionTime: number; callCount: number }[];
}

interface Props {
  root: RuntimeProcessNode | null;
  debug: string;
  runCount: number;
  currentCode?: string;
  onExecuteCode?: (code: string) => Promise<{
    root: RuntimeProcessNode | null;
    debug: string;
    analysisData: AdvancedAnalysisData;
  }>;
}

export const RuntimeAnalyzer: React.FC<Props> = ({ root, debug, runCount, currentCode = '', onExecuteCode }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-insights' | 'complexity' | 'performance' | 'security' | 'predictive' | 'flame-graph' | 'errors'>('overview');
  const [realTimeData, setRealTimeData] = useState<number[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Comparison state
  const [comparisonData, setComparisonData] = useState<{
    original: AdvancedAnalysisData;
    improved: AdvancedAnalysisData | null;
    gptCode: string;
    gptExecutionResult?: {
      root: RuntimeProcessNode | null;
      debug: string;
    };
  } | null>(null);
  const [isTestingGPTCode, setIsTestingGPTCode] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => [...prev.slice(-19), Math.random() * 100]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset AI analysis state when new execution results come in
  useEffect(() => {
    // Only reset when runCount changes (indicating new code execution)
    if (runCount > 0) {
      setAiAnalysis(null);
      setComparisonData(null);
      setAiError(null);
      setTestError(null);
      // Don't reset loading states as they should be managed by the actual operations
    }
  }, [runCount]); // Only reset when runCount changes

  const analysisData: AdvancedAnalysisData = useMemo(() => {
    if (!root) {
      return {
        totalFunctions: 0,
        totalExecutionTime: 0,
        successRate: 0,
        nestingDepth: 0,
        asyncOperations: 0,
        errors: 0,
        performanceScore: 0,
        complexityScore: 0,
        maintainabilityScore: 0,
        securityScore: 0,
        overallScore: 0,
        aiInsights: [],
        cyclomaticComplexity: 0,
        cognitiveComplexity: 0,
        bigOEstimate: 'O(1)',
        hotFunctions: [],
        memoryLeakRisk: 0,
        scalabilityPrediction: 'Unknown',
        securityIssues: [],
        antiPatterns: [],
        performanceTrend: 'stable',
        resourceUsageForecast: [],
        scalabilityBottlenecks: [],
        errorAnalysis: {
          totalErrors: 0,
          errorTypes: {},
          criticalErrors: [],
          warnings: [],
          errorInsights: []
        },
        functionPerformanceMap: []
      };
    }

    // Flatten all nodes for analysis
    const flattenNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
      return [node, ...node.children.flatMap(flattenNodes)];
    };

    const allNodes = flattenNodes(root);
    const completedNodes = allNodes.filter(node => node.status === 'completed' && node.endTime);
    const debugLines = debug.split('\n');
    
    // Basic metrics
    const totalFunctions = allNodes.length;
    const successRate = totalFunctions > 0 ? (completedNodes.length / totalFunctions) * 100 : 0;
    const executionTimes = completedNodes.map(node => (node.endTime! - node.startTime));
    const totalExecutionTime = Math.max(...completedNodes.map(node => node.endTime!)) - Math.min(...allNodes.map(node => node.startTime));
    
    // Calculate nesting depth
    const calculateDepth = (node: RuntimeProcessNode, currentDepth = 0): number => {
      if (node.children.length === 0) return currentDepth;
      return Math.max(...node.children.map(child => calculateDepth(child, currentDepth + 1)));
    };
    const nestingDepth = calculateDepth(root);
    
    const asyncOperations = debugLines.filter(line => 
      line.includes('Promise') || line.includes('setTimeout') || line.includes('async') || line.includes('.then')
    ).length;
    
    const errors = debugLines.filter(line => 
      line.includes('error') || line.includes('Error') || line.includes('failed')
    ).length;

    // Advanced scoring algorithms
    const performanceScore = Math.max(0, 100 - (totalExecutionTime / 100) - (errors * 10));
    const complexityScore = Math.max(0, 100 - (nestingDepth * 8) - (totalFunctions * 2));
    const maintainabilityScore = Math.max(0, 100 - (nestingDepth * 10) - (totalFunctions > 20 ? 20 : 0));
    const securityScore = Math.max(0, 100 - (debugLines.filter(line => 
      line.includes('eval') || line.includes('innerHTML') || line.includes('Function constructor')
    ).length * 15));
    
    const overallScore = (performanceScore + complexityScore + maintainabilityScore + securityScore) / 4;

    // AI-powered insights - only real GPT analysis will be shown (no fake insights)
    const aiInsights: {
      type: 'ai';
      title: string;
      message: string;
      confidence: number;
    }[] = [];
    
    if (nestingDepth > 7) {
      // Removed fake AI insight - only real GPT analysis should be shown
      // aiInsights.push({
      //   type: 'ai' as const,
      //   title: 'Deep Nesting Anti-Pattern Detected',
      //   message: 'AI Analysis: Your code exhibits the "Arrow Anti-Pattern" with excessive nesting. This suggests callback hell or deeply nested conditionals. Consider implementing the Strategy Pattern or Promise chains to flatten the structure.',
      //   confidence: 94
      // });
    }

    if (totalFunctions > 15 && asyncOperations > 8) {
      // Removed fake AI insight
      /*
      aiInsights.push({
        type: 'ai' as const,
        title: 'Concurrent Execution Optimization Opportunity',
        message: 'AI Analysis: Multiple async operations detected. Your code could benefit from Promise.allSettled() or async pools to improve parallel execution efficiency by ~40-60%.',
        confidence: 87
      });
      */
    }

    if (executionTimes.some(time => time > 1000)) {
      // Removed fake AI insight
      /*
      aiInsights.push({
        type: 'ai' as const,
        title: 'Performance Bottleneck Prediction',
        message: 'AI Analysis: Long-running functions detected. This pattern typically leads to UI blocking and poor user experience. Consider implementing Web Workers or time-slicing for operations exceeding 16ms.',
        confidence: 91
      });
      */
    }

    // Complexity analysis
    const cyclomaticComplexity = Math.min(20, Math.floor(nestingDepth * 1.5 + totalFunctions * 0.3));
    const cognitiveComplexity = Math.min(25, Math.floor(nestingDepth * 2 + asyncOperations * 0.5));
    
    // Big O estimation based on nesting and loops
    let bigOEstimate = 'O(1)';
    if (nestingDepth >= 2) bigOEstimate = 'O(n)';
    if (nestingDepth >= 4) bigOEstimate = 'O(n²)';
    if (nestingDepth >= 6) bigOEstimate = 'O(n³)';
    if (nestingDepth >= 8) bigOEstimate = 'O(2ⁿ)';

    // Performance patterns
    const functionCounts = new Map<string, number>();
    completedNodes.forEach(node => {
      const count = functionCounts.get(node.name) || 0;
      functionCounts.set(node.name, count + 1);
    });
    
    const hotFunctions = Array.from(functionCounts.entries())
      .filter(([_, count]) => count > 2)
      .map(([name]) => name);

    // Memory leak risk assessment
    const memoryLeakRisk = Math.min(100, 
      (debugLines.filter(line => line.includes('setInterval')).length * 20) +
      (debugLines.filter(line => line.includes('addEventListener')).length * 15) +
      (debugLines.filter(line => line.includes('closure')).length * 10)
    );

    // Security analysis
    const securityIssues = [];
    const antiPatterns = [];
    
    if (debugLines.some(line => line.includes('eval'))) {
      securityIssues.push('Dynamic code execution (eval) detected');
      antiPatterns.push('Code Injection Vulnerability');
    }
    
    if (debugLines.some(line => line.includes('innerHTML'))) {
      securityIssues.push('Potential XSS vulnerability (innerHTML usage)');
    }
    
    if (nestingDepth > 5) {
      antiPatterns.push('Arrow Anti-Pattern (Callback Hell)');
    }
    
    if (totalFunctions > 20 && asyncOperations < 2) {
      antiPatterns.push('Synchronous Bottleneck Pattern');
    }

    // Predictive analytics
    const performanceTrend: 'improving' | 'degrading' | 'stable' = 
      overallScore > 80 ? 'improving' : 
      overallScore < 50 ? 'degrading' : 
      'stable';
    
    const resourceUsageForecast = Array.from({ length: 10 }, (_, i) => 
      Math.max(0, totalExecutionTime * (1 + (i * 0.1)) + Math.random() * 50)
    );

    const scalabilityBottlenecks = [];
    if (nestingDepth > 6) scalabilityBottlenecks.push('Deep function nesting');
    if (totalFunctions > 25) scalabilityBottlenecks.push('High function count');
    if (memoryLeakRisk > 40) scalabilityBottlenecks.push('Memory leak risk');

    // Error analysis
    const errorLines = debugLines.filter(line => 
      line.includes('error') || line.includes('Error') || line.includes('failed') || 
      line.includes('warning') || line.includes('Warning')
    );
    
    const errorAnalysis = {
      totalErrors: errors,
      errorTypes: errorLines.reduce((types, line) => {
        if (line.toLowerCase().includes('error') || line.includes('Error')) {
          types['error'] = (types['error'] || 0) + 1;
        }
        if (line.toLowerCase().includes('warning') || line.includes('Warning')) {
          types['warning'] = (types['warning'] || 0) + 1;
        }
        if (line.toLowerCase().includes('failed')) {
          types['failed'] = (types['failed'] || 0) + 1;
        }
        return types;
      }, {} as { [key: string]: number }),
      criticalErrors: debugLines.filter(line => 
        line.includes('Error') || line.includes('failed') || line.includes('critical')
      ),
      warnings: debugLines.filter(line => 
        line.includes('warning') || line.includes('Warning')
      ),
      errorInsights: [] as {
        type: 'error' | 'warning';
        title: string;
        message: string;
        suggestion: string;
      }[]
    };

    // Add AI-powered error insights
    if (errorAnalysis.totalErrors > 0) {
      // Removed fake error insight - not actually AI-powered
      /*
      errorAnalysis.errorInsights.push({
        type: 'error' as const,
        title: 'Error Detection Pattern',
        message: `Detected ${errorAnalysis.totalErrors} error(s) during execution. This indicates potential stability issues.`,
        suggestion: 'Consider adding try-catch blocks and implementing proper error handling strategies.'
      });
      */
    }

    if (errorAnalysis.criticalErrors.length > 0) {
      // Removed fake error insight - not actually AI-powered
      /*
      errorAnalysis.errorInsights.push({
        type: 'error' as const,
        title: 'Critical Error Alert',
        message: `Found ${errorAnalysis.criticalErrors.length} critical error(s) that could cause application crashes.`,
        suggestion: 'Immediately review and fix critical errors to prevent runtime failures.'
      });
      */
    }

    // Performance heatmap data - group similar functions and aggregate their performance
    const functionStats = new Map<string, { totalTime: number; count: number }>();
    completedNodes.forEach(node => {
      const existing = functionStats.get(node.name) || { totalTime: 0, count: 0 };
      existing.totalTime += (node.endTime! - node.startTime);
      existing.count += 1;
      functionStats.set(node.name, existing);
    });

    const functionPerformanceMap = Array.from(functionStats.entries()).map(([name, stats]) => ({
      name,
      executionTime: stats.totalTime / stats.count, // Average execution time
      callCount: stats.count
    }));

    return {
      totalFunctions,
      totalExecutionTime,
      successRate,
      nestingDepth,
      asyncOperations,
      errors,
      performanceScore,
      complexityScore,
      maintainabilityScore,
      securityScore,
      overallScore,
      aiInsights,
      cyclomaticComplexity,
      cognitiveComplexity,
      bigOEstimate,
      hotFunctions,
      memoryLeakRisk,
      scalabilityPrediction: performanceTrend === 'improving' ? 'Excellent' : 
                            performanceTrend === 'stable' ? 'Good' : 'Concerning',
      securityIssues,
      antiPatterns,
      performanceTrend,
      resourceUsageForecast,
      scalabilityBottlenecks,
      errorAnalysis,
      functionPerformanceMap
    };
  }, [root, debug]);

  // Store original analysis data when it changes
  useEffect(() => {
    if (root && analysisData.totalFunctions > 0) {
      setComparisonData(prev => prev ? { ...prev, original: analysisData } : null);
    }
  }, [analysisData, root]);

  // Test GPT Code function
  const testGPTCode = async () => {
    if (!aiAnalysis?.fullCodeRecommendation?.improvedCode) {
      setTestError('No GPT code recommendation available to test');
      return;
    }

    if (!onExecuteCode) {
      setTestError('Code execution not available. Make sure the runtime is properly configured.');
      return;
    }

    setIsTestingGPTCode(true);
    setTestError(null);

    try {
      // Store the original analysis and GPT code for comparison
      setComparisonData({
        original: analysisData,
        improved: null, // Will be set after execution
        gptCode: aiAnalysis.fullCodeRecommendation.improvedCode
      });

      console.log('[GPT_TEST] Testing GPT recommended code:', aiAnalysis.fullCodeRecommendation.improvedCode);
      console.log('[GPT_TEST] GPT code structure analysis:');
      console.log('[GPT_TEST] - Contains async:', aiAnalysis.fullCodeRecommendation.improvedCode.includes('async'));
      console.log('[GPT_TEST] - Contains await:', aiAnalysis.fullCodeRecommendation.improvedCode.includes('await'));
      console.log('[GPT_TEST] - Contains Promise:', aiAnalysis.fullCodeRecommendation.improvedCode.includes('Promise'));
      console.log('[GPT_TEST] - Function count:', (aiAnalysis.fullCodeRecommendation.improvedCode.match(/function\s+\w+/g) || []).length);
      
      // Execute the GPT code and get the results
      const executionResult = await onExecuteCode(aiAnalysis.fullCodeRecommendation.improvedCode);
      
      console.log('[GPT_TEST] Execution completed:', {
        hasRoot: !!executionResult.root,
        debugLength: executionResult.debug.length,
        analysisData: executionResult.analysisData
      });
      
      // Update comparison data with improved results and execution data
      setComparisonData(prev => prev ? {
        ...prev,
        improved: executionResult.analysisData,
        gptExecutionResult: {
          root: executionResult.root,
          debug: executionResult.debug
        }
      } : null);
      
      console.log('[GPT_TEST] Comparison data updated successfully');
      console.log('[GPT_TEST] GPT execution root:', executionResult.root);
      console.log('[GPT_TEST] GPT execution debug length:', executionResult.debug.length);
      if (executionResult.root) {
        const flattenGptNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
          return [node, ...node.children.flatMap(flattenGptNodes)];
        };
        const gptNodes = flattenGptNodes(executionResult.root);
        console.log('[GPT_TEST] Total nodes captured:', gptNodes.length);
        console.log('[GPT_TEST] Node details:', gptNodes.map(n => ({ name: n.name, status: n.status, children: n.children.length })));
      }
      
    } catch (error) {
      console.error('[GPT_TEST] Failed to test GPT code:', error);
      setTestError(error instanceof Error ? error.message : 'Failed to test GPT code');
    } finally {
      setIsTestingGPTCode(false);
    }
  };

  const renderOverview = () => (
    <TabContent>
      {/* Run Info */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '12px 16px',
        background: 'rgba(88, 166, 255, 0.1)',
        border: '1px solid rgba(88, 166, 255, 0.3)',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'SF Mono, monospace'
      }}>
        <span style={{ color: '#58a6ff', fontWeight: '600' }}>
          Run #{runCount}
        </span>
        <span style={{ color: '#e6edf3' }}>
          Overall Score: <strong style={{ color: '#00d448' }}>{Math.round(analysisData.overallScore)}/100</strong>
        </span>
      </div>

      {/* Overall Score */}
      <ScoreCard score={analysisData.overallScore} style={{ marginBottom: '24px' }}>
        <ScoreValue score={analysisData.overallScore}>
          {Math.round(analysisData.overallScore)}
        </ScoreValue>
        <ScoreLabel>Overall Code Quality Score</ScoreLabel>
      </ScoreCard>

      {/* Performance Scores Grid */}
      <MetricGrid>
        <ScoreCard score={analysisData.performanceScore}>
          <ScoreValue score={analysisData.performanceScore}>
            {Math.round(analysisData.performanceScore)}
          </ScoreValue>
          <ScoreLabel>Performance</ScoreLabel>
        </ScoreCard>
        
        <ScoreCard score={analysisData.complexityScore}>
          <ScoreValue score={analysisData.complexityScore}>
            {Math.round(analysisData.complexityScore)}
          </ScoreValue>
          <ScoreLabel>Complexity</ScoreLabel>
        </ScoreCard>
        
        <ScoreCard score={analysisData.maintainabilityScore}>
          <ScoreValue score={analysisData.maintainabilityScore}>
            {Math.round(analysisData.maintainabilityScore)}
          </ScoreValue>
          <ScoreLabel>Maintainability</ScoreLabel>
        </ScoreCard>
        
        <ScoreCard score={analysisData.securityScore}>
          <ScoreValue score={analysisData.securityScore}>
            {Math.round(analysisData.securityScore)}
          </ScoreValue>
          <ScoreLabel>Security</ScoreLabel>
        </ScoreCard>
      </MetricGrid>

      {/* Real-time Metrics */}
      <MetricGrid>
        <MetricCard glow={analysisData.successRate === 100}>
          <MetricTitle>Functions Tracked</MetricTitle>
          <MetricValue highlight={analysisData.totalFunctions > 10}>
            {analysisData.totalFunctions}
          </MetricValue>
          <MetricSubtext>Total function executions</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>Execution Time</MetricTitle>
          <MetricValue>{analysisData.totalExecutionTime.toFixed(0)}ms</MetricValue>
          <MetricSubtext>End-to-end runtime</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>Big O Complexity</MetricTitle>
          <MetricValue>{analysisData.bigOEstimate}</MetricValue>
          <MetricSubtext>Estimated algorithmic complexity</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>Memory Leak Risk</MetricTitle>
          <MetricValue>{analysisData.memoryLeakRisk}%</MetricValue>
          <MetricSubtext>Potential memory issues</MetricSubtext>
        </MetricCard>
      </MetricGrid>

      {/* Function Performance Heatmap */}
      <MetricTitle>Function Performance Heatmap</MetricTitle>
      <HeatmapContainer>
        {analysisData.functionPerformanceMap.length > 0 ? (
          // Show actual function performance data
          Array.from({ length: 100 }, (_, i) => {
            const functionIndex = i % analysisData.functionPerformanceMap.length;
            const func = analysisData.functionPerformanceMap[functionIndex];
            const maxTime = Math.max(...analysisData.functionPerformanceMap.map(f => f.executionTime));
            const intensity = func ? func.executionTime / maxTime : 0;
            
            return (
              <HeatmapCell 
                key={i} 
                intensity={intensity} 
                title={func ? `${func.name}: ${func.executionTime.toFixed(1)}ms (${func.callCount} calls)` : 'No data'}
              />
            );
          })
        ) : (
          // Fallback when no function data available
          Array.from({ length: 100 }, (_, i) => (
            <HeatmapCell 
              key={i} 
              intensity={0} 
              title="No function data available - run some code first"
            />
          ))
        )}
      </HeatmapContainer>
    </TabContent>
  );

  const renderAIInsights = () => (
    <TabContent>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <MetricTitle>
          <VscRobot style={{ marginRight: '8px' }} />
          AI-Powered Code Analysis
        </MetricTitle>
        <button 
          onClick={getAIAnalysis}
          disabled={isLoadingAI || !root}
          style={{ 
            background: 'linear-gradient(135deg, #1f6feb, #0969da)',
            color: '#ffffff',
            border: '2px solid #1f6feb',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: isLoadingAI || !root ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: 'SF Mono, monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            opacity: isLoadingAI || !root ? 0.5 : 1,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
          onMouseEnter={(e) => {
            if (!isLoadingAI && root) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
          }}
        >
          {isLoadingAI ? (
            <>
              <VscRefresh style={{ marginRight: '6px', animation: 'spin 1s linear infinite' }} />
              Analyzing...
            </>
          ) : (
            <>
              <FaBrain style={{ marginRight: '6px' }} />
              Get GPT Analysis
            </>
          )}
        </button>
      </div>

      {aiError && (
        <InsightCard type="error">
          <InsightTitle>AI Analysis Error</InsightTitle>
          <InsightText>{aiError}</InsightText>
        </InsightCard>
      )}

      {aiAnalysis ? (
        // Show real GPT analysis
        <>
          <ScoreCard score={aiAnalysis.overallScore} style={{ marginBottom: '24px' }}>
            <ScoreValue score={aiAnalysis.overallScore}>
              {Math.round(aiAnalysis.overallScore)}
            </ScoreValue>
            <ScoreLabel>GPT Analysis Score</ScoreLabel>
          </ScoreCard>

          <InsightCard type="ai">
            <InsightTitle type="ai">
              <VscTarget style={{ marginRight: '8px', color: '#58a6ff' }} />
              GPT Summary
            </InsightTitle>
            <InsightText>{aiAnalysis.summary}</InsightText>
          </InsightCard>

          {aiAnalysis.insights.map((insight, index) => (
            <InsightCard key={index} type={insight.type === 'error' ? 'error' : insight.type === 'optimization' ? 'warning' : 'ai'}>
              <InsightTitle type="ai">
                {insight.title}
                <span style={{ 
                  color: insight.priority === 'critical' ? '#f85149' : 
                        insight.priority === 'high' ? '#d29922' : 
                        insight.priority === 'medium' ? '#1f6feb' : '#238636',
                  fontSize: '10px', 
                  marginLeft: '8px',
                  textTransform: 'uppercase',
                  fontWeight: '700'
                }}>
                  {insight.priority} • {insight.confidence}% confidence
                </span>
              </InsightTitle>
              <InsightText>
                {insight.message}
                {insight.suggestions.length > 0 && (
                  <>
                    <br /><br />
                    <strong>
                      <VscLightbulb style={{ marginRight: '6px', color: '#fbbf24' }} />
                      Suggestions:
                    </strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                      {insight.suggestions.map((suggestion, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{suggestion}</li>
                      ))}
                    </ul>
                  </>
                )}
              </InsightText>
              
              {/* Code Recommendation Spoiler */}
              {insight.codeRecommendation && (
                <CodeSpoilerComponent
                  title={`${insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} Code Fix`}
                  description={insight.codeRecommendation.description}
                  code={insight.codeRecommendation.improvedCode}
                  explanation={insight.codeRecommendation.explanation}
                />
              )}
            </InsightCard>
          ))}

          {aiAnalysis.recommendations.length > 0 && (
            <>
              <MetricTitle style={{ marginTop: '32px' }}>
                <VscTarget style={{ marginRight: '8px', color: '#58a6ff' }} />
                Top Recommendations
              </MetricTitle>
              {aiAnalysis.recommendations.map((recommendation, index) => (
                <InsightCard key={index} type="info">
                  <InsightTitle>Recommendation {index + 1}</InsightTitle>
                  <InsightText>{recommendation}</InsightText>
                </InsightCard>
              ))}
            </>
          )}

          {/* Full Code Refactor Recommendation */}
          {aiAnalysis.fullCodeRecommendation && (
            <>
              <MetricTitle style={{ marginTop: '32px' }}>
                <VscRocket style={{ marginRight: '8px', color: '#58a6ff' }} />
                Complete Code Refactor
              </MetricTitle>
              <InsightCard type="ai">
                <InsightTitle type="ai">{aiAnalysis.fullCodeRecommendation.title}</InsightTitle>
                <InsightText>
                  {aiAnalysis.fullCodeRecommendation.description}
                  <br /><br />
                  <strong>
                    <VscTools style={{ marginRight: '6px', color: '#58a6ff' }} />
                    Key Changes:
                  </strong>
                  <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                    {aiAnalysis.fullCodeRecommendation.keyChanges.map((change, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{change}</li>
                    ))}
                  </ul>
                </InsightText>
                
                <CodeSpoilerComponent
                  title="Complete Refactored Code"
                  description="Your entire code improved with all recommended optimizations applied"
                  code={aiAnalysis.fullCodeRecommendation.improvedCode}
                  explanation="This is a complete rewrite of your code incorporating all the performance, security, and maintainability improvements suggested above."
                />
              </InsightCard>

              {/* Test GPT Code Section */}
              <MetricTitle style={{ marginTop: '32px' }}>
                <VscBeaker style={{ marginRight: '8px', color: '#58a6ff' }} />
                Test GPT Improvements
              </MetricTitle>
              <InsightCard type="ai">
                <InsightTitle type="ai">Validate AI Recommendations</InsightTitle>
                <InsightText>
                  Ready to see if GPT's code improvements actually deliver better performance? 
                  Click below to run the optimized code and get a detailed comparison!
                </InsightText>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  marginTop: '16px',
                  alignItems: 'center'
                }}>
                  <button 
                    onClick={testGPTCode}
                    disabled={isTestingGPTCode}
                    style={{ 
                      background: 'linear-gradient(135deg, #238636, #2ea043)',
                      color: '#ffffff',
                      border: '2px solid #238636',
                      borderRadius: '6px',
                      padding: '12px 24px',
                      cursor: isTestingGPTCode ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'SF Mono, monospace',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      opacity: isTestingGPTCode ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isTestingGPTCode) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    {isTestingGPTCode ? (
                      <>
                        <VscRefresh style={{ marginRight: '6px', animation: 'spin 1s linear infinite' }} />
                        Testing...
                      </>
                    ) : (
                      <>
                        <VscRocket style={{ marginRight: '6px' }} />
                        Test GPT Code
                      </>
                    )}
                  </button>
                  
                  {comparisonData && (
                    <span style={{ 
                      color: '#238636', 
                      fontSize: '12px', 
                      fontWeight: '600' 
                    }}>
                      <VscCheck style={{ marginRight: '4px' }} />
                      Ready for comparison
                    </span>
                  )}
                </div>

                {testError && (
                  <div style={{ 
                    marginTop: '12px',
                    padding: '12px',
                    background: 'rgba(248, 81, 73, 0.1)',
                    border: '1px solid rgba(248, 81, 73, 0.3)',
                    borderRadius: '6px',
                    color: '#f85149',
                    fontSize: '13px'
                  }}>
                    <strong>Test Error:</strong> {testError}
                  </div>
                )}

                {/* Mini GPT Execution Visualizer */}
                {comparisonData?.gptExecutionResult && (
                  <div style={{ 
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(35, 134, 54, 0.05)',
                    border: '1px solid rgba(35, 134, 54, 0.2)',
                    borderRadius: '8px'
                  }}>
                    <h4 style={{ 
                      color: '#238636', 
                      margin: '0 0 12px 0', 
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'SF Mono, monospace'
                    }}>
                      <VscEye style={{ marginRight: '6px' }} />
                      GPT Code Execution Flow
                    </h4>
                    
                    {comparisonData.gptExecutionResult.root ? (
                      <div style={{ 
                        maxHeight: '200px', 
                        overflowY: 'auto',
                        background: '#0a0c10',
                        borderRadius: '6px',
                        padding: '12px'
                      }}>
                        {(() => {
                          const flattenNodesWithDepth = (node: RuntimeProcessNode, depth = 0): Array<RuntimeProcessNode & { depth: number }> => {
                            return [
                              { ...node, depth }, 
                              ...node.children.flatMap(child => flattenNodesWithDepth(child, depth + 1))
                            ];
                          };
                          const nodes = flattenNodesWithDepth(comparisonData.gptExecutionResult.root);
                          
                          console.log('[MINI_VIZ] Displaying nodes:', nodes.map(n => ({ name: n.name, depth: n.depth, status: n.status, children: n.children.length })));
                          
                          return nodes.map((node, index) => (
                            <div key={`${node.name}-${index}`} style={{
                              padding: '4px 0',
                              paddingLeft: `${node.depth * 16}px`,
                              fontSize: '11px',
                              fontFamily: 'SF Mono, monospace',
                              color: node.status === 'completed' ? '#00d448' : 
                                     node.status === 'error' ? '#f85149' : '#d29922',
                              borderLeft: node.depth > 0 ? '1px solid #30363d' : 'none',
                              marginLeft: node.depth > 0 ? '8px' : '0'
                            }}>
                              <span style={{ 
                                display: 'inline-block', 
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: node.status === 'completed' ? '#00d448' : 
                                           node.status === 'error' ? '#f85149' : '#d29922',
                                marginRight: '8px'
                              }} />
                              {node.name} 
                              {node.endTime && (
                                <span style={{ color: '#7d8590', marginLeft: '8px' }}>
                                  ({(node.endTime - node.startTime).toFixed(1)}ms)
                                </span>
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#d29922',
                        fontStyle: 'italic'
                      }}>
                        No execution tree available - GPT code may not have generated trackable functions
                      </div>
                    )}
                    
                    {comparisonData.gptExecutionResult.debug && (
                      <details style={{ marginTop: '12px' }}>
                        <summary style={{ 
                          cursor: 'pointer', 
                          color: '#58a6ff', 
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          View Debug Output ({comparisonData.gptExecutionResult.debug.split('\n').length} lines)
                        </summary>
                        <pre style={{
                          background: '#0a0c10',
                          padding: '12px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          color: '#e6edf3',
                          maxHeight: '150px',
                          overflowY: 'auto',
                          marginTop: '8px',
                          fontFamily: 'SF Mono, monospace',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word'
                        }}>
                          {comparisonData.gptExecutionResult.debug}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </InsightCard>

              {/* Comparison Results */}
              {comparisonData && (
                <>
                  <MetricTitle style={{ marginTop: '32px' }}>
                    <VscGraphLine style={{ marginRight: '8px' }} />
                    Before vs After Comparison
                  </MetricTitle>
                  
                  {/* Performance Comparison */}
                  <InsightCard type="ai">
                    <InsightTitle type="ai">
                      <VscPlay style={{ marginRight: '8px', color: '#58a6ff' }} />
                      Performance Comparison
                    </InsightTitle>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '16px', 
                      marginTop: '16px' 
                    }}>
                      <div style={{ 
                        padding: '16px', 
                        background: 'rgba(248, 81, 73, 0.1)', 
                        borderRadius: '8px',
                        border: '1px solid rgba(248, 81, 73, 0.3)'
                      }}>
                        <h4 style={{ color: '#f85149', margin: '0 0 12px 0', fontSize: '14px' }}>
                          <VscCircleFilled style={{ marginRight: '6px', color: '#f85149' }} />
                          Original Code
                        </h4>
                        <div style={{ fontSize: '12px', color: '#e6edf3' }}>
                          <div>
                            <VscWatch style={{ marginRight: '6px', color: '#58a6ff' }} />
                            Execution Time: <strong>{comparisonData.original.totalExecutionTime}ms</strong>
                          </div>
                          <div>
                            <VscTarget style={{ marginRight: '6px', color: '#58a6ff' }} />
                            Performance Score: <strong>{Math.round(comparisonData.original.performanceScore)}/100</strong>
                          </div>
                          <div>
                            <FaBrain style={{ marginRight: '6px', color: '#58a6ff' }} />
                            Complexity: <strong>{comparisonData.original.cyclomaticComplexity}</strong>
                          </div>
                          <div>
                            <VscSymbolStructure style={{ marginRight: '6px', color: '#58a6ff' }} />
                            Nesting Depth: <strong>{comparisonData.original.nestingDepth}</strong>
                          </div>
                          <div>
                            <VscError style={{ marginRight: '6px', color: '#f85149' }} />
                            Errors: <strong>{comparisonData.original.errors}</strong>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        padding: '16px', 
                        background: 'rgba(35, 134, 54, 0.1)', 
                        borderRadius: '8px',
                        border: '1px solid rgba(35, 134, 54, 0.3)'
                      }}>
                        <h4 style={{ color: '#238636', margin: '0 0 12px 0', fontSize: '14px' }}>
                          <VscCircleFilled style={{ marginRight: '6px', color: '#238636' }} />
                          GPT Improved Code
                        </h4>
                        <div style={{ fontSize: '12px', color: '#e6edf3' }}>
                          {comparisonData.improved ? (
                            <>
                              <div>
                                <VscWatch style={{ marginRight: '6px', color: '#58a6ff' }} />
                                Execution Time: <strong>{comparisonData.improved.totalExecutionTime}ms</strong>
                              </div>
                              <div>
                                <VscTarget style={{ marginRight: '6px', color: '#58a6ff' }} />
                                Performance Score: <strong>{Math.round(comparisonData.improved.performanceScore)}/100</strong>
                              </div>
                              <div>
                                <FaBrain style={{ marginRight: '6px', color: '#58a6ff' }} />
                                Complexity: <strong>{comparisonData.improved.cyclomaticComplexity}</strong>
                              </div>
                              <div>
                                <VscSymbolStructure style={{ marginRight: '6px', color: '#58a6ff' }} />
                                Nesting Depth: <strong>{comparisonData.improved.nestingDepth}</strong>
                              </div>
                              <div>
                                <VscError style={{ marginRight: '6px', color: '#f85149' }} />
                                Errors: <strong>{comparisonData.improved.errors}</strong>
                              </div>
                            </>
                          ) : (
                            <div style={{ color: '#d29922' }}>
                              <VscSync style={{ marginRight: '6px' }} />
                              Run test to see results
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {comparisonData.improved && (
                      <div style={{ marginTop: '20px' }}>
                        <strong style={{ color: '#238636', fontSize: '14px' }}>
                          <VscCheck style={{ marginRight: '6px' }} />
                          Analysis Complete
                        </strong>
                        <p style={{ fontSize: '12px', color: '#7d8590', marginTop: '8px' }}>
                          Comparison results are displayed above. Review the metrics to understand the impact of GPT's optimizations.
                        </p>
                      </div>
                    )}
                  </InsightCard>

                  {/* Pros and Cons */}
                  <InsightCard type="ai">
                    <InsightTitle type="ai">
                      <FaBalanceScale style={{ marginRight: '8px', color: '#58a6ff' }} />
                      Honest Trade-off Analysis
                    </InsightTitle>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '16px', 
                      marginTop: '16px' 
                    }}>
                      <div>
                        <h4 style={{ 
                          color: comparisonData.improved && comparisonData.improved.performanceScore > comparisonData.original.performanceScore ? '#238636' : '#d29922', 
                          margin: '0 0 12px 0', 
                          fontSize: '14px' 
                        }}>
                          <VscCheck style={{ marginRight: '6px' }} />
                          Actual Improvements
                        </h4>
                        <ul style={{ fontSize: '12px', paddingLeft: '16px', color: '#e6edf3' }}>
                          {comparisonData.improved ? (() => {
                            const improvements = [];
                            
                            if (comparisonData.improved.totalExecutionTime < comparisonData.original.totalExecutionTime) {
                              improvements.push(`Faster execution (${comparisonData.original.totalExecutionTime}ms → ${comparisonData.improved.totalExecutionTime}ms)`);
                            }
                            if (comparisonData.improved.performanceScore > comparisonData.original.performanceScore) {
                              improvements.push(`Better performance score (${Math.round(comparisonData.original.performanceScore)} → ${Math.round(comparisonData.improved.performanceScore)})`);
                            }
                            if (comparisonData.improved.cyclomaticComplexity < comparisonData.original.cyclomaticComplexity) {
                              improvements.push(`Reduced complexity (${comparisonData.original.cyclomaticComplexity} → ${comparisonData.improved.cyclomaticComplexity})`);
                            }
                            if (comparisonData.improved.nestingDepth < comparisonData.original.nestingDepth) {
                              improvements.push(`Less nesting (${comparisonData.original.nestingDepth} → ${comparisonData.improved.nestingDepth} levels)`);
                            }
                            if (comparisonData.improved.errors < comparisonData.original.errors) {
                              improvements.push(`Fewer errors (${comparisonData.original.errors} → ${comparisonData.improved.errors})`);
                            }
                            
                            return improvements.length > 0 ? improvements.map((improvement, idx) => (
                              <li key={idx}>{improvement}</li>
                            )) : [<li key="none" style={{ color: '#7d8590' }}>No measurable improvements detected</li>];
                          })() : [<li key="pending">Run test to see actual improvements</li>]}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 style={{ 
                          color: comparisonData.improved && (
                            comparisonData.improved.totalExecutionTime > comparisonData.original.totalExecutionTime ||
                            comparisonData.improved.performanceScore < comparisonData.original.performanceScore
                          ) ? '#f85149' : '#d29922', 
                          margin: '0 0 12px 0', 
                          fontSize: '14px' 
                        }}>
                          <VscWarning style={{ marginRight: '6px' }} />
                          Actual Trade-offs
                        </h4>
                        <ul style={{ fontSize: '12px', paddingLeft: '16px', color: '#e6edf3' }}>
                          {comparisonData.improved ? (() => {
                            const tradeoffs = [];
                            
                            if (comparisonData.improved.totalExecutionTime > comparisonData.original.totalExecutionTime) {
                              tradeoffs.push(`Slower execution (${comparisonData.original.totalExecutionTime}ms → ${comparisonData.improved.totalExecutionTime}ms)`);
                            }
                            if (comparisonData.improved.performanceScore < comparisonData.original.performanceScore) {
                              tradeoffs.push(`Lower performance score (${Math.round(comparisonData.original.performanceScore)} → ${Math.round(comparisonData.improved.performanceScore)})`);
                            }
                            if (comparisonData.improved.cyclomaticComplexity > comparisonData.original.cyclomaticComplexity) {
                              tradeoffs.push(`Higher complexity (${comparisonData.original.cyclomaticComplexity} → ${comparisonData.improved.cyclomaticComplexity})`);
                            }
                            if (comparisonData.improved.nestingDepth > comparisonData.original.nestingDepth) {
                              tradeoffs.push(`Deeper nesting (${comparisonData.original.nestingDepth} → ${comparisonData.improved.nestingDepth} levels)`);
                            }
                            if (comparisonData.improved.errors > comparisonData.original.errors) {
                              tradeoffs.push(`More errors (${comparisonData.original.errors} → ${comparisonData.improved.errors})`);
                            }
                            
                            // Always include general considerations
                            tradeoffs.push('Different execution characteristics');
                            if (comparisonData?.gptCode !== currentCode) {
                              tradeoffs.push('Code behavior may differ');
                            }
                            tradeoffs.push('Requires additional testing');
                            
                            return tradeoffs.map((tradeoff, idx) => (
                              <li key={idx} style={{ 
                                color: tradeoff.includes('Slower') || tradeoff.includes('Lower') || tradeoff.includes('Higher') || tradeoff.includes('More') ? '#f85149' : '#e6edf3' 
                              }}>
                                {tradeoff}
                              </li>
                            ));
                          })() : [<li key="pending">Run test to see actual trade-offs</li>]}
                        </ul>
                      </div>
                    </div>
                    
                    {comparisonData.improved && (
                      <div style={{ 
                        marginTop: '16px', 
                        padding: '12px', 
                        borderRadius: '6px',
                        background: comparisonData.improved.performanceScore > comparisonData.original.performanceScore ? 
                          'rgba(35, 134, 54, 0.1)' : 'rgba(248, 81, 73, 0.1)',
                        border: `1px solid ${comparisonData.improved.performanceScore > comparisonData.original.performanceScore ? 
                          'rgba(35, 134, 54, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`
                      }}>
                        <strong style={{ 
                          color: comparisonData.improved.performanceScore > comparisonData.original.performanceScore ? '#238636' : '#f85149',
                          fontSize: '12px' 
                        }}>
                          {comparisonData.improved.performanceScore > comparisonData.original.performanceScore ? 
                            '✓ GPT optimization was beneficial' : 
                            '⚠ GPT optimization degraded performance'
                          }
                        </strong>
                        <p style={{ fontSize: '11px', color: '#7d8590', marginTop: '6px', margin: '6px 0 0 0' }}>
                          {comparisonData.improved.performanceScore > comparisonData.original.performanceScore ?
                            'The AI successfully improved your code with measurable benefits.' :
                            'In this case, the original code was already optimal. AI suggestions may not always improve performance.'
                          }
                        </p>
                      </div>
                    )}
                  </InsightCard>

                  {/* Code Diff Preview */}
                  <InsightCard type="ai">
                    <InsightTitle type="ai">
                      <VscEye style={{ marginRight: '8px', color: '#58a6ff' }} />
                      Code Comparison Preview
                    </InsightTitle>
                    <div style={{ marginTop: '16px' }}>
                      <CodeSpoilerComponent
                        title="GPT Optimized Code"
                        description="See exactly what GPT changed to improve your code"
                        code={comparisonData.gptCode}
                        explanation="This optimized version addresses the performance and maintainability issues identified in the analysis above."
                      />
                    </div>
                  </InsightCard>
                </>
              )}
            </>
          )}
        </>
      ) : (
        // Show fallback rule-based analysis until GPT analysis is requested
        <>
          {analysisData.aiInsights.length > 0 ? (
            analysisData.aiInsights.map((insight, index) => (
              <InsightCard key={index} type="ai">
                <InsightTitle type="ai">
                  {insight.title} 
                  <span style={{ color: '#8b5cf6', fontSize: '10px', marginLeft: '8px' }}>
                    {insight.confidence}% confidence
                  </span>
                </InsightTitle>
                <InsightText>{insight.message}</InsightText>
              </InsightCard>
            ))
          ) : (
            <InsightCard type="ai">
              <InsightTitle type="ai">Ready for AI Analysis</InsightTitle>
              <InsightText>
                Click "Get GPT Analysis" above to receive intelligent insights powered by GPT-4. 
                The AI will analyze your code execution patterns, performance, and provide personalized recommendations.
              </InsightText>
            </InsightCard>
          )}

          {/* Anti-patterns Detection */}
          {analysisData.antiPatterns.length > 0 && (
            <>
              <MetricTitle style={{ marginTop: '32px' }}>
                <VscWarning style={{ marginRight: '8px', color: '#f85149' }} />
                Anti-Patterns Detected
              </MetricTitle>
              {analysisData.antiPatterns.map((pattern, index) => (
                <InsightCard key={index} type="warning">
                  <InsightTitle>Anti-Pattern: {pattern}</InsightTitle>
                  <InsightText>
                    This pattern may lead to maintainability issues and should be refactored.
                  </InsightText>
                </InsightCard>
              ))}
            </>
          )}
        </>
      )}
    </TabContent>
  );

  const renderComplexity = () => (
    <TabContent>
      <MetricTitle>
        <VscGraphLine style={{ marginRight: '8px' }} />
        Complexity Analysis
      </MetricTitle>
      
      <ComplexityVisualization>
        <ComplexityMeter complexity={analysisData.cyclomaticComplexity / 5}>
          <div className="complexity-circle">
            {analysisData.cyclomaticComplexity}
          </div>
          <div style={{ color: '#e6edf3', fontSize: '12px', fontWeight: '600' }}>
            Cyclomatic Complexity
          </div>
        </ComplexityMeter>
        
        <ComplexityMeter complexity={analysisData.cognitiveComplexity / 6}>
          <div className="complexity-circle">
            {analysisData.cognitiveComplexity}
          </div>
          <div style={{ color: '#e6edf3', fontSize: '12px', fontWeight: '600' }}>
            Cognitive Complexity
          </div>
        </ComplexityMeter>
        
        <ComplexityMeter complexity={analysisData.nestingDepth / 3}>
          <div className="complexity-circle">
            {analysisData.nestingDepth}
          </div>
          <div style={{ color: '#e6edf3', fontSize: '12px', fontWeight: '600' }}>
            Nesting Depth
          </div>
        </ComplexityMeter>
      </ComplexityVisualization>

      <InsightCard type="info">
        <InsightTitle>Complexity Insights</InsightTitle>
        <InsightText>
          • Cyclomatic Complexity: Measures decision points in your code (if/else, loops, etc.)
          <br />
          • Cognitive Complexity: Measures how difficult the code is to understand
          <br />
          • Nesting Depth: Maximum levels of nested function calls
          <br />
          <br />
          <strong>Recommended Limits:</strong> Cyclomatic &lt; 10, Cognitive &lt; 15, Nesting &lt; 5
        </InsightText>
      </InsightCard>
    </TabContent>
  );

  const renderErrors = () => (
    <TabContent>
      <MetricTitle>
        <VscError style={{ marginRight: '8px' }} />
        Error Analysis
      </MetricTitle>
      
      <MetricGrid>
        <MetricCard glow={analysisData.errorAnalysis.totalErrors === 0}>
          <MetricTitle>Total Errors</MetricTitle>
          <MetricValue highlight={analysisData.errorAnalysis.totalErrors > 0}>
            {analysisData.errorAnalysis.totalErrors}
          </MetricValue>
          <MetricSubtext>
            {analysisData.errorAnalysis.totalErrors === 0 ? 'Clean execution!' : 'Issues detected'}
          </MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>Critical Errors</MetricTitle>
          <MetricValue highlight={analysisData.errorAnalysis.criticalErrors.length > 0}>
            {analysisData.errorAnalysis.criticalErrors.length}
          </MetricValue>
          <MetricSubtext>Requires immediate attention</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>Warnings</MetricTitle>
          <MetricValue>{analysisData.errorAnalysis.warnings.length}</MetricValue>
          <MetricSubtext>Potential issues</MetricSubtext>
        </MetricCard>
      </MetricGrid>

      {/* Success State */}
      {analysisData.errorAnalysis.totalErrors === 0 && (
        <InsightCard type="success">
          <InsightTitle>
            <VscCheck style={{ marginRight: '6px', color: '#238636' }} />
            Clean Execution
          </InsightTitle>
          <InsightText>
            No errors detected! Your code executed successfully without any runtime issues.
            This indicates good error handling and robust code structure.
          </InsightText>
        </InsightCard>
      )}
    </TabContent>
  );

  const renderFlameGraph = () => {
    // Build a proper hierarchical structure for flame graph
    const buildFlameHierarchy = (node: RuntimeProcessNode, depth = 0): any[] => {
      const duration = (node.endTime || node.startTime) - node.startTime;
      const nodeData = {
        name: node.name,
        duration,
        depth,
        startTime: node.startTime,
        children: node.children.flatMap(child => buildFlameHierarchy(child, depth + 1))
      };
      return [nodeData];
    };

    const flameData = root ? buildFlameHierarchy(root).flat() : [];
    const maxTime = flameData.length > 0 ? Math.max(...flameData.map(d => d.duration)) : 1;
    const colors = ['#238636', '#1f6feb', '#d29922', '#f85149', '#8b5cf6', '#00d448', '#ff7b7b', '#87ceeb'];

    // Sort by depth to ensure proper stacking
    const sortedData = flameData.sort((a, b) => a.depth - b.depth || a.startTime - b.startTime);

    return (
      <TabContent>
        <MetricTitle>
          <VscFlame style={{ marginRight: '8px' }} />
          Interactive Flame Graph
        </MetricTitle>
        <FlameGraphContainer>
          {sortedData.length > 0 ? (
            sortedData.map((item, index) => {
              const width = Math.max(2, (item.duration / maxTime) * 90);
              const color = colors[item.depth % colors.length];
              
              return (
                <FlameBlock
                  key={`${item.name}-${item.depth}-${index}`}
                  width={width}
                  depth={item.depth}
                  color={color}
                  title={`${item.name}: ${item.duration.toFixed(1)}ms (Depth: ${item.depth})`}
                >
                  {item.name} ({item.duration.toFixed(1)}ms)
                </FlameBlock>
              );
            })
          ) : (
            <div style={{ 
              color: '#7d8590', 
              textAlign: 'center', 
              padding: '40px',
              fontFamily: 'SF Mono, monospace'
            }}>
              No function execution data available. Run some code to see the flame graph!
            </div>
          )}
        </FlameGraphContainer>
        
        <InsightCard type="info">
          <InsightTitle>How to Read the Flame Graph</InsightTitle>
          <InsightText>
            • <strong>Width:</strong> Represents execution time (wider = longer execution)
            <br />
            • <strong>Depth:</strong> Shows function call hierarchy (indentation = call stack level)
            <br />
            • <strong>Color:</strong> Distinguishes different call stack depths
            <br />
            • <strong>Hover:</strong> Shows detailed timing and depth information
            <br />
            • <strong>Top:</strong> Root functions, <strong>Bottom:</strong> Nested function calls
          </InsightText>
        </InsightCard>
      </TabContent>
    );
  };

  const renderPredictive = () => (
    <TabContent>
      <MetricTitle>
        <VscEye style={{ marginRight: '8px' }} />
        Predictive Analytics
      </MetricTitle>
      
      <MetricGrid>
        <MetricCard>
          <MetricTitle>Scalability Prediction</MetricTitle>
          <MetricValue>{analysisData.scalabilityPrediction}</MetricValue>
          <MetricSubtext>Based on current patterns</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>Performance Trend</MetricTitle>
          <MetricValue>
            {analysisData.performanceTrend === 'improving' ? <VscTriangleUp style={{ color: '#00d448' }} /> : 
             analysisData.performanceTrend === 'degrading' ? <VscTriangleDown style={{ color: '#f85149' }} /> : <VscArrowRight style={{ color: '#7d8590' }} />}
            {' '}
            {analysisData.performanceTrend}
          </MetricValue>
          <MetricSubtext>Trajectory analysis</MetricSubtext>
        </MetricCard>
      </MetricGrid>

      <InsightCard type="info">
        <InsightTitle>Predictive Insights</InsightTitle>
        <InsightText>
          Based on current execution patterns, your code shows a {analysisData.performanceTrend} performance trend.
          This analysis helps predict future scalability challenges and optimization opportunities.
        </InsightText>
      </InsightCard>
    </TabContent>
  );

  const renderSecurity = () => (
    <TabContent>
      <MetricTitle>
        <VscShield style={{ marginRight: '8px' }} />
        Security Analysis
      </MetricTitle>
      
      <MetricCard>
        <MetricTitle>Security Score</MetricTitle>
        <MetricValue highlight={analysisData.securityScore > 80}>
          {Math.round(analysisData.securityScore)}/100
        </MetricValue>
        <MetricSubtext>
          {analysisData.securityScore > 80 ? 'Excellent security posture' : 
           analysisData.securityScore > 60 ? 'Good with room for improvement' : 
           'Needs immediate attention'}
        </MetricSubtext>
      </MetricCard>

      {analysisData.securityIssues.length > 0 ? (
        analysisData.securityIssues.map((issue, index) => (
          <InsightCard key={index} type="error">
            <InsightTitle>Security Issue</InsightTitle>
            <InsightText>{issue}</InsightText>
          </InsightCard>
        ))
      ) : (
        <InsightCard type="success">
          <InsightTitle>No Security Issues Detected</InsightTitle>
          <InsightText>Your code appears to follow security best practices.</InsightText>
        </InsightCard>
      )}
    </TabContent>
  );

  // AI Analysis function
  const getAIAnalysis = async () => {
    if (!root || !currentCode.trim()) {
      setAiError('No code or execution data available for analysis');
      return;
    }

    if (!OPENAI_API_KEY) {
      setAiError('OpenAI API key not configured. Please add REACT_APP_OPENAI_API_KEY to your .env.local file.');
      return;
    }

    setIsLoadingAI(true);
    setAiError(null);

    try {
      console.log('[AI Analysis] Starting GPT analysis...');
      
      const aiService = createAIAnalysisService(OPENAI_API_KEY);
      
      // Prepare execution data for AI analysis
      const flattenNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
        return [node, ...node.children.flatMap(flattenNodes)];
      };

      const allNodes = flattenNodes(root);
      const completedNodes = allNodes.filter(node => node.status === 'completed' && node.endTime);
      const debugLines = debug.split('\n');
      
      const calculateDepth = (node: RuntimeProcessNode, currentDepth = 0): number => {
        if (node.children.length === 0) return currentDepth;
        return Math.max(...node.children.map(child => calculateDepth(child, currentDepth + 1)));
      };

      const request = {
        code: currentCode,
        executionData: {
          functions: completedNodes.map(node => ({
            name: node.name,
            executionTime: (node.endTime! - node.startTime),
            callCount: 1,
            depth: calculateDepth(node)
          })),
          errors: debugLines.filter(line => 
            line.includes('error') || line.includes('Error') || line.includes('failed')
          ),
          debugLogs: debugLines.filter(line => line.trim().length > 0),
          patterns: {
            nestingDepth: calculateDepth(root),
            asyncOperations: debugLines.filter(line => 
              line.includes('Promise') || line.includes('setTimeout') || line.includes('async')
            ).length,
            totalFunctions: allNodes.length,
            cyclomaticComplexity: Math.min(20, Math.floor(calculateDepth(root) * 1.5 + allNodes.length * 0.3)),
            executionTime: Math.max(...completedNodes.map(node => node.endTime!)) - Math.min(...allNodes.map(node => node.startTime))
          }
        }
      };

      const analysis = await aiService.analyzeCodeExecution(request);
      setAiAnalysis(analysis);
      
    } catch (error) {
      console.error('[AI Analysis] Failed to get AI analysis:', error);
      setAiError(`AI Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <AnalyzerContainer>
      <TabContainer>
        <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          <VscGraph /> Overview
        </Tab>
        <Tab active={activeTab === 'ai-insights'} onClick={() => setActiveTab('ai-insights')}>
          <VscRobot /> AI Insights
        </Tab>
        <Tab active={activeTab === 'complexity'} onClick={() => setActiveTab('complexity')}>
          <VscGraphLine /> Complexity
        </Tab>
        <Tab active={activeTab === 'flame-graph'} onClick={() => setActiveTab('flame-graph')}>
          <VscFlame /> Flame Graph
        </Tab>
        <Tab active={activeTab === 'predictive'} onClick={() => setActiveTab('predictive')}>
          <VscEye /> Predictive
        </Tab>
        <Tab active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
          <VscShield /> Security
        </Tab>
        <Tab active={activeTab === 'errors'} onClick={() => setActiveTab('errors')}>
          <VscError /> Error Analysis
        </Tab>
      </TabContainer>
      
      <AnalysisContent>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'ai-insights' && renderAIInsights()}
        {activeTab === 'complexity' && renderComplexity()}
        {activeTab === 'flame-graph' && renderFlameGraph()}
        {activeTab === 'predictive' && renderPredictive()}
        {activeTab === 'security' && renderSecurity()}
        {activeTab === 'errors' && renderErrors()}
      </AnalysisContent>
    </AnalyzerContainer>
  );
}; 