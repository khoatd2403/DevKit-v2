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
          <div className="tool-output-header">
            <label className="tool-label">Input JSON</label>
          </div>
          <FileDropTextarea className="h-80" placeholder="Paste JSON here..." value={input} onChange={setInput} accept=".json,text/plain,text/*" />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">
              Minified Output
              {savings > 0 && <span className="ml-2 text-green-600 dark:text-green-400">-{savings}% size</span>}
            </label>
            <CopyButton text={output} toast="Minified JSON copied" />
          </div>
          <textarea className="tool-textarea-output h-80" readOnly value={output} placeholder="Minified JSON will appear here..." />
        </div>
      </div>
      {error && <p className="tool-msg tool-msg--error">{error}</p>}
    </div>
  )
}
