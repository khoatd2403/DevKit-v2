import { useState, useEffect, useRef } from 'react'

/**
 * A persistent state hook that survives page reloads and respects key changes.
 */
export function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Use a ref to track the current key so we don't save old state to a new key during transition
  const keyRef = useRef(key);
  
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  // 1. Sync state when the key changes (e.g. navigating between tools)
  useEffect(() => {
    if (key !== keyRef.current) {
      keyRef.current = key;
      try {
        const stored = localStorage.getItem(key)
        setState(stored !== null ? JSON.parse(stored) : initialValue)
      } catch {
        setState(initialValue)
      }
    }
  }, [key, initialValue])

  // 2. Save state to localStorage only for the CORRECT key
  useEffect(() => {
    if (key === keyRef.current) {
      try {
        localStorage.setItem(key, JSON.stringify(state))
      } catch {}
    }
  }, [key, state])

  return [state, setState]
}
