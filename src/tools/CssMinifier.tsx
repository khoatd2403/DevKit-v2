import { useState } from 'react'
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

  const process = () => {
    setOutput(mode === 'minify' ? minifyCss(input) : formatCss(input))
  }

  const savings = mode === 'minify' && input.length && output.length
    ? Math.round((1 - output.length / input.length) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
          {(['minify', 'format'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-1.5 capitalize transition-colors ${mode === m ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              {m}
            </button>
          ))}
        </div>
        <button onClick={process} className="btn-primary ml-auto">{mode === 'minify' ? 'Minify' : 'Format'} CSS</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Input CSS</label>
          <FileDropTextarea className="h-72" placeholder=".selector {\n  color: red;\n  background: blue;\n}" value={input} onChange={setInput} accept=".css,text/css,text/*" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Output</label>
            <div className="flex items-center gap-2">
              {savings > 0 && <span className="text-xs text-green-600 dark:text-green-400">-{savings}%</span>}
              <CopyButton text={output} />
            </div>
          </div>
          <textarea className="tool-textarea h-72" readOnly value={output} placeholder="Output will appear here..." />
        </div>
      </div>
    </div>
  )
}
