import { useEffect } from 'react';

/**
 * Hook to make tool state shareable via the ToolPage header.
 * 
 * @param state - Current state value
 * @param setState - Function to update state
 */
export function useShareableState<T>(state: T, setState: (val: T) => void) {
  useEffect(() => {
    // 1. Respond with current state when requested
    const handleRequest = () => {
      window.dispatchEvent(new CustomEvent('devkit:state-provided', {
        detail: { state }
      }));
    };

    // 2. Load state when provided by URL
    const handleLoad = (e: any) => {
      if (e.detail?.state) {
        try {
          const loaded = typeof state === 'string' 
            ? e.detail.state 
            : JSON.parse(e.detail.state);
          setState(loaded);
        } catch (err) {
          console.error('Failed to load shared state:', err);
        }
      }
    };

    window.addEventListener('devkit:request-state', handleRequest);
    window.addEventListener('devkit:load-state', handleLoad);

    return () => {
      window.removeEventListener('devkit:request-state', handleRequest);
      window.removeEventListener('devkit:load-state', handleLoad);
    };
  }, [state, setState]);
}
