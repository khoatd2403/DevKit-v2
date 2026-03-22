import { createContext, useContext, useState, useEffect } from 'react'

interface LiveModeContextType {
  liveMode: boolean
  setLiveMode: (v: boolean) => void
}

const LiveModeContext = createContext<LiveModeContextType>({ liveMode: false, setLiveMode: () => {} })

export function LiveModeProvider({ children }: { children: React.ReactNode }) {
  const [liveMode, setLiveMode] = useState(() =>
    localStorage.getItem('devkit-live-mode') === 'true'
  )

  useEffect(() => {
    localStorage.setItem('devkit-live-mode', String(liveMode))
  }, [liveMode])

  useEffect(() => {
    const handler = () => setLiveMode(v => !v)
    window.addEventListener('devkit:toggle-live', handler)
    return () => window.removeEventListener('devkit:toggle-live', handler)
  }, [])

  return <LiveModeContext.Provider value={{ liveMode, setLiveMode }}>{children}</LiveModeContext.Provider>
}

export const useLiveMode = () => useContext(LiveModeContext)
