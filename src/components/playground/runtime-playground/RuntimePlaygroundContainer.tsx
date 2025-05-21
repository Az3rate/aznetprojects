import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { RuntimeProcessVisualizer } from './RuntimeProcessVisualizer';
import { useRuntimeProcessEvents } from './useRuntimeProcessEvents';
import { instrumentCode } from './utils/instrumentCode';
import type { RuntimeProcessEvent } from './types';
import * as Comlink from 'comlink';
import MermaidDiagram from '../components/MermaidDiagram';
import codeExamples from './codeExamples';

const Container = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  height: 100%;
`;

const EditorSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CodeEditor = styled.textarea`
  width: 100%;
  height: 200px;
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  resize: vertical;
`;

const RunButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: opacity ${({ theme }) => theme.effects.transition.normal};

  &:hover {
    opacity: 0.9;
  }
`;

const OutputArea = styled.pre`
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  overflow: auto;
  max-height: 200px;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const VisualizerSection = styled.div`
  flex: 1;
  overflow: auto;
`;

const DebugOutput = styled.pre`
  background: #222;
  color: #0ff;
  font-size: 12px;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 4px;
  max-height: 120px;
  overflow: auto;
`;

const SelectWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ExampleSelect = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ExampleDescription = styled.div`
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
`;

const ComplexityBadge = styled.span<{ complexity: string }>`
  display: inline-block;
  padding: 2px 6px;
  margin-left: 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  color: white;
  background-color: ${({ complexity, theme }) => {
    switch (complexity) {
      case 'basic': return theme.colors.success;
      case 'intermediate': return theme.colors.primary;
      case 'advanced': return theme.colors.warning;
      case 'expert': return theme.colors.error;
      default: return theme.colors.secondary;
    }
  }};
`;

const DEFAULT_CODE = `// Example with async/await and callbacks
async function main() {
  console.log('Starting...');
  
  function nested() {
    setTimeout(() => {
      console.log('Timeout in nested');
    }, 500);
  }
  
  const arrow = () => {
    console.log('Arrow function');
  };
  
  await new Promise(r => setTimeout(r, 1000));
  nested();
  arrow();
  console.log('Done!');
}

main();`;

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
        timestamp: Date.now()
      }
    }, '*');
  } catch (e) {
    console.error('Failed to emit event:', e);
  }
}

// Use this to wrap any function you want to track
function trackFunction(fn, name) {
  return function(...args) {
    const id = 'fn-' + name;
    emitProcessEvent(id, name, 'function', 'start');
    try {
      const result = fn.apply(this, args);
      if (result instanceof Promise) {
        return result.finally(() => {
          emitProcessEvent(id, name, 'function', 'end');
        });
      }
      emitProcessEvent(id, name, 'function', 'end');
      return result;
    } catch (error) {
      emitProcessEvent(id, name, 'function', 'end');
      throw error;
    }
  };
}

// Example with async/await and callbacks - manually instrumented
const main = trackFunction(async function main() {
  console.log('Starting...');
  
  const nested = trackFunction(function nested() {
    setTimeout(() => {
      console.log('Timeout in nested');
    }, 500);
  }, 'nested');
  
  const arrow = trackFunction(() => {
    console.log('Arrow function');
  }, 'arrow');
  
  await new Promise(r => setTimeout(r, 1000));
  nested();
  arrow();
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
  const { root, handleEvent } = useRuntimeProcessEvents();

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
      
      if (e.data?.type === 'runtime-process-event') {
        const event = e.data.event as RuntimeProcessEvent;
        setDebug(d => d + `[DEBUG_RECEIVED_EVENT] ${JSON.stringify(event)}\n`);
        setDebug(d => d + `[EVENT] ${event.status} ${event.type} ${event.name}\n`);
        console.log('[DEBUG_PROCESS_EVENT]', event);
        handleEvent(event);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleEvent]);

  function runCode() {
    setRunCount(c => c + 1);
    setDebug(`Run #${runCount + 1} started\n`);
    setOutput('');

    setDebug(d => d + 'Successfully got iframe document, setting up Web Worker with Comlink...\n');

    // Instrument the user code
    const instrumentedCode = instrumentCode(code);
    console.log('[DEBUG_TRANSFORMED_CODE]', instrumentedCode);

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

    // Use Comlink to call the worker's executeCode function
    (async () => {
      await workerAPI.executeCode(instrumentedCode);
      worker.terminate();
    })();

    // Listen for messages from the worker
    worker.onmessage = function(event) {
      console.log('[DEBUG_WORKER_MESSAGE]', event.data);
      
      if (event.data?.type === 'runtime-process-event') {
        const processEvent = event.data.event as RuntimeProcessEvent;
        console.log('[DEBUG_PROCESS_EVENT_RECEIVED]', processEvent);
        handleEvent(processEvent);
        setDebug(d => d + `[EVENT] ${processEvent.status} ${processEvent.type} ${processEvent.name}\n`);
      } else if (event.data?.type) {
        const { type, message } = event.data;
        setDebug(d => d + `[WORKER ${type.toUpperCase()}] ${message}\n`);
        if (type === 'log' || type === 'error') {
          setOutput(o => o + message + '\n');
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
      <EditorSection>
        <SelectWrapper>
          <ExampleSelect 
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
          </ExampleSelect>
          
          {currentExample && (
            <ExampleDescription>
              {currentExample.description}
              <ComplexityBadge complexity={currentExample.complexity}>
                {currentExample.complexity}
              </ComplexityBadge>
            </ExampleDescription>
          )}
        </SelectWrapper>
        
        <DebugOutput data-testid="debug-output">{debug}</DebugOutput>
        <CodeEditor
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
        />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <RunButton onClick={runCode}>Run Code</RunButton>
          <button onClick={downloadDebugInfo}>Download Debug Info</button>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={useSimpleWrapper} 
              onChange={e => setUseSimpleWrapper(e.target.checked)} 
              style={{ marginRight: '4px' }}
            />
            Use Simple Wrapper
          </label>
        </div>
        <OutputArea data-testid="output-area">{output}</OutputArea>
      </EditorSection>
      <VisualizerSection>
        <RuntimeProcessVisualizer root={root} />
      </VisualizerSection>
    </Container>
  );
}; 