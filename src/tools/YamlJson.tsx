import { useState, useEffect } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

type Mode = 'yaml2json' | 'json2yaml'

// ── JSON → YAML ────────────────────────────────────────────────────────────────

const YAML_SPECIAL = /[:#{}\[\]&*!|>'"%@`]/
const YAML_SPECIAL_START = /^[-?]/

function needsQuotes(s: string): boolean {
  if (s === '') return true
  if (YAML_SPECIAL_START.test(s)) return true
  if (YAML_SPECIAL.test(s)) return true
  if (s.includes('\n')) return true
  // bare scalars that look like other types
  if (['true', 'false', 'null', '~'].includes(s.toLowerCase())) return true
  if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s)) return true
  return false
}

function escapeYamlString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
}

function jsonToYaml(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent)

  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)

  if (typeof value === 'string') {
    if (needsQuotes(value)) return `"${escapeYamlString(value)}"`
    return value
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return value
      .map(item => {
        const rendered = jsonToYaml(item, indent + 1)
        // If the rendered value is multi-line (object/array), put it on next line
        if (rendered.includes('\n')) {
          return `${pad}- ${rendered.trimStart()}`
        }
        return `${pad}- ${rendered}`
      })
      .join('\n')
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)
    if (keys.length === 0) return '{}'
    return keys
      .map(key => {
        const keyStr = needsQuotes(key) ? `"${escapeYamlString(key)}"` : key
        const val = obj[key]
        if (val !== null && typeof val === 'object') {
          const rendered = jsonToYaml(val, indent + 1)
          if (rendered === '[]' || rendered === '{}') return `${pad}${keyStr}: ${rendered}`
          return `${pad}${keyStr}:\n${rendered}`
        }
        return `${pad}${keyStr}: ${jsonToYaml(val, indent + 1)}`
      })
      .join('\n')
  }

  return String(value)
}

// ── YAML → JSON ────────────────────────────────────────────────────────────────

function parseScalar(raw: string): unknown {
  const s = raw.trim()
  if (s === 'null' || s === '~' || s === '') return null
  if (s === 'true') return true
  if (s === 'false') return false
  if (/^[-+]?0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16)
  if (/^[-+]?0o[0-7]+$/.test(s)) return parseInt(s.replace('0o', ''), 8)
  if (/^[-+]?(\d+)$/.test(s)) return parseInt(s, 10)
  if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s)) return parseFloat(s)
  // quoted strings
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  }
  return s
}

interface YamlLine {
  indent: number
  content: string
  raw: string
}

function parseYamlLines(text: string): YamlLine[] {
  return text.split('\n').map(raw => {
    // strip inline comment (not inside quotes)
    let content = raw
    let inSingle = false, inDouble = false
    for (let i = 0; i < content.length; i++) {
      const c = content[i]
      if (c === "'" && !inDouble) inSingle = !inSingle
      else if (c === '"' && !inSingle) inDouble = !inDouble
      else if (c === '#' && !inSingle && !inDouble && (i === 0 || content[i - 1] === ' ')) {
        content = content.slice(0, i)
        break
      }
    }
    content = content.trimEnd()
    const trimmed = content.trimStart()
    const indent = content.length - trimmed.length
    return { indent, content: trimmed, raw }
  })
}

function parseYamlBlock(lines: YamlLine[], start: number, baseIndent: number): [unknown, number] {
  // skip empty lines
  let i = start
  while (i < lines.length && lines[i].content === '') i++
  if (i >= lines.length) return [null, i]

  const firstLine = lines[i]

  // Detect block type by first non-empty line
  if (firstLine.content.startsWith('- ') || firstLine.content === '-') {
    // Array
    return parseYamlArray(lines, i, firstLine.indent)
  } else if (firstLine.content.includes(': ') || firstLine.content.endsWith(':')) {
    return parseYamlObject(lines, i, firstLine.indent)
  } else {
    return [parseScalar(firstLine.content), i + 1]
  }
}

function parseYamlArray(lines: YamlLine[], start: number, arrayIndent: number): [unknown[], number] {
  const arr: unknown[] = []
  let i = start

  while (i < lines.length) {
    const line = lines[i]
    if (line.content === '') { i++; continue }
    if (line.indent < arrayIndent) break
    if (line.indent > arrayIndent) { i++; continue }

    if (!line.content.startsWith('- ') && line.content !== '-') break

    const rest = line.content === '-' ? '' : line.content.slice(2).trim()
    i++

    if (rest === '') {
      // value is on next lines
      if (i < lines.length && lines[i].content !== '' && lines[i].indent > arrayIndent) {
        const [val, ni] = parseYamlBlock(lines, i, lines[i].indent)
        arr.push(val)
        i = ni
      } else {
        arr.push(null)
      }
    } else if (rest.includes(': ') || (rest.endsWith(':') && !rest.startsWith('"') && !rest.startsWith("'"))) {
      // inline object key: value or nested object
      const tempLines: YamlLine[] = [{ indent: arrayIndent + 2, content: rest, raw: rest }]
      // collect more lines at deeper indent
      while (i < lines.length && lines[i].content !== '' && lines[i].indent > arrayIndent) {
        tempLines.push(lines[i])
        i++
      }
      const [obj] = parseYamlObject(tempLines, 0, tempLines[0].indent)
      arr.push(obj)
    } else {
      arr.push(parseScalar(rest))
    }
  }

  return [arr, i]
}

function parseYamlObject(lines: YamlLine[], start: number, objIndent: number): [Record<string, unknown>, number] {
  const obj: Record<string, unknown> = {}
  let i = start

  while (i < lines.length) {
    const line = lines[i]
    if (line.content === '') { i++; continue }
    if (line.indent < objIndent) break
    if (line.indent > objIndent) { i++; continue }

    // parse key
    const colonIdx = line.content.indexOf(': ')
    const isTrailingColon = line.content.endsWith(':') && !line.content.endsWith('\\:')
    let key: string
    let valueStr: string

    if (colonIdx !== -1) {
      key = line.content.slice(0, colonIdx).trim()
      valueStr = line.content.slice(colonIdx + 2).trim()
    } else if (isTrailingColon) {
      key = line.content.slice(0, -1).trim()
      valueStr = ''
    } else {
      i++
      continue
    }

    // strip quotes from key
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
      key = key.slice(1, -1)
    }

    i++

    if (valueStr === '' || valueStr === null) {
      // look ahead for block scalar or nested
      if (i < lines.length && lines[i].content !== '' && lines[i].indent > objIndent) {
        const nextLine = lines[i]
        if (nextLine.content.startsWith('- ') || nextLine.content === '-') {
          const [val, ni] = parseYamlArray(lines, i, nextLine.indent)
          obj[key] = val
          i = ni
        } else if (nextLine.content.includes(': ') || nextLine.content.endsWith(':')) {
          const [val, ni] = parseYamlObject(lines, i, nextLine.indent)
          obj[key] = val
          i = ni
        } else {
          obj[key] = parseScalar(nextLine.content)
          i++
        }
      } else {
        obj[key] = null
      }
    } else if (valueStr === '|') {
      // literal block scalar
      const blockLines: string[] = []
      while (i < lines.length && (lines[i].content === '' || lines[i].indent > objIndent)) {
        if (lines[i].content === '') {
          blockLines.push('')
        } else {
          blockLines.push(lines[i].content)
        }
        i++
      }
      obj[key] = blockLines.join('\n')
    } else if (valueStr === '>') {
      // folded block scalar — treat same as literal for basic support
      const blockLines: string[] = []
      while (i < lines.length && (lines[i].content === '' || lines[i].indent > objIndent)) {
        blockLines.push(lines[i].content)
        i++
      }
      obj[key] = blockLines.join(' ').trim()
    } else if (valueStr.startsWith('[')) {
      // inline array
      try {
        obj[key] = JSON.parse(valueStr.replace(/'/g, '"'))
      } catch {
        obj[key] = parseScalar(valueStr)
      }
    } else if (valueStr.startsWith('{')) {
      try {
        obj[key] = JSON.parse(valueStr.replace(/'/g, '"'))
      } catch {
        obj[key] = parseScalar(valueStr)
      }
    } else {
      obj[key] = parseScalar(valueStr)
    }
  }

  return [obj, i]
}

function yamlToJson(yaml: string): string {
  const lines = parseYamlLines(yaml)
  // find first non-empty line
  const firstMeaningful = lines.find(l => l.content !== '')
  if (!firstMeaningful) return 'null'

  const [result] = parseYamlBlock(lines, 0, firstMeaningful.indent)
  return JSON.stringify(result, null, 2)
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function YamlJson() {
  const [mode, setMode] = useState<Mode>('yaml2json')
  const [input, setInput] = useState('name: John Doe\nage: 30\nhobbies:\n  - reading\n  - coding\naddress:\n  city: New York\n  country: USA')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); return }
    try {
      if (mode === 'yaml2json') {
        setOutput(yamlToJson(input))
      } else {
        const parsed = JSON.parse(input)
        setOutput(jsonToYaml(parsed))
      }
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }, [input, mode])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['yaml2json', 'json2yaml'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setInput(''); setOutput(''); setError('') }}
            className={m === mode ? 'btn-primary' : 'btn-secondary'}
          >
            {m === 'yaml2json' ? 'YAML → JSON' : 'JSON → YAML'}
          </button>
        ))}
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
          {mode === 'yaml2json' ? 'YAML Input' : 'JSON Input'}
        </label>
        <FileDropTextarea
          className="h-64"
          placeholder={mode === 'yaml2json' ? 'key: value\nlist:\n  - item1\n  - item2' : '{"key": "value", "list": ["item1", "item2"]}'}
          value={input}
          onChange={setInput}
          accept={mode === 'yaml2json' ? '.yaml,.yml,text/plain,text/*' : '.json,text/plain,text/*'}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
            {mode === 'yaml2json' ? 'JSON Output' : 'YAML Output'}
            {output && <span className="ml-2 text-gray-400 dark:text-gray-500">({output.length} chars)</span>}
          </label>
          <CopyButton text={output} />
        </div>
        <textarea
          className="tool-textarea h-64"
          readOnly
          value={output}
          placeholder="Output will appear here..."
        />
      </div>

      {error && (
        <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
    </div>
  )
}
