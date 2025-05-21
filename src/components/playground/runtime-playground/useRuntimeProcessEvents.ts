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
    
    // Create an event ID to track processed events
    const eventId = `${event.id}-${event.status}-${event.timestamp}`;
    
    // Skip if we've already processed this exact event
    if (processedEventsRef.current.has(eventId)) {
      return;
    }
    
    // Mark this event as processed
    processedEventsRef.current.add(eventId);
    
    // Set a flag to avoid concurrent updates
    if (processingRef.current) {
      console.log('[DB1] Already processing an event, queueing this one');
      setTimeout(() => handleEvent(event), 0);
      return;
    }
    
    processingRef.current = true;
    
    // Fix the parentId if it's referencing itself
    if (event.parentId === event.id) {
      // This is usually artificialDelay calling itself
      console.log('[DB1] Fixing self-referential parentId in event:', event.id);
      // We'll check the nodeMap to see if we can find the correct parent
      const potentialParents = Object.values(nodeMap).filter(
        node => node.children.some(child => child.id === event.id)
      );
      if (potentialParents.length > 0) {
        console.log('[DB1] Found correct parent:', potentialParents[0].id);
        event = {
          ...event,
          parentId: potentialParents[0].id
        };
      }
    }
    
    // Fast-path special handling for main start event
    if (event.status === 'start' && event.name === 'main') {
      // Create the main/root node immediately
      const mainNode: RuntimeProcessNode = {
        id: event.id,
        name: event.name,
        type: event.type,
        children: [],
        parentId: event.parentId,
        status: 'running',
        startTime: event.timestamp,
      };
      
      console.log('[DB1] Creating root node for main function:', mainNode);
      
      // Set root node directly
      setRoot(mainNode);
      
      // Also add to node map
      setNodeMap(prev => ({
        ...prev,
        [event.id]: mainNode
      }));
      
      processingRef.current = false;
      return;
    }
    
    // Special handling for end events to mark nodes as completed
    if (event.status === 'end') {
      setNodeMap(prev => {
        const newMap = { ...prev };
        if (newMap[event.id]) {
          newMap[event.id].status = 'completed';
          newMap[event.id].endTime = event.timestamp;
          console.log('[DB1] Marked node as completed from end event:', newMap[event.id].name);
          
          // If this is the root node ending, check for any running nodes
          if (root && root.id === event.id) {
            console.log('[DB1] Root node completed, checking for running nodes');
            // Schedule a check to mark all nodes as completed
            setTimeout(markAllNodesCompleted, 100);
          }
        }
        return newMap;
      });
      
      processingRef.current = false;
      return;
    }
    
    setNodeMap(prev => {
      try {
        // Make a copy of the previous state
        const newMap = { ...prev };
        
        if (event.status === 'start') {
          // Create a new node using the exact parentId from the event
          const node: RuntimeProcessNode = {
            id: event.id,
            name: event.name,
            type: event.type,
            children: [],
            parentId: event.parentId,
            status: 'running',
            startTime: event.timestamp,
          };
          
          console.log('[DB1] Creating new node for function:', node);
          console.log('[DB1] Using exact parentId from event:', event.parentId);
          
          // Add to node map
          newMap[event.id] = node;
          
          // If this node has a parent, add it as a child to the parent
          if (event.parentId && newMap[event.parentId]) {
            const parent = newMap[event.parentId];
            
            // Only add if not already a child
            if (!parent.children.some(c => c.id === node.id)) {
              parent.children.push(node);
              console.log('[DB1] Added child to parent, parent now has', parent.children.length, 'children');
            }
            
            console.log('[DB1] Added child to parent:', {
              child: node.name,
              parent: parent.name,
              parentId: parent.id,
              childParentId: node.parentId,
              children: parent.children.map(c => c.name)
            });
          } else if (event.parentId) {
            // If parent doesn't exist yet but parentId is specified, create a temporary placeholder parent
            console.log('[DB1] Parent not found yet for node', node.name, 'with parentId', event.parentId);
            
            // We'll create a placeholder that will be updated when the actual parent event arrives
            const placeholderParent: RuntimeProcessNode = {
              id: event.parentId,
              name: event.parentId.split('-')[1] || 'parent', // Use function name from ID if available
              type: 'function',
              children: [node],
              status: 'running',
              startTime: event.timestamp - 1, // Start just before child
            };
            
            newMap[event.parentId] = placeholderParent;
            console.log('[DB1] Created placeholder parent:', placeholderParent.name);
          }
        }
        
        // Find all root candidates (nodes without parents or with nonexistent parents)
        // First priority is 'main' function, then any function named with variants of 'main'
        const rootCandidates = Object.values(newMap).filter(node => 
          node.name === 'main' || 
          node.name.includes('main') || 
          node.name.includes('Main') || 
          !node.parentId || 
          !newMap[node.parentId]
        );
        
        if (rootCandidates.length > 0) {
          // Sort by priority:
          // 1. Exactly named 'main'
          // 2. Contains 'main' in the name
          // 3. Has no parent
          const mainNode = rootCandidates.find(node => node.name === 'main') ||
                          rootCandidates.find(node => node.name.includes('main') || node.name.includes('Main')) ||
                          rootCandidates[0];
          
          // Only update if root changed
          if (!root || root.id !== mainNode.id) {
            console.log('[DB1] Setting new root node:', mainNode);
            setRoot(mainNode);
          } else {
            // Otherwise, just update the existing root with any changes
            console.log('[DB1] Updating existing root node with changes');
            setRoot({...newMap[root.id]});
          }
        }
        
        return newMap;
      } finally {
        processingRef.current = false;
      }
    });
  }, [root, markAllNodesCompleted, nodeMap]);
  
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
      
      // Parse the console output directly to build the tree
      const parseConsoleOutputToTree = () => {
        const outputArea = document.querySelector('[data-testid="output-area"]');
        if (!outputArea) return null;
        
        const outputText = outputArea.textContent || '';
        const lines = outputText.split('\n').filter(Boolean);
        
        console.log('[SYNC] Parsing console output with', lines.length, 'lines');
        
        // First, identify all functions and their start/end times
        const functionStarts = new Map(); // function name -> start time
        const functionEnds = new Map();   // function name -> end time
        const functionCalls = new Map();  // function name -> array of called functions
        const startTimes = new Map();     // timestamp string -> unix timestamp
        
        // Initialize with "main" as the root
        let rootFunctionName = "main";
        let activeStack = [];
        const timestamp = Date.now();
        
        lines.forEach((line, index) => {
          // Capture function starting
          if (line.includes('starting')) {
            const functionName = line.split(' ')[0].trim();
            functionStarts.set(functionName, timestamp + (index * 100)); // Estimate time with line position
            startTimes.set(functionName, timestamp + (index * 100));
            
            // Track stack
            activeStack.push(functionName);
            
            // If this is the first function, set it as root
            if (index === 0 && !line.toLowerCase().includes('main')) {
              rootFunctionName = functionName;
            }
          }
          
          // Capture function calling another function
          if (line.includes('calling')) {
            const callerFunctionName = line.split(' ')[0].trim();
            const calledFunctionName = line.split('calling ')[1].trim();
            
            if (!functionCalls.has(callerFunctionName)) {
              functionCalls.set(callerFunctionName, []);
            }
            functionCalls.get(callerFunctionName).push(calledFunctionName);
          }
          
          // Capture function completing
          if (line.includes('completed')) {
            const functionName = line.split(' ')[0].trim();
            functionEnds.set(functionName, timestamp + (index * 100)); // Estimate time
            
            // Pop from stack
            if (activeStack[activeStack.length - 1] === functionName) {
              activeStack.pop();
            }
          }
        });
        
        console.log('[SYNC] Identified functions:', 
          'starts=', functionStarts.size, 
          'ends=', functionEnds.size, 
          'calls=', functionCalls.size);
        
        // Build the tree structure
        const buildTreeNode = (name: string, parentId: string | null = null) => {
          const node: RuntimeProcessNode = {
            id: `fn-${name}`,
            name,
            type: 'function',
            children: [],
            parentId: parentId ? `fn-${parentId}` : undefined,
            status: 'completed',
            startTime: functionStarts.get(name) || Date.now() - 1000,
            endTime: functionEnds.get(name) || Date.now()
          };
          
          // Add children
          const childFunctions = functionCalls.get(name) || [];
          for (const childName of childFunctions) {
            const childNode = buildTreeNode(childName, name);
            node.children.push(childNode);
          }
          
          return node;
        };
        
        // Build the tree starting from the root function
        const rootNode = buildTreeNode(rootFunctionName);
        console.log('[SYNC] Built tree from console output:', rootNode);
        
        return rootNode;
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