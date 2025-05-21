import React, { createContext, useContext } from 'react';
import type { RuntimeProcessNode } from '../types';

// Define the context shape
interface RuntimeContextProps {
  root: RuntimeProcessNode | null;
  syncVisualization: () => void;
}

// Create the context with default values
export const RuntimeContext = createContext<RuntimeContextProps>({
  root: null,
  syncVisualization: () => console.log('Sync function not implemented')
});

// Create a provider component
export const RuntimeProvider: React.FC<{
  children: React.ReactNode;
  root: RuntimeProcessNode | null;
  syncVisualization: () => void;
}> = ({ children, root, syncVisualization }) => {
  return (
    <RuntimeContext.Provider value={{ root, syncVisualization }}>
      {children}
    </RuntimeContext.Provider>
  );
};

// Create a hook for easy consumption
export const useRuntime = () => useContext(RuntimeContext); 