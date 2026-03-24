import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

// ---------------------------------------------------------------------------
// Minify
// ---------------------------------------------------------------------------
function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')   // remove comments
    .replace(/\s+/g, ' ')               // collapse whitespace
    .replace(/\s*([{}:;,>~+])\s*/g, '$1') // remove spaces around punctuation
    .replace(/;}/g, '}')                // remove trailing semicolon before }
    .trim()
}

// ---------------------------------------------------------------------------
// Beautify
// ---------------------------------------------------------------------------
function beautifyCss(css: string): string {
  // Remove comments first
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')

  // Tokenise into: selectors, {, }, property:value;
  // We'll do a character-by-character state machine
  const lines: string[] = []
  let indent = 0
  let buffer = ''

  const flush = (trim = true) => {
    const s = trim ? buffer.trim() : buffer
    if (s) {
      lines.push('  '.repeat(indent) + s)
    }
    buffer = ''
  }

  let i = 0
  const src = stripped

  while (i < src.length) {
    const ch = src[i]

    if (ch === '{') {
      const selector = buffer.trim()
      if (selector) {
        // Handle comma-separated selectors: put each on its own line
        const selectors = selector.split(',').map(s => s.trim()).filter(Boolean)
        const formatted = selectors.join(',\n' + '  '.repeat(indent))
        lines.push('  '.repeat(indent) + formatted + ' {')
      } else {
        lines.push('  '.repeat(indent) + '{')
      }
      buffer = ''
      indent++
      i++
    } else if (ch === '}') {
      flush()
      indent = Math.max(0, indent - 1)
      lines.push('  '.repeat(indent) + '}')
      // blank line between top-level rule blocks
      if (indent === 0) lines.push('')
      i++
    } else if (ch === ';') {
      buffer += ';'
      flush()
      i++
    } else {
      buffer += ch
      i++
    }
  }

  flush()

  // Normalise property formatting: ensure "key: value" spacing
  const result = lines
    .map(line => {
      // Only reformat lines that look like property declarations (indented, contains :, not selector-like)
      const trimmed = line.trimStart()
      const indentStr = line.slice(0, line.length - trimmed.length)
      // Looks like a property if it contains : and ends with ; and doesn't contain { or }
      if (trimmed.includes(':') && trimmed.endsWith(';') && !trimmed.includes('{') && !trimmed.includes('}')) {
        const colonIdx = trimmed.indexOf(':')
        const prop = trimmed.slice(0, colonIdx).trim()
        const val = trimmed.slice(colonIdx + 1).replace(/;$/, '').trim()
        return `${indentStr}${prop}: ${val};`
      }
      return line
    })
    .join('\n')
    // Remove consecutive blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return result
}

export default function CssFormatter() {
  const [input, setInput] = usePersistentState('tool-css-formatter-input', '.btn{display:inline-flex;align-items:center;padding:8px 16px;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;background:#3b82f6;color:#fff;border:none}')
  const [mode, setMode] = useState<'beautify' | 'minify'>('beautify')

  const output = input.trim()
    ? mode === 'minify' ? minifyCss(input) : beautifyCss(input)
    : ''

  const inputBytes = new TextEncoder().encode(input).length
  const outputBytes = new TextEncoder().encode(output).length
  const diff = inputBytes - outputBytes
  const pct = inputBytes > 0 ? Math.round(Math.abs(diff) / inputBytes * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="tool-tabs">
          {(['beautify', 'minify'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`tool-tab ${mode === m ? 'active' : ''}`}>
              {m}
            </button>
          ))}
        </div>
        {output && inputBytes > 0 && (
          <span className={`text-xs ml-auto ${diff > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
            {diff > 0
              ? `-${diff} bytes saved (${pct}% smaller)`
              : `+${Math.abs(diff)} bytes added (${pct}% larger)`}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input CSS</label>
          </div>
          <FileDropTextarea
            className="h-80"
            placeholder={`.container {\n  display: flex;\n  background-color: #fff;\n}\n\n@media (max-width: 768px) {\n  .container { flex-direction: column; }\n}`}
            value={input}
            onChange={setInput}
            accept=".css,text/css,text/*"
          />
          {input && <p className="tool-note text-right">{inputBytes} bytes</p>}
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">{mode === 'minify' ? 'Minified' : 'Beautified'} Output</label>
            <CopyButton text={output} toast={`${mode === 'minify' ? 'Minified' : 'Beautified'} CSS copied`} />
          </div>
          <textarea className="tool-textarea-output h-80" readOnly value={output} placeholder="Output will appear here as you type..." />
          {output && <p className="tool-note text-right">{outputBytes} bytes</p>}
        </div>
      </div>
    </div>
  )
}
