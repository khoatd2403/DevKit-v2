import { useState, useEffect } from 'react'

const KEY = 'devkit-explored'

export function useToolStats() {
  const [explored, setExplored] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(explored))
  }, [explored])

  const markExplored = (id: string) => {
    setExplored(prev => prev.includes(id) ? prev : [...prev, id])
  }

  return { explored, markExplored, count: explored.length }
}
