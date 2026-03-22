import { useState, useEffect } from 'react'

const KEY = 'devkit-recent'
const MAX = 8

export function useRecentTools() {
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]')
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(recent))
  }, [recent])

  const addRecent = (id: string) => {
    setRecent(prev => {
      const filtered = prev.filter(x => x !== id)
      return [id, ...filtered].slice(0, MAX)
    })
  }

  return { recent, addRecent }
}
