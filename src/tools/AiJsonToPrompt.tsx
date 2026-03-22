import { useState } from 'react'
import CopyButton from '../components/CopyButton'

const EXAMPLE = JSON.stringify({
  user: {
    name: 'Alice',
    age: 28,
    role: 'Software Engineer',
    skills: ['TypeScript', 'React', 'Node.js'],
    active: true
  },
  project: {
    name: 'DevTools Online',
    deadline: '2026-06-01',
    priority: 'high'
  }
}, null, 2)

function jsonToPrompt(obj: unknown, indent = 0): string {
  const pad = indent > 0 ? '  '.repeat(indent) : ''

  if (obj === null) return 'null'
  if (typeof obj === 'boolean') return obj ? 'yes' : 'no'
  if (typeof obj === 'number') return String(obj)
  if (typeof obj === 'string') return `"${obj}"`

  if (Array.isArray(obj)) {
    if (obj.length === 0) return 'an empty list'
    const items = obj.map(v => jsonToPrompt(v, 0))
    if (items.every(i => !i.includes('\n')) && items.join(', ').length < 80) {
      return items.join(', ')
    }
    return items.map((v, i) => `${pad}  ${i + 1}. ${v}`).join('\n')
  }

  if (typeof obj === 'object') {
    const lines: string[] = []
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const readable = key
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .toLowerCase()

      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        lines.push(`${pad}- ${readable}:`)
        lines.push(jsonToPrompt(val, indent + 1))
      } else {
        lines.push(`${pad}- ${readable}: ${jsonToPrompt(val, indent + 1)}`)
      }
    }
    return lines.join('\n')
  }

  return String(obj)
}

function buildPrompt(json: unknown, style: string): string {
  if (style === 'describe') {
    return `Here is the data:\n${jsonToPrompt(json)}\n\nBased on the information above, please answer my questions.`
  }
  if (style === 'instruct') {
    return `You will receive structured data. Use this data to complete the task.\n\nData:\n${jsonToPrompt(json)}\n\nTask: [describe what you want the AI to do]`
  }
  return jsonToPrompt(json)
}

export default function AiJsonToPrompt() {
  const [input, setInput] = useState(EXAMPLE)
  const [style, setStyle] = useState<'plain' | 'describe' | 'instruct'>('describe')
  const [error, setError] = useState('')
  const [output, setOutput] = useState('')

  const convert = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(buildPrompt(parsed, style))
      setError('')
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message)
      setOutput('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Style */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Style:</span>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
          {([
            { v: 'plain', label: 'Plain' },
            { v: 'describe', label: 'Describe' },
            { v: 'instruct', label: 'Instruct' },
          ] as const).map(s => (
            <button
              key={s.v}
              onClick={() => setStyle(s.v)}
              className={`px-3 py-1.5 font-medium transition-colors ${style === s.v ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button onClick={convert} className="btn-primary ml-auto text-sm">Convert →</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">JSON Input</label>
          <textarea
            className="tool-textarea h-64 font-mono text-xs"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Prompt Output</label>
            <CopyButton text={output} />
          </div>
          <textarea
            className="tool-textarea h-64 text-xs"
            readOnly
            value={output}
            placeholder="Click Convert to generate prompt..."
          />
        </div>
      </div>

      {error && (
        <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
    </div>
  )
}
