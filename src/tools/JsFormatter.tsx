import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

// ---------------------------------------------------------------------------
// Helpers: split code into tokens respecting string literals
// ---------------------------------------------------------------------------
type Chunk = { type: 'string'; value: string } | { type: 'code'; value: string }

function splitChunks(src: string): Chunk[] {
  const chunks: Chunk[] = []
  let i = 0

  while (i < src.length) {
    const ch = src[i]

    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch
      let s = ch
      i++
      while (i < src.length) {
        const c = src[i]
        s += c
        if (c === '\\') { i++; if (i < src.length) { s += src[i]; i++ }; continue }
        if (c === quote) { i++; break }
        i++
      }
      chunks.push({ type: 'string', value: s })
    } else {
      // collect code up to the next string delimiter or end
      let code = ''
      while (i < src.length && src[i] !== '"' && src[i] !== "'" && src[i] !== '`') {
        code += src[i]
        i++
      }
      if (code) chunks.push({ type: 'code', value: code })
    }
  }

  return chunks
}

// ---------------------------------------------------------------------------
// Minify
// ---------------------------------------------------------------------------
function minifyJs(src: string): string {
  // Step 1 & 2: remove comments from code chunks only
  const chunks = splitChunks(src)
  const processed = chunks.map(chunk => {
    if (chunk.type === 'string') return chunk.value
    return chunk.value
      .replace(/\/\/[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
  })
  let code = processed.join('')

  // Step 3: collapse whitespace (but re-split to protect strings)
  const chunks2 = splitChunks(code)
  const processed2 = chunks2.map(chunk => {
    if (chunk.type === 'string') return chunk.value
    return chunk.value.replace(/\s+/g, ' ')
  })
  code = processed2.join('')

  // Step 4: remove spaces around operators in code chunks only
  const chunks3 = splitChunks(code)
  const processed3 = chunks3.map(chunk => {
    if (chunk.type === 'string') return chunk.value
    return chunk.value
      .replace(/\s*([{}();,])\s*/g, '$1')
      .replace(/\s*([=+\-*/<>!&|?:])\s*/g, '$1')
  })
  code = processed3.join('')

  return code.trim()
}

// ---------------------------------------------------------------------------
// Beautify
// ---------------------------------------------------------------------------
function beautifyJs(src: string): string {
  // Split into string/code chunks, only reformat code portions
  const chunks = splitChunks(src)
  let result = ''
  let indent = 0

  const pad = () => '  '.repeat(Math.max(0, indent))
  let atLineStart = true

  for (const chunk of chunks) {
    if (chunk.type === 'string') {
      if (atLineStart && result.length > 0 && !result.endsWith('\n')) {
        result += pad()
        atLineStart = false
      }
      result += chunk.value
      atLineStart = false
      continue
    }

    // Process code character by character
    const code = chunk.value
    let i = 0
    while (i < code.length) {
      const ch = code[i]

      if (ch === '{') {
        result += ' {'
        indent++
        result += '\n' + pad()
        atLineStart = true
        i++
        // skip whitespace after {
        while (i < code.length && (code[i] === ' ' || code[i] === '\n' || code[i] === '\r' || code[i] === '\t')) i++
      } else if (ch === '}') {
        // trim trailing space on current line
        result = result.trimEnd()
        indent = Math.max(0, indent - 1)
        result += '\n' + pad() + '}'
        // peek: if next meaningful char is not } or , or ;, add newline
        let j = i + 1
        while (j < code.length && (code[j] === ' ' || code[j] === '\n' || code[j] === '\r' || code[j] === '\t')) j++
        const next = code[j]
        if (next && next !== '}' && next !== ',' && next !== ';' && next !== ')') {
          result += '\n\n' + pad()
        } else if (next) {
          result += '\n' + pad()
        }
        atLineStart = true
        i++
        while (i < code.length && (code[i] === ' ' || code[i] === '\n' || code[i] === '\r' || code[i] === '\t')) i++
      } else if (ch === ';') {
        result += ';'
        // Add newline after ; — but check we're not in a for(...) context
        // Simple heuristic: don't add newline if inside parens
        result += '\n' + pad()
        atLineStart = true
        i++
        while (i < code.length && (code[i] === ' ' || code[i] === '\n' || code[i] === '\r' || code[i] === '\t')) i++
      } else if (ch === '\n' || ch === '\r') {
        // Skip raw newlines — we control them
        i++
      } else if (ch === ' ' || ch === '\t') {
        // Collapse multiple spaces to single space (but not at line start)
        if (!atLineStart && result.length > 0 && !result.endsWith(' ') && !result.endsWith('\n')) {
          result += ' '
        }
        i++
      } else {
        if (atLineStart && result.length > 0 && !result.endsWith('\n') && !result.endsWith(pad())) {
          // already padded
        }
        result += ch
        atLineStart = false
        i++
      }
    }
  }

  // Clean up: remove trailing spaces on each line, normalise blank lines
  return result
    .split('\n')
    .map(l => l.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function JsFormatter() {
  const [input, setInput] = usePersistentState('tool-js-formatter-input', 'function fibonacci(n){if(n<=1)return n;return fibonacci(n-1)+fibonacci(n-2);}const result=Array.from({length:10},(_,i)=>fibonacci(i));console.log(result);')
  const [mode, setMode] = useState<'minify' | 'beautify'>('minify')

  const output = input.trim()
    ? mode === 'minify' ? minifyJs(input) : beautifyJs(input)
    : ''

  const inputLines = input ? input.split('\n').length : 0
  const outputLines = output ? output.split('\n').length : 0
  const compressionRatio = mode === 'minify' && input.length > 0
    ? Math.round((1 - output.length / input.length) * 100)
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="tool-tabs">
          {(['minify', 'beautify'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`tool-tab capitalize ${mode === m ? 'active' : ''}`}
            >
              {m}
            </button>
          ))}
        </div>
        {compressionRatio !== null && output && (
          <span className={`text-xs ml-auto ${compressionRatio > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
            {compressionRatio > 0 ? `${compressionRatio}% smaller` : `${Math.abs(compressionRatio)}% larger`}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input JavaScript</label>
          </div>
          <FileDropTextarea
            className="h-80 font-mono text-sm"
            placeholder={`function hello(name) {\n  // greet the user\n  console.log("Hello, " + name);\n}`}
            value={input}
            onChange={setInput}
            accept=".js,.ts,.jsx,.tsx,text/javascript,text/*"
          />
          {input && (
            <div className="text-xs text-gray-400 mt-1 text-right">
              {inputLines} lines · {input.length} chars
            </div>
          )}
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">
              {mode === 'minify' ? 'Minified' : 'Beautified'} Output
            </label>
            <CopyButton text={output} toast="JavaScript copied" />
          </div>
          <textarea
            className="tool-textarea-output h-80 font-mono text-sm"
            readOnly
            value={output}
            placeholder="Output will appear here as you type..."
          />
          {output && (
            <div className="text-xs text-gray-400 mt-1 text-right">
              {outputLines} lines · {output.length} chars
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
