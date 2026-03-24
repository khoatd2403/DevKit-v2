import { useState, useMemo } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import FileDropTextarea from '../components/FileDropTextarea'

export default function RegexTester() {
  const [pattern, setPattern] = usePersistentState('tool-regex-pattern', '\\b[A-Z][a-z]+\\b')
  const [flags, setFlags] = useState('g')
  const [testString, setTestString] = usePersistentState('tool-regex-input', 'Hello World, my Name is Alice and I live in New York.')
  const [error, setError] = useState('')

  const result = useMemo(() => {
    if (!pattern || !testString) return null
    try {
      const re = new RegExp(pattern, flags)
      setError('')
      const matches: { index: number; length: number; groups: string[] }[] = []
      let m
      if (flags.includes('g')) {
        while ((m = re.exec(testString)) !== null) {
          matches.push({ index: m.index, length: m[0].length, groups: [...m] })
          if (m[0].length === 0) re.lastIndex++
        }
      } else {
        m = re.exec(testString)
        if (m) matches.push({ index: m.index, length: m[0].length, groups: [...m] })
      }
      return matches
    } catch (e) {
      setError((e as Error).message)
      return null
    }
  }, [pattern, flags, testString])

  // Build highlighted text
  const highlighted = useMemo(() => {
    if (!result || result.length === 0) return null
    const parts: { text: string; match: boolean }[] = []
    let pos = 0
    for (const { index, length } of result) {
      if (index > pos) parts.push({ text: testString.slice(pos, index), match: false })
      parts.push({ text: testString.slice(index, index + length), match: true })
      pos = index + length
    }
    if (pos < testString.length) parts.push({ text: testString.slice(pos), match: false })
    return parts
  }, [result, testString])

  const FLAG_OPTIONS = ['g', 'i', 'm', 's', 'u']

  const toggleFlag = (f: string) => {
    setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)
  }

  return (
    <div className="space-y-4">
      {/* Pattern */}
      <div>
        <label className="tool-label block mb-1">Regular Expression</label>
        <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
          <span className="pl-3 text-gray-400 text-lg select-none">/</span>
          <input
            type="text"
            className="flex-1 px-2 py-2 bg-transparent font-mono text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
            placeholder="([A-Z]\w+)"
            value={pattern}
            onChange={e => setPattern(e.target.value)}
          />
          <span className="text-gray-400 text-lg select-none">/</span>
          <input
            type="text"
            className="w-16 px-2 py-2 bg-transparent font-mono text-sm text-gray-800 dark:text-gray-200 focus:outline-none border-l border-gray-200 dark:border-gray-700"
            placeholder="gi"
            value={flags}
            onChange={e => setFlags(e.target.value)}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* Flags */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 dark:text-gray-400">Flags:</span>
        {FLAG_OPTIONS.map(f => (
          <button key={f} onClick={() => toggleFlag(f)}
            className={`w-7 h-7 font-mono text-sm rounded border transition-colors ${flags.includes(f) ? 'bg-primary-100 dark:bg-primary-900 border-primary-400 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400'}`}
            title={{ g: 'Global', i: 'Case insensitive', m: 'Multiline', s: 'Dot all', u: 'Unicode' }[f]}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Test string */}
      <div>
        <div className="tool-output-header">
          <label className="tool-label">Test String</label>
          {result && <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">{result.length} match{result.length !== 1 ? 'es' : ''}</span>}
        </div>
        <FileDropTextarea className="h-32" placeholder="Enter text to test against the pattern..." value={testString} onChange={setTestString} accept="text/*" />
      </div>

      {/* Highlighted */}
      {highlighted && (
        <div>
          <label className="tool-label block mb-1">Matches Highlighted</label>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 font-mono text-sm whitespace-pre-wrap break-all text-gray-700 dark:text-gray-300">
            {highlighted.map((p, i) =>
              p.match
                ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-gray-100 rounded px-0.5">{p.text}</mark>
                : <span key={i}>{p.text}</span>
            )}
          </div>
        </div>
      )}

      {/* Match details */}
      {result && result.length > 0 && (
        <div>
          <label className="tool-label block mb-1">Match Details</label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {result.map((m, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm">
                <span className="text-xs text-gray-400 w-6">#{i + 1}</span>
                <span className="font-mono bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-1.5 rounded">{m.groups[0]}</span>
                <span className="text-xs text-gray-400">index: {m.index}</span>
                {m.groups.slice(1).length > 0 && (
                  <span className="text-xs text-gray-400">groups: {m.groups.slice(1).join(', ')}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
