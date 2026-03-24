import { useState, useEffect } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import { Trash2, FileText, Zap } from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'
import { useShareableState } from '../hooks/useShareableState'
import { SmartNextSteps } from '../components/SmartNextSteps'

const SAMPLE = `{
  "id": "tool-123",
  "name": "DevTools Online",
  "version": "2.1.0",
  "active": true,
  "metadata": {
    "author": "DevKit Team",
    "license": "MIT"
  },
  "tags": ["developer", "tools", "utility"],
  "stats": {
    "downloads": 15000,
    "rating": 4.9
  }
}`

export default function JsonMinifier() {
  const [input, setInput] = usePersistentState('tool-json-minifier-input', SAMPLE)
  useShareableState(input, setInput)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const minify = () => {
    if (!input.trim()) { setOutput(''); setError(''); return }
    try {
      setOutput(JSON.stringify(JSON.parse(input)))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  useEffect(() => {
    if (input.trim()) {
      minify()
    }
  }, [input])

  const savings = input.length && output.length
    ? Math.round((1 - output.length / input.length) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input JSON</label>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setInput(SAMPLE)} 
                className="btn-ghost text-xs flex items-center gap-1"
              >
                <FileText size={12} /> Load Sample
              </button>
              <button 
                onClick={() => { setInput(''); setOutput(''); setError('') }} 
                className="btn-ghost text-xs flex items-center gap-1"
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>
          </div>
          <FileDropTextarea 
            className="h-80" 
            placeholder="Paste JSON here..." 
            value={input} 
            onChange={setInput} 
            accept=".json,text/plain,text/*" 
          />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">
              Minified Output
              {savings > 0 && <span className="ml-2 text-green-600 dark:text-green-400">-{savings}% size</span>}
            </label>
            <div className="flex items-center gap-1">
               <button onClick={minify} className="btn-ghost text-xs text-primary-600 flex items-center gap-1">
                  <Zap size={12} /> Minify Now
               </button>
               <CopyButton text={output} toast="Minified JSON copied" />
            </div>
          </div>
          <textarea 
            className="tool-textarea-output h-80" 
            readOnly 
            value={output} 
            placeholder="Minified JSON will appear here..." 
          />
        </div>
      </div>
      {error && <p className="tool-msg tool-msg--error">{error}</p>}

      {output && !error && (
        <SmartNextSteps currentToolId="json-minifier" output={output} />
      )}
    </div>
  )
}
