import { useState, useEffect } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'
import { usePersistentState } from '../hooks/usePersistentState'
import { useShareableState } from '../hooks/useShareableState'
import { SmartNextSteps } from '../components/SmartNextSteps'
import { Trash2, FileText, Zap } from 'lucide-react'

const SAMPLE = '[{"id":1,"name":"Alice","role":"Engineer","salary":95000},{"id":2,"name":"Bob","role":"Designer","salary":85000},{"id":3,"name":"Carol","role":"Manager","salary":110000}]'

export default function JsonToCsv() {
  const [input, setInput] = usePersistentState('tool-json-to-csv-input', SAMPLE)
  useShareableState(input, setInput)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [delimiter, setDelimiter] = useState(',')

  const convert = () => {
    if (!input.trim()) { setOutput(''); setError(''); return }
    try {
      const data = JSON.parse(input)
      const arr: any[] = Array.isArray(data) ? data : [data]
      if (arr.length === 0) { setError('Empty array'); return }
      
      const headers = [...new Set(arr.flatMap(row => Object.keys(row)))]
      const escape = (val: any) => {
        const str = val == null ? '' : String(val)
        return str.includes(delimiter) || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }
      
      const rows = [
        headers.map(escape).join(delimiter), 
        ...arr.map(row => headers.map(h => escape(row[h])).join(delimiter))
      ]
      setOutput(rows.join('\n'))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  useEffect(() => {
    if (input.trim()) {
      convert()
    }
  }, [input, delimiter])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          {[',', ';', '\t', '|'].map(d => (
            <button 
              key={d}
              onClick={() => setDelimiter(d)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                delimiter === d 
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {d === '\t' ? 'Tab' : d === ',' ? 'Comma' : d === ';' ? 'Semicolon' : 'Pipe'}
            </button>
          ))}
        </div>
        
        <div className="ml-auto flex items-center gap-1">
             <button onClick={() => setInput(SAMPLE)} className="btn-ghost text-xs flex items-center gap-1 font-medium">
                  <FileText size={12} /> Load Sample
             </button>
             <button onClick={() => { setInput(''); setOutput(''); setError('') }} className="btn-ghost text-xs flex items-center gap-1 font-medium text-red-500">
                  <Trash2 size={12} /> Clear
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input JSON</label>
            <button onClick={convert} className="btn-ghost text-xs text-primary-600 flex items-center gap-1">
                <Zap size={12} /> Convert Now
            </button>
          </div>
          <FileDropTextarea 
            className="h-80" 
            placeholder='[{"name":"Alice","age":30},{"name":"Bob","age":25}]' 
            value={input} 
            onChange={setInput} 
            accept=".json,text/plain,text/*" 
          />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">CSV Output</label>
            <CopyButton text={output} toast="CSV copied" />
          </div>
          <textarea 
            className="tool-textarea-output h-80" 
            readOnly 
            value={output} 
            placeholder="CSV will appear here..." 
          />
        </div>
      </div>
      {error && <p className="tool-msg tool-msg--error">{error}</p>}

      {output && !error && (
        <SmartNextSteps currentToolId="json-to-csv" output={output} />
      )}
    </div>
  )
}
