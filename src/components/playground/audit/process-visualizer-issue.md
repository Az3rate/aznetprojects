# Process Visualizer Highlighting Issue Audit

## Problem Statement
- Only async function nodes (e.g., `fetchData`) are highlighted in the process visualizer.
- Function call nodes (e.g., `fetchData() call`, `sum() call`) are not highlighted, even though they appear in the process tree.
- For sync functions (e.g., `sum`), only the function node is present and highlighted, not the call node.

## Investigation Steps
1. **Process Tree Structure**
   - Confirmed that both function and call nodes are present in the process tree for both async and sync functions.
   - Example tree for async:
     ```json
     [
       { "id": "fn-fetchData", "name": "fetchData", "type": "async function", ... },
       { "id": "call-fetchData-1", "name": "fetchData() call", "type": "function call", "children": [ ... ] }
     ]
     ```
   - Example tree for sync:
     ```json
     [
       { "id": "fn-sum", "name": "sum", "type": "function", ... },
       { "id": "call-sum-1", "name": "sum() call", "type": "function call", "children": [ ... ] }
     ]
     ```
2. **Instrumentation**
   - Instrumentation emits process events for function nodes, but unclear if it emits for call nodes.
   - Need to confirm if both `call-*` and `fn-*` IDs are being emitted in process events.
3. **Visualizer**
   - Visualizer highlights nodes based on `activeProcessIds`.
   - Only function nodes are ever highlighted, not call nodes.

## Next Steps
- [ ] Add debug logs to instrumentation to confirm which IDs are being emitted in process events.
- [ ] Add debug logs to process event handler to show which IDs are added to `activeProcessIds`.
- [ ] Add debug logs to visualizer to show which node IDs are being highlighted.

## Debug Logs & Changes
- Place all relevant debug logs and code changes here as the investigation continues.

--- 