import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { RuntimeProcessVisualizer } from './RuntimeProcessVisualizer';
import { useRuntimeProcessEvents } from './useRuntimeProcessEvents';
import { instrumentCode } from './utils/instrumentCode';
import type { RuntimeProcessEvent } from './types';
import * as Comlink from 'comlink';
import MermaidDiagram from '../components/MermaidDiagram';
import codeExamples from './codeExamples';
import { VisualizationExplainer } from './VisualizationExplainer';
import { RuntimeProvider } from './context/RuntimeContext';

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

// Main page container with grid layout
const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "examples visualizer-hint"
    "editor visualizer"
    "debug visualizer";
  gap: 24px;
  padding: 24px;
  height: 100vh;
  max-width: 100vw;
  overflow: hidden;
  background: #010409;
`;

// Header Section for Examples
const ExamplesSection = styled(WeightedContainer)`
  grid-area: examples;
  padding: 20px;
  min-height: 120px;
`;

const ExamplesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #1c2128;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 800;
  color: #e6edf3;
  font-family: 'SF Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  
  &:before {
    content: '⚡';
    color: #00d448;
    margin-right: 12px;
    font-size: 16px;
  }
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
const OutputSection = styled(WeightedContainer)`
  grid-area: debug;
  min-height: 200px;
  max-height: 300px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

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

// Visualizer Section
const VisualizerSection = styled.div`
  grid-area: visualizer;
  overflow: auto;
  position: relative;
`;

// Enhanced Select Styling
const WeightedSelect = styled.select`
  background: #21262d;
  border: 2px solid #30363d;
  border-radius: 6px;
  padding: 10px 14px;
  color: #e6edf3;
  font-size: 14px;
  font-family: 'SF Mono', monospace;
  font-weight: 600;
  width: 100%;
  max-width: 300px;
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 0, 0, 0.8);
  
  &:focus {
    outline: none;
    border-color: #1f6feb;
    box-shadow: 
      inset 0 1px 2px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(0, 0, 0, 0.8),
      0 0 0 3px rgba(31, 111, 235, 0.3);
  }

  option {
    background: #21262d;
    color: #e6edf3;
  }

  optgroup {
    background: #0d1117;
    color: #7d8590;
    font-weight: 700;
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

export const RuntimePlaygroundContainer: React.FC = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [debug, setDebug] = useState('');
  const [output, setOutput] = useState('');
  const [runCount, setRunCount] = useState(0);
  const [useSimpleWrapper, setUseSimpleWrapper] = useState(false);
  const [selectedExample, setSelectedExample] = useState<string>('');
  const { root, handleEvent, setRoot, setNodeMap, syncVisualization } = useRuntimeProcessEvents();

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

  // Current selected example details
  const currentExample = selectedExample 
    ? codeExamples.find(ex => ex.id === selectedExample) 
    : null;

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

  return (
    <Container>
      {/* Example Selection Section */}
      <ExamplesSection>
        <ExamplesHeader>
          <SectionTitle>Code Examples</SectionTitle>
        </ExamplesHeader>
        <WeightedSelect 
          value={selectedExample} 
          onChange={(e) => setSelectedExample(e.target.value)}
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
          <ExampleDescription>
            {currentExample.description}
            <ComplexityBadge complexity={currentExample.complexity}>
              {currentExample.complexity}
            </ComplexityBadge>
          </ExampleDescription>
        )}
      </ExamplesSection>

      {/* Visualizer Hint Section */}
      <VisualizerHintSection>
        <ExamplesHeader>
          <SectionTitle>What to Expect</SectionTitle>
        </ExamplesHeader>
        {currentExample && currentExample.visualizationHint ? (
          <VisualizationExplainer hint={currentExample.visualizationHint} />
        ) : (
          <div style={{ 
            color: '#7d8590', 
            fontStyle: 'italic',
            fontSize: '14px',
            fontFamily: 'SF Mono, monospace'
          }}>
            Select an example to see what the visualization will show.
          </div>
        )}
      </VisualizerHintSection>

      {/* Code Editor Section */}
      <EditorSection>
        <EditorHeader>
          <SectionTitle>Code Editor</SectionTitle>
          <div style={{ display: 'flex', gap: '12px' }}>
            <CheckboxWrapper>
              <input 
                type="checkbox" 
                checked={useSimpleWrapper} 
                onChange={e => setUseSimpleWrapper(e.target.checked)} 
              />
              Use Simple Wrapper
            </CheckboxWrapper>
          </div>
        </EditorHeader>
        
        <EditorContent>
          <CodeEditor
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            placeholder="Enter your JavaScript code here..."
          />
          
          <EditorControls>
            <WeightedButton variant="success" onClick={runCode}>
              ▶ Run Code
            </WeightedButton>
            <WeightedButton variant="primary" onClick={() => syncVisualization && syncVisualization()}>
              ↻ Sync Visualization
            </WeightedButton>
            <WeightedButton onClick={downloadDebugInfo}>
              💾 Download Debug
            </WeightedButton>
          </EditorControls>
        </EditorContent>
      </EditorSection>

      {/* Debug & Output Section */}
      <OutputSection>
        <OutputHeader>
          <SectionTitle>Debug & Output</SectionTitle>
          <div style={{ 
            color: '#7d8590', 
            fontSize: '12px',
            fontFamily: 'SF Mono, monospace'
          }}>
            Run #{runCount}
          </div>
        </OutputHeader>
        
        <DebugOutput data-testid="debug-output">
          {debug || 'No debug output yet. Run some code to see execution details.'}
        </DebugOutput>
        
        <OutputContent data-testid="output-area">
          {output || 'No console output yet. Run some code to see console.log statements.'}
        </OutputContent>
      </OutputSection>

      {/* Runtime Visualizer Section */}
      <VisualizerSection>
        <RuntimeProvider root={root} syncVisualization={syncVisualization}>
          <RuntimeProcessVisualizer root={root} />
        </RuntimeProvider>
      </VisualizerSection>
    </Container>
  );
}; 