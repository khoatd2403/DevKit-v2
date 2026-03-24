import { useState, useEffect } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, c => c.toUpperCase())
}

interface GeneratorOptions {
  interfaceName: string
  useInterface: boolean
  optionalNulls: boolean
  exportKeyword: boolean
}

interface GeneratedBlock {
  name: string
  body: string
}

function inferType(
  value: unknown,
  name: string,
  opts: GeneratorOptions,
  blocks: GeneratedBlock[]
): string {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string') return 'string'

  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]'
    // Infer element type from all elements
    const types = value.map((item, i) => inferType(item, `${name}Item`, opts, blocks))
    const unique = [...new Set(types)]
    const elemType = unique.length === 1 ? unique[0] : unique.join(' | ')
    return `(${elemType})[]`
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)
    if (keys.length === 0) return 'Record<string, unknown>'

    const nestedName = name
    const lines: string[] = []

    for (const key of keys) {
      const val = obj[key]
      const propType = inferType(val, toPascalCase(key), opts, blocks)
      const optional = opts.optionalNulls && val === null ? '?' : ''
      const safePropType = opts.optionalNulls && val === null ? 'null' : propType
      // quote key if it contains special chars
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`
      lines.push(`  ${safeKey}${optional}: ${safePropType};`)
    }

    const keyword = opts.useInterface ? 'interface' : 'type'
    const exportStr = opts.exportKeyword ? 'export ' : ''
    let body: string
    if (opts.useInterface) {
      body = `${exportStr}interface ${nestedName} {\n${lines.join('\n')}\n}`
    } else {
      body = `${exportStr}type ${nestedName} = {\n${lines.join('\n')}\n}`
    }

    // Only add block if it doesn't already exist with this name
    if (!blocks.find(b => b.name === nestedName)) {
      blocks.push({ name: nestedName, body })
    }

    return nestedName
  }

  return 'unknown'
}

function generateTypeScript(json: string, opts: GeneratorOptions): string {
  const parsed = JSON.parse(json)
  const blocks: GeneratedBlock[] = []

  if (Array.isArray(parsed)) {
    // Top-level array
    const itemName = `${opts.interfaceName}Item`
    if (parsed.length === 0) {
      const exportStr = opts.exportKeyword ? 'export ' : ''
      if (opts.useInterface) {
        return `${exportStr}type ${opts.interfaceName} = unknown[]`
      } else {
        return `${exportStr}type ${opts.interfaceName} = unknown[]`
      }
    }
    // infer items
    parsed.forEach((item) => inferType(item, itemName, opts, blocks))
    const itemType = inferType(parsed[0], itemName, opts, blocks)
    const exportStr = opts.exportKeyword ? 'export ' : ''
    const topType = `${exportStr}type ${opts.interfaceName} = (${itemType})[]`
    const allBlocks = blocks.map(b => b.body)
    return [...allBlocks, topType].join('\n\n')
  }

  if (typeof parsed === 'object' && parsed !== null) {
    inferType(parsed, opts.interfaceName, opts, blocks)
    return blocks.map(b => b.body).join('\n\n')
  }

  // Primitives
  const exportStr = opts.exportKeyword ? 'export ' : ''
  return `${exportStr}type ${opts.interfaceName} = ${typeof parsed}`
}

export default function JsonToTypescript() {
  const [input, setInput] = useState('{"name":"John Doe","age":30,"email":"john@example.com","address":{"city":"New York","zip":"10001"},"hobbies":["reading","coding","hiking"]}')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [interfaceName, setInterfaceName] = useState('Root')
  const [useInterface, setUseInterface] = useState(true)
  const [optionalNulls, setOptionalNulls] = useState(true)
  const [exportKeyword, setExportKeyword] = useState(true)

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); return }
    try {
      const opts: GeneratorOptions = { interfaceName: interfaceName || 'Root', useInterface, optionalNulls, exportKeyword }
      setOutput(generateTypeScript(input, opts))
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }, [input, interfaceName, useInterface, optionalNulls, exportKeyword])

  const toggleClass = (active: boolean) =>
    active
      ? 'px-3 py-1 rounded text-xs border bg-primary-100 dark:bg-primary-900 border-primary-400 text-primary-700 dark:text-primary-300 font-medium transition-colors'
      : 'px-3 py-1 rounded text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-colors'

  return (
    <div className="space-y-4">
      {/* Options row */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="tool-label block mb-1">Interface Name</label>
          <input
            type="text"
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 w-36"
            value={interfaceName}
            onChange={e => setInterfaceName(e.target.value)}
            placeholder="Root"
          />
        </div>

        <div>
          <label className="tool-label block mb-1">Keyword</label>
          <div className="flex gap-1">
            <button onClick={() => setUseInterface(true)} className={toggleClass(useInterface)}>interface</button>
            <button onClick={() => setUseInterface(false)} className={toggleClass(!useInterface)}>type</button>
          </div>
        </div>

        <div>
          <label className="tool-label block mb-1">Optional nulls</label>
          <button onClick={() => setOptionalNulls(v => !v)} className={toggleClass(optionalNulls)}>
            {optionalNulls ? 'On' : 'Off'}
          </button>
        </div>

        <div>
          <label className="tool-label block mb-1">Export</label>
          <button onClick={() => setExportKeyword(v => !v)} className={toggleClass(exportKeyword)}>
            {exportKeyword ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">JSON Input</label>
          </div>
          <FileDropTextarea
            className="h-80"
            placeholder={'{\n  "name": "Alice",\n  "age": 30,\n  "active": true,\n  "address": {\n    "city": "NY"\n  }\n}'}
            value={input}
            onChange={setInput}
            accept=".json,text/plain,text/*"
          />
        </div>

        <div>
          <div className="tool-output-header">
            <label className="tool-label">TypeScript Output</label>
            <CopyButton text={output} toast="TypeScript copied" />
          </div>
          <textarea
            className="tool-textarea-output h-80 font-mono text-xs"
            readOnly
            value={output}
            placeholder="TypeScript interfaces will appear here..."
          />
        </div>
      </div>

      {error && (
        <p className="tool-msg tool-msg--error">
          {error}
        </p>
      )}
    </div>
  )
}
