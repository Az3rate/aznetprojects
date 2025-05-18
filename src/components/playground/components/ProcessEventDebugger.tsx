import React from 'react';

interface ProcessEventDebuggerProps {
  activeProcessIds: string[];
  parsedProcesses: { id: string; name: string; type: string; async?: boolean }[];
}

const ProcessEventDebugger: React.FC<ProcessEventDebuggerProps> = ({ activeProcessIds, parsedProcesses }) => {
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, color: 'lime', fontSize: 12, zIndex: 1000, background: 'rgba(0,0,0,0.7)', padding: 8, borderRadius: 4 }}>
      <div><strong>activeProcessIds:</strong> {JSON.stringify(activeProcessIds)}</div>
      <div><strong>parsedProcesses:</strong> {JSON.stringify(parsedProcesses)}</div>
    </div>
  );
};

export default ProcessEventDebugger; 