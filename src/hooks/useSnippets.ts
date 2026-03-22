import { useState, useEffect } from 'react'

export interface Snippet {
  id: string
  label: string
  content: string
  toolId?: string  // optional: tied to specific tool
  createdAt: number
}

const KEY = 'devkit-snippets'

export function useSnippets(toolId?: string) {
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(snippets))
  }, [snippets])

  const save = (label: string, content: string) => {
    const s: Snippet = { id: crypto.randomUUID(), label, content, toolId, createdAt: Date.now() }
    setSnippets(prev => [s, ...prev])
    return s
  }

  const remove = (id: string) => setSnippets(prev => prev.filter(s => s.id !== id))

  const update = (id: string, label: string) =>
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, label } : s))

  // tool-specific snippets first, then global
  const filtered = toolId
    ? [...snippets.filter(s => s.toolId === toolId), ...snippets.filter(s => !s.toolId)]
    : snippets

  return { snippets: filtered, save, remove, update }
}
