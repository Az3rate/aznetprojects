import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Process {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: string;
  data?: any;
}

export interface ProcessState {
  processes: Process[];
  activeProcessIds: string[];
  executionMode: 'normal' | 'step';
  currentStep: number;
  totalSteps: number;
  isPaused: boolean;
  addProcess: (process: Process) => void;
  removeProcess: (id: string) => void;
  updateProcess: (id: string, updates: Partial<Process>) => void;
  setActiveProcesses: (ids: string[]) => void;
  setExecutionMode: (mode: 'normal' | 'step') => void;
  setStep: (step: number) => void;
  setTotalSteps: (steps: number) => void;
  togglePause: () => void;
  reset: () => void;
}

const initialState = {
  processes: [],
  activeProcessIds: [],
  executionMode: 'normal' as const,
  currentStep: 0,
  totalSteps: 0,
  isPaused: false,
};

export const useProcessStore = create<ProcessState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      addProcess: (process) => {
        set((state) => ({
          processes: [...state.processes, process],
          activeProcessIds: process.status === 'running' ? [...state.activeProcessIds, process.id] : state.activeProcessIds,
        }));
      },

      removeProcess: (id) => {
        set((state) => ({
          processes: state.processes.filter((p) => p.id !== id),
          activeProcessIds: state.activeProcessIds.filter((pid) => pid !== id),
        }));
      },

      updateProcess: (id, updates) => {
        set((state) => {
          const processIndex = state.processes.findIndex((p) => p.id === id);
          if (processIndex === -1) return state;

          const updatedProcesses = [...state.processes];
          const process = updatedProcesses[processIndex];
          
          // Calculate duration if both start and end times are present
          if (updates.endTime && process.startTime) {
            updates.duration = updates.endTime - process.startTime;
          }

          updatedProcesses[processIndex] = { ...process, ...updates };

          // Update active processes list based on status
          let newActiveProcessIds = [...state.activeProcessIds];
          if (updates.status === 'running') {
            if (!newActiveProcessIds.includes(id)) {
              newActiveProcessIds.push(id);
              // DEBUG_HIGHLIGHT: Added process to activeProcessIds
              // eslint-disable-next-line no-console
              console.log('[DEBUG_HIGHLIGHT] Added', id, 'to activeProcessIds:', newActiveProcessIds);
            }
          } else if (updates.status === 'stopped' || updates.status === 'error') {
            // Delay removal for better UX
            setTimeout(() => {
              set((state) => {
                const newActiveProcessIds = state.activeProcessIds.filter(pid => pid !== id);
                // DEBUG_HIGHLIGHT: Removed process from activeProcessIds (delayed)
                // eslint-disable-next-line no-console
                console.log('[DEBUG_HIGHLIGHT] Removed', id, 'from activeProcessIds (delayed):', newActiveProcessIds);
                return { ...state, activeProcessIds: newActiveProcessIds };
              });
            }, 300);
            return { ...state };
          }
          return {
            processes: updatedProcesses,
            activeProcessIds: newActiveProcessIds,
          };
        });
      },

      setActiveProcesses: (ids) => {
        //console.log('[AZNET_TRACK] setActiveProcesses called:', ids);
        set({ activeProcessIds: ids });
      },

      setExecutionMode: (mode) => {
        set({ executionMode: mode });
      },

      setStep: (step) => {
        set({ currentStep: step });
      },

      setTotalSteps: (steps) => {
        set({ totalSteps: steps });
      },

      togglePause: () => {
        set((state) => ({ isPaused: !state.isPaused }));
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'process-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
); 