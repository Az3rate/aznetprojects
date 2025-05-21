import { useState, useCallback, useEffect } from 'react';
import type { RuntimeProcessEvent, RuntimeProcessNode } from './types';

export function useRuntimeProcessEvents() {
  const [root, setRoot] = useState<RuntimeProcessNode | null>(null);
  // Map of id to node for fast lookup
  const [nodeMap, setNodeMap] = useState<Record<string, RuntimeProcessNode>>({});

  const handleEvent = useCallback((event: RuntimeProcessEvent) => {
    console.log('[DEBUG_HANDLE_EVENT] Received event:', event);
    
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
      
      console.log('[DEBUG_CREATING_ROOT_NODE]', mainNode);
      
      // Set root node directly
      setRoot(mainNode);
      
      // Also add to node map
      setNodeMap(prev => ({
        ...prev,
        [event.id]: mainNode
      }));
      
      return;
    }
    
    setNodeMap(prev => {
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
        
        // Add to node map
        newMap[event.id] = node;
        
        // If this node has a parent, add it as a child to the parent
        if (event.parentId && newMap[event.parentId]) {
          const parent = newMap[event.parentId];
          
          // Only add if not already a child
          if (!parent.children.some(c => c.id === node.id)) {
            parent.children.push(node);
          }
          
          console.log('[DEBUG_ADDING_CHILD]', {
            child: node.name,
            parent: parent.name,
            children: parent.children.map(c => c.name)
          });
        }
      } 
      else if (event.status === 'end' && newMap[event.id]) {
        // Update node status
        newMap[event.id].status = 'completed';
        newMap[event.id].endTime = event.timestamp;
        console.log('[DEBUG_COMPLETED_NODE]', newMap[event.id]);
      }
      
      // If we have a root set, update it with any changes to children
      if (root && newMap[root.id]) {
        setRoot({...newMap[root.id]});
      }
      
      return newMap;
    });
  }, [root]);
  
  // Debug: Log the root when it changes
  useEffect(() => {
    console.log('[DEBUG_ROOT_UPDATED]', root);
  }, [root]);

  return { root, handleEvent };
} 