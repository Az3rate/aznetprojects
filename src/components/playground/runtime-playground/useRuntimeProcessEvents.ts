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

  const handleEvent = useCallback((event: RuntimeProcessEvent) => {
    console.log('[DB1] Handling process event:', event);
    
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
    
    setNodeMap(prev => {
      try {
        // Make a copy of the previous state
        const newMap = { ...prev };
        
        if (event.status === 'start') {
          // Create a new node
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
          console.log('[DB1] Parent ID is:', event.parentId);
          
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
          } else {
            console.log('[DB1] No parent found for node', node.name, 'with parentId', event.parentId);
          }
        } 
        else if (event.status === 'end' && newMap[event.id]) {
          // Update node status
          newMap[event.id].status = 'completed';
          newMap[event.id].endTime = event.timestamp;
          console.log('[DB1] Marked node as completed:', newMap[event.id]);
          
          // If we have a root node that's being completed
          if (root && event.id === root.id) {
            console.log('[DB1] Root node (main function) completed, final state:', {
              ...newMap[event.id],
              children: newMap[event.id].children.map(c => c.name)
            });
          }
        } 
        // Special handling for callbacks that report end with their own ID as parentId
        else if (event.status === 'end' && event.id.includes('callback') && !newMap[event.id]) {
          // Try to find the callback node by removing any prefix from the ID
          const callbackId = event.id.includes('-') ? event.id.split('-')[1] : event.id;
          const possibleIds = Object.keys(newMap).filter(id => id.includes(callbackId));
          
          if (possibleIds.length > 0) {
            const callbackNodeId = possibleIds[0];
            console.log('[DB1] Found callback node to complete:', callbackNodeId);
            newMap[callbackNodeId].status = 'completed';
            newMap[callbackNodeId].endTime = event.timestamp;
          } else {
            console.log('[DB1] Could not find callback node for completion event:', event);
          }
        }
        
        // Find root node candidates (either 'main' function or nodes without parents)
        const rootCandidates = Object.values(newMap).filter(node => 
          node.name === 'main' || !node.parentId || !newMap[node.parentId]
        );
        
        // If we have at least one root candidate, update the root
        if (rootCandidates.length > 0) {
          // Prefer 'main' function if available
          const mainNode = rootCandidates.find(node => node.name === 'main');
          const newRoot = mainNode || rootCandidates[0];
          
          // Only update if root changed
          if (!root || root.id !== newRoot.id) {
            console.log('[DB1] Setting new root node:', newRoot);
            setRoot(newRoot);
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
  }, [root]);
  
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
        // We don't need to actually set this since the Mermaid diagram 
        // will handle single nodes appropriately
      }
    }
  }, [root]);

  return { root, handleEvent, setRoot, setNodeMap };
} 