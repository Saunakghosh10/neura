export function disableReactDevTools() {
  // Make sure we're in the browser environment
  if (typeof window === 'undefined') return

  // Define the key used by React Developer Tools
  const key = '__REACT_DEVTOOLS_GLOBAL_HOOK__'

  // Type declaration for the window object with React DevTools hook
  interface WindowWithDevTools extends Window {
    [key: string]: any;
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      renderers: Map<any, any>;
      supportsFiber: boolean;
      inject: (renderer: any) => void;
      [key: string]: any;
    };
  }

  // Cast window to our custom interface
  const win = window as WindowWithDevTools

  // Check if the hook exists
  if (win.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    // Instead of redefining, modify the existing hook
    Object.keys(win.__REACT_DEVTOOLS_GLOBAL_HOOK__).forEach((prop) => {
      if (prop === 'renderers') {
        // Clear any existing renderers
        win.__REACT_DEVTOOLS_GLOBAL_HOOK__!.renderers.clear()
      } else {
        // Replace other properties with no-op functions
        const value = win.__REACT_DEVTOOLS_GLOBAL_HOOK__![prop]
        if (typeof value === 'function') {
          win.__REACT_DEVTOOLS_GLOBAL_HOOK__![prop] = Function.prototype
        }
      }
    })

    // Disable injection
    win.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = () => {}
  }
} 