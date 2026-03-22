import { useState } from 'react'
import { Copy, Check, ArrowRight } from 'lucide-react'

type Mode = 'escape' | 'unescape' | 'verbatim' | 'interpolated'

function escapeRegular(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\0/g, '\\0')
    .replace(/[\x01-\x1f\x7f]/g, c => `\\x${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
}

function unescapeRegular(s: string): string {
  try {
    return s
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\0/g, '\0')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/\\U([0-9a-fA-F]{8})/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  } catch {
    return s
  }
}

function toVerbatim(s: string): string {
  return s.replace(/"/g, '""')
}

function fromVerbatim(s: string): string {
  return s.replace(/""/g, '"')
}

const EXAMPLES: { label: string; value: string }[] = [
  { label: 'File path', value: 'C:\\Users\\John\\Documents\\file.txt' },
  { label: 'Newlines', value: 'Line 1\nLine 2\nLine 3' },
  { label: 'Quotes', value: 'He said "Hello, World!"' },
  { label: 'SQL query', value: `SELECT * FROM "users" WHERE name = 'John'` },
  { label: 'Regex', value: String.raw`^\d{4}-\d{2}-\d{2}$` },
  { label: 'JSON', value: '{"name": "John", "age": 30}' },
]

export default function CsharpStringEscape() {
  const [input, setInput] = useState('C:\\Users\\John\\Documents\\file.txt')
  const [mode, setMode] = useState<Mode>('escape')
  const [copied, setCopied] = useState<string | null>(null)

  const processedOutput = (() => {
    switch (mode) {
      case 'escape':     return escapeRegular(input)
      case 'unescape':   return unescapeRegular(input)
      case 'verbatim':   return toVerbatim(input)
      case 'interpolated': return escapeRegular(input).replace(/\{/g, '{{').replace(/\}/g, '}}')
      default:           return input
    }
  })()

  const csharpString = (() => {
    switch (mode) {
      case 'escape':        return `"${processedOutput}"`
      case 'unescape':      return processedOutput
      case 'verbatim':      return `@"${processedOutput}"`
      case 'interpolated':  return `$"${processedOutput}"`
      default:              return processedOutput
    }
  })()

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-1.5">
        {([
          { id: 'escape', label: 'Escape → C# string', desc: '"..."' },
          { id: 'unescape', label: 'Unescape C# string', desc: 'raw text' },
          { id: 'verbatim', label: 'Verbatim string', desc: '@"..."' },
          { id: 'interpolated', label: 'Interpolated', desc: '$"..."' },
        ] as { id: Mode; label: string; desc: string }[]).map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === m.id
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-400'
            }`}
          >
            {m.label} <span className="opacity-70 font-mono">{m.desc}</span>
          </button>
        ))}
      </div>

      {/* Quick examples */}
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => setInput(ex.value)}
            className="text-[11px] px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {mode === 'unescape' ? 'C# escaped string (without quotes)' : 'Raw text input'}
          </label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
            rows={10}
            className="tool-textarea font-mono text-sm resize-none"
            placeholder="Enter text here..."
          />
          <button
            onClick={() => copy(input, 'input')}
            className="btn-ghost text-xs px-2 py-1 flex items-center gap-1"
          >
            {copied === 'input' ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
            Copy input
          </button>
        </div>

        <div className="space-y-3">
          {/* C# string */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                C# string literal
              </label>
              <button
                onClick={() => copy(csharpString, 'csharp')}
                className="btn-ghost text-xs px-2 py-1 flex items-center gap-1"
              >
                {copied === 'csharp' ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                Copy
              </button>
            </div>
            <pre className="tool-textarea font-mono text-sm h-auto min-h-14 overflow-auto whitespace-pre-wrap break-all text-primary-700 dark:text-primary-300">
              {csharpString}
            </pre>
          </div>

          {/* Just the escaped content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Content only (no quotes)
              </label>
              <button
                onClick={() => copy(processedOutput, 'content')}
                className="btn-ghost text-xs px-2 py-1 flex items-center gap-1"
              >
                {copied === 'content' ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                Copy
              </button>
            </div>
            <pre className="tool-textarea font-mono text-xs h-auto min-h-14 overflow-auto whitespace-pre-wrap break-all text-gray-700 dark:text-gray-300">
              {processedOutput}
            </pre>
          </div>

          {/* Escape legend */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">C# escape sequences</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                ['\\n', 'Newline'],
                ['\\r', 'Carriage return'],
                ['\\t', 'Tab'],
                ['\\\\', 'Backslash'],
                ['\\"', 'Double quote'],
                ['\\0', 'Null'],
                ['\\uXXXX', 'Unicode (4 hex)'],
                ['\\xXX', 'Hex escape'],
              ].map(([seq, desc]) => (
                <div key={seq} className="flex items-center gap-2">
                  <code className="text-[11px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-1 rounded">
                    {seq}
                  </code>
                  <span className="text-[11px] text-gray-500 dark:text-gray-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      {mode === 'escape' && processedOutput !== input && (
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-blue-500 dark:text-blue-400 font-medium mb-1">Input ({input.length} chars)</p>
            <pre className="text-xs font-mono text-blue-700 dark:text-blue-300 whitespace-pre-wrap break-all">{input}</pre>
          </div>
          <ArrowRight size={16} className="text-blue-400 mt-4 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-blue-500 dark:text-blue-400 font-medium mb-1">Escaped ({processedOutput.length} chars)</p>
            <pre className="text-xs font-mono text-blue-700 dark:text-blue-300 whitespace-pre-wrap break-all">{processedOutput}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
