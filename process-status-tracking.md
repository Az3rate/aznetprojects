# Process Status Tracking Audit

## Expected Flow
1. User code is instrumented to send process events via `parent.postMessage({ type: 'playground-process', ... })`.
2. The parent (Playground) listens for these messages and updates process status in Zustand.

## Current Implementation
- `useProcessEvents.ts` listens for `postMessage` events of type `'playground-process'` on `window`.
- When a message of type `'playground-process'` is received, it updates the process status in Zustand using `updateProcess`.
- Instrumentation now uses the same process IDs as the process tree/Zustand.
- `nodeIdSet` is reset on every instrumentation run to avoid ID drift.

## Result
- **ISSUE:** Process status tracking only works on the first run. If the user switches to another code example and runs again, process status is not tracked, but the code executes successfully.
- This suggests a mismatch between the process tree and the instrumented code after switching examples, likely due to memoization or stale state.
- Further investigation and code update is required to ensure IDs and instrumentation are always in sync for every code change/run.

## Action Items
- [x] Add `window.addEventListener('message', ...)` for `'playground-process'` in `useProcessEvents.ts`.
- [x] Update process status in Zustand when these messages are received.
- [x] Remove or refactor unused custom DOM event listeners.
- [x] Audit the code instrumentation to ensure process events are sent with correct IDs.
- [x] Refactor instrumentation to use the same process IDs as the process tree/Zustand.
- [x] Reset nodeIdSet on every instrumentation run.
- [ ] Fix memoization or state issues so that process IDs and instrumentation are always in sync for every run, including after switching code examples.

**Status: INTERMITTENT — Further investigation and code update required.**

## Latest Result (after using a ref for the process list)
- The visualizer still does not highlight or change process status to running, even though debug output shows process events for all types.
- The code runs and events are emitted, but Zustand process status is not updated.

## Next Step
- Add debug output to updateProcess to verify if it is being called and if the process list is being updated as expected. 