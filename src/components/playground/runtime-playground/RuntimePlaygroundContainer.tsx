import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { RuntimeProcessVisualizer } from './RuntimeProcessVisualizer';
import { useRuntimeProcessEvents } from './useRuntimeProcessEvents';
import { instrumentCode } from './utils/instrumentCode';
import type { RuntimeProcessEvent, RuntimeProcessNode } from './types';
import * as Comlink from 'comlink';
import MermaidDiagram from '../components/MermaidDiagram';
import codeExamples from './codeExamples';
import { VisualizationExplainer } from './VisualizationExplainer';
import { RuntimeProvider } from './context/RuntimeContext';
import { RuntimeAnalyzer } from './RuntimeAnalyzer';
import { VscCode, VscDebugConsole } from 'react-icons/vsc';

// Weighted & Anchored Design System - Base Container
const WeightedContainer = styled.div<{ gridArea?: string }>`
  position: relative;
  background: #0a0c10;
  border: 4px solid #1c2128;
  box-shadow: 
    0 0 0 1px #21262d,
    0 8px 24px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
  grid-area: ${({ gridArea }) => gridArea || 'auto'};
`;

// Main page container with updated vertical layout
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  padding-top: 88px; /* Account for floating navigation + optimal breathing room */
  min-height: 100vh;
  max-width: 100vw;
  background: #010409;
  box-sizing: border-box;
`;

// Main Code Section - Full width, prominent
const CodeSection = styled(WeightedContainer)`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 500px; /* Fixed height for code editing */
`;

// Execution Results Section - Collapsible
const ExecutionResultsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

// Collapsible Section Component
const CollapsibleSection = styled.div<{ expanded: boolean }>`
  background: #0a0c10;
  border: 4px solid #1c2128;
  box-shadow: 
    0 0 0 1px #21262d,
    0 8px 24px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  ${({ expanded }) => !expanded && `
    border-color: #30363d;
    box-shadow: 
      0 0 0 1px #30363d,
      0 4px 12px rgba(0, 0, 0, 0.3);
  `}
`;

const CollapsibleHeader = styled.div<{ expanded: boolean }>`
  background: #0d1117;
  border-bottom: 2px solid #1c2128;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #161b22;
  }
  
  ${({ expanded }) => !expanded && `
    border-bottom: none;
  `}
`;

const CollapsibleContent = styled.div<{ expanded: boolean; maxHeight?: string }>`
  max-height: ${({ expanded, maxHeight }) => expanded ? (maxHeight || '800px') : '0'};
  overflow: ${({ expanded }) => expanded ? 'auto' : 'hidden'};
  transition: max-height 0.3s ease;
  
  /* Ensure proper scrolling behavior when expanded */
  ${({ expanded }) => expanded && `
    /* Custom scrollbar styling for dark theme */
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: #161b22;
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #30363d;
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: #484f58;
    }
  `}
`;

const ExpandIcon = styled.span<{ expanded: boolean }>`
  font-size: 14px;
  transition: transform 0.2s ease;
  transform: ${({ expanded }) => expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  color: #7d8590;
`;

// Tab System for Code Editor
const EditorTabContainer = styled.div`
  display: flex;
  background: #161b22;
  border-bottom: 2px solid #1c2128;
`;

const EditorTab = styled.button<{ active: boolean }>`
  background: ${({ active }) => active ? '#0d1117' : 'transparent'};
  color: ${({ active }) => active ? '#e6edf3' : '#7d8590'};
  border: none;
  padding: 12px 20px;
  font-family: 'SF Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid ${({ active }) => active ? '#1f6feb' : 'transparent'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    background: ${({ active }) => active ? '#0d1117' : 'rgba(48, 54, 61, 0.3)'};
    color: #e6edf3;
  }
`;

// Delete old sections - Examples, Output, Visualizer that will be replaced
const ExamplesSection = styled.div`
  display: none; /* Remove old examples section */
`;

const OutputSection = styled.div`
  display: none; /* Will be replaced by collapsible */
`;

const VisualizerSection = styled.div`
  display: none; /* Will be replaced by collapsible */
`;

const AnalyzerSection = styled.div`
  display: none; /* Will be replaced by collapsible */
`;

// Editor Section
const EditorSection = styled(WeightedContainer)`
  grid-area: editor;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const EditorHeader = styled.div`
  background: #0d1117;
  border-bottom: 2px solid #1c2128;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  flex-wrap: wrap;
  gap: 12px;
`;

const EditorContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CodeEditor = styled.textarea`
  flex: 1;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 14px;
  padding: 20px;
  background: #0a0c10;
  color: #e6edf3;
  border: none;
  resize: none;
  outline: none;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;
  border-bottom: 2px solid #1c2128;
`;

const EditorControls = styled.div`
  background: #0d1117;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 2px solid #1c2128;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
`;

// Weighted Button System
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
`;

// Output Section
const OutputHeader = styled(EditorHeader)`
  min-height: auto;
`;

const OutputContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 20px;
  font-family: 'SF Mono', monospace;
  font-size: 12px;
  color: #e6edf3;
  line-height: 1.4;
  background: #0a0c10;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const DebugOutput = styled(OutputContent)`
  color: #00d448;
  border-bottom: 2px solid #1c2128;
  max-height: 150px;
`;

// Visualizer Hint Section
const VisualizerHintSection = styled(WeightedContainer)`
  grid-area: visualizer-hint;
  padding: 20px;
  min-height: 120px;
`;

// Enhanced Select Styling for Examples 
const WeightedSelect = styled.select`
  background: #21262d;
  border: 2px solid #30363d;
  border-radius: 6px;
  padding: 8px 12px;
  color: #e6edf3;
  font-size: 13px;
  font-family: 'SF Mono', monospace;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #1f6feb;
    box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.3);
  }
  
  &:hover {
    border-color: #48515c;
  }

  option {
    background: #21262d;
    color: #e6edf3;
    padding: 8px;
  }

  optgroup {
    background: #0d1117;
    color: #7d8590;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ExampleDescription = styled.div`
  margin-top: 12px;
  padding: 12px;
  font-size: 13px;
  color: #7d8590;
  background: rgba(33, 38, 45, 0.6);
  border-radius: 6px;
  border: 1px solid #30363d;
  backdrop-filter: blur(8px);
  line-height: 1.4;
`;

const ComplexityBadge = styled.span<{ complexity: string }>`
  display: inline-block;
  padding: 4px 8px;
  margin-left: 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: ${({ complexity }) => {
    switch (complexity) {
      case 'basic': return '#238636';
      case 'intermediate': return '#1f6feb';
      case 'advanced': return '#fb8500';
      case 'expert': return '#f85149';
      default: return '#6e7681';
    }
  }};
  box-shadow: 0 0 8px ${({ complexity }) => {
    switch (complexity) {
      case 'basic': return 'rgba(35, 134, 54, 0.3)';
      case 'intermediate': return 'rgba(31, 111, 235, 0.3)';
      case 'advanced': return 'rgba(251, 133, 0, 0.3)';
      case 'expert': return 'rgba(248, 81, 73, 0.3)';
      default: return 'rgba(110, 118, 129, 0.3)';
    }
  }};
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #7d8590;
  font-size: 12px;
  font-family: 'SF Mono', monospace;
  
  input {
    margin-right: 8px;
    accent-color: #238636;
  }
`;

const DEFAULT_CODE = `// Nested function call example
function first() {
  console.log("First function starting");
  console.log("First function calling second");
  second();
  console.log("First function completed");
}

function second() {
  console.log("Second function starting");
  console.log("Second function calling third");
  third();
  console.log("Second function completed");
}

function third() {
  console.log("Third function starting");
  console.log("Third function completed");
}

// Call the first function to start the chain
first();`;

const SIMPLE_WRAPPER = `
// Event emitter setup
function emitProcessEvent(id, name, type, status) {
  console.log('[RUNTIME_EVENT]', { id, name, type, status });
  try {
    window.parent.postMessage({
      type: 'runtime-process-event',
      event: {
        id: id,
        name: name,
        type: type,
        status: status,
        timestamp: Date.now(),
        parentId: getCurrentParent()
      }
    }, '*');
  } catch (e) {
    console.error('Failed to emit process event:', e);
  }
}

let globalCurrentParent = null;
function getCurrentParent() { 
  return globalCurrentParent; 
}
function setCurrentParent(parentId) { 
  globalCurrentParent = parentId; 
}

function main() {
  console.log('Program started');
  console.log('Done!');
}, 'main');

main();`;

// Define the interface for the worker API
interface WorkerAPI {
  executeCode: (code: string) => Promise<void>;
}

// Add back SectionTitle and other needed components
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

export const RuntimePlaygroundContainer: React.FC = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [debug, setDebug] = useState('');
  const [output, setOutput] = useState('');
  const [runCount, setRunCount] = useState(0);
  const [useSimpleWrapper, setUseSimpleWrapper] = useState(false);
  const [selectedExample, setSelectedExample] = useState<string>('');
  const { root, handleEvent, setRoot, setNodeMap, syncVisualization } = useRuntimeProcessEvents();

  // New state for collapsible layout
  const [expandedSections, setExpandedSections] = useState({
    debug: true,
    visualizer: true,
    analyzer: true
  });

  // Get current example for description display
  const currentExample = selectedExample ? codeExamples.find(ex => ex.id === selectedExample) : null;

  // Load code example when selected
  useEffect(() => {
    if (selectedExample) {
      const example = codeExamples.find(ex => ex.id === selectedExample);
      if (example) {
        setCode(example.code);
      }
    }
  }, [selectedExample]);

  // Listen for process events from iframe
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      // Ignore React DevTools messages
      if (e.data?.source === 'react-devtools-content-script') {
        return;
      }
      
      // Handle iframe ready message
      if (e.data?.type === 'iframe-ready') {
        setDebug(d => d + '[IFRAME] Runtime initialized and ready\n');
        return;
      }
      
      // Log all received messages to debug output
      setDebug(d => d + `Message received: ${JSON.stringify(e.data)}\n`);
      console.log('[DEBUG_RECEIVED_MESSAGE]', e.data);
      
      // Handle special runtime-complete event to force sync
      if (e.data?.type === 'runtime-complete') {
        console.log('[DEBUG_RUNTIME_COMPLETE] Runtime execution complete, triggering sync');
        setDebug(d => d + `[RUNTIME_COMPLETE] Execution completed at ${new Date().toISOString()}\n`);
        
        // Trigger sync after a small delay to ensure all events are processed
        setTimeout(() => {
          if (syncVisualization) {
            console.log('[DEBUG_RUNTIME_COMPLETE] Syncing visualization after completion');
            syncVisualization();
          }
        }, 500);
        
        return;
      }
      
      if (e.data?.type === 'runtime-process-event') {
        const event = e.data.event as RuntimeProcessEvent;
        setDebug(d => d + `[DEBUG_RECEIVED_EVENT] ${JSON.stringify(event)}\n`);
        setDebug(d => d + `[EVENT] ${event.status} ${event.type} ${event.name} (Parent: ${event.parentId || 'none'})\n`);
        console.log('[DEBUG_PROCESS_EVENT]', event);
        
        // Ensure we're handling events in the correct order
        if (event.status === 'end' && !root) {
          console.log('[DB1] Received end event before tree was constructed, handling immediately');
        }
        
        // Make sure parentId is properly set
        if (event.status === 'start' && event.name === 'main') {
          // Main function has no parent
          event.parentId = undefined;
        }
        
        // Detailed logging for debugging parent-child relationships
        console.log(`[DB1] Event: ${event.status} ${event.name} (Parent: ${event.parentId || 'none'})`);
        
        handleEvent(event);
        
        // Check if this is a completion event for the main function
        if (event.status === 'end' && event.name === 'main') {
          console.log('[DEBUG_MAIN_COMPLETE] Main function completed, triggering sync in 1s');
          // Trigger sync after a delay to ensure visualization is updated
          setTimeout(() => {
            if (syncVisualization) {
              syncVisualization();
            }
          }, 1000);
        }
        
        // Force a re-render to ensure visualization updates
        setTimeout(() => {
          console.log('[DB1] Checking tree state after event:', root);
        }, 0);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleEvent, root, syncVisualization]);

  function runCode() {
    setRunCount(c => c + 1);
    setDebug(`Run #${runCount + 1} started\n`);
    setOutput('');
    setRoot(null); // Reset the process tree
    setNodeMap({}); // Reset node map

    setDebug(d => d + 'Successfully got iframe document, setting up Web Worker with Comlink...\n');

    // Instrument the user code
    const instrumentedCode = instrumentCode(code);
    console.log('[DB1] Transformed code:', instrumentedCode);

    // Create a new Web Worker using Comlink
    const workerBlob = new Blob([
      `importScripts('https://unpkg.com/comlink/dist/umd/comlink.js');

      // Define the worker API
      const workerAPI = {
        async executeCode(code) {
          try {
            // Override console methods
            const originalConsole = {
              log: console.log,
              error: console.error,
              warn: console.warn,
              info: console.info
            };

            console.log = function(...args) {
              self.postMessage({ type: 'log', message: args.join(' ') });
              originalConsole.log(...args);
            };

            console.error = function(...args) {
              self.postMessage({ type: 'error', message: args.join(' ') });
              originalConsole.error(...args);
            };

            console.info = function(...args) {
              self.postMessage({ type: 'info', message: args.join(' ') });
              originalConsole.info(...args);
            };

            console.warn = function(...args) {
              self.postMessage({ type: 'warn', message: args.join(' ') });
              originalConsole.warn(...args);
            };

            // Execute the instrumented code
            self.postMessage({ type: 'log', message: 'Executing user code...' });
            await eval(code);
            self.postMessage({ type: 'log', message: 'Code execution completed' });
          } catch (err) {
            self.postMessage({ type: 'error', message: 'Error executing code: ' + err.message });
            console.error(err);
          }
        }
      };

      Comlink.expose(workerAPI);
      `
    ], { type: 'application/javascript' });

    const worker = new Worker(URL.createObjectURL(workerBlob));
    const workerAPI = Comlink.wrap<WorkerAPI>(worker);

    // Track if we should delay termination for Promises
    let workerTerminated = false;
    
    // Use Comlink to call the worker's executeCode function
    (async () => {
      await workerAPI.executeCode(instrumentedCode);
      console.log('[DEBUG] Code execution completed, but checking for pending Promises...');
      
      // Don't terminate immediately - wait for runtime-complete signal
      // Set a maximum timeout of 15 seconds
      setTimeout(() => {
        if (!workerTerminated) {
          console.log('[DEBUG] Maximum wait time reached, terminating worker');
          worker.terminate();
          workerTerminated = true;
        }
      }, 15000);
    })();

    // Listen for messages from the worker
    worker.onmessage = function(event) {
      console.log('[DB1] Worker message received:', event.data);
      
      if (event.data?.type === 'runtime-process-event') {
        const processEvent = event.data.event as RuntimeProcessEvent;
        console.log('[DB1] Process event from worker:', processEvent);
        
        // Make sure parentId is properly set
        if (processEvent.status === 'start' && processEvent.name === 'main') {
          // Main function has no parent
          processEvent.parentId = undefined;
        }
        
        // Detailed logging for debugging parent-child relationships
        console.log(`[DB1] Event: ${processEvent.status} ${processEvent.name} (Parent: ${processEvent.parentId || 'none'})`);
        
        // Handle the event to update visualization
        handleEvent(processEvent);
        setDebug(d => d + `[EVENT] ${processEvent.status} ${processEvent.type} ${processEvent.name} (Parent: ${processEvent.parentId || 'none'})\n`);
        
        // Force sync if this is the end of the main function
        if (processEvent.status === 'end' && processEvent.name === 'main') {
          console.log('[DEBUG] Main function ended, syncing visualization');
          setTimeout(() => {
            if (syncVisualization) {
              syncVisualization();
            }
          }, 500); // Increased timeout to ensure console output is available
        }
      } else if (event.data?.type === 'runtime-complete') {
        console.log('[DEBUG] Runtime complete event received, all Promises resolved');
        
        // Terminate the worker now that all Promises are complete
        if (!workerTerminated) {
          console.log('[DEBUG] Terminating worker after Promise completion');
          worker.terminate();
          workerTerminated = true;
        }
        
        // Sync visualization after a delay
        setTimeout(() => {
          if (syncVisualization) {
            console.log('[DEBUG] Syncing visualization after Promise completion');
            syncVisualization();
          }
        }, 500);
      } else if (event.data?.type) {
        const { type, message } = event.data;
        setDebug(d => d + `[WORKER ${type.toUpperCase()}] ${message}\n`);
        if (type === 'log' || type === 'error') {
          setOutput(o => o + message + '\n');
          
          // Check if the message contains DEBUG_EVENT_EMISSION 
          if (message.includes('DEBUG_EVENT_EMISSION')) {
            console.log('[DEBUG] Found event emission in log:', message);
          }
          
          // Check for function completion to help sync
          if (message.includes('completed') && message.includes('function')) {
            console.log('[DEBUG] Detected completion message, may need to sync visualization');
          }
        }
      } else {
        setDebug(d => d + `[WORKER RAW] ${JSON.stringify(event.data)}\n`);
      }
    };
  }

  const downloadDebugInfo = () => {
    const uniqueDebugLines = Array.from(new Set(debug.split('\n'))).join('\n');
    const blob = new Blob([uniqueDebugLines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'debug-info.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add debugging for root data
  console.log('[DEBUG] Root data:', root);
  
  useEffect(() => {
    console.log('[DEBUG] Root data updated:', root);
    
    if (root) {
      console.log('[DEBUG] Root children:', root.children);
      const mermaidString = `graph TD; ${root.name}[${root.name}] --> ${root.children.map(child => child.name).join(' --> ')};`;
      console.log('[DEBUG] Mermaid string:', mermaidString);
    }
  }, [root]);

  // Function to execute GPT code for testing
  const executeGPTCode = async (gptCode: string) => {
    return new Promise<{
      root: RuntimeProcessNode | null;
      debug: string;
      analysisData: any;
    }>((resolve, reject) => {
      try {
        console.log('[GPT_EXEC] Starting GPT code execution...');
        
        // Store current state to restore later
        const originalCode = code;
        const originalRoot = root;
        const originalDebug = debug;
        
        // Temporarily set the GPT code
        setCode(gptCode);
        
        // Reset state for GPT execution
        let gptRoot: RuntimeProcessNode | null = null;
        let gptDebug = '';
        let gptOutput = '';
        
        // Create a temporary event handler for GPT execution
        const tempHandleEvent = (event: RuntimeProcessEvent) => {
          console.log('[GPT_EXEC] Processing event:', event);
          
          if (event.status === 'start') {
            const newNode: RuntimeProcessNode = {
              id: event.id,
              name: event.name,
              type: event.type,
              status: 'running',
              startTime: event.timestamp,
              children: [],
              parentId: event.parentId
            };

            if (!event.parentId) {
              gptRoot = newNode;
            } else {
              // Find parent and add as child
              const findAndAddChild = (node: RuntimeProcessNode): boolean => {
                if (node.id === event.parentId) {
                  node.children.push(newNode);
                  return true;
                }
                return node.children.some(findAndAddChild);
              };
              
              if (gptRoot) {
                findAndAddChild(gptRoot);
              }
            }
          } else if (event.status === 'end') {
            // Find and update the node
            const findAndUpdate = (node: RuntimeProcessNode): boolean => {
              if (node.id === event.id) {
                node.status = 'completed';
                node.endTime = event.timestamp;
                return true;
              }
              return node.children.some(findAndUpdate);
            };
            
            if (gptRoot) {
              findAndUpdate(gptRoot);
            }
          }
        };

        // Generate analysis data from GPT execution results
        const generateAnalysisData = (root: RuntimeProcessNode | null, debug: string, isGPTCode = true, originalData?: any) => {
          if (!root) {
            return {
              totalFunctions: 0,
              totalExecutionTime: 0,
              successRate: 0,
              nestingDepth: 0,
              asyncOperations: 0,
              errors: 0,
              performanceScore: 100,
              complexityScore: 100,
              maintainabilityScore: 100,
              securityScore: 100,
              overallScore: 100,
              aiInsights: [],
              cyclomaticComplexity: 0,
              cognitiveComplexity: 0,
              bigOEstimate: 'O(1)',
              hotFunctions: [],
              memoryLeakRisk: 0,
              scalabilityPrediction: 'Excellent',
              securityIssues: [],
              antiPatterns: [],
              performanceTrend: 'improving' as const,
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

          // Flatten all nodes for analysis (same logic as original)
          const flattenNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
            return [node, ...node.children.flatMap(flattenNodes)];
          };

          const allNodes = flattenNodes(root);
          const completedNodes = allNodes.filter(node => node.status === 'completed' && node.endTime);
          const debugLines = debug.split('\n');
          
          const totalFunctions = allNodes.length;
          const successRate = totalFunctions > 0 ? (completedNodes.length / totalFunctions) * 100 : 0;
          const totalExecutionTime = completedNodes.length > 0 ? 
            Math.max(...completedNodes.map(node => node.endTime!)) - Math.min(...allNodes.map(node => node.startTime)) : 0;
          
          // Calculate nesting depth
          const calculateDepth = (node: RuntimeProcessNode, currentDepth = 0): number => {
            if (node.children.length === 0) return currentDepth;
            return Math.max(...node.children.map((child: RuntimeProcessNode) => calculateDepth(child, currentDepth + 1)));
          };
          const nestingDepth = calculateDepth(root);
          
          const asyncOperations = debugLines.filter(line => 
            line.includes('Promise') || line.includes('setTimeout') || line.includes('async')
          ).length;
          
          const errors = debugLines.filter(line => 
            line.includes('error') || line.includes('Error') || line.includes('failed')
          ).length;

          // Enhanced scoring algorithm for GPT code comparison
          let performanceScore, complexityScore, maintainabilityScore, securityScore;
          
          if (isGPTCode && originalData) {
            // Comparison-based scoring for GPT code
            console.log('[GPT_SCORING] Using comparison-based scoring with original data:', originalData);
            
            // Performance Score: Reward improvements, penalize regressions
            const timeImprovement = originalData.totalExecutionTime > 0 ? 
              ((originalData.totalExecutionTime - totalExecutionTime) / originalData.totalExecutionTime) * 100 : 0;
            const errorReduction = (originalData.errors - errors) * 10; // 10 points per error fixed
            
            // Base score of 60, adjust based on improvements
            performanceScore = Math.min(100, Math.max(0, 
              60 + timeImprovement + errorReduction - (totalExecutionTime > 10000 ? 20 : 0)
            ));
            
            // Complexity Score: Reward complexity reduction, penalize increases more heavily
            const complexityImprovement = (originalData.nestingDepth - nestingDepth) * 15; // 15 points per level reduced
            const functionCountImprovement = (originalData.totalFunctions - totalFunctions) * 5; // 5 points per function reduced
            
            // Penalize complexity increases more heavily than rewarding reductions
            const complexityPenalty = nestingDepth > originalData.nestingDepth ? (nestingDepth - originalData.nestingDepth) * 25 : 0;
            const functionCountPenalty = totalFunctions > originalData.totalFunctions ? (totalFunctions - originalData.totalFunctions) * 8 : 0;
            
            complexityScore = Math.min(100, Math.max(0, 
              60 + complexityImprovement + functionCountImprovement - complexityPenalty - functionCountPenalty
            ));
            
            // Maintainability Score: Focus on structure improvements with penalties for regressions
            const nestingImprovement = (originalData.nestingDepth - nestingDepth) * 12;
            const nestingPenalty = nestingDepth > originalData.nestingDepth ? (nestingDepth - originalData.nestingDepth) * 20 : 0;
            const readabilityBonus = totalFunctions <= originalData.totalFunctions ? 8 : -10;
            
            // Bonus for fixing specific blocking issues
            const blockingDelayFixed = !debugLines.some(line => 
              line.includes('while') && line.includes('Date.now')
            ) && debugLines.some(line => 
              line.includes('setTimeout') || line.includes('Promise.resolve')
            ) ? 15 : 0;
            
            maintainabilityScore = Math.min(100, Math.max(0, 
              60 + nestingImprovement + readabilityBonus + blockingDelayFixed - nestingPenalty
            ));
            
            // Security Score: Maintain or improve security
            const securityRegressions = debugLines.filter(line => 
              line.includes('eval') || line.includes('innerHTML')
            ).length;
            
            securityScore = securityRegressions === 0 ? 90 : Math.max(0, 90 - (securityRegressions * 20));
            
            console.log('[GPT_SCORING] Calculated scores:', {
              performanceScore: performanceScore.toFixed(1),
              timeImprovement: timeImprovement.toFixed(1) + '%',
              complexityScore: complexityScore.toFixed(1),
              complexityDetails: {
                improvement: complexityImprovement.toFixed(1),
                penalty: complexityPenalty.toFixed(1),
                functionImprovement: functionCountImprovement.toFixed(1),
                functionPenalty: functionCountPenalty.toFixed(1)
              },
              maintainabilityScore: maintainabilityScore.toFixed(1),
              maintainabilityDetails: {
                nestingImprovement: nestingImprovement.toFixed(1),
                nestingPenalty: nestingPenalty.toFixed(1),
                readabilityBonus: readabilityBonus,
                blockingDelayFixed: blockingDelayFixed
              },
              securityScore: securityScore.toFixed(1),
              originalData: {
                nestingDepth: originalData.nestingDepth,
                totalFunctions: originalData.totalFunctions,
                executionTime: originalData.totalExecutionTime
              },
              newData: {
                nestingDepth: nestingDepth,
                totalFunctions: totalFunctions,
                executionTime: totalExecutionTime
              }
            });
            
          } else {
            // Original absolute scoring for baseline code
            performanceScore = Math.max(0, 100 - (totalExecutionTime / 100) - (errors * 10));
            complexityScore = Math.max(0, 100 - (nestingDepth * 8) - (totalFunctions * 2));
            maintainabilityScore = Math.max(0, 100 - (nestingDepth * 10) - (totalFunctions > 20 ? 20 : 0));
            securityScore = Math.max(0, 100 - (debugLines.filter(line => 
              line.includes('eval') || line.includes('innerHTML')
            ).length * 15));
          }
          
          const overallScore = (performanceScore + complexityScore + maintainabilityScore + securityScore) / 4;

          const cyclomaticComplexity = Math.min(15, Math.floor(nestingDepth * 1.2 + totalFunctions * 0.2));
          const cognitiveComplexity = Math.min(20, Math.floor(nestingDepth * 1.5 + asyncOperations * 0.4));
          const bigOEstimate = nestingDepth >= 6 ? 'O(n²)' : nestingDepth >= 3 ? 'O(n)' : 'O(1)';

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
            aiInsights: [],
            cyclomaticComplexity,
            cognitiveComplexity,
            bigOEstimate,
            hotFunctions: [],
            memoryLeakRisk: 0,
            scalabilityPrediction: overallScore > 80 ? 'Excellent' : overallScore > 60 ? 'Good' : 'Needs Improvement',
            securityIssues: [],
            antiPatterns: [],
            performanceTrend: 'improving' as const,
            resourceUsageForecast: [],
            scalabilityBottlenecks: [],
            errorAnalysis: {
              totalErrors: errors,
              errorTypes: {},
              criticalErrors: [],
              warnings: [],
              errorInsights: []
            },
            functionPerformanceMap: []
          };
        };

        // Execute the GPT code using similar logic to runCode
        console.log('[GPT_EXEC] Instrumenting GPT code...');
        const instrumentedCode = instrumentCode(gptCode);
        
        // Create worker for GPT execution
        const workerBlob = new Blob([
          `importScripts('https://unpkg.com/comlink/dist/umd/comlink.js');
          
          const workerAPI = {
            async executeCode(code) {
              try {
                const originalConsole = {
                  log: console.log,
                  error: console.error,
                  warn: console.warn,
                  info: console.info
                };

                console.log = function(...args) {
                  self.postMessage({ type: 'log', message: args.join(' ') });
                  originalConsole.log(...args);
                };

                console.error = function(...args) {
                  self.postMessage({ type: 'error', message: args.join(' ') });
                  originalConsole.error(...args);
                };

                self.postMessage({ type: 'log', message: 'Executing GPT code...' });
                await eval(code);
                self.postMessage({ type: 'log', message: 'GPT code execution completed' });
              } catch (err) {
                self.postMessage({ type: 'error', message: 'Error executing GPT code: ' + err.message });
                console.error(err);
              }
            }
          };

          Comlink.expose(workerAPI);`
        ], { type: 'application/javascript' });

        const worker = new Worker(URL.createObjectURL(workerBlob));
        const workerAPI = Comlink.wrap<WorkerAPI>(worker);
        
        let executionComplete = false;
        
        // Execute the GPT code
        (async () => {
          try {
            await workerAPI.executeCode(instrumentedCode);
            
            // Wait a bit for events to process
            setTimeout(() => {
              if (!executionComplete) {
                console.log('[GPT_EXEC] Finalizing execution...');
                worker.terminate();
                executionComplete = true;
                
                // Generate analysis data from execution results
                const analysisData = generateAnalysisData(gptRoot, gptDebug, true, {
                  totalExecutionTime: originalRoot ? (() => {
                    const flattenNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
                      return [node, ...node.children.flatMap(flattenNodes)];
                    };
                    const allNodes = flattenNodes(originalRoot);
                    const completedNodes = allNodes.filter(node => node.status === 'completed' && node.endTime);
                    return completedNodes.length > 0 ? 
                      Math.max(...completedNodes.map(node => node.endTime!)) - Math.min(...allNodes.map(node => node.startTime)) : 0;
                  })() : 0,
                  errors: originalDebug.split('\n').filter(line => 
                    line.includes('error') || line.includes('Error') || line.includes('failed')
                  ).length,
                  nestingDepth: originalRoot ? (() => {
                    const calculateDepth = (node: RuntimeProcessNode, currentDepth = 0): number => {
                      if (node.children.length === 0) return currentDepth;
                      return Math.max(...node.children.map((child: RuntimeProcessNode) => calculateDepth(child, currentDepth + 1)));
                    };
                    return calculateDepth(originalRoot);
                  })() : 0,
                  totalFunctions: originalRoot ? (() => {
                    const flattenNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
                      return [node, ...node.children.flatMap(flattenNodes)];
                    };
                    return flattenNodes(originalRoot).length;
                  })() : 0
                });
                
                console.log('[GPT_EXEC] Execution completed successfully:', {
                  hasRoot: !!gptRoot,
                  totalFunctions: analysisData.totalFunctions,
                  score: analysisData.overallScore
                });
                
                // Restore original state
                setCode(originalCode);
                
                // Resolve with results
                resolve({
                  root: gptRoot,
                  debug: gptDebug,
                  analysisData
                });
              }
            }, 2000); // Give more time for GPT code to complete
          } catch (error) {
            worker.terminate();
            reject(error);
          }
        })();

        // Listen for worker messages
        worker.onmessage = function(event) {
          console.log('[GPT_EXEC] Worker message:', event.data);
          
          if (event.data?.type === 'runtime-process-event') {
            const processEvent = event.data.event as RuntimeProcessEvent;
            tempHandleEvent(processEvent);
            gptDebug += `[GPT_EVENT] ${processEvent.status} ${processEvent.type} ${processEvent.name}\n`;
          } else if (event.data?.type === 'runtime-complete') {
            console.log('[GPT_EXEC] Runtime complete received');
            if (!executionComplete) {
              worker.terminate();
              executionComplete = true;
              
              const analysisData = generateAnalysisData(gptRoot, gptDebug, true, {
                totalExecutionTime: originalRoot ? (() => {
                  const flattenNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
                    return [node, ...node.children.flatMap(flattenNodes)];
                  };
                  const allNodes = flattenNodes(originalRoot);
                  const completedNodes = allNodes.filter(node => node.status === 'completed' && node.endTime);
                  return completedNodes.length > 0 ? 
                    Math.max(...completedNodes.map(node => node.endTime!)) - Math.min(...allNodes.map(node => node.startTime)) : 0;
                })() : 0,
                errors: originalDebug.split('\n').filter(line => 
                  line.includes('error') || line.includes('Error') || line.includes('failed')
                ).length,
                nestingDepth: originalRoot ? (() => {
                  const calculateDepth = (node: RuntimeProcessNode, currentDepth = 0): number => {
                    if (node.children.length === 0) return currentDepth;
                    return Math.max(...node.children.map((child: RuntimeProcessNode) => calculateDepth(child, currentDepth + 1)));
                  };
                  return calculateDepth(originalRoot);
                })() : 0,
                totalFunctions: originalRoot ? (() => {
                  const flattenNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
                    return [node, ...node.children.flatMap(flattenNodes)];
                  };
                  return flattenNodes(originalRoot).length;
                })() : 0
              });
              setCode(originalCode);
              
              resolve({
                root: gptRoot,
                debug: gptDebug,
                analysisData
              });
            }
          } else if (event.data?.type) {
            const { type, message } = event.data;
            gptDebug += `[GPT_WORKER ${type.toUpperCase()}] ${message}\n`;
            if (type === 'log' || type === 'error') {
              gptOutput += message + '\n';
            }
          }
        };

        // Timeout fallback
        setTimeout(() => {
          if (!executionComplete) {
            console.log('[GPT_EXEC] Execution timeout, finalizing...');
            worker.terminate();
            executionComplete = true;
            
            const analysisData = generateAnalysisData(gptRoot, gptDebug, true, {
              totalExecutionTime: originalRoot ? (() => {
                const flattenNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
                  return [node, ...node.children.flatMap(flattenNodes)];
                };
                const allNodes = flattenNodes(originalRoot);
                const completedNodes = allNodes.filter(node => node.status === 'completed' && node.endTime);
                return completedNodes.length > 0 ? 
                  Math.max(...completedNodes.map(node => node.endTime!)) - Math.min(...allNodes.map(node => node.startTime)) : 0;
              })() : 0,
              errors: originalDebug.split('\n').filter(line => 
                line.includes('error') || line.includes('Error') || line.includes('failed')
              ).length,
              nestingDepth: originalRoot ? (() => {
                const calculateDepth = (node: RuntimeProcessNode, currentDepth = 0): number => {
                  if (node.children.length === 0) return currentDepth;
                  return Math.max(...node.children.map((child: RuntimeProcessNode) => calculateDepth(child, currentDepth + 1)));
                };
                return calculateDepth(originalRoot);
              })() : 0,
              totalFunctions: originalRoot ? (() => {
                const flattenNodes = (node: RuntimeProcessNode): RuntimeProcessNode[] => {
                  return [node, ...node.children.flatMap(flattenNodes)];
                };
                return flattenNodes(originalRoot).length;
              })() : 0
            });
            setCode(originalCode);
            
            resolve({
              root: gptRoot,
              debug: gptDebug,
              analysisData
            });
          }
        }, 10000); // 10 second timeout
        
      } catch (error) {
        console.error('[GPT_EXEC] Execution error:', error);
        reject(error);
      }
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Container>
      {/* Main Code Section - No More Tabs */}
      <CodeSection>
        <EditorHeader>
          <SectionTitle>
            <VscCode />
            JavaScript Runtime Studio
          </SectionTitle>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Examples Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                color: '#e6edf3', 
                fontSize: '13px', 
                fontFamily: 'SF Mono, monospace',
                fontWeight: '600'
              }}>
                📚 Examples:
              </span>
              <WeightedSelect 
                value={selectedExample} 
                onChange={(e) => setSelectedExample(e.target.value)}
                style={{ minWidth: '200px' }}
              >
                <option value="">Select an example...</option>
                <optgroup label="Basic">
                  {codeExamples.filter(ex => ex.complexity === 'basic').map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Intermediate">
                  {codeExamples.filter(ex => ex.complexity === 'intermediate').map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Advanced">
                  {codeExamples.filter(ex => ex.complexity === 'advanced').map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Expert">
                  {codeExamples.filter(ex => ex.complexity === 'expert').map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </optgroup>
              </WeightedSelect>
              {currentExample && (
                <ComplexityBadge complexity={currentExample.complexity}>
                  {currentExample.complexity}
                </ComplexityBadge>
              )}
            </div>
            
            <CheckboxWrapper>
              <input 
                type="checkbox" 
                checked={useSimpleWrapper} 
                onChange={e => setUseSimpleWrapper(e.target.checked)} 
              />
              Use Simple Wrapper
            </CheckboxWrapper>
            <WeightedButton variant="success" onClick={runCode}>
              ▶ Run Code
            </WeightedButton>
            <WeightedButton variant="primary" onClick={() => syncVisualization && syncVisualization()}>
              ↻ Sync Visualization
            </WeightedButton>
          </div>
        </EditorHeader>
        
        {/* Show example description if selected */}
        {currentExample && (
          <div style={{
            padding: '12px 20px',
            background: 'rgba(88, 166, 255, 0.1)',
            border: '1px solid rgba(88, 166, 255, 0.3)',
            borderRadius: '6px',
            margin: '0 20px 20px 20px',
            fontSize: '14px',
            color: '#e6edf3',
            fontFamily: 'SF Mono, monospace',
            lineHeight: '1.4'
          }}>
            <strong>Example:</strong> {currentExample.description}
          </div>
        )}
        
        <EditorContent>
          <CodeEditor
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            placeholder="Enter your JavaScript code here or select an example above..."
          />
        </EditorContent>
      </CodeSection>

      {/* Execution Results - Collapsible Sections */}
      <ExecutionResultsSection>
        {/* Runtime Visualizer Section */}
        <CollapsibleSection expanded={expandedSections.visualizer}>
          <CollapsibleHeader 
            expanded={expandedSections.visualizer}
            onClick={() => toggleSection('visualizer')}
          >
            <SectionTitle>
              🌳 Runtime Visualizer
            </SectionTitle>
            <ExpandIcon expanded={expandedSections.visualizer}>▶</ExpandIcon>
          </CollapsibleHeader>
          
          <CollapsibleContent expanded={expandedSections.visualizer} maxHeight="800px">
            <RuntimeProvider root={root} syncVisualization={syncVisualization}>
              <RuntimeProcessVisualizer root={root} />
            </RuntimeProvider>
          </CollapsibleContent>
        </CollapsibleSection>

        {/* AI Runtime Analyzer Section */}
        <CollapsibleSection expanded={expandedSections.analyzer}>
          <CollapsibleHeader 
            expanded={expandedSections.analyzer}
            onClick={() => toggleSection('analyzer')}
          >
            <SectionTitle>
              🤖 AI Runtime Analyzer
            </SectionTitle>
            <ExpandIcon expanded={expandedSections.analyzer}>▶</ExpandIcon>
          </CollapsibleHeader>
          
          <CollapsibleContent expanded={expandedSections.analyzer} maxHeight="1000px">
            <RuntimeAnalyzer 
              root={root} 
              debug={debug} 
              runCount={runCount} 
              currentCode={code} 
              onExecuteCode={executeGPTCode}
            />
          </CollapsibleContent>
        </CollapsibleSection>

        {/* Debug & Output Section - Moved to bottom */}
        <CollapsibleSection expanded={expandedSections.debug}>
          <CollapsibleHeader 
            expanded={expandedSections.debug}
            onClick={() => toggleSection('debug')}
          >
            <SectionTitle>
              <VscDebugConsole />
              Debug & Output
            </SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                color: '#7d8590', 
                fontSize: '12px',
                fontFamily: 'SF Mono, monospace'
              }}>
                Run #{runCount}
              </div>
              <ExpandIcon expanded={expandedSections.debug}>▶</ExpandIcon>
            </div>
          </CollapsibleHeader>
          
          <CollapsibleContent expanded={expandedSections.debug} maxHeight="400px">
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              maxHeight: '400px'
            }}>
              <div style={{
                flex: '1',
                overflow: 'auto',
                padding: '20px',
                fontFamily: 'SF Mono, monospace',
                fontSize: '12px',
                color: '#00d448',
                lineHeight: '1.4',
                background: '#0a0c10',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                borderBottom: '2px solid #1c2128',
                maxHeight: '200px'
              }}>
                {debug || 'No debug output yet. Run some code to see execution details.'}
              </div>
              
              <div style={{
                flex: '1',
                overflow: 'auto',
                padding: '20px',
                fontFamily: 'SF Mono, monospace',
                fontSize: '12px',
                color: '#e6edf3',
                lineHeight: '1.4',
                background: '#0a0c10',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                maxHeight: '200px'
              }}>
                {output || 'No console output yet. Run some code to see console.log statements.'}
              </div>
            </div>
          </CollapsibleContent>
        </CollapsibleSection>
      </ExecutionResultsSection>
    </Container>
  );
}; 