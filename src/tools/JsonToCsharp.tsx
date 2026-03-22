import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { CsharpCodeBlock } from '../lib/codeHighlight'

type Annotation = 'none' | 'newtonsoft' | 'system'

function toPascalCase(str: string): string {
  return (
    str
      .replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase())
      .replace(/^(.)/, (_, c: string) => c.toUpperCase()) || str
  )
}

function toSingular(word: string): string {
  if (/ies$/i.test(word)) return word.replace(/ies$/i, 'y')
  if (/ses$/i.test(word)) return word.replace(/ses$/i, 's')
  if (/s$/i.test(word) && word.length > 3) return word.replace(/s$/i, '')
  return word
}

function inferType(
  value: unknown,
  key: string,
  queue: { name: string; obj: Record<string, unknown> }[],
  nullable: boolean
): string {
  if (value === null || value === undefined) return nullable ? 'object?' : 'object'
  if (typeof value === 'boolean') return 'bool'
  if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'double'
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return 'DateTime'
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'DateTime'
    if (/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value)) return 'Guid'
    return nullable ? 'string?' : 'string'
  }
  if (Array.isArray(value)) {
    const item = value.find(v => v !== null && v !== undefined) ?? value[0]
    if (item === undefined) return 'List<object>'
    const itemClassName = toPascalCase(toSingular(key))
    const itemType = inferType(item, itemClassName, queue, nullable)
    return `List<${itemType}>`
  }
  if (typeof value === 'object') {
    const className = toPascalCase(key)
    if (!queue.find(q => q.name === className)) {
      queue.push({ name: className, obj: value as Record<string, unknown> })
    }
    return className
  }
  return 'object'
}

function generateCSharp(
  rootName: string,
  rootObj: Record<string, unknown>,
  annotation: Annotation,
  nullable: boolean,
  useRecords: boolean
): string {
  const queue: { name: string; obj: Record<string, unknown> }[] = [
    { name: rootName, obj: rootObj },
  ]
  const processedNames = new Set<string>()
  const classBlocks: string[] = []
  const needsList = { value: false }

  while (queue.length > 0) {
    const { name, obj } = queue.shift()!
    if (processedNames.has(name)) continue
    processedNames.add(name)

    const props: { jsonKey: string; propName: string; type: string }[] = []
    for (const [jsonKey, val] of Object.entries(obj)) {
      const propName = toPascalCase(jsonKey)
      const itemKey = Array.isArray(val) ? toSingular(propName) : propName
      const type = inferType(val, itemKey, queue, nullable)
      if (type.startsWith('List<')) needsList.value = true
      props.push({ jsonKey, propName, type })
    }

    const lines: string[] = []
    if (useRecords) {
      const params = props.map((p, i) => {
        const parts: string[] = []
        if (annotation === 'newtonsoft') parts.push(`    [JsonProperty("${p.jsonKey}")]`)
        if (annotation === 'system') parts.push(`    [JsonPropertyName("${p.jsonKey}")]`)
        parts.push(`    ${p.type} ${p.propName}`)
        return parts.join('\n') + (i < props.length - 1 ? ',' : '')
      })
      lines.push(`public record ${name}(`)
      lines.push(...params)
      lines.push(');')
    } else {
      lines.push(`public class ${name}`)
      lines.push('{')
      for (const p of props) {
        if (annotation === 'newtonsoft') lines.push(`    [JsonProperty("${p.jsonKey}")]`)
        if (annotation === 'system') lines.push(`    [JsonPropertyName("${p.jsonKey}")]`)
        lines.push(`    public ${p.type} ${p.propName} { get; set; }`)
      }
      lines.push('}')
    }
    classBlocks.push(lines.join('\n'))
  }

  const imports: string[] = []
  if (needsList.value) imports.push('using System.Collections.Generic;')
  if (annotation === 'newtonsoft') imports.push('using Newtonsoft.Json;')
  if (annotation === 'system') imports.push('using System.Text.Json.Serialization;')

  const header = imports.length > 0 ? imports.join('\n') + '\n\n' : ''
  return header + classBlocks.join('\n\n')
}

const SAMPLE = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "isActive": true,
  "score": 98.5,
  "createdAt": "2024-01-15T10:30:00",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  },
  "tags": ["admin", "user"],
  "orders": [
    { "orderId": 1001, "total": 59.99, "status": "shipped" }
  ]
}`

export default function JsonToCsharp() {
  const [input, setInput] = useState(SAMPLE)
  const [rootName, setRootName] = useState('Root')
  const [annotation, setAnnotation] = useState<Annotation>('none')
  const [nullable, setNullable] = useState(true)
  const [useRecords, setUseRecords] = useState(false)
  const [copied, setCopied] = useState(false)

  let output = ''
  let parseError = ''

  try {
    const parsed = JSON.parse(input)
    const rootObj = Array.isArray(parsed) ? parsed[0] : parsed
    if (typeof rootObj !== 'object' || rootObj === null) {
      parseError = 'Root must be a JSON object or array of objects'
    } else {
      output = generateCSharp(rootName || 'Root', rootObj as Record<string, unknown>, annotation, nullable, useRecords)
    }
  } catch (e) {
    parseError = (e as Error).message
  }

  const copy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Options */}
      <div className="flex flex-wrap gap-4 items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Root class</label>
          <input
            value={rootName}
            onChange={e => setRootName(e.target.value)}
            className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 w-28 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Attributes</label>
          <select
            value={annotation}
            onChange={e => setAnnotation(e.target.value as Annotation)}
            className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="none">None</option>
            <option value="newtonsoft">Newtonsoft.Json</option>
            <option value="system">System.Text.Json</option>
          </select>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
          <input type="checkbox" checked={nullable} onChange={e => setNullable(e.target.checked)} className="rounded" />
          Nullable types
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-600 dark:text-gray-400">
          <input type="checkbox" checked={useRecords} onChange={e => setUseRecords(e.target.checked)} className="rounded" />
          Use records
        </label>
      </div>

      {/* Two-panel editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">JSON Input</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
            className="tool-textarea font-mono text-xs h-96 resize-none"
            placeholder="Paste JSON here..."
          />
          {parseError && (
            <p className="text-xs text-red-500 dark:text-red-400">{parseError}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">C# Classes</label>
            <button
              onClick={copy}
              disabled={!output}
              className="btn-ghost text-xs px-2 py-1 flex items-center gap-1 disabled:opacity-40"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <CsharpCodeBlock code={output} className="h-96" placeholder="// C# classes will appear here" />
        </div>
      </div>
    </div>
  )
}
