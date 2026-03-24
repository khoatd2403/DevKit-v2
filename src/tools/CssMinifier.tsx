import { useState, useEffect } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    .replace(/;\s*}/g, '}')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatCss(css: string): string {
  let indent = 0
  const result: string[] = []
  const tokens = css.replace(/\s*([{}:;,])\s*/g, ' $1 ').trim().split(/\s+/)
  for (const token of tokens) {
    if (token === '{') { result.push(' {'); indent++ }
    else if (token === '}') { indent--; result.push('\n' + '  '.repeat(indent) + '}') }
    else if (token === ';') { result.push(';'); if (indent > 0) result.push('\n' + '  '.repeat(indent)) }
    else if (token === ',') { result.push(',\n' + '  '.repeat(indent)) }
    else { result.push(token === ':' ? ': ' : (result.length && !result[result.length - 1]!.endsWith('\n') && !result[result.length - 1]!.endsWith(': ') && token !== ':' ? ' ' : '') + token) }
  }
  return result.join('').replace(/\n\s*\n/g, '\n')
}

export default function CssMinifier() {
  const [input, setInput] = useState(`.container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  padding: 20px;\n  margin: 0 auto;\n  max-width: 1200px;\n  background-color: #ffffff;\n}`)
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'minify' | 'format'>('minify')

  useEffect(() => {
    setOutput(mode === 'minify' ? minifyCss(input) : formatCss(input))
  }, [input, mode])

  const savings = mode === 'minify' && input.length && output.length
    ? Math.round((1 - output.length / input.length) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="tool-tabs">
          {(['minify', 'format'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`tool-tab capitalize ${mode === m ? 'active' : ''}`}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input CSS</label>
          </div>
          <FileDropTextarea className="h-72" placeholder=".selector {\n  color: red;\n  background: blue;\n}" value={input} onChange={setInput} accept=".css,text/css,text/*" />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Output</label>
            <div className="flex items-center gap-2">
              {savings > 0 && <span className="text-xs text-green-600 dark:text-green-400">-{savings}%</span>}
              <CopyButton text={output} toast="CSS copied" />
            </div>
          </div>
          <textarea className="tool-textarea-output h-72" readOnly value={output} placeholder="Output will appear here..." />
        </div>
      </div>
    </div>
  )
}
