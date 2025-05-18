import { DefaultTheme } from 'styled-components';

export type PlaygroundMode = 'node' | 'api' | 'database';

export interface ProcessMetrics {
  cpu: number;
  memory: number;
  network: number;
}

export interface Process {
  id: string;
  name: string;
  type: 'server' | 'database' | 'api';
  status: 'running' | 'stopped' | 'error';
  metrics: {
    cpu: number;
    memory: number;
  };
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'http' | 'websocket' | 'database';
  status: 'active' | 'inactive' | 'error';
}

export interface NetworkTraffic {
  bytesIn: number;
  bytesOut: number;
  requestsPerSecond: number;
  activeConnections: number;
}

export interface Protocol {
  name: string;
  version: string;
  status: 'active' | 'inactive';
}

export interface EditorState {
  content: string;
  language: string;
  theme: string;
}

export interface VisualizationState {
  showProcessTree: boolean;
  showNetworkTraffic: boolean;
  showMetrics: boolean;
}

export interface PlaygroundState {
  activeProcesses: Process[];
  networkConnections: Connection[];
  resourceMetrics: {
    cpu: number;
    memory: number;
    network: number;
  };
  codeEditor: {
    content: string;
    language: string;
    theme: string;
  };
  visualizations: {
    showProcessTree: boolean;
    showNetworkTraffic: boolean;
    showMetrics: boolean;
  };
}

export interface PlaygroundProps {
  mode: 'node' | 'api' | 'database';
  theme: DefaultTheme;
  onStateChange: (state: PlaygroundState) => void;
}

export type PlaygroundAction =
  | { type: 'ADD_PROCESS'; payload: Process }
  | { type: 'REMOVE_PROCESS'; payload: string }
  | { type: 'UPDATE_PROCESS'; payload: Process }
  | { type: 'ADD_CONNECTION'; payload: Connection }
  | { type: 'REMOVE_CONNECTION'; payload: string }
  | { type: 'UPDATE_METRICS'; payload: ProcessMetrics }
  | { type: 'UPDATE_EDITOR'; payload: Partial<EditorState> }
  | { type: 'TOGGLE_VISUALIZATION'; payload: keyof VisualizationState }; 