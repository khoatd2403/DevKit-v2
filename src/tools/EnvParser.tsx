import { useState, useMemo } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { Copy, Check, RefreshCw } from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'

// ---------------------------------------------------------------------------
// .env → JSON
// ---------------------------------------------------------------------------
function parseEnv(raw: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = raw.split('\n')
  let i = 0

  while (i < lines.length) {
    let line = lines[i]

    // Strip BOM on first line
    if (i === 0) line = line.replace(/^\uFEFF/, '')

    // Blank or comment
    const trimmed = line.trimStart()
    if (!trimmed || trimmed.startsWith('#')) { i++; continue }

    // Strip optional leading `export `
    const stripped = trimmed.replace(/^export\s+/, '')

    // Key = value
    const eqIdx = stripped.indexOf('=')
    if (eqIdx === -1) { i++; continue }

    const key = stripped.slice(0, eqIdx).trim()
    let value = stripped.slice(eqIdx + 1)

    // Multiline backslash continuation
    while (value.endsWith('\\') && i + 1 < lines.length) {
      value = value.slice(0, -1) // remove trailing backslash
      i++
      value += lines[i].trimStart()
    }

    // Unquote
    value = unquote(value)

    if (key) result[key] = value
    i++
  }

  return result
}

function unquote(value: string): string {
  const v = value.trim()
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    const inner = v.slice(1, -1)
    // Only expand escape sequences for double-quoted values
    if (v.startsWith('"')) {
      return inner
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
    }
    return inner
  }
  // Inline comment for unquoted values
  const commentIdx = v.indexOf(' #')
  return commentIdx !== -1 ? v.slice(0, commentIdx).trim() : v
}

// ---------------------------------------------------------------------------
// JSON → .env
// ---------------------------------------------------------------------------
function jsonToEnv(raw: string): { output: string; error: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    return { output: '', error: (e as Error).message }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { output: '', error: 'Input must be a flat JSON object.' }
  }

  const obj = parsed as Record<string, unknown>
  const lines: string[] = []

  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) {
      lines.push(`${key}=`)
      continue
    }
    const str = String(val)
    // Quote if contains spaces, special chars or is empty
    const needsQuote = str === '' || /[\s"'\\#]/.test(str)
    lines.push(needsQuote ? `${key}="${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : `${key}=${str}`)
  }

  return { output: lines.join('\n'), error: '' }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
type TabMode = 'env-to-json' | 'json-to-env'

export default function EnvParser() {
  const [tab, setTab] = useState<TabMode>('env-to-json')
  const [input, setInput] = usePersistentState('tool-env-input', 'APP_NAME=MyApp\nAPP_ENV=production\nAPP_PORT=3000\nDB_HOST=localhost\nDB_PORT=5432\nDB_NAME=mydb\nDB_USER=admin\nDB_PASS="secret password"\n# JWT Secret\nJWT_SECRET=mysupersecretkey')
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    if (!input.trim()) return { output: '', error: '', keyCount: 0 }

    if (tab === 'env-to-json') {
      try {
        const obj = parseEnv(input)
        const keyCount = Object.keys(obj).length
        return { output: JSON.stringify(obj, null, 2), error: '', keyCount }
      } catch (e) {
        return { output: '', error: (e as Error).message, keyCount: 0 }
      }
    } else {
      const { output, error } = jsonToEnv(input)
      const keyCount = output ? output.split('\n').filter(l => l.includes('=')).length : 0
      return { output, error, keyCount }
    }
  }, [input, tab])

  const copy = async () => {
    if (!result.output) return
    await navigator.clipboard.writeText(result.output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const swap = () => {
    setTab(prev => (prev === 'env-to-json' ? 'json-to-env' : 'env-to-json'))
    setInput(result.output)
  }

  const tabs: { id: TabMode; label: string }[] = [
    { id: 'env-to-json', label: '.env → JSON' },
    { id: 'json-to-env', label: 'JSON → .env' },
  ]

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-3">
        <div className="tool-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setInput('') }}
              className={`tool-tab ${tab === t.id ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={swap}
          disabled={!result.output}
          title="Swap: use output as new input"
          className="btn-ghost flex items-center gap-1 text-xs disabled:opacity-40"
        >
          <RefreshCw size={13} /> Swap
        </button>
      </div>

      {/* Side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div>
          <label className="label-text block mb-1">
            {tab === 'env-to-json' ? '.env Input' : 'JSON Input'}
          </label>
          <FileDropTextarea
            value={input}
            onChange={setInput}
            accept={tab === 'env-to-json' ? '.env,.txt' : '.json'}
            placeholder={
              tab === 'env-to-json'
                ? '# Database config\nDB_HOST=localhost\nDB_PORT=5432\nDB_NAME="my_database"\nDB_PASS=\'s3cr3t\'\nexport API_KEY=abc123\nMULTI=first\\\n  second'
                : '{\n  "DB_HOST": "localhost",\n  "DB_PORT": "5432",\n  "API_KEY": "abc123"\n}'
            }
            className="h-80"
          />
          {input && (
            <p className="text-xs text-gray-400 mt-1 text-right">
              {input.split('\n').length} lines
            </p>
          )}
        </div>

        {/* Output */}
        <div>
          <div className="tool-output-header">
            <label className="tool-label">
              {tab === 'env-to-json' ? 'JSON Output' : '.env Output'}
              {result.keyCount > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  ({result.keyCount} {result.keyCount === 1 ? 'key' : 'keys'})
                </span>
              )}
            </label>
            <button
              onClick={copy}
              disabled={!result.output}
              className="btn-ghost text-xs flex items-center gap-1 disabled:opacity-40"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {result.error ? (
            <div className="tool-textarea h-80 flex items-start text-red-500 dark:text-red-400 text-sm">
              <span className="mt-0.5">Error: {result.error}</span>
            </div>
          ) : (
            <textarea
              className="tool-textarea-output h-80"
              readOnly
              value={result.output}
              placeholder="Output will appear here…"
            />
          )}
        </div>
      </div>
    </div>
  )
}
