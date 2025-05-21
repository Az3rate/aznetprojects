import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import styled from 'styled-components';

const DiagramContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  padding: ${({ theme }) => theme.spacing.md};
  overflow: auto;
  max-width: 100%;
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
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'default'
  });
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const chartId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!ref.current || !chart) return;
    
    try {
      // Reset state
      setError(null);
      
      // Clear previous content
      ref.current.innerHTML = '';
      
      console.log('[DEBUG_MERMAID_RENDERING]', { 
        chart, 
        id: chartId.current 
      });
      
      // Use the simpler API
      mermaid.render(chartId.current, chart)
        .then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        })
        .catch(err => {
          console.error('[MERMAID_RENDER_ERROR]', err);
          setError(`Failed to render diagram: ${err.message || 'Unknown error'}`);
        });
    } catch (err: any) {
      console.error('[MERMAID_ERROR]', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
    }
  }, [chart]);

  return (
    <DiagramContainer>
      <div ref={ref}></div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <pre style={{ fontSize: '10px', color: '#666', marginTop: '8px', display: 'none' }}>
        {chart}
      </pre>
    </DiagramContainer>
  );
};

export default MermaidDiagram; 