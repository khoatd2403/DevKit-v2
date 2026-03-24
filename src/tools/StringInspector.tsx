import { useState } from 'react'
import FileDropTextarea from '../components/FileDropTextarea'

export default function StringInspector() {
  const [input, setInput] = useState('Hello, World! \ud83c\udf0d')

  const stats = {
    characters: input.length,
    charactersNoSpaces: input.replace(/\s/g, '').length,
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    lines: input ? input.split('\n').length : 0,
    sentences: input.trim() ? input.split(/[.!?]+/).filter(Boolean).length : 0,
    paragraphs: input.trim() ? input.split(/\n\s*\n/).filter(Boolean).length : 0,
    bytes: new TextEncoder().encode(input).length,
    uppercase: (input.match(/[A-Z]/g) || []).length,
    lowercase: (input.match(/[a-z]/g) || []).length,
    digits: (input.match(/\d/g) || []).length,
    spaces: (input.match(/\s/g) || []).length,
    special: (input.match(/[^a-zA-Z0-9\s]/g) || []).length,
  }

  // Character frequency
  const freq = [...input].reduce<Record<string, number>>((acc, c) => {
    acc[c] = (acc[c] || 0) + 1
    return acc
  }, {})
  const topChars = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10)

  return (
    <div className="space-y-4">
      <div>
        <label className="tool-label block mb-1">Input Text</label>
        <FileDropTextarea className="h-40" placeholder="Type or paste text to analyze..." value={input} onChange={setInput} accept="text/*" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{val.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
          </div>
        ))}
      </div>

      {topChars.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Character Frequency (Top 10)</h3>
          <div className="flex flex-wrap gap-2">
            {topChars.map(([c, n]) => (
              <div key={c} className="flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1">
                <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200">{c === ' ' ? '⎵' : c === '\n' ? '↵' : c}</span>
                <span className="text-xs text-gray-500">{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
