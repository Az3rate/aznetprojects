import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import styled from 'styled-components';

const DiagramContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.md};
  overflow: auto;
  max-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  
  svg {
    max-width: 100%;
    height: auto;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: rgba(255, 0, 0, 0.1);
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

interface MermaidDiagramProps {
  chart: string;
}

// Initialize mermaid once on component load
if (typeof window !== 'undefined') {
  console.log('[DB1] Initializing Mermaid library');
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'default',
    logLevel: 5, // Log everything for debugging
  });
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const chartId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    console.log('[DB1] MermaidDiagram useEffect with chart:', chart);
    
    if (!ref.current || !chart) {
      console.log('[DB1] No ref or chart available');
      return;
    }
    
    try {
      // Reset state
      setError(null);
      
      // Clear previous content
      ref.current.innerHTML = '';
      
      console.log('[DB1] Rendering Mermaid diagram with ID:', chartId.current);
      console.log('[DB1] Chart content to render:', chart);
      
      // Add a minimum node if chart is too simple
      let renderChart = chart;
      if (chart.trim().split('\n').length <= 3) {
        console.log('[DB1] Chart is too simple, enhancing for better visualization');
        
        // Extract any node definitions
        const nodeMatch = chart.match(/([A-Za-z0-9_-]+)\["([^"]+)"\]/);
        if (nodeMatch) {
          const nodeId = nodeMatch[1];
          const nodeName = nodeMatch[2];
          console.log('[DB1] Found node definition:', nodeMatch[0]);
          
          // If no connections found, add a dummy connection for better rendering
          if (!chart.includes('-->')) {
            console.log('[DB1] No connections found, adding dummy node and connection');
            renderChart = `${chart.trim()}\n  dummy[" "]:::hidden\n  ${nodeId} --> dummy\n  style dummy fill:none,stroke:none\n  classDef hidden display:none;`;
          }
        }
      }
      
      // Use the simpler API
      mermaid.render(chartId.current, renderChart)
        .then(({ svg }) => {
          console.log('[DB1] Mermaid render successful, svg length:', svg.length);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        })
        .catch(err => {
          console.error('[DB1] MERMAID_RENDER_ERROR', err);
          setError(`Failed to render diagram: ${err.message || 'Unknown error'}`);
          
          // Fallback rendering for single nodes
          if (chart.trim().split('\n').length <= 3) {
            console.log('[DB1] Attempting fallback rendering for simple chart');
            
            // Extract any node definitions
            const nodeMatch = chart.match(/[A-Za-z0-9_-]+\["([^"]+)"\]/);
            
            if (nodeMatch && nodeMatch[1] && ref.current) {
              const nodeName = nodeMatch[1];
              
              // Create a simple DIV as fallback
              const fallbackDiv = document.createElement('div');
              fallbackDiv.style.padding = '20px';
              fallbackDiv.style.border = '2px solid #4a9eff';
              fallbackDiv.style.borderRadius = '8px';
              fallbackDiv.style.background = '#9f9';
              fallbackDiv.style.color = '#000';
              fallbackDiv.style.textAlign = 'center';
              fallbackDiv.style.fontWeight = 'bold';
              fallbackDiv.style.width = '150px';
              fallbackDiv.style.margin = '0 auto';
              fallbackDiv.innerText = nodeName;
              
              ref.current.innerHTML = '';
              ref.current.appendChild(fallbackDiv);
              
              setError('Using fallback rendering for simple diagram');
            }
          }
        });
    } catch (err: any) {
      console.error('[DB1] MERMAID_ERROR', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
    }
  }, [chart]);

  return (
    <DiagramContainer>
      <div ref={ref}></div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {/* Hide chart code in production */}
      {process.env.NODE_ENV === 'development' && (
        <pre style={{ 
          fontSize: '10px', 
          color: '#666', 
          marginTop: '8px', 
          display: 'none' // Hide in production, only show in dev if needed 
        }}>
          {chart}
        </pre>
      )}
    </DiagramContainer>
  );
};

export default MermaidDiagram; 