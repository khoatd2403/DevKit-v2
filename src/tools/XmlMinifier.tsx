import { useState, useCallback, useEffect } from 'react'
import { Copy, Check, RotateCcw, ArrowLeftRight } from 'lucide-react'

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <!-- A collection of books -->
  <book category="cooking">
    <title lang="en">Everyday Italian</title>
    <author>Giada De Laurentiis</author>
    <year>2005</year>
    <price>30.00</price>
  </book>
  <book category="web">
    <title lang="en">Learning XML</title>
    <author>Erik T. Ray</author>
    <year>2003</year>
    <price>39.95</price>
  </book>
</bookstore>`

function minifyXml(xml: string, opts: { removeComments: boolean; removeDeclaration: boolean }): string {
  let result = xml

  if (opts.removeComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, '')
  }

  if (opts.removeDeclaration) {
    result = result.replace(/<\?xml[^?]*\?>\s*/i, '')
  }

  // Remove whitespace between tags
  result = result
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .replace(/> </g, '><')
    .trim()

  return result
}

function formatXml(xml: string, indent = 2): string {
  let result = ''
  let level = 0
  const pad = (n: number) => ' '.repeat(n * indent)

  // Simple XML formatter
  const tokens = xml
    .replace(/>\s*</g, '>\n<')
    .replace(/<\?xml[^?]*\?>/i, m => m + '\n')
    .split('\n')
    .map(t => t.trim())
    .filter(Boolean)

  for (const token of tokens) {
    if (token.match(/^<\//) || token.match(/^-->/)) {
      level = Math.max(0, level - 1)
      result += pad(level) + token + '\n'
    } else if (token.match(/^<[^/!?][^>]*[^/]>$/) && !token.match(/<[^>]+\/>/)) {
      result += pad(level) + token + '\n'
      level++
    } else if (token.match(/^<!--/)) {
      result += pad(level) + token + '\n'
      if (!token.match(/-->$/)) level++
    } else {
      result += pad(level) + token + '\n'
    }
  }

  return result.trimEnd()
}

function countBytes(s: string): string {
  const bytes = new TextEncoder().encode(s).length
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export default function XmlMinifier() {
  const [input, setInput] = useState(SAMPLE_XML)
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'minify' | 'format'>('minify')
  const [removeComments, setRemoveComments] = useState(true)
  const [removeDeclaration, setRemoveDeclaration] = useState(false)
  const [indentSize, setIndentSize] = useState(2)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const process = useCallback(() => {
    setError('')
    if (!input.trim()) { setOutput(''); return }
    try {
      // Basic XML validation
      const parser = new DOMParser()
      const doc = parser.parseFromString(input, 'application/xml')
      const parseError = doc.querySelector('parsererror')
      if (parseError) {
        setError(parseError.textContent?.split('\n')[0] ?? 'Invalid XML')
        setOutput('')
        return
      }

      if (mode === 'minify') {
        setOutput(minifyXml(input, { removeComments, removeDeclaration }))
      } else {
        setOutput(formatXml(minifyXml(input, { removeComments: false, removeDeclaration: false }), indentSize))
      }
    } catch (e) {
      setError((e as Error).message)
    }
  }, [input, mode, removeComments, removeDeclaration, indentSize])

  useEffect(() => {
    process()
  }, [process])

  const copy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const savings = input && output && mode === 'minify'
    ? Math.round((1 - output.length / input.length) * 100)
    : null

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {(['minify', 'format'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              mode === m ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {m === 'minify' ? 'Minify' : 'Format / Beautify'}
          </button>
        ))}
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4 items-center">
        {mode === 'minify' ? (
          <>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={removeComments} onChange={e => setRemoveComments(e.target.checked)}
                className="rounded" />
              Remove comments
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" checked={removeDeclaration} onChange={e => setRemoveDeclaration(e.target.checked)}
                className="rounded" />
              Remove XML declaration
            </label>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Indent:</span>
            {[2, 4].map(n => (
              <button key={n} onClick={() => setIndentSize(n)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  indentSize === n ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                {n} spaces
              </button>
            ))}
          </div>
        )}
        {/* We can remove the explicit button because it auto-runs now, but let's just make it a hidden or visual indicator if they want, actually better to just remove it or keep it as "Copy" or remove entirely */}
      </div>

      {/* Editor panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Input XML</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">{countBytes(input)}</span>
              <button onClick={() => { setInput(''); setOutput('') }} className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1">
                <RotateCcw size={10} /> Clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={16}
            placeholder="Paste XML here..."
            className="tool-textarea font-mono text-xs"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Output</span>
            <div className="flex items-center gap-2">
              {savings !== null && savings > 0 && (
                <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                  -{savings}% saved · {countBytes(output)}
                </span>
              )}
              {output && !savings && <span className="text-[10px] text-gray-400">{countBytes(output)}</span>}
              <button onClick={copy} disabled={!output}
                className="text-[10px] text-gray-400 hover:text-primary-600 disabled:opacity-40 flex items-center gap-1">
                {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                Copy
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            rows={16}
            placeholder="Output will appear here..."
            className="tool-textarea-output font-mono text-xs bg-gray-50 dark:bg-gray-900"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl font-mono">{error}</p>
      )}
    </div>
  )
}
