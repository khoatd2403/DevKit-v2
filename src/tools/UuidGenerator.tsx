import { useState } from 'react'
import CopyButton from '../components/CopyButton'
import { RefreshCw, Copy, Check } from 'lucide-react'

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

function uuidv7() {
  const now = BigInt(Date.now())
  const randA = BigInt(Math.floor(Math.random() * 0xFFF))
  const randB = BigInt(Math.floor(Math.random() * 0x3FFFFFFFFFFFFFFF))
  const ts = now.toString(16).padStart(12, '0')
  const a = randA.toString(16).padStart(3, '0')
  const b = ((randB | BigInt('0x8000000000000000')) & BigInt('0xBFFFFFFFFFFFFFFF')).toString(16).padStart(16, '0')
  return `${ts.slice(0, 8)}-${ts.slice(8)}-7${a}-${b.slice(0, 4)}-${b.slice(4)}`
}

export default function UuidGenerator() {
  const [version, setVersion] = useState<'v4' | 'v7'>('v4')
  const [count, setCount] = useState(5)
  const [uuids, setUuids] = useState<string[]>([])
  const [copiedAll, setCopiedAll] = useState(false)

  const generate = () => {
    const fn = version === 'v4' ? uuidv4 : uuidv7
    setUuids(Array.from({ length: count }, fn))
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="tool-tabs">
          {(['v4', 'v7'] as const).map(v => (
            <button key={v} onClick={() => setVersion(v)}
              className={`tool-tab ${version === v ? 'active' : ''}`}>
              UUID {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Count:</label>
          <select value={count} onChange={e => setCount(+e.target.value)} className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300">
            {[1, 5, 10, 20, 50].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <button onClick={generate} className="btn-primary flex items-center gap-2">
          <RefreshCw size={14} /> Generate
        </button>
      </div>

      {uuids.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">{uuids.length} UUIDs generated</span>
            <button onClick={copyAll} className="btn-ghost flex items-center gap-1 text-xs">
              {copiedAll ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copiedAll ? 'Copied!' : 'Copy All'}
            </button>
          </div>
          <div className="space-y-1.5">
            {uuids.map((id, i) => (
              <div key={i} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300 flex-1">{id}</span>
                <CopyButton text={id} toast="UUID copied" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p><strong className="text-gray-700 dark:text-gray-300">UUID v4:</strong> Random — 122 bits of randomness. Most common choice.</p>
        <p><strong className="text-gray-700 dark:text-gray-300">UUID v7:</strong> Time-ordered — Unix timestamp + random. Better for database indexing.</p>
      </div>
    </div>
  )
}
