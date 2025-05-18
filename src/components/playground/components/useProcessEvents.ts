import { useState, useEffect, useRef, useCallback } from 'react';

export function useProcessEvents(
  code: string,
  iframeRef: React.RefObject<HTMLIFrameElement>,
  iframeReady: boolean,
  animationSpeed?: number | 'step'
) {
  const [parsedProcesses, setParsedProcesses] = useState<{ id: string; name: string; type: string; async?: boolean }[]>([]);
  const [activeProcessIds, setActiveProcessIds] = useState<string[]>([]);
  const [logBuffer, setLogBuffer] = useState<string[]>([]);
  const [runId, setRunId] = useState(0);
  const [tick, setTick] = useState(0);
  const processEventQueue = useRef<any[]>([]);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const isPlaying = useRef(false);
  const [done, setDone] = useState(false);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRunning = useRef(false);

  // Step mode state
  const [isStepPaused, setIsStepPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const stepResolveRef = useRef<(() => void) | null>(null);
  const animationDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Mount/unmount debug
  useEffect(() => {
    return () => {};
  }, []);

  // Parse processes from code
  useEffect(() => {
    const fnRegex = /(?:async\s+)?function\s+([a-zA-Z0-9_]+)/g;
    const processes: { id: string; name: string; type: string; async?: boolean }[] = [];
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
    setParsedProcesses(processes);
    setActiveProcessIds([]);
  }, [code]);

  // Listen for process events and buffer them
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'playground-log') {
        const msg = event.data.payload;
        if (!msg || msg.trim() === '' || msg.startsWith('[playground-debug]')) return;
        setLogBuffer(prev => [...prev, msg]);
      }
      if (event.data && event.data.type === 'playground-process') {
        console.log('[aznet-process-debug] playground-process event:', event.data.payload);
        processEventQueue.current.push(event.data.payload);
        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current);
          fallbackTimeoutRef.current = null;
        }
        // Debounce animation loop start
        if (animationDebounceRef.current) clearTimeout(animationDebounceRef.current);
        animationDebounceRef.current = setTimeout(() => {
          setTotalSteps(processEventQueue.current.length);
          if (!isPlaying.current) {
            startAnimationLoop();
          }
        }, 100);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const nextStep = useCallback(() => {
    if (stepResolveRef.current) {
      stepResolveRef.current();
      stepResolveRef.current = null;
    }
  }, []);

  function startAnimationLoop() {
    isPlaying.current = true;
    setDone(false);
    setCurrentStep(0);
    setIsStepPaused(false);
    setTotalSteps(processEventQueue.current.length);
    let stepNum = 0;
    async function step() {
      if (processEventQueue.current.length === 0) {
        isPlaying.current = false;
        animationRef.current = null;
        setDone(true);
        isRunning.current = false;
        setIsStepPaused(false);
        return;
      }
      const event = processEventQueue.current.shift();
      stepNum++;
      setActiveProcessIds(prev => {
        let next;
        if (event.status === 'start') next = [...prev, event.id];
        else if (event.status === 'end') next = prev.filter(pid => pid !== event.id);
        else next = prev;
        setTick(t => t + 1);
        return next;
      });
      setCurrentStep(stepNum);
      let delay = 300;
      if (animationSpeed === 'step') {
        setIsStepPaused(true);
        await new Promise<void>(resolve => {
          stepResolveRef.current = () => {
            setIsStepPaused(false);
            resolve();
          };
        });
      } else if (typeof animationSpeed === 'number') {
        delay = animationSpeed;
        await new Promise(resolve => {
          animationRef.current = setTimeout(resolve, delay);
        });
      } else {
        await new Promise(resolve => {
          animationRef.current = setTimeout(resolve, delay);
        });
      }
      step();
    }
    step();
  }

  // Fallback: if no process events, mark as done after 500ms
  function startFallbackTimer() {
    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    fallbackTimeoutRef.current = setTimeout(() => {
      if (!isPlaying.current && processEventQueue.current.length === 0) {
        setDone(true);
        isRunning.current = false;
        setTick(t => t + 1);
      }
    }, 500);
  }

  // Reset all state for a new run
  function startNewRun() {
    if (isRunning.current) {
      return;
    }
    isRunning.current = true;
    setActiveProcessIds([]);
    setLogBuffer([]);
    setRunId(r => r + 1);
    processEventQueue.current = [];
    if (animationRef.current) clearTimeout(animationRef.current);
    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    if (animationDebounceRef.current) clearTimeout(animationDebounceRef.current);
    isPlaying.current = false;
    setDone(false);
    setIsStepPaused(false);
    setCurrentStep(0);
    setTotalSteps(0);
    stepResolveRef.current = null;
    startFallbackTimer();
  }

  return {
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
  };
} 