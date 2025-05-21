import React from 'react';
import MermaidDiagram from './MermaidDiagram';

const ProcessTreeInspector: React.FC = () => {
  const mermaidChart = `graph TD;
    A[Start] --> B{Is it working?};
    B -- Yes --> C[Great!];
    B -- No --> D[Try again];
    D --> B;`;

  return (
    <div>
      <h2>Process Tree</h2>
      <MermaidDiagram chart={mermaidChart} />
    </div>
  );
};

export default ProcessTreeInspector; 