import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import { usePlayground } from '../context/PlaygroundContext';
import type { PlaygroundProps } from '../types';
import { glassEffect } from '../../../styles/mixins/glass';
import MonacoEditor from '@monaco-editor/react';
import { useProcessEvents } from './useProcessEvents';
import ProcessEventDebugger from './ProcessEventDebugger';
import { instrumentWithAcorn } from '../utils/instrumentWithAcorn';
import { parseProcessTreeWithAcorn } from '../utils/parseProcessesWithAcorn';
import ProcessFlowVisualizer from './ProcessFlowVisualizer';
import { useProcessStore } from '../../../store/processStore';
import { v4 as uuidv4 } from 'uuid';

const PlaygroundGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(480px, 1fr) 420px 420px;
  gap: ${({ theme }) => theme.spacing.lg};
  height: 100%;
  min-height: 0;
  width: 100%;
  background: transparent;
  z-index: 1;
  transition: grid-template-columns 0.3s ease;
`;

const PlaygroundSidebar = styled.section`
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  flex-shrink: 0;
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const PlaygroundMain = styled.section`
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  min-width: 0;
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  gap: ${({ theme }) => theme.spacing.xs};
  border-radius: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
`;

const PlaygroundDetails = styled.section`
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(${({ theme }) => theme.effects.blur.md});
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const PanelHeader = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.accent};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  letter-spacing: 1px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const RunButton = styled.button`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.effects.borderRadius};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const ExampleSelect = styled.select`
  background: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
`;

const Output = styled.pre`
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  margin: 0;
  padding: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  white-space: pre-wrap;
`;

const EditorWrapper = styled.div`
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  height: 100%;
  .monaco-editor {
    background: ${({ theme }) => theme.colors.background.glass};
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    border-radius: ${({ theme }) => theme.effects.borderRadius};
  }
`;

const EXAMPLES = [
  {
    label: 'Hello World',
    code: `// Prints Hello World\nconsole.log('Hello World');`
  },
  {
    label: 'Sum Function',
    code: `// Sums two numbers\nfunction sum(a, b) {\n  return a + b;\n}\nconsole.log('Sum:', sum(2, 3));`
  },
  {
    label: 'Async Example',
    code: `// Async function\nasync function fetchData() {\n  await new Promise(r => setTimeout(r, 1000));\n  console.log('Fetched!');\n}\nfetchData();`
  },
  {
    label: 'Timer Example',
    code: `// Timer\nsetTimeout(() => {\n  console.log('Timeout!');\n}, 1000);`
  },
  {
    label: 'Complex Process Tree',
    code: `// Top-level function\nfunction main() {\n  // Nested function\n  function nestedA() {\n    setTimeout(() => {\n      console.log('Timer in nestedA');\n      arrowInTimer();\n    }, 500);\n  }\n\n  // Arrow function assigned to variable\n  const arrowInMain = () => {\n    console.log('Arrow in main');\n    // Removed classTest(); as it was undefined\n  };\n\n  // Class with method\n  class MyClass {\n    method() {\n      setTimeout(function timerInMethod() {\n        console.log('Timer in class method');\n      }, 300);\n    }\n  }\n\n  // Arrow function inside timer\n  const arrowInTimer = () => {\n    console.log('Arrow in timer');\n  };\n\n  // Async function\n  async function asyncFunc() {\n    await new Promise(resolve => setTimeout(resolve, 200));\n    console.log('Async done');\n  }\n\n  // Call everything\n  nestedA();\n  arrowInMain();\n  new MyClass().method();\n  asyncFunc();\n}\n\nmain();`
  },
  {
    label: 'Really Complex Process Tree',
    code: `// Really Complex Process Tree\nfunction main() {\n  function nestedA() {\n    setTimeout(() => {\n      console.log('Timer in nestedA');\n      arrowInTimer();\n      recursiveFn(2);\n    }, 500);\n  }\n\n  const arrowInMain = () => {\n    setTimeout(() => {\n      console.log('Timer in arrowInMain');\n      deepArrow();\n    }, 100);\n    console.log('Arrow in main');\n  };\n\n  class MyClass {\n    method() {\n      setTimeout(function timerInMethod() {\n        console.log('Timer in class method');\n        nestedClassMethod();\n      }, 300);\n    }\n  }\n\n  function nestedClassMethod() {\n    setTimeout(() => {\n      console.log('Timer in nestedClassMethod');\n    }, 150);\n  }\n\n  const arrowInTimer = () => {\n    setTimeout(() => {\n      console.log('Timer in arrowInTimer');\n    }, 50);\n    console.log('Arrow in timer');\n  };\n\n  const deepArrow = () => {\n    setTimeout(() => {\n      console.log('Timer in deepArrow');\n      asyncDeep();\n    }, 75);\n  };\n\n  async function asyncFunc() {\n    await new Promise(resolve => setTimeout(resolve, 200));\n    console.log('Async done');
    await asyncDeep();\n  }\n\n  async function asyncDeep() {\n    await new Promise(resolve => setTimeout(resolve, 80));\n    console.log('Async deep done');\n  }\n\n  function recursiveFn(n) {\n    if (n <= 0) return;\n    setTimeout(() => {\n      console.log('Timer in recursiveFn', n);\n      recursiveFn(n - 1);\n    }, 60 * n);\n  }\n\n  // Call everything\n  nestedA();\n  arrowInMain();\n  new MyClass().method();\n  asyncFunc();\n}\n\nmain();`
  },
  {
    label: 'Visualizer Sync Test',
    code: `// Visualizer Sync Test\nasync function stepOne() {\n  await new Promise(r => setTimeout(r, 500));\n  console.log('Step One Complete');\n}\nfunction stepTwo() {\n  setTimeout(() => {\n    console.log('Step Two Complete');\n  }, 500);\n}\nfunction stepThree() {\n  console.log('Step Three Complete');\n}\nasync function main() {\n  await stepOne();\n  stepTwo();\n  stepThree();\n}\nmain();`
  }
];

const DEFAULT_EDITOR_WIDTH = 600;

const SANDBOX_ORIGIN = 'null'; // for local iframe

// Sanitize user code for safe script injection
function sanitizeForScript(code: string) {
  return code
    .replace(/<\//g, '<\\/') // Escape closing script tags
    .replace(/`/g, '\`'); // Escape backticks
}

// Instrument user code to send process events
function instrumentUserCode(code: string, processes: { id: string; name: string; type: string; async?: boolean }[]): string {
  // Use Acorn-based instrumentation for all function types
  return instrumentWithAcorn(code);
}

const SPEEDS = [
  { label: 'Slow', value: 800 },
  { label: 'Normal', value: 300 },
  { label: 'Fast', value: 100 },
  { label: 'Step', value: 'step' },
];

interface PlaygroundContainerProps {
  mode: 'node' | 'browser';
  theme: any;
  onStateChange?: (state: any) => void;
}

const PlaygroundContainer: React.FC<PlaygroundContainerProps> = ({ mode, theme, onStateChange }) => {
  const { state, dispatch } = usePlayground();
  const [output, setOutput] = useState('');
  const [selectedExample, setSelectedExample] = useState(0);
  const [editorWidth, setEditorWidth] = useState(DEFAULT_EDITOR_WIDTH);
  const resizing = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<number | 'step'>(300);
  const [done, setDone] = useState(false);
  const { reset, addProcess } = useProcessStore();
  const [runId, setRunId] = useState<string>('');

  // Remove useMemo for processTree, use a ref instead
  const processTreeRef = useRef<any[]>([]);

  // Use the custom hook for all process state and event logic
  const {
    processes,
    activeProcessIds,
    logBuffer,
    setLogBuffer,
    startNewRun,
    runId: processRunId,
    tick,
    done: processDone,
    isPaused,
    currentStep,
    totalSteps,
    nextStep,
    togglePause
  } = useProcessEvents(state.codeEditor.content, iframeRef, iframeReady, animationSpeed, runId);

  useEffect(() => {
    //console.log('[debug] processDone:', processDone, 'logBuffer:', logBuffer);
    if (processDone) {
      const outputText = logBuffer.length > 0 
        ? logBuffer.join('\n')
        : 'Process completed with no output';
      setOutput(outputText);
    }
  }, [processDone, logBuffer]);

  useEffect(() => {
    reset();
    const added = new Set<string>();
    function addAllProcesses(nodes: any[]) {
      for (const node of nodes) {
        if (added.has(node.id)) continue;
        added.add(node.id);
        addProcess({
          id: node.id,
          name: node.name,
          status: 'stopped'
        });
        if (node.children && node.children.length) {
          addAllProcesses(node.children);
        }
      }
    }
    addAllProcesses(processTreeRef.current);
  }, [state.codeEditor.content, reset, addProcess]);

  const handleEditorChange = (value: string | undefined) => {
    startNewRun();
    dispatch({ type: 'UPDATE_EDITOR', payload: { content: value ?? '' } });
  };

  const handleIframeLoad = () => {
    setIframeReady(true);
  };

  const handleRunCode = () => {
    const newRunId = uuidv4();
    setRunId(newRunId);
    setOutput('Running…');
    setLogBuffer([]);
    startNewRun();
    const processTree = parseProcessTreeWithAcorn(state.codeEditor.content);
    processTreeRef.current = processTree;
    const userCode = sanitizeForScript(instrumentUserCode(state.codeEditor.content, processTree));
    // DEBUG: Print the final instrumented code
    // eslint-disable-next-line no-console
    console.log('[DEBUG_HIGHLIGHT_INJECT] Final instrumented user code:', userCode);
    // Clean sandbox script: no debug logs, only user output and process events
    const sandboxScript = `
      window.__AZNET_RUN_ID = '${newRunId}';
      (function() {
        var runId = '${newRunId}';
        var logs = [];
        function sendLogs() {
          if (logs.length > 0) {
            try { parent.postMessage({ source: 'aznet-playground', version: 1, runId: runId, type: 'playground-log', payload: logs.join('\\n') }, '*'); } catch (e) { }
            logs = [];
          }
        }
        var originalLog = console.log;
        console.log = function() {
          var msg = Array.from(arguments).join(' ');
          logs.push(msg);
          try { originalLog.apply(console, arguments); } catch (e) {}
          sendLogs();
        };
        function sendDone() {
          try { parent.postMessage({ source: 'aznet-playground', version: 1, runId: runId, type: 'playground-done' }, '*'); } catch (e) { }
        }
        function sendProcessEvent(payload) {
          try { parent.postMessage({ source: 'aznet-playground', version: 1, runId: runId, type: 'playground-process', payload }, '*'); } catch (e) { }
        }
        try {
          (async function() {
            try {
              ${userCode}
            } catch (e) {
              if (e && e.name === 'SecurityError') {
                console.log('Access to cookies/localStorage is not allowed in this Playground sandbox.');
              } else {
                console.log(e && e.stack ? e.stack : e);
              }
            } finally {
              sendLogs();
              sendDone();
            }
          })();
        } catch (e) {
          if (e && e.name === 'SecurityError') {
            console.log('Access to cookies/localStorage is not allowed in this Playground sandbox.');
          } else {
            console.log(e && e.stack ? e.stack : e);
          }
          sendLogs();
          sendDone();
        }
        setTimeout(function() {
          sendLogs();
        }, 2000);
      })();
    `;
    const html = `<!DOCTYPE html><html><body><scr` + `ipt>\n${sandboxScript}</scr` + `ipt></body></html>`;
    const iframe = iframeRef.current;
    if (iframe && iframeReady) {
      iframe.srcdoc = html;
    }
  };

  const handleExampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startNewRun();
    const idx = Number(e.target.value);
    setSelectedExample(idx);
    dispatch({ type: 'UPDATE_EDITOR', payload: { content: EXAMPLES[idx].code } });
    const processTree = parseProcessTreeWithAcorn(EXAMPLES[idx].code);
    processTreeRef.current = processTree;
  };

  // Resizer logic
  const handleMouseDown = (e: React.MouseEvent) => {
    document.body.style.cursor = 'col-resize';
  };
  const handleMouseUp = () => {
    document.body.style.cursor = '';
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (resizing.current) {
      setEditorWidth(Math.max(320, Math.min(window.innerWidth - 400, e.clientX - 32)));
    }
  };
  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  return (
    <PlaygroundGrid theme={theme}>
      <PlaygroundSidebar>
        <PanelHeader>Code Editor</PanelHeader>
        <Controls>
          <RunButton onClick={handleRunCode}>Run Code</RunButton>
          <ExampleSelect value={selectedExample} onChange={handleExampleChange} aria-label="Load example code">
            {EXAMPLES.map((ex, i) => (
              <option value={i} key={ex.label}>{ex.label}</option>
            ))}
          </ExampleSelect>
          <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Speed:</span>
            <select
              value={animationSpeed}
              onChange={e => setAnimationSpeed(Number(e.target.value) as number | 'step')}
              aria-label="Animation speed"
            >
              {SPEEDS.map(s => (
                <option key={s.label} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <button
            onClick={nextStep}
            disabled={animationSpeed !== 'step' || !isPaused}
            style={{ marginLeft: 8 }}
          >
            Next Step
          </button>
          {animationSpeed === 'step' && (
            <span style={{ marginLeft: 12, fontSize: 13, color: '#888' }}>
              Step {currentStep + 1} / {totalSteps}
            </span>
          )}
        </Controls>
        <EditorWrapper theme={theme}>
          <MonacoEditor
            height="100%"
            language={state.codeEditor.language}
            value={state.codeEditor.content}
            onChange={handleEditorChange}
            theme={state.codeEditor.theme}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </EditorWrapper>
      </PlaygroundSidebar>
      <PlaygroundMain>
        <ProcessFlowVisualizer processTree={processTreeRef.current} activeProcessIds={activeProcessIds} />
      </PlaygroundMain>
      <PlaygroundDetails>
        <PanelHeader>Terminal Output</PanelHeader>
        <Output>{output || 'No output yet'}</Output>
      </PlaygroundDetails>
      {/* Hidden sandbox iframe for code execution */}
      <iframe
        ref={iframeRef}
        title="playground-sandbox"
        sandbox="allow-scripts allow-same-origin"
        style={{ position: 'absolute', left: '-9999px', width: 0, height: 0, border: 0 }}
        onLoad={handleIframeLoad}
      />
    </PlaygroundGrid>
  );
};

export default PlaygroundContainer; 