# Runtime Visualization System Documentation

## 1. System Architecture Overview

The runtime visualization system tracks JavaScript execution and displays it as an interactive, hierarchical tree diagram. The system consists of several key components:

- **Code Instrumentation**: Transforms user code to emit execution events
- **Event Collection**: Captures function starts/ends and parent-child relationships
- **State Management**: Builds a tree representation of execution flow
- **Visualization Components**: Renders the execution tree, timelines, and details
- **Console Output Parsing**: Extracts execution flow directly from console output

## 2. Data Flow & Event Tracking

### Event Emission

```typescript
// Events emitted during execution have this structure:
{
  id: string;           // Unique identifier (e.g., "fn-main", "fn-first")
  name: string;         // Function name (e.g., "main", "first")
  type: string;         // Function type ("function" or "callback")
  status: string;       // Execution status ("start" or "end")
  parentId: string;     // ID of the parent function/context
  timestamp: number;    // Execution time in milliseconds
  isCompleted?: boolean; // For end events, indicates completion status
  isLastFunction?: boolean; // For the last function in the execution stack
  syncTimestamp?: number; // Timestamp for synchronization purposes
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
- Includes a "Sync with Console Output" button to manually update visualization

### Function Status Determination

```typescript
// For callbacks, we force completed status if they have startTime
const displayStatus = isCallback && safeNode.startTime ? 'completed' : safeNode.status;
```

### Asynchronous Operation Handling

```typescript
// Detection of asynchronous nodes
const isCallback = safeNode.name.includes('callback') || 
                  safeNode.name === 'setTimeout' || 
                  safeNode.name === 'fetchData' ||
                  safeNode.name.includes('fetch') || 
                  isAsyncCallback;

// Display special connector for async operations
<AsyncConnectorLine /> // Uses dashed styling
```

### Timeline Visualization (RuntimeTimeline.tsx)

- Shows execution timing of functions on a horizontal timeline
- Displays start and end times of functions
- Provides a tabular view of function execution details

## 4. Console-Based Visualization

### Console Output Parser

A key enhancement to the system is the ability to build the visualization tree directly from console output:

```typescript
// Parse console output to generate visualization tree
const parseConsoleOutputToTree = () => {
  const outputArea = document.querySelector('[data-testid="output-area"]');
  if (!outputArea) return null;
  
  const outputText = outputArea.textContent || '';
  const lines = outputText.split('\n').filter(Boolean);
  
  // Identify all functions and their relationships
  const functionStarts = new Map(); // function name -> start time
  const functionEnds = new Map();   // function name -> end time
  const functionCalls = new Map();  // function name -> array of called functions
  
  // Process console lines to extract function call patterns
  lines.forEach((line, index) => {
    if (line.includes('starting')) {
      // Capture function start
      const functionName = line.split(' ')[0].trim();
      functionStarts.set(functionName, timestamp + (index * 100));
    }
    
    if (line.includes('calling')) {
      // Capture function calls
      const callerFunction = line.split(' ')[0].trim();
      const calledFunction = line.split('calling ')[1].trim();
      // Track parent-child relationship
      functionCalls.set(callerFunction, 
        [...(functionCalls.get(callerFunction) || []), calledFunction]);
    }
    
    if (line.includes('completed')) {
      // Capture function completion
      const functionName = line.split(' ')[0].trim();
      functionEnds.set(functionName, timestamp + (index * 100));
    }
  });
  
  // Build tree structure from parsed console data
  const buildTreeNode = (name, parentId = null) => {
    // Create node with proper timing info
    return { 
      id: `fn-${name}`,
      name,
      type: 'function',
      children: (functionCalls.get(name) || [])
        .map(childName => buildTreeNode(childName, name)),
      parentId: parentId ? `fn-${parentId}` : undefined,
      status: 'completed',
      startTime: functionStarts.get(name),
      endTime: functionEnds.get(name)
    };
  };
  
  // Return root node of tree
  return buildTreeNode(rootFunctionName);
};
```

### Sync Visualization Feature

The system provides multiple ways to synchronize the visualization with the console output:

1. **Automatic Sync**: 
   - Triggered after code execution completes
   - Triggered when the main function completes
   - Triggered on runtime-complete events

2. **Manual Sync**:
   - "Sync Visualization" button in the playground container
   - "Sync with Console Output" button in the visualizer 

3. **Console-Based Tree Generation**:
   - Parses console output to build a visualization tree
   - Analyzes function start/end patterns and calling relationships
   - Creates timing estimates based on execution order

## 5. Integration Guide For New Examples

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
- **Console parsing relies on function names**: Ensure function names appear in console output

### Console Output Patterns

For optimal console-based visualization:

1. Use consistent function naming patterns
2. Include "starting" in function start logs: `console.log("FunctionName starting");`
3. Include "calling" to show function calls: `console.log("FunctionName calling OtherFunction");`
4. Include "completed" in function end logs: `console.log("FunctionName completed");`

## 6. How The System Works

1. **Code Execution**:
   - User code is transformed via instrumentation
   - Runtime events are emitted when functions start/end
   - Web Worker executes code in isolation
   - Console logs track function execution flow

2. **Event Processing**:
   - Events are captured and passed to the parent window
   - `handleEvent` builds the execution tree incrementally
   - Tree structure maintains parent-child relationships
   - Console output is parsed as an alternative event source

3. **Parent-Child Relationship Tracking**:
   - **Parent Stack**: Maintains a stack of active function calls
   - **Parent Map**: Stores explicit parent-child relationships
   - **ID Consistency**: Uses consistent IDs for functions
   - **Console Parsing**: Extracts relationship from "calling" statements

4. **Status Handling**:
   - Normal functions: Status tracked directly via start/end events
   - Callbacks: Status forced to "completed" in UI when startTime exists
   - Console-based: All functions marked completed with proper timing

5. **Visualization Logic**:
   - Tree nodes show execution hierarchy
   - Connector lines differ between sync (solid) and async (dashed)
   - Special containers separate synchronous and asynchronous operations
   - Timeline visualization shows duration and order

## 7. Troubleshooting & Edge Cases

### Common Issues

1. **Callbacks Not Showing as Completed**:
   - Fixed via UI override in `displayStatus`
   - Use the sync button to force update from console output
   - Check for proper event emission in instrumentation

2. **Missing Parent-Child Relationships**:
   - Ensure proper parentId propagation
   - Use console-based tree generation through the sync button
   - Add explicit "calling" statements in logs

3. **Complex Async Patterns**:
   - Promise chains may need manual instrumentation
   - Deep callback nesting requires special attention
   - Use console output as the source of truth for visualization

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

## 8. Advanced Customization

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

## 9. Implementation Details

### Event Emission from User Code

The instrumentation process injects code that emits events with enhanced metadata:

```javascript
function emitProcessEvent(id, name, type, status) {
  // Get parent ID before manipulating the stack
  const parentId = getParentId();
  
  // Create event with all necessary information
  const event = {
    id,
    name,
    type, 
    status,
    parentId,
    timestamp: Date.now()
  };
  
  // Add additional metadata for end events
  if (status === 'end') {
    event.isCompleted = true;
    
    // Check if this is the last function
    if (parentStack.length === 0) {
      event.isLastFunction = true;
    }
  }
  
  // Emit event for visualization
  self.postMessage({
    type: 'runtime-process-event',
    event
  });
  
  // Add sync timestamp for visualization
  console.log('[DEBUG_EVENT_EMISSION]', JSON.stringify({
    ...event,
    syncTimestamp: Date.now()
  }));
}
```

### Parent-Child Relationship Tracking

The system uses multiple strategies to maintain parent-child relationships:

```javascript
// Parent stack to track execution context
const parentStack = [];

// Parent map to store explicit relationships
const parentMap = new Map();

// Track relationships on function start
if (status === 'start') {
  if (parentId) {
    // Store relationship in parent map
    parentMap.set(id, parentId);
  }
  
  // Add to parent stack for future children
  parentStack.push(id);
}

// Maintain stack on function end
if (status === 'end') {
  if (parentStack.length > 0) {
    if (parentStack[parentStack.length - 1] === id) {
      // Normal case - expected function ending
      parentStack.pop();
    } else {
      // Handle stack mismatch
      const index = parentStack.indexOf(id);
      if (index !== -1) {
        // Remove this specific ID from stack
        parentStack.splice(index, 1);
      } else if (parentMap.has(id)) {
        // Use parent map as fallback
        event.parentId = parentMap.get(id);
      }
    }
  }
}
```

### Console-Based Tree Sync Mechanism

The system now includes a mechanism to sync the visualization directly from console output:

```typescript
// In the syncVisualization function
const treeFromConsole = parseConsoleOutputToTree();
if (treeFromConsole) {
  // Update node map with all nodes from console-based tree
  const allNodes = flattenTree(treeFromConsole);
  const newNodeMap = {};
  allNodes.forEach(node => {
    newNodeMap[node.id] = node;
  });
  
  // Update state with console-based tree
  setNodeMap(newNodeMap);
  setRoot(treeFromConsole);
}
```

## 10. Further Enhancements

Some potential enhancements to consider:

1. **Memory Usage Visualization**: Track and display memory allocation
2. **Network Request Tracking**: Visualize API calls and responses
3. **Stack Trace Integration**: Show full execution stack for each node
4. **Performance Profiling**: Highlight performance bottlenecks
5. **Event Loop Visualization**: Show macro/micro task queue processing
6. **Improved Console Parsing**: Enhance pattern recognition and timing accuracy
7. **Interactive Tree Manipulation**: Allow users to rearrange nodes for better viewing
8. **Code Coverage Integration**: Show which lines of code were executed

---

This documentation provides a robust foundation for understanding, using, and extending the JavaScript runtime visualization system. Refer to this guide when adding new examples, troubleshooting visualization issues, or enhancing the system's capabilities. 