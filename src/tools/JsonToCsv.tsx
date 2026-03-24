import { useState } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

export default function JsonToCsv() {
  const [input, setInput] = useState('[{"id":1,"name":"Alice","role":"Engineer","salary":95000},{"id":2,"name":"Bob","role":"Designer","salary":85000},{"id":3,"name":"Carol","role":"Manager","salary":110000}]')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [delimiter, setDelimiter] = useState(',')

  const convert = () => {
    if (!input.trim()) return
    try {
      const data = JSON.parse(input)
      const arr: Record<string, unknown>[] = Array.isArray(data) ? data : [data]
      if (arr.length === 0) { setError('Empty array'); return }
      const headers = [...new Set(arr.flatMap(row => Object.keys(row)))]
      const escape = (val: unknown) => {
        const str = val == null ? '' : String(val)
        return str.includes(delimiter) || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }
      const rows = [headers.map(escape).join(delimiter), ...arr.map(row => headers.map(h => escape(row[h])).join(delimiter))]
      setOutput(rows.join('\n'))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <label>Delimiter:</label>
          {[',', ';', '\t', '|'].map(d => (
            <button key={d}
              onClick={() => setDelimiter(d)}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${delimiter === d ? 'bg-primary-100 dark:bg-primary-900 border-primary-400 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700'}`}>
              {d === '\t' ? 'Tab' : d === ',' ? 'Comma' : d === ';' ? 'Semicolon' : 'Pipe'}
            </button>
          ))}
        </div>
        <button onClick={convert} className="btn-primary ml-auto">Convert</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input JSON (array)</label>
          </div>
          <FileDropTextarea className="h-80" placeholder='[{"name":"Alice","age":30},{"name":"Bob","age":25}]' value={input} onChange={setInput} accept=".json,text/plain,text/*" />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">CSV Output</label>
            <CopyButton text={output} toast="CSV copied" />
          </div>
          <textarea className="tool-textarea-output h-80" readOnly value={output} placeholder="CSV will appear here..." />
        </div>
      </div>
      {error && <p className="tool-msg tool-msg--error">{error}</p>}
    </div>
  )
}
