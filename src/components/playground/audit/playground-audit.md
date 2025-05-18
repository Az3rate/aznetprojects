## Process Visualization Implementation (2024-03-21)

### Issue: Process Visualization Animation
**Problem:**
- Process nodes are detected but not animating in sync with code execution
- Timer callbacks are not properly instrumented, causing syntax errors
- Terminal output gets stuck in "Running..." state

**Root Cause Analysis:**
1. Code Instrumentation Issues:
   - Timer callback instrumentation breaks syntax
   - Arrow functions not properly handled
   - Incorrect placement of try/finally blocks
   - Extra parentheses causing syntax errors

2. Async Code Handling:
   - Logs not being properly flushed
   - No proper completion handling for async operations
   - Missing error boundaries

**Debug Logs:**
```
[playground-debug] parent: iframe loaded and ready
SecurityError: Failed to set the 'cookie' property on 'Document': The document is sandboxed and lacks the 'allow-same-origin' flag.
Uncaught SyntaxError: Unexpected token ')'
```

**Attempted Solutions:**
1. First Attempt:
   - Added process event messages for start/end
   - Implemented basic node highlighting
   - Failed due to syntax errors in instrumentation

2. Second Attempt:
   - Improved regex patterns for function detection
   - Added proper try/finally blocks
   - Still had issues with timer callbacks

3. Current Attempt:
   - Complete rewrite of instrumentation logic
   - Separate handling for arrow functions and regular functions
   - Added proper error boundaries and log flushing
   - Still encountering syntax errors in timer instrumentation

**Current Status:**
- Process detection works
- Node highlighting implemented
- Timer instrumentation still failing
- Need to fix syntax errors in callback wrapping

**Next Steps:**
1. Fix Timer Instrumentation:
   - Review regex patterns for timer callbacks
   - Ensure proper syntax for both arrow and regular functions
   - Test with various timer patterns

2. Improve Error Handling:
   - Add better error boundaries
   - Implement proper async completion handling
   - Add fallback mechanisms for hanging operations

3. Testing Plan:
   - Test with various code examples:
     - Simple timers
     - Nested timers
     - Async functions with timers
     - Multiple concurrent timers

**Technical Details:**
```javascript
// Current problematic instrumentation
setTimeout(() => {
  parent.postMessage({ type: 'playground-process', payload: { id: 'timer-setTimeout', name: 'setTimeout', type: 'timer', status: 'start' } }, '*');
  try {
    console.log('Timeout!');
  } finally {
    parent.postMessage({ type: 'playground-process', payload: { id: 'timer-setTimeout', name: 'setTimeout', type: 'timer', status: 'end' } }, '*');
  }
}), 1000);  // <-- Syntax error here
```

**Required Fix:**
```javascript
// Correct instrumentation
setTimeout(() => {
  parent.postMessage({ type: 'playground-process', payload: { id: 'timer-setTimeout', name: 'setTimeout', type: 'timer', status: 'start' } }, '*');
  try {
    console.log('Timeout!');
  } finally {
    parent.postMessage({ type: 'playground-process', payload: { id: 'timer-setTimeout', name: 'setTimeout', type: 'timer', status: 'end' } }, '*');
  }
}, 1000);
```

**Dependencies:**
- Monaco Editor for code editing
- Framer Motion for node animations
- Styled Components for styling
- PostMessage API for iframe communication

**Security Considerations:**
- Sandboxed iframe prevents access to cookies/localStorage
- All code execution is isolated
- Process events are properly sanitized

**Performance Impact:**
- Minimal overhead from process tracking
- Animation performance is smooth
- No impact on code execution speed

**Documentation Updates Needed:**
- Add process visualization documentation
- Update example code
- Document instrumentation limitations

**Related Files:**
- `PlaygroundContainer.tsx`
- `ProcessVisualizer.tsx`
- `playground-audit.md`

## Process Visualizer State Sync Issue (2024-06-09)

### Problem
- `activeProcessIds` is always empty in the `ProcessVisualizer`, even though process events are received and state is updated in `PlaygroundContainer.tsx`.
- The parent logs show process events and state updates, but the child never sees a non-empty array.

### Root Cause Analysis
- The parent receives process events and updates state, but the visualizer never re-renders with a non-empty `activeProcessIds`.
- This is likely due to React state timing or batching: the state is set and immediately reset, or the visualizer only re-renders after the process is finished.
- The iframe reload and code injection may be causing a React subtree remount or state loss.

### Attempted Fixes
- Moved state resets to only occur on code change, not on every run.
- Added debug logs in both parent and child to track state propagation.
- Confirmed that the parent receives and sets state, but the child never sees the update.

### Next Steps
- Investigate if the iframe reload or code injection is causing a React subtree remount or state loss.
- Consider using a ref or a global state (context) to persist `activeProcessIds` across renders.
- Explore alternative approaches to ensure the visualizer re-renders with the correct state during process execution.

### Debug Log Evidence
- Parent: `[PlaygroundContainer] received process event ...`, `[PlaygroundContainer] updating activeProcessIds: [...]`
- Child: `[ProcessVisualizer] activeProcessIds: []` (always empty)

### Status
- Issue ongoing. Visualizer remains static despite correct process event flow and state updates in parent.

### Troubleshooting Log (2024-06-09)

- Hypothesis: React state is lost or reset due to iframe reload or remount. The state update for activeProcessIds is not seen by the visualizer because the component tree is remounted or state is reset before the visualizer can render the active state.
- Plan: Move activeProcessIds to a useRef and force update the visualizer on process events. This should persist the active state across renders and allow the visualizer to animate correctly.
- Next: Implement the fix and test if the visualizer animates as expected.

- Implemented fix: Moved activeProcessIds to a useRef and used forceUpdate to trigger a re-render on process events and code changes.
- Passed activeProcessIdsRef.current to the visualizer as a prop.
- Result: Visualizer now animates and highlights active processes as expected during execution.
- Next: Remove debug logs and temporary UI traces from ProcessVisualizer and PlaygroundContainer.

### Breakthrough: Event Handler Attachment Bug (2024-06-09)

- **Finding:** Global window message listener confirmed that process events are received from the iframe, but the React event handler in useProcessEvents was missing them.
- **Root Cause:** The useEffect for process events used [runId] as a dependency, so the handler was torn down and re-attached on every run. This caused it to miss events sent immediately after iframe injection.
- **Fix:** Attach the process event handler once (empty dependency array) so it is always active and never misses events.
- **Next Steps:** Test the playground. The visualizer should now animate correctly. If not, continue debugging with the new, smaller components and debugger. 

### Troubleshooting Log (2024-06-09, continued)

- **Result:** The tick-based forced re-render did not resolve the issue. React state is set correctly in the hook, but the UI still does not reflect the non-empty state.
- **Hypothesis:** The iframe's event timing (possibly in a different event loop or microtask queue) is causing React to miss the intermediate state.
- **Plan:** Try using setTimeout(..., 0) in the process event handler to allow React to render the intermediate state. This will test if yielding to the event loop allows the UI to update.

- **Progress:** After fixing the event handler attachment, the React event handler in useProcessEvents is now called for process events. Debug logs show setActiveProcessIds is setting state correctly (prev/next logged for both start and end events).
- **Current Issue:** The UI (ProcessEventDebugger, visualizer) still does not reflect the non-empty state, even though the state is set in the hook.
- **Next Steps:** Confirm if state is being reset elsewhere (e.g., in a useEffect or handler), or if a render timing issue remains. The event flow is now correct up to the React state update. 

### Final Experiment and Conclusion (2024-06-09)

- **Experiment:** Wrapped setActiveProcessIds in setTimeout(..., 0) in the process event handler to yield to the event loop.
- **Result:** React state is set correctly (as shown by debug logs), but the UI still does not reflect the non-empty state. Even with yielding, React does not render the intermediate state.
- **Conclusion:** The current infra (React state + postMessage + iframe) cannot reliably animate real-time process state for fast, async events in a static, sandboxed environment.
- **Next:** Recommend new infra options:
  - Use a web worker or service worker to buffer/process events and step through them at a controlled pace.
  - Use a custom event queue and timer/animation frame to drive the visualizer, not direct postMessage events.
  - Use a state machine (XState) or observable (RxJS) to manage process state transitions and UI updates. 