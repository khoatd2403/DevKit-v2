import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { Trash2, WrapText } from 'lucide-react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

export default function JsonFormatter() {
  const [input, setInput] = usePersistentState('tool-json-formatter-input', '{"name":"John Doe","age":30,"email":"john@example.com","address":{"city":"New York","zip":"10001"},"hobbies":["reading","coding","hiking"]}')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)

  const format = () => {
    if (!input.trim()) { setOutput(''); setError(''); return }
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  const validate = () => {
    if (!input.trim()) { setError('Input is empty'); return }
    try {
      JSON.parse(input)
      setError('✅ Valid JSON')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <WrapText size={14} />
          <span>Indent:</span>
          {[2, 4, '\t'].map(v => (
            <button
              key={v}
              onClick={() => setIndent(v as number)}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${indent === v
                ? 'bg-primary-100 dark:bg-primary-900 border-primary-400 text-primary-700 dark:text-primary-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
            >
              {v === '\t' ? 'Tab' : `${v} spaces`}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={validate} className="btn-secondary">Validate</button>
          <button onClick={format} className="btn-primary">Format</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Input JSON</label>
            <button onClick={() => { setInput(''); setOutput(''); setError('') }} className="btn-ghost text-xs gap-1 flex items-center">
              <Trash2 size={12} /> Clear
            </button>
          </div>
          <FileDropTextarea
            className="h-80"
            placeholder='{"key": "value", "array": [1, 2, 3]}'
            value={input}
            onChange={setInput}
            accept=".json,text/plain,text/*"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Formatted Output</label>
            <CopyButton text={output} />
          </div>
          <textarea
            className="tool-textarea h-80"
            readOnly
            value={output}
            placeholder="Formatted JSON will appear here..."
          />
        </div>
      </div>

      {error && (
        <div className={`text-sm px-3 py-2 rounded-lg ${error.startsWith('✅')
          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
          {error}
        </div>
      )}
    </div>
  )
}
