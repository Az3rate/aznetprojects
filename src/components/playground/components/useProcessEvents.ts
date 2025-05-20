import { useState, useEffect, useRef, useCallback } from 'react';
import { useProcessStore } from '../../../store/processStore';

// Unique debug flag for process tracking
if (typeof window !== 'undefined') {
  (window as any).__AZNET_PROCESS_DEBUG = true;
  // eslint-disable-next-line no-console
  console.log('%c[AZNET_PROCESS_DEBUG] Debug flag set:', 'color: #f0f; font-weight: bold', (window as any).__AZNET_PROCESS_DEBUG);
}

export function useProcessEvents(
  code: string,
  iframeRef: React.RefObject<HTMLIFrameElement>,
  iframeReady: boolean,
  animationSpeed?: number | 'step',
  runId?: string
) {
  const {
    processes,
    activeProcessIds,
    executionMode,
    currentStep,
    totalSteps,
    isPaused,
    setActiveProcesses,
    updateProcess,
    setExecutionMode,
    setStep,
    setTotalSteps,
    togglePause,
    reset
  } = useProcessStore();

  const [logBuffer, setLogBuffer] = useState<string[]>([]);
  const [tick, setTick] = useState(0);
  const processEventQueue = useRef<any[]>([]);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const isPlaying = useRef(false);
  const [done, setDone] = useState(false);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRunning = useRef(false);
  const animationDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const processesRef = useRef(processes);
  const updateProcessRef = useRef(updateProcess);

  useEffect(() => {
    processesRef.current = processes;
    updateProcessRef.current = updateProcess;
  }, [processes, updateProcess]);

  // Helper for debug logging
  function debugLog(...args: any[]) {
    if (typeof window !== 'undefined' && (window as any).__AZNET_PROCESS_DEBUG) {
      // eslint-disable-next-line no-console
      console.log('%c[AZNET_PROCESS_DEBUG]', 'color: #f0f; font-weight: bold', ...args);
    }
  }

  // Reset all state for a new run
  function startNewRun() {
    if (isRunning.current) {
      return;
    }
    //console.log('[AZNET_TRACK] User clicked Run Code');
    isRunning.current = true;
    reset();
    setExecutionMode(animationSpeed === 'step' ? 'step' : 'normal');
    setLogBuffer([]);
    processEventQueue.current = [];
    if (animationRef.current) clearTimeout(animationRef.current);
    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    if (animationDebounceRef.current) clearTimeout(animationDebounceRef.current);
    isPlaying.current = false;
    setDone(false);
    setStep(0);
    setTotalSteps(0);
  }

  // Process execution tracking with immediate updates
  useEffect(() => {
    debugLog('useEffect: Registering message event listener. iframeReady:', iframeReady, 'iframeRef:', iframeRef.current);
    if (!iframeReady || !iframeRef.current) return;

    function handleMessage(event: MessageEvent) {
      // DEBUG: Log every raw event received
      // eslint-disable-next-line no-console
      console.log('[DEBUG_HIGHLIGHT_MAIN] handleMessage raw event:', event);
      const data = event.data;
      if (!data || data.source !== 'aznet-playground' || data.version !== 1 || (runId && data.runId !== runId) || !['playground-process', 'playground-done', 'playground-log'].includes(data.type)) {
        return;
      }
      debugLog('handleMessage called:', data);
      if (data.type === 'playground-process' && data.payload) {
        const { id, status } = data.payload;
        debugLog('Received process event:', { id, status });
        if (typeof updateProcessRef.current === 'function') {
          const newStatus = status === 'start' ? 'running' : 
                          status === 'end' ? 'stopped' : 
                          status === 'error' ? 'error' : 'stopped';
          updateProcessRef.current(id, { status: newStatus });
          // Update active processes list
          if (status === 'start') {
            const newActive = [...activeProcessIds, id];
            setActiveProcesses(newActive);
            debugLog('Added to activeProcessIds:', id, 'New list:', newActive);
          } else if (status === 'end' || status === 'error') {
            const newActive = activeProcessIds.filter(pid => pid !== id);
            setActiveProcesses(newActive);
            debugLog('Removed from activeProcessIds:', id, 'New list:', newActive);
          }
          setTick(t => t + 1);
        }
      }
      if (data.type === 'playground-done') {
        setDone(true);
        isRunning.current = false;
      }
      if (data.type === 'playground-log') {
        setLogBuffer(prev => [...prev, data.payload]);
      }
    }

    window.addEventListener('message', handleMessage);
    debugLog('Event listener added for message events.');
    return () => {
      window.removeEventListener('message', handleMessage);
      debugLog('Event listener removed for message events.');
    };
  }, [iframeReady, iframeRef.current]);

  return {
    processes,
    activeProcessIds,
    logBuffer,
    setLogBuffer,
    startNewRun,
    runId,
    tick,
    done,
    isPaused,
    currentStep,
    totalSteps,
    nextStep: () => setStep(currentStep + 1),
    togglePause
  };
} 