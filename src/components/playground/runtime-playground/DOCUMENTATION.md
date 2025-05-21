# Runtime Visualization System Documentation

## 1. System Architecture Overview

The runtime visualization system tracks JavaScript execution and displays it as an interactive, hierarchical tree diagram. The system consists of several key components:

- **Code Instrumentation**: Transforms user code to emit execution events
- **Event Collection**: Captures function starts/ends and parent-child relationships
- **State Management**: Builds a tree representation of execution flow
- **Visualization Components**: Renders the execution tree, timelines, and details

## 2. Data Flow & Event Tracking

### Event Emission

```typescript
// Events emitted during execution have this structure:
{
  id: string;           // Unique identifier (e.g., "fn-main", "callback-xyz")
  name: string;         // Function name (e.g., "main", "anonymous_callback")
  type: string;         // Function type ("function" or "callback")
  status: string;       // Execution status ("start" or "end")
  parentId: string;     // ID of the parent function/context
  timestamp: number;    // Execution time in milliseconds
}
```

### Node Structure

```typescript
// The internal representation of a process node
interface RuntimeProcessNode {
  id: string;                 // Unique identifier matching event ID
  name: string;               // Function name (e.g., "main")
  type: "function" | "call";  // Node type
  children: RuntimeProcessNode[]; // Child nodes
  parentId?: string;          // Parent node ID
  status: "running" | "completed"; // Current status
  startTime: number;          // Timestamp when function started
  endTime?: number;           // Timestamp when function ended
}
```

### State Transformation (useRuntimeProcessEvents.ts)

1. Events are processed sequentially in `handleEvent`
2. `status: "start"` creates new nodes in the hierarchy
3. `status: "end"` marks nodes as completed
4. Special handling exists for callbacks with self-referential parentIds
5. Nodes build a tree structure through parent-child relationships

#### Key Processing Logic:

```typescript
// For callback completion detection
if (event.status === 'end' && event.id.includes('callback') && !nodeMap[event.id]) {
  // Try to find the callback node by matching part of the ID
  const callbackId = event.id.includes('-') ? event.id.split('-')[1] : event.id;
  const possibleIds = Object.keys(nodeMap).filter(id => id.includes(callbackId));
  
  if (possibleIds.length > 0) {
    const callbackNodeId = possibleIds[0];
    nodeMap[callbackNodeId].status = 'completed';
    nodeMap[callbackNodeId].endTime = event.timestamp;
  }
}
```

## 3. Visualization Components

### Process Tree (RuntimeProcessVisualizer.tsx)

- Renders execution as a hierarchical tree
- Custom styling for both synchronous and asynchronous operations
- Uses `TreeNode` component recursively to display nested execution
- Special handling for callbacks and asynchronous operations
- Status-based coloring (green=completed, yellow=running)

### Function Status Determination

```typescript
// For callbacks, we force completed status if they have startTime
const displayStatus = isCallback && safeNode.startTime ? 'completed' : safeNode.status;
```

### Asynchronous Operation Handling

```typescript
// Detection of asynchronous nodes
const isCallback = node.name.includes('callback') || 
                  node.name === 'setTimeout' || 
                  node.name === 'fetchData';

// Display special connector for async operations
<AsyncConnectorLine /> // Uses dashed styling
```

### Timeline Visualization (RuntimeTimeline.tsx)

- Shows execution timing of functions on a horizontal timeline
- Displays start and end times of functions
- Provides a tabular view of function execution details

## 4. Integration Guide For New Examples

### Adding New Code Examples

1. Create example in `codeExamples.ts` with proper structure:
   ```typescript
   {
     id: "unique-id",
     name: "Example Name",
     complexity: "basic|intermediate|advanced|expert",
     description: "What this example demonstrates",
     code: `// Your example code here`,
     visualizationHint: "What to expect in the visualization"
   }
   ```

2. Ensure proper instrumentation for special cases:
   - **Promise chains**: Use `.finally()` to track completion
   - **setTimeout/setInterval**: Ensure callback tracking
   - **Async/await**: Will work automatically
   - **Nested functions**: Will be tracked through parent-child relationships

### Naming Conventions

- Use descriptive function names that indicate the role (e.g., `fetchData`, `processResult`)
- Anonymous functions in callbacks are auto-named but consider explicit naming for clarity
- Function names are used in visualization, so make them meaningful

## 5. How The System Works

1. **Code Execution**:
   - User code is transformed via instrumentation (using Acorn parser)
   - Runtime events are emitted when functions start/end
   - Web Worker executes code in isolation

2. **Event Processing**:
   - Events are captured and passed to the parent window
   - `handleEvent` builds the execution tree incrementally
   - Tree structure maintains parent-child relationships

3. **Status Handling**:
   - Normal functions: Status tracked directly via start/end events
   - Callbacks: Status forced to "completed" in UI when startTime exists
   - This approach handles the race condition where callbacks might not properly report completion

4. **Visualization Logic**:
   - Tree nodes show execution hierarchy
   - Connector lines differ between sync (solid) and async (dashed)
   - Special containers separate synchronous and asynchronous operations

## 6. Troubleshooting & Edge Cases

### Common Issues

1. **Callbacks Not Showing as Completed**:
   - Fixed via UI override in `displayStatus`
   - Check for proper event emission in instrumentation
   - Verify callback ID patterns in detection logic

2. **Missing Parent-Child Relationships**:
   - Ensure proper parentId propagation
   - Check for race conditions in event handling
   - Verify event order is maintained

3. **Complex Async Patterns**:
   - Promise chains may need manual instrumentation
   - Deep callback nesting requires special attention
   - Consider adding `console.log('[DEBUG_EVENT_EMISSION]', eventObject)` for debugging

### Adding New Async Patterns

When adding new asynchronous patterns, ensure:

1. The callback detection logic (`isCallback`) includes your pattern's naming convention:
   ```typescript
   // Update this logic in RuntimeProcessVisualizer.tsx
   const isCallback = safeNode.name.includes('callback') || 
                      safeNode.name === 'setTimeout' || 
                      safeNode.name === 'fetchData' ||
                      // Add your pattern here
                      safeNode.name.includes('yourPattern');
   ```

2. Consider adding appropriate type detection in the instrumentation code
3. Test with simple examples before adding complex ones

## 7. Advanced Customization

### Styling Nodes Based on Function Type

You can extend the styling logic to handle specific function types differently:

```typescript
// Add specialized node types
const APICallNode = styled(FunctionNode)`
  background: ${({ status }) => status === 'completed' ? '#b3e6ff' : '#ffe6b3'};
  border-color: #4d94ff;
`;

// Extend the node component selection
const NodeComponent = 
  node.name.includes('api') ? APICallNode :
  isCallback ? CallbackNode : 
  FunctionNode;
```

### Custom Timeline Visualization

For specialized timing visualizations, extend the RuntimeTimeline component:

```typescript
// Example: highlighting long-running functions
const isLongRunning = (node) => 
  node.endTime && node.startTime && 
  (node.endTime - node.startTime > 1000);

<TimelineRow 
  highlighted={isLongRunning(node)}
  // other props
/>
```

## 8. Implementation Details

### Event Emission from User Code

The instrumentation process injects code that emits events:

```javascript
function emitProcessEvent(id, name, type, status, parentId) {
  window.parent.postMessage({
    type: 'runtime-process-event',
    event: {
      id: id,
      name: name,
      type: type,
      status: status,
      parentId: parentId,
      timestamp: Date.now()
    }
  }, '*');
}

// Example of wrapping a function
function wrappedFunction() {
  const fnId = 'fn-uniqueId';
  emitProcessEvent(fnId, 'functionName', 'function', 'start', parentId);
  try {
    // Original function body
    return result;
  } finally {
    emitProcessEvent(fnId, 'functionName', 'function', 'end', parentId);
  }
}
```

### Processing Events in RuntimePlaygroundContainer

The container component listens for events and forwards them to the state management hook:

```typescript
useEffect(() => {
  function onMessage(e: MessageEvent) {
    if (e.data?.type === 'runtime-process-event') {
      const event = e.data.event as RuntimeProcessEvent;
      handleEvent(event);
    }
  }
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}, [handleEvent]);
```

## 9. Further Enhancements

Some potential enhancements to consider:

1. **Memory Usage Visualization**: Track and display memory allocation
2. **Network Request Tracking**: Visualize API calls and responses
3. **Stack Trace Integration**: Show full execution stack for each node
4. **Performance Profiling**: Highlight performance bottlenecks
5. **Event Loop Visualization**: Show macro/micro task queue processing

---

This documentation provides a robust foundation for understanding, using, and extending the JavaScript runtime visualization system. Refer to this guide when adding new examples, troubleshooting visualization issues, or enhancing the system's capabilities. 