import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import { Trash2 } from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'

export default function JsonMinifier() {
  const [input, setInput] = usePersistentState('tool-json-minifier-input', `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "city": "New York",
    "zip": "10001"
  },
  "hobbies": ["reading", "coding", "hiking"]
}`)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const minify = () => {
    if (!input.trim()) return
    try {
      setOutput(JSON.stringify(JSON.parse(input)))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const savings = input.length && output.length
    ? Math.round((1 - output.length / input.length) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button onClick={() => { setInput(''); setOutput(''); setError('') }} className="btn-secondary flex items-center gap-1">
          <Trash2 size={14} /> Clear
        </button>
        <button onClick={minify} className="btn-primary">Minify</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Input JSON</label>
          <FileDropTextarea className="h-80" placeholder="Paste JSON here..." value={input} onChange={setInput} accept=".json,text/plain,text/*" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Minified Output</label>
            <div className="flex items-center gap-2">
              {savings > 0 && <span className="text-xs text-green-600 dark:text-green-400">-{savings}% size</span>}
              <CopyButton text={output} />
            </div>
          </div>
          <textarea className="tool-textarea h-80" readOnly value={output} placeholder="Minified JSON will appear here..." />
        </div>
      </div>
      {error && <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">{error}</div>}
    </div>
  )
}
