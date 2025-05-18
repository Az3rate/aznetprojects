# Playground Async Code Execution Audit

## Issue Summary
- **Problem:** When running async code (e.g., with `setTimeout` or `async/await`) in the Playground, the terminal output does not display the expected user code output (e.g., from `console.log`).
- **Observed Behavior:**
  - The debug log `[playground-debug] handleRunCode: about to run userAsyncFn` appears in the terminal output.
  - No user code output (e.g., `Fetched!`) is shown, even after the async code completes.
  - The Playground visualizer updates as expected, but the terminal output does not reflect user code logs.
- **Expected Behavior:**
  - When running async code, the terminal output should display all `console.log` output from user code, including delayed or async logs.

## Debug Output
```
[playground-debug] parent: iframe loaded and ready
[playground-debug] parent: injecting code into iframe via srcdoc
[playground-debug] parent: srcdoc set
about:srcdoc:7 Uncaught SyntaxError: Invalid or unexpected token (at about:srcdoc:7:75)
```

## Steps Taken
1. Refactored code execution to use the `Function` constructor for async code, ensuring the overridden `console.log` is respected.
2. Added `[playground-debug]` logs to trace execution and output capture.
3. Performed a hard reset and verified the latest code is running.
4. Switched to iframe sandboxing with code injection via `srcdoc`.
5. Used script tag splitting and added debug logs at every step.

## Troubleshooting Step 3: SyntaxError in srcdoc Injection
- **Action:** Used `<scr` + `ipt>...</scr` + `ipt>` to safely inject the script, removed accidental non-printable characters, and added a debug log at the start of the script.
- **Result:**
  - The browser still throws `Uncaught SyntaxError: Invalid or unexpected token` in the injected script.
  - No `[playground-debug] sandbox: script running` log appears, confirming the script is not executing.
- **Conclusion:**
  - There is still a problematic character or unescaped content in the injected script or user code, causing the syntax error.

## Next Step
- Sanitize user code and the injected script to remove problematic characters (e.g., backticks, unescaped newlines, or template string delimiters).
- Ensure the injected HTML and JavaScript are valid and do not break the script context.
- Add more granular debug logs to isolate the exact line/character causing the error.

## Notes
- The issue appears specific to async code and the Function constructor context.
- All progress and findings will be tracked in this audit file. 