import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import ProcessVisualizer from './ProcessVisualizer';
import { usePlayground } from '../context/PlaygroundContext';
import type { PlaygroundProps } from '../types';
import { glassEffect } from '../../../styles/mixins/glass';
import MonacoEditor from '@monaco-editor/react';
import { useProcessEvents } from './useProcessEvents';
import ProcessEventDebugger from './ProcessEventDebugger';

const Container = styled.div`
  display: grid;
  grid-template-columns: auto 8px 1fr;
  grid-template-rows: 1fr auto;
  gap: ${({ theme }) => theme.spacing.md};
  height: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
`;

const PanelHeader = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.accent};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  letter-spacing: 1px;
`;

const EditorSection = styled.section<{ $width: number }>`
  grid-column: 1;
  grid-row: 1;
  width: ${({ $width }) => $width}px;
  min-width: 320px;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  ${glassEffect}
  border-radius: ${({ theme }) => theme.effects.borderRadius};
  box-shadow: ${({ theme }) => theme.effects.boxShadow};
  transition: all 0.3s ease;
`;

const Resizer = styled.div`
  grid-column: 2;
  grid-row: 1;
  width: 8px;
  cursor: col-resize;
  background: ${({ theme }) => theme.colors.background.glassLight};
  border-radius: ${({ theme }) => theme.effects.borderRadius};
  transition: background 0.2s;
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.accent};
    outline: 2px solid ${({ theme }) => theme.colors.accent};
  }
`;

const VisualizerSection = styled.section`
  grid-column: 3;
  grid-row: 1;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  ${glassEffect}
  border-radius: ${({ theme }) => theme.effects.borderRadius};
  box-shadow: ${({ theme }) => theme.effects.boxShadow};
  transition: all 0.3s ease;
`;

const TerminalSection = styled.section`
  grid-column: 1 / -1;
  grid-row: 2;
  ${glassEffect}
  border-radius: ${({ theme }) => theme.effects.borderRadius};
  box-shadow: ${({ theme }) => theme.effects.boxShadow};
  transition: all 0.3s ease;
  min-height: 48px;
  display: flex;
  align-items: flex-end;
`;

const EditorWrapper = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
  .monaco-editor {
    background: ${({ theme }) => theme.colors.background.glass};
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    border-radius: ${({ theme }) => theme.effects.borderRadius};
  }
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
  }
];

const DEFAULT_EDITOR_WIDTH = 600;

function parseProcessesFromCode(code: string) {
  const processes: { id: string; name: string; type: string; async?: boolean }[] = [];
  const fnRegex = /(?:async\s+)?function\s+([a-zA-Z0-9_]+)/g;
  let match;
  while ((match = fnRegex.exec(code))) {
    processes.push({
      id: `fn-${match[1]}`,
      name: match[1],
      type: code.substring(match.index, match.index + 5).includes('async') ? 'async function' : 'function',
      async: code.substring(match.index, match.index + 5).includes('async'),
    });
  }
  if (/setTimeout\s*\(/.test(code)) {
    processes.push({ id: 'timer-setTimeout', name: 'setTimeout', type: 'timer' });
  }
  if (/setInterval\s*\(/.test(code)) {
    processes.push({ id: 'timer-setInterval', name: 'setInterval', type: 'timer' });
  }
  return processes;
}

const SANDBOX_ORIGIN = 'null'; // for local iframe

// Sanitize user code for safe script injection
function sanitizeForScript(code: string) {
  return code
    .replace(/<\//g, '<\\/') // Escape closing script tags
    .replace(/`/g, '\`'); // Escape backticks
}

// Instrument user code to send process events
function instrumentUserCode(code: string, processes: { id: string; name: string; type: string; async?: boolean }[]): string {
  // Instrument all top-level functions robustly
  let instrumented = code;
  const fnRegex = /((?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*){([\s\S]*?)}(?!\s*catch)/g;
  let match;
  let offset = 0;
  let result = '';
  let lastIndex = 0;
  while ((match = fnRegex.exec(code)) !== null) {
    const [full, header, fnName, body] = match;
    const proc = processes.find(p => p.name === fnName);
    if (!proc) continue;
    // Append code before this function
    result += code.slice(lastIndex, match.index);
    // Instrumented function
    result += `${header}{\nparent.postMessage({ type: 'playground-process', payload: { id: '${proc.id}', name: '${proc.name}', type: '${proc.type}', status: 'start' } }, '*');\ntry {${body}} finally {\nparent.postMessage({ type: 'playground-process', payload: { id: '${proc.id}', name: '${proc.name}', type: '${proc.type}', status: 'end' } }, '*');\n}\n}`;
    lastIndex = match.index + full.length;
  }
  // Append the rest of the code
  result += code.slice(lastIndex);
  instrumented = result;

  // Instrument setTimeout/setInterval callbacks
  ['setTimeout', 'setInterval'].forEach(timer => {
    const timerProc = processes.find(p => p.name === timer);
    if (!timerProc) return;
    const arrowRegex = new RegExp(`${timer}\\s*\\(\\s*\\(\\)\\s*=>\\s*{([\\s\\S]*?)}\\s*,\\s*([^)]*)\\)`, 'g');
    instrumented = instrumented.replace(arrowRegex, (match, body, delay) => {
      return `${timer}(() => {\n        parent.postMessage({ type: 'playground-process', payload: { id: '${timerProc.id}', name: '${timer}', type: 'timer', status: 'start' } }, '*');\n        try {${body}} finally {\n          parent.postMessage({ type: 'playground-process', payload: { id: '${timerProc.id}', name: '${timer}', type: 'timer', status: 'end' } }, '*');\n        }\n      }, ${delay})`;
    });
    const fnRegex = new RegExp(`${timer}\\s*\\(\\s*function\\s*\\([^)]*\\)\\s*{([\\s\\S]*?)}\\s*,\\s*([^)]*)\\)`, 'g');
    instrumented = instrumented.replace(fnRegex, (match, body, delay) => {
      return `${timer}(function() {\n        parent.postMessage({ type: 'playground-process', payload: { id: '${timerProc.id}', name: '${timer}', type: 'timer', status: 'start' } }, '*');\n        try {${body}} finally {\n          parent.postMessage({ type: 'playground-process', payload: { id: '${timerProc.id}', name: '${timer}', type: 'timer', status: 'end' } }, '*');\n        }\n      }, ${delay})`;
    });
  });

  return instrumented;
}

const SPEEDS = [
  { label: 'Slow', value: 800 },
  { label: 'Normal', value: 300 },
  { label: 'Fast', value: 100 },
  { label: 'Step', value: 'step' },
];

const PlaygroundContainer: React.FC<PlaygroundProps> = ({ mode }) => {
  const { state, dispatch } = usePlayground();
  const theme = useTheme();
  const [output, setOutput] = useState('');
  const [selectedExample, setSelectedExample] = useState(0);
  const [editorWidth, setEditorWidth] = useState(DEFAULT_EDITOR_WIDTH);
  const resizing = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<number | 'step'>(300);

  // Use the custom hook for all process state and event logic
  const {
    parsedProcesses,
    activeProcessIds,
    logBuffer,
    setLogBuffer,
    startNewRun,
    runId,
    tick,
    done,
    isStepPaused,
    currentStep,
    totalSteps,
    nextStep,
  } = useProcessEvents(state.codeEditor.content, iframeRef, iframeReady, animationSpeed);

  useEffect(() => {
    if (done) {
      console.log('[PlaygroundContainer] done state changed, updating output');
      console.log('[PlaygroundContainer] logBuffer:', logBuffer);
      const outputText = logBuffer.length > 0 
        ? logBuffer.join('\n')
        : 'Process completed with no output';
      setOutput(outputText);
    }
  }, [done, logBuffer]);

  const handleEditorChange = (value: string | undefined) => {
    startNewRun();
    dispatch({ type: 'UPDATE_EDITOR', payload: { content: value ?? '' } });
  };

  const handleIframeLoad = () => {
    setIframeReady(true);
  };

  const handleRunCode = () => {
    setOutput('Running…');
    setLogBuffer([]);
    startNewRun();
    const processes = parsedProcesses;
    const userCode = sanitizeForScript(instrumentUserCode(state.codeEditor.content, processes));
    // Clean sandbox script: no debug logs, only user output and process events
    const sandboxScript = `
      (function() {
        var logs = [];
        function sendLogs() {
          try { parent.postMessage({ type: 'playground-log', payload: logs.join('\\n') }, '*'); } catch (e) { }
          logs = [];
        }
        var originalLog = console.log;
        console.log = function() {
          var msg = Array.from(arguments).join(' ');
          logs.push(msg);
          try { originalLog.apply(console, arguments); } catch (e) {}
          sendLogs();
        };
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
            }
          })();
        } catch (e) {
          if (e && e.name === 'SecurityError') {
            console.log('Access to cookies/localStorage is not allowed in this Playground sandbox.');
          } else {
            console.log(e && e.stack ? e.stack : e);
          }
          sendLogs();
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
    <Container>
      <ProcessEventDebugger key={tick} activeProcessIds={activeProcessIds} parsedProcesses={parsedProcesses} />
      <EditorSection $width={editorWidth}>
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
              onChange={e => setAnimationSpeed(e.target.value === 'step' ? 'step' : Number(e.target.value))}
              aria-label="Animation speed"
            >
              {SPEEDS.map(s => (
                <option key={s.label} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <button
            onClick={nextStep}
            disabled={animationSpeed !== 'step' || !isStepPaused}
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
        <EditorWrapper>
          <MonacoEditor
            height="100%"
            width="100%"
            language={state.codeEditor.language}
            theme={state.codeEditor.theme}
            value={state.codeEditor.content}
            options={{
              fontFamily: theme.typography.fontFamily.monospace,
              fontSize: 16,
              minimap: { enabled: false },
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
            onChange={handleEditorChange}
          />
        </EditorWrapper>
      </EditorSection>
      <Resizer
        tabIndex={0}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize editor and visualizer panels"
        onMouseDown={handleMouseDown}
        onKeyDown={e => {
          if (e.key === 'ArrowLeft') setEditorWidth(w => Math.max(320, w - 20));
          if (e.key === 'ArrowRight') setEditorWidth(w => Math.min(window.innerWidth - 400, w + 20));
        }}
      />
      <VisualizerSection>
        <PanelHeader>Process Visualizer</PanelHeader>
        <ProcessVisualizer
          key={tick}
          parsedProcesses={parsedProcesses}
          activeProcessIds={activeProcessIds}
        />
      </VisualizerSection>
      <TerminalSection>
        <PanelHeader>Terminal Output</PanelHeader>
        <Output>{output || 'No output yet'}</Output>
      </TerminalSection>
      {/* Hidden sandbox iframe for code execution */}
      <iframe
        ref={iframeRef}
        title="playground-sandbox"
        sandbox="allow-scripts allow-same-origin"
        style={{ position: 'absolute', left: '-9999px', width: 0, height: 0, border: 0 }}
        onLoad={handleIframeLoad}
      />
    </Container>
  );
};

// aznetrule: global debug log for all window messages
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    console.log('[GLOBAL window message]', event.data);
  });
}

export default PlaygroundContainer; 