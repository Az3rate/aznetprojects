import { useState, useCallback, useEffect, useRef } from 'react';
import type { RuntimeProcessEvent, RuntimeProcessNode } from './types';

export function useRuntimeProcessEvents() {
  const [root, setRoot] = useState<RuntimeProcessNode | null>(null);
  // Map of id to node for fast lookup
  const [nodeMap, setNodeMap] = useState<Record<string, RuntimeProcessNode>>({});
  // Add a ref to track if we're currently processing a node update
  const processingRef = useRef(false);
  // Add a ref to track processed event IDs to prevent duplicate processing
  const processedEventsRef = useRef<Set<string>>(new Set());
  // Add ref to track visualization performance
  const visualizationTimingRef = useRef<{
    firstEventTime: number | null;
    lastEventTime: number | null;
    eventCount: number;
  }>({
    firstEventTime: null,
    lastEventTime: null,
    eventCount: 0
  });
  
  // Function to force all nodes to completed status
  const markAllNodesCompleted = useCallback(() => {
    console.log('[SYNC] Marking all running nodes as completed');
    setNodeMap(prev => {
      const newMap = {...prev};
      
      // Find all running nodes
      const runningNodes = Object.values(newMap).filter(node => node.status === 'running');
      if (runningNodes.length > 0) {
        console.log('[SYNC] Found', runningNodes.length, 'running nodes to complete');
        
        // Mark all running nodes as completed
        runningNodes.forEach(node => {
          node.status = 'completed';
          if (!node.endTime) {
            node.endTime = Date.now();
          }
          console.log('[SYNC] Marked node as completed:', node.name);
        });
        
        // Update root if it's running
        if (root && root.status === 'running') {
          setRoot({
            ...newMap[root.id],
            status: 'completed',
            endTime: newMap[root.id].endTime || Date.now()
          });
        }
      }
      
      return newMap;
    });
  }, [root]);

  // Function to rebuild complete tree structure from nodeMap
  const rebuildTreeFromNodeMap = useCallback((nodeMapData: Record<string, RuntimeProcessNode>) => {
    console.log('[REBUILD] Rebuilding tree from nodeMap with', Object.keys(nodeMapData).length, 'nodes');
    
    // Find the root node (main function)
    const rootNode = Object.values(nodeMapData).find(node => node.name === 'main');
    if (!rootNode) {
      console.log('[REBUILD] No main function found in nodeMap');
      return null;
    }
    
    // Recursively build tree structure
    const buildNodeWithChildren = (node: RuntimeProcessNode): RuntimeProcessNode => {
      const children = Object.values(nodeMapData)
        .filter(child => child.parentId === node.id)
        .map(child => buildNodeWithChildren(child));
      
      return {
        ...node,
        children: children
      };
    };
    
    const completeTree = buildNodeWithChildren(rootNode);
    console.log('[REBUILD] Complete tree built with', getAllNodesCount(completeTree), 'total nodes');
    
    return completeTree;
  }, []);
  
  // Helper function to count all nodes in tree
  const getAllNodesCount = (node: RuntimeProcessNode): number => {
    return 1 + node.children.reduce((count, child) => count + getAllNodesCount(child), 0);
  };

  const handleEvent = useCallback((event: RuntimeProcessEvent) => {
    console.log('[DB1] Handling process event:', event);
    
    // Track visualization timing metrics
    const now = Date.now();
    if (!visualizationTimingRef.current.firstEventTime) {
      visualizationTimingRef.current.firstEventTime = now;
    }
    visualizationTimingRef.current.lastEventTime = now;
    visualizationTimingRef.current.eventCount++;
    
    // Log visualization performance every 5 events
    if (visualizationTimingRef.current.eventCount % 5 === 0) {
      const elapsed = visualizationTimingRef.current.lastEventTime! - visualizationTimingRef.current.firstEventTime!;
      console.log(`[VISUALIZATION_METRICS] Processed ${visualizationTimingRef.current.eventCount} events in ${elapsed}ms (${(elapsed/visualizationTimingRef.current.eventCount).toFixed(2)}ms/event)`);
    }
    
    // SIMPLIFIED: Process all events without aggressive duplicate filtering
    // Only filter if it's the exact same event at the exact same timestamp
    const eventId = `${event.id}-${event.status}-${event.timestamp}`;
    if (processedEventsRef.current.has(eventId)) {
      console.log('[DB1] Skipping exact duplicate event:', eventId);
      return;
    }
    processedEventsRef.current.add(eventId);
    
    // SIMPLIFIED: Remove concurrent processing protection to ensure all events are handled
    setNodeMap(prev => {
      const newMap = { ...prev };
      
      if (event.status === 'start') {
        // Create new node
        const node: RuntimeProcessNode = {
          id: event.id,
          name: event.name,
          type: event.type,
          children: [],
          parentId: event.parentId,
          status: 'running',
          startTime: event.timestamp,
        };
        
        console.log('[DB1] Creating node:', event.name, 'with parent:', event.parentId);
        newMap[event.id] = node;
        
        // Rebuild and update root with complete tree
        setTimeout(() => {
          const completeTree = rebuildTreeFromNodeMap(newMap);
          if (completeTree) {
            console.log('[DB1] Setting rebuilt tree as root');
            setRoot(completeTree);
          }
        }, 0);
        
      } else if (event.status === 'end') {
        // Mark node as completed
        if (newMap[event.id]) {
          newMap[event.id].status = 'completed';
          newMap[event.id].endTime = event.timestamp;
          console.log('[DB1] Completed node:', newMap[event.id].name);
          
          // Rebuild and update root with complete tree
          setTimeout(() => {
            const completeTree = rebuildTreeFromNodeMap(newMap);
            if (completeTree) {
              console.log('[DB1] Setting rebuilt tree as root after completion');
              setRoot(completeTree);
            }
          }, 0);
        }
      }
      
      return newMap;
    });
  }, [rebuildTreeFromNodeMap]);
  
  // Add functionality to sync with console output from DEBUG_EVENT_EMISSION
  useEffect(() => {
    // Create a function to process DEBUG_EVENT_EMISSION events from console
    const syncFromConsole = () => {
      const outputArea = document.querySelector('[data-testid="output-area"]');
      const debugOutput = document.querySelector('[data-testid="debug-output"]');
      
      if (!outputArea && !debugOutput) {
        console.warn('[SYNC] Could not find output areas for sync');
        return;
      }
      
      const outputText = (outputArea?.textContent || '') + '\n' + (debugOutput?.textContent || '');
      const lines = outputText.split('\n');
      
      // Find all different types of debug event emissions
      const eventLines = [
        ...lines.filter(line => line.includes('[DEBUG_EVENT_EMISSION]')),
        ...lines.filter(line => line.includes('[RUNTIME_EVENT]')),
        ...lines.filter(line => line.includes('[DEBUG_PROCESS_EVENT]'))
      ];
      
      console.log(`[SYNC] Found ${eventLines.length} event lines in console output`);
      
      // Create a set of already processed events
      const processedIds = new Set<string>();
      
      // Track if we found main function end event
      let mainFunctionEnded = false;
      
      // Process all events, with emphasis on 'end' events 
      eventLines.forEach(line => {
        try {
          // Extract the event JSON based on different formats
          let event: RuntimeProcessEvent | null = null;
          
          if (line.includes('[DEBUG_EVENT_EMISSION]')) {
            const jsonStart = line.indexOf('[DEBUG_EVENT_EMISSION]') + '[DEBUG_EVENT_EMISSION]'.length;
            const jsonStr = line.substring(jsonStart).trim();
            event = JSON.parse(jsonStr);
          } else if (line.includes('[RUNTIME_EVENT]')) {
            const jsonStart = line.indexOf('[RUNTIME_EVENT]') + '[RUNTIME_EVENT]'.length;
            const jsonStr = line.substring(jsonStart).trim();
            // Different format, needs conversion
            const rawEvent = JSON.parse(jsonStr);
            event = {
              id: rawEvent.id,
              name: rawEvent.name,
              type: rawEvent.type,
              status: rawEvent.status,
              timestamp: rawEvent.timestamp || Date.now(),
              parentId: rawEvent.parentId
            };
          } else if (line.includes('[DEBUG_PROCESS_EVENT]')) {
            const jsonStart = line.indexOf('[DEBUG_PROCESS_EVENT]') + '[DEBUG_PROCESS_EVENT]'.length;
            const jsonStr = line.substring(jsonStart).trim();
            event = JSON.parse(jsonStr);
          }
          
          if (!event) {
            console.warn('[SYNC] Could not extract event from line:', line);
            return;
          }
          
          // Check if this is main function end event
          if (event.name === 'main' && event.status === 'end') {
            mainFunctionEnded = true;
            console.log('[SYNC] Found main function end event');
          }
          
          // Add to our processed event set
          const eventKey = `console-${event.id}-${event.status}`;
          
          // Skip if already processed
          if (processedIds.has(eventKey)) return;
          processedIds.add(eventKey);
          
          // Update the node map for both start and end events
          setNodeMap(prev => {
            const newMap = { ...prev };
            
            if (event?.status === 'end') {
              // For end events, mark node as completed
              if (newMap[event.id]) {
                console.log('[SYNC] Marking node completed from console event:', event.id, event.name);
                newMap[event.id].status = 'completed';
                newMap[event.id].endTime = event.timestamp;
              }
            } else if (event?.status === 'start' && !newMap[event.id]) {
              // For start events that we haven't seen before, create the node
              console.log('[SYNC] Creating new node from console event:', event.id, event.name);
              const node: RuntimeProcessNode = {
                id: event.id,
                name: event.name,
                type: event.type,
                children: [],
                parentId: event.parentId,
                status: 'running',
                startTime: event.timestamp,
              };
              
              newMap[event.id] = node;
              
              // If this node has a parent, add it as a child to the parent
              if (event.parentId && newMap[event.parentId]) {
                const parent = newMap[event.parentId];
                
                // Only add if not already a child
                if (!parent.children.some(c => c.id === node.id)) {
                  parent.children.push(node);
                }
              }
            }
            
            return newMap;
          });
        } catch (e) {
          console.error('[SYNC] Failed to parse event line:', line, e);
        }
      });
      
      // After processing all events, check if all functions should be completed
      if (mainFunctionEnded) {
        console.log('[SYNC] Main function has ended, marking all running nodes completed');
        // Use setTimeout to ensure all state updates are processed
        setTimeout(markAllNodesCompleted, 100);
      }
    };
    
    // Call once on mount
    console.log('[SYNC] Initial sync from console');
    syncFromConsole();
    
    // Set up an interval to check console regularly
    const intervalId = setInterval(syncFromConsole, 1000);
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [markAllNodesCompleted]);

  // Add a sync button component that lets users manually sync the visualization
  const syncVisualization = useCallback(() => {
    console.log('[SYNC] Manual sync triggered');
    
    try {
      // Get node counts before sync
      const runningNodesBeforeSync = Object.values(nodeMap).filter(node => node.status === 'running').length;
      console.log(`[SYNC] Before sync: ${runningNodesBeforeSync} running nodes`);
      
      // Special case: Check for SYNC_FORCE messages in console for directly specifying tree structure
      const debugOutput = document.querySelector('[data-testid="debug-output"]');
      if (debugOutput) {
        const debugText = debugOutput.textContent || '';
        const syncForceMatch = debugText.match(/\[SYNC_FORCE\]\s+(\w+)\s+->\s+(\w+)/);
        
        if (syncForceMatch) {
          const parentName = syncForceMatch[1];
          const childName = syncForceMatch[2];
          console.log(`[SYNC] Found SYNC_FORCE directive: ${parentName} -> ${childName}`);
          
          // Create nodes for this relationship
          const parentNode: RuntimeProcessNode = {
            id: `fn-${parentName}`,
            name: parentName,
            type: 'function',
            status: 'completed',
            startTime: Date.now() - 2000,
            endTime: Date.now() - 200,
            children: []
          };
          
          const childNode: RuntimeProcessNode = {
            id: `fn-${childName}`,
            name: childName,
            type: 'function',
            status: 'completed',
            startTime: Date.now() - 1500,
            endTime: Date.now() - 500,
            children: [],
            parentId: parentNode.id
          };
          
          // Set up parent-child relationship
          parentNode.children.push(childNode);
          
          // Update the nodeMap and root
          const newNodeMap = {
            [parentNode.id]: parentNode,
            [childNode.id]: childNode
          };
          
          console.log('[SYNC] Setting synthetic tree from SYNC_FORCE directive', newNodeMap);
          setNodeMap(newNodeMap);
          setRoot(parentNode);
          
          // Skip the rest of the sync process
          return;
        }
      }
      
      // Parse the console output directly to build the tree
      // DISABLED: This was creating fake function events from console.log messages
      // Instead, we should only use real function tracking events
      const parseConsoleOutputToTree = () => {
        console.log('[SYNC] Console parsing disabled - using real function events only');
        return null;
      };
      
      // Try to build tree from console output
      const treeFromConsole = parseConsoleOutputToTree();
      if (treeFromConsole) {
        console.log('[SYNC] Replacing visualization with console-based tree');
        // Update the node map to include all nodes in the tree
        const flattenTree = (node: RuntimeProcessNode) => {
          const nodes: RuntimeProcessNode[] = [node];
          for (const child of node.children) {
            nodes.push(...flattenTree(child));
          }
          return nodes;
        };
        
        const allNodes = flattenTree(treeFromConsole);
        const newNodeMap: Record<string, RuntimeProcessNode> = {};
        allNodes.forEach(node => {
          newNodeMap[node.id] = node;
        });
        
        // Update the state
        setNodeMap(newNodeMap);
        setRoot(treeFromConsole);
        
        // Return to skip the rest of the sync process
        return;
      }
      
      // If we couldn't build from console, use the existing approach
      markAllNodesCompleted();
      
      // Verify the sync was successful
      setTimeout(() => {
        const runningNodesAfterSync = Object.values(nodeMap).filter(node => node.status === 'running').length;
        console.log(`[SYNC] After sync: ${runningNodesAfterSync} running nodes`);
        
        if (runningNodesAfterSync > 0) {
          console.warn(`[SYNC] Warning: Still have ${runningNodesAfterSync} running nodes after sync`);
          console.log('[SYNC] Trying one more forced completion');
          
          // If there are still running nodes, try one more time with a direct update
          setNodeMap(prev => {
            const newMap = {...prev};
            
            Object.values(newMap).forEach(node => {
              if (node.status === 'running') {
                console.log(`[SYNC] Forcing completion of node: ${node.name} (${node.id})`);
                node.status = 'completed';
                if (!node.endTime) {
                  node.endTime = Date.now();
                }
              }
            });
            
            return newMap;
          });
          
          // Also force update on root if needed
          if (root && root.status === 'running') {
            console.log('[SYNC] Forcing completion of root node');
            setRoot({
              ...root,
              status: 'completed',
              endTime: root.endTime || Date.now()
            });
          }
        }
      }, 100);
    } catch (err) {
      console.error('[SYNC] Error during manual sync:', err);
    }
  }, [markAllNodesCompleted, nodeMap, root, setNodeMap, setRoot]);
  
  // Debug: Log the root when it changes
  useEffect(() => {
    console.log('[DB1] Root node updated:', root);
    if (root && root.children.length === 0) {
      console.log('[DB1] ⚠️ Root has no children - simple function detected');
      
      // For visualization, some diagrams may not render for nodes without children
      // We could create a dummy child node just for visual purposes
      if (root.status === 'completed') {
        console.log('[DB1] Adding dummy execution node for visualization purposes');
        
        // This is just for visualization enhancement - we're not modifying the actual data structure
        const enhancedRoot = { 
          ...root,
          // We don't actually modify the children array in the state,
          // this is just for logging purposes
          _visualChildren: [{
            id: `${root.id}-exec`,
            name: 'Execution',
            type: 'execution',
            children: [],
            parentId: root.id,
            status: 'completed',
            startTime: root.startTime,
            endTime: root.endTime
          }]
        };
        
        console.log('[DB1] Enhanced root node for visualization:', enhancedRoot);
      }
    }
  }, [root]);

  return { root, handleEvent, setRoot, setNodeMap, syncVisualization };
} 