import { useState } from 'react'
import FileDropTextarea from '../components/FileDropTextarea'

function diffObjects(a: unknown, b: unknown, path = ''): string[] {
  const results: string[] = []
  if (JSON.stringify(a) === JSON.stringify(b)) return results

  if (typeof a !== typeof b || a === null || b === null) {
    results.push(`~ ${path || 'root'}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`)
    return results
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.max(a.length, b.length)
    for (let i = 0; i < len; i++) {
      if (i >= a.length) results.push(`+ ${path}[${i}]: ${JSON.stringify(b[i])}`)
      else if (i >= b.length) results.push(`- ${path}[${i}]: ${JSON.stringify(a[i])}`)
      else results.push(...diffObjects(a[i], b[i], `${path}[${i}]`))
    }
    return results
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>
    const bObj = b as Record<string, unknown>
    const keys = new Set([...Object.keys(aObj), ...Object.keys(bObj)])
    for (const key of keys) {
      const p = path ? `${path}.${key}` : key
      if (!(key in aObj)) results.push(`+ ${p}: ${JSON.stringify(bObj[key])}`)
      else if (!(key in bObj)) results.push(`- ${p}: ${JSON.stringify(aObj[key])}`)
      else results.push(...diffObjects(aObj[key], bObj[key], p))
    }
    return results
  }

  results.push(`~ ${path}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`)
  return results
}

export default function JsonDiff() {
  const [left, setLeft] = useState('{"name":"Alice","age":28,"city":"NYC"}')
  const [right, setRight] = useState('{"name":"Alice","age":29,"city":"Boston","job":"Engineer"}')
  const [diffs, setDiffs] = useState<string[]>([])
  const [error, setError] = useState('')
  const [compared, setCompared] = useState(false)

  const compare = () => {
    try {
      const a = JSON.parse(left)
      const b = JSON.parse(right)
      setDiffs(diffObjects(a, b))
      setError('')
      setCompared(true)
    } catch (e) {
      setError((e as Error).message)
      setCompared(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={compare} className="btn-primary">Compare</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">JSON A (Original)</label>
          <FileDropTextarea className="h-64" placeholder='{"a":1,"b":2}' value={left} onChange={setLeft} accept=".json,text/plain,text/*" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">JSON B (Modified)</label>
          <FileDropTextarea className="h-64" placeholder='{"a":1,"b":3,"c":4}' value={right} onChange={setRight} accept=".json,text/plain,text/*" />
        </div>
      </div>
      {error && <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">{error}</div>}
      {compared && (
        <div className="bg-gray-900 dark:bg-black rounded-lg p-4 font-mono text-sm">
          {diffs.length === 0 ? (
            <p className="text-green-400">✅ No differences found. JSON objects are identical.</p>
          ) : (
            diffs.map((line, i) => (
              <div key={i} className={`py-0.5 ${line.startsWith('+') ? 'text-green-400' : line.startsWith('-') ? 'text-red-400' : 'text-yellow-400'}`}>
                {line}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
