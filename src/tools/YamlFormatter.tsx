import { useState, useEffect } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { Trash2 } from 'lucide-react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

// --- Minimal YAML parser (subset: mappings, sequences, scalars, quoted strings, multi-line) ---
function parseYaml(text: string): unknown {
  const lines = text.split('\n')
  let pos = 0

  function peekLine(): string | undefined { return lines[pos] }
  function currentIndent(line: string): number {
    let i = 0
    while (i < line.length && line[i] === ' ') i++
    return i
  }

  function isBlankOrComment(line: string): boolean {
    return /^\s*(#.*)?$/.test(line)
  }

  function skipBlanks() {
    while (pos < lines.length && isBlankOrComment(lines[pos]!)) pos++
  }

  function parseScalar(raw: string): unknown {
    const s = raw.trim()
    if (s === 'null' || s === '~' || s === '') return null
    if (s === 'true' || s === 'yes' || s === 'on') return true
    if (s === 'false' || s === 'no' || s === 'off') return false
    if (/^-?(\d+)$/.test(s)) return parseInt(s, 10)
    if (/^-?\d*\.\d+$/.test(s) || /^-?\d+[eE][+-]?\d+$/.test(s)) return parseFloat(s)
    // quoted strings
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\').replace(/\\"/g, '"')
    }
    return s
  }

  function parseBlock(baseIndent: number): unknown {
    skipBlanks()
    if (pos >= lines.length) return null
    const line = lines[pos]!
    const indent = currentIndent(line)
    if (indent < baseIndent) return undefined

    // detect sequence
    if (/^\s*-\s/.test(line) || /^\s*-\s*$/.test(line)) {
      return parseSequence(indent)
    }
    // detect mapping
    if (/^\s*\S[^:]*:(\s|$)/.test(line) || /^\s*"[^"]*"\s*:/.test(line) || /^\s*'[^']*'\s*:/.test(line)) {
      return parseMapping(indent)
    }
    // scalar block
    pos++
    return parseScalar(line.slice(indent))
  }

  function parseSequence(seqIndent: number): unknown[] {
    const arr: unknown[] = []
    while (pos < lines.length) {
      skipBlanks()
      if (pos >= lines.length) break
      const line = lines[pos]!
      const indent = currentIndent(line)
      if (indent < seqIndent) break
      if (indent > seqIndent) break
      if (!/^\s*-/.test(line)) break
      pos++
      const rest = line.slice(indent + 1).trimStart()
      if (rest === '') {
        // value on next lines
        const val = parseBlock(seqIndent + 2)
        arr.push(val === undefined ? null : val)
      } else if (/^\s*\S[^:]*:(\s|$)/.test(rest) || rest.includes(': ')) {
        // inline mapping: parse as if it's a mapping starting here
        const subLines: string[] = [' '.repeat(seqIndent + 2) + rest]
        // collect continuation lines
        while (pos < lines.length) {
          const next = lines[pos]!
          if (isBlankOrComment(next)) { pos++; continue }
          const ni = currentIndent(next)
          if (ni <= seqIndent) break
          subLines.push(next)
          pos++
        }
        const saved = lines.splice(0, lines.length, ...subLines)
        const savedPos = pos
        pos = 0
        const val = parseBlock(seqIndent + 2)
        lines.splice(0, lines.length, ...saved)
        pos = savedPos
        arr.push(val)
      } else {
        arr.push(parseScalar(rest))
      }
    }
    return arr
  }

  function parseMapping(mapIndent: number): Record<string, unknown> {
    const obj: Record<string, unknown> = {}
    while (pos < lines.length) {
      skipBlanks()
      if (pos >= lines.length) break
      const line = lines[pos]!
      const indent = currentIndent(line)
      if (indent < mapIndent) break
      if (indent > mapIndent) break
      // match key: value
      const m = line.match(/^(\s*)((?:"[^"]*"|'[^']*'|[^:]+?))\s*:([ \t](.*))?$/)
      if (!m) break
      pos++
      let key = m[2]!.trim()
      if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1)
      }
      const inlineVal = (m[4] ?? '').trim()
      if (inlineVal === '' || inlineVal === null || inlineVal === undefined) {
        // value on next lines
        skipBlanks()
        if (pos < lines.length) {
          const nextLine = lines[pos]!
          const nextIndent = currentIndent(nextLine)
          if (nextIndent > mapIndent) {
            const val = parseBlock(nextIndent)
            obj[key] = val === undefined ? null : val
          } else {
            obj[key] = null
          }
        } else {
          obj[key] = null
        }
      } else if (inlineVal === '|' || inlineVal === '>') {
        // block scalar
        const blockLines: string[] = []
        const chomp = inlineVal
        while (pos < lines.length) {
          const bl = lines[pos]!
          if (isBlankOrComment(bl) && blockLines.length === 0) { pos++; continue }
          const bi = currentIndent(bl)
          if (bi <= mapIndent && bl.trim() !== '') break
          blockLines.push(bl.slice(mapIndent + 2))
          pos++
        }
        obj[key] = chomp === '|' ? blockLines.join('\n') : blockLines.join(' ')
      } else {
        obj[key] = parseScalar(inlineVal)
      }
    }
    return obj
  }

  skipBlanks()
  if (pos >= lines.length) return null
  return parseBlock(0)
}

// --- YAML serializer ---
function serializeYaml(value: unknown, indent: number, level = 0): string {
  const pad = ' '.repeat(indent * level)
  const padChild = ' '.repeat(indent * (level + 1))

  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') {
    if (value === '') return "''"
    if (/[\n:#{}\[\],&*?|<>=!%@`]/.test(value) || /^\s|\s$/.test(value) ||
        value === 'true' || value === 'false' || value === 'null' || value === '~' ||
        /^[-\d]/.test(value)) {
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
    }
    return value
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return value.map(item => {
      const serialized = serializeYaml(item, indent, level + 1)
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const lines = serialized.split('\n')
        return `${pad}- ${lines[0]!.slice(padChild.length)}\n${lines.slice(1).join('\n')}`
      }
      return `${pad}- ${serialized.trim()}`
    }).join('\n')
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return entries.map(([k, v]) => {
      const keyStr = /[\s:#{}\[\],&*?|<>=!%@`]/.test(k) ? `"${k}"` : k
      if (v === null || v === undefined) return `${pad}${keyStr}: null`
      if (typeof v === 'object') {
        const child = serializeYaml(v, indent, level + 1)
        if (child === '[]' || child === '{}') return `${pad}${keyStr}: ${child}`
        return `${pad}${keyStr}:\n${child}`
      }
      return `${pad}${keyStr}: ${serializeYaml(v, indent, level)}`
    }).join('\n')
  }
  return String(value)
}

function countKeys(value: unknown): number {
  if (value === null || typeof value !== 'object') return 0
  if (Array.isArray(value)) return value.reduce((sum, v) => sum + countKeys(v), 0)
  const obj = value as Record<string, unknown>
  return Object.keys(obj).length + Object.values(obj).reduce((sum: number, v) => sum + countKeys(v), 0)
}

export default function YamlFormatter() {
  const [input, setInput] = usePersistentState('tool-yaml-input', 'name: my-app\nversion: 1.0.0\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - "80:80"\n  db:\n    image: postgres:15\n    environment:\n      POSTGRES_DB: mydb')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)
  const [stats, setStats] = useState<{ lines: number; keys: number } | null>(null)

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); setStats(null); return }
    try {
      const parsed = parseYaml(input)
      const formatted = serializeYaml(parsed, indent)
      setOutput(formatted)
      setError('')
      setStats({
        lines: formatted.split('\n').length,
        keys: countKeys(parsed),
      })
    } catch (e) {
      const msg = (e as Error).message
      // try to get line hint
      const lineMatch = msg.match(/line\s+(\d+)/i)
      setError(lineMatch ? `Parse error at line ${lineMatch[1]}: ${msg}` : `Parse error: ${msg}`)
      setOutput('')
      setStats(null)
    }
  }, [input, indent])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Indent:</span>
          {[2, 4].map(v => (
            <button
              key={v}
              onClick={() => setIndent(v)}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${indent === v
                ? 'bg-primary-100 dark:bg-primary-900 border-primary-400 text-primary-700 dark:text-primary-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
            >
              {v} spaces
            </button>
          ))}
        </div>
        <button
          onClick={() => { setInput(''); setOutput(''); setError(''); setStats(null) }}
          className="btn-ghost flex items-center gap-1 text-xs ml-auto"
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input YAML</label>
          </div>
          <FileDropTextarea
            className="h-80"
            placeholder="name: John Doe&#10;age: 30&#10;roles:&#10;  - admin&#10;  - user"
            value={input}
            onChange={setInput}
            accept=".yaml,.yml,text/plain,text/*"
          />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Formatted Output</label>
            <CopyButton text={output} toast="YAML copied" />
          </div>
          <textarea
            className="tool-textarea-output h-80"
            readOnly
            value={output}
            placeholder="Formatted YAML will appear here..."
          />
        </div>
      </div>

      {error && (
        <p className="tool-msg tool-msg--error">
          {error}
        </p>
      )}

      {stats && !error && (
        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>Lines: <strong className="text-gray-700 dark:text-gray-300">{stats.lines}</strong></span>
          <span>Keys (deep): <strong className="text-gray-700 dark:text-gray-300">{stats.keys}</strong></span>
          <span className="text-green-600 dark:text-green-400 font-medium">Valid YAML</span>
        </div>
      )}
    </div>
  )
}
