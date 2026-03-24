import { useState } from 'react'
import CopyButton from '../components/CopyButton'
import { RefreshCw } from 'lucide-react'

const CHARSETS: Record<string, string> = {
  'Uppercase': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'Lowercase': 'abcdefghijklmnopqrstuvwxyz',
  'Numbers': '0123456789',
  'Hex': '0123456789abcdef',
  'Symbols': '!@#$%^&*()-_+=[]{}|;:,.<>?',
  'Base62': 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  'Custom': '',
}

export default function RandomString() {
  const [length, setLength] = useState(16)
  const [count, setCount] = useState(5)
  const [preset, setPreset] = useState('Base62')
  const [custom, setCustom] = useState('')
  const [results, setResults] = useState<string[]>([])

  const generate = () => {
    const charset = preset === 'Custom' ? custom : CHARSETS[preset] || ''
    if (!charset) return
    setResults(Array.from({ length: count }, () =>
      Array.from(crypto.getRandomValues(new Uint8Array(length))).map(b => charset[b % charset.length]).join('')
    ))
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Character Set</label>
          <select value={preset} onChange={e => setPreset(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500">
            {Object.keys(CHARSETS).map(k => <option key={k}>{k}</option>)}
          </select>
          {preset === 'Custom' && (
            <input type="text" className="tool-textarea h-auto py-2 mt-2 text-sm font-mono" placeholder="Enter custom characters..." value={custom} onChange={e => setCustom(e.target.value)} />
          )}
          {preset !== 'Custom' && (
            <p className="text-xs text-gray-400 mt-1 font-mono break-all">{CHARSETS[preset]}</p>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Length</label>
              <span className="text-xs font-mono text-primary-600 dark:text-primary-400">{length}</span>
            </div>
            <input type="range" min={1} max={256} value={length} onChange={e => setLength(+e.target.value)} className="w-full accent-primary-600" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Count:</label>
            <select value={count} onChange={e => setCount(+e.target.value)}
              className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300">
              {[1, 5, 10, 20].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <button onClick={generate} className="btn-primary w-full flex items-center justify-center gap-2">
            <RefreshCw size={14} /> Generate
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-1.5">
          {results.map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
              <span className="font-mono text-sm text-gray-700 dark:text-gray-300 flex-1 break-all">{s}</span>
              <CopyButton text={s} toast="String copied" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
