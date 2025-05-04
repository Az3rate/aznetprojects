export function logDebug(message, data = null) {
  const stack = new Error().stack.split('\n')[2].trim();
  const functionName = stack.match(/at (.*?) /) ? stack.match(/at (.*?) /)[1] : 'anonymous';
  console.log(`[DEBUG] ${functionName}: ${message}`);
  if (data !== null) {
    console.log('[DEBUG DATA]', data);
  }
  console.log('[DEBUG STACK]', stack);
} 