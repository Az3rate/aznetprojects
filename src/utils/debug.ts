
let isDebugEnabled = true;

export const debug = {
  enable: () => {
    isDebugEnabled = true;
    //console.log('Debug mode enabled');
  },
  disable: () => {
    isDebugEnabled = false;
    //console.log('Debug mode disabled');
  },
  isEnabled: () => isDebugEnabled,
  log: (message: string, data?: any) => {
    if (isDebugEnabled) {
      //console.log(`[DEBUG] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    if (isDebugEnabled) {
      console.error(`[DEBUG ERROR] ${message}`, error || '');
    }
  }
}; 