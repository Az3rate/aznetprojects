import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { PlaygroundState, PlaygroundAction } from '../types';

interface PlaygroundContextType {
  state: PlaygroundState;
  dispatch: React.Dispatch<PlaygroundAction>;
}

const initialState: PlaygroundState = {
  activeProcesses: [
    {
      id: '1',
      name: 'API Server',
      type: 'api',
      status: 'running',
      metrics: {
        cpu: 45,
        memory: 60
      }
    },
    {
      id: '2',
      name: 'Database',
      type: 'database',
      status: 'running',
      metrics: {
        cpu: 30,
        memory: 75
      }
    },
    {
      id: '3',
      name: 'WebSocket',
      type: 'server',
      status: 'running',
      metrics: {
        cpu: 25,
        memory: 40
      }
    }
  ],
  networkConnections: [
    {
      id: '1',
      sourceId: '1',
      targetId: '2',
      type: 'database',
      status: 'active'
    },
    {
      id: '2',
      sourceId: '1',
      targetId: '3',
      type: 'websocket',
      status: 'active'
    },
    {
      id: '3',
      sourceId: '3',
      targetId: '2',
      type: 'database',
      status: 'active'
    }
  ],
  resourceMetrics: {
    cpu: 33,
    memory: 58,
    network: 45
  },
  codeEditor: {
    content: '// Your code here',
    language: 'typescript',
    theme: 'vs-dark'
  },
  visualizations: {
    showProcessTree: true,
    showNetworkTraffic: true,
    showMetrics: true
  }
};

const playgroundReducer = (state: PlaygroundState, action: PlaygroundAction): PlaygroundState => {
  switch (action.type) {
    case 'ADD_PROCESS':
      return {
        ...state,
        activeProcesses: [...state.activeProcesses, action.payload]
      };
    case 'REMOVE_PROCESS':
      return {
        ...state,
        activeProcesses: state.activeProcesses.filter(p => p.id !== action.payload)
      };
    case 'UPDATE_PROCESS':
      return {
        ...state,
        activeProcesses: state.activeProcesses.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        )
      };
    case 'ADD_CONNECTION':
      return {
        ...state,
        networkConnections: [...state.networkConnections, action.payload]
      };
    case 'REMOVE_CONNECTION':
      return {
        ...state,
        networkConnections: state.networkConnections.filter(c => c.id !== action.payload)
      };
    case 'UPDATE_METRICS':
      return {
        ...state,
        resourceMetrics: { ...state.resourceMetrics, ...action.payload }
      };
    case 'UPDATE_EDITOR':
      return {
        ...state,
        codeEditor: { ...state.codeEditor, ...action.payload }
      };
    case 'TOGGLE_VISUALIZATION':
      return {
        ...state,
        visualizations: {
          ...state.visualizations,
          [action.payload]: !state.visualizations[action.payload]
        }
      };
    default:
      return state;
  }
};

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined);

export const PlaygroundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(playgroundReducer, initialState);

  return (
    <PlaygroundContext.Provider value={{ state, dispatch }}>
      {children}
    </PlaygroundContext.Provider>
  );
};

export const usePlayground = () => {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error('usePlayground must be used within a PlaygroundProvider');
  }
  return context;
}; 