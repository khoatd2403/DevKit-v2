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
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Input JSON (array)</label>
          <FileDropTextarea className="h-80" placeholder='[{"name":"Alice","age":30},{"name":"Bob","age":25}]' value={input} onChange={setInput} accept=".json,text/plain,text/*" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">CSV Output</label>
            <CopyButton text={output} />
          </div>
          <textarea className="tool-textarea h-80" readOnly value={output} placeholder="CSV will appear here..." />
        </div>
      </div>
      {error && <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">{error}</div>}
    </div>
  )
}
