import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'
import { useShareableState } from '../hooks/useShareableState'

export default function UrlEncodeTool() {
  const [input, setInput] = usePersistentState('tool-url-encode-input', 'https://example.com/search?q=hello world&lang=en&page=1')
  useShareableState(input, setInput)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const process = (m = mode) => {
    if (!input.trim()) return
    try {
      setOutput(m === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="tool-tabs">
          {(['encode', 'decode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`tool-tab ${mode === m ? 'active' : ''}`}>
              {m}
            </button>
          ))}
        </div>
        <button onClick={() => process()} className="btn-primary ml-auto">{mode === 'encode' ? 'Encode' : 'Decode'}</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">{mode === 'encode' ? 'Plain URL / Text' : 'Encoded URL'}</label>
          </div>
          <FileDropTextarea className="h-48" placeholder={mode === 'encode' ? 'https://example.com/path?q=hello world&lang=en' : 'https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dhello%20world'} value={input} onChange={setInput} accept="text/*" />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Output</label>
            <CopyButton text={output} toast={mode === 'encode' ? 'Encoded URL copied' : 'Decoded URL copied'} />
          </div>
          <textarea className="tool-textarea-output h-48" readOnly value={output} placeholder="Result will appear here..." />
        </div>
      </div>
      {error && <p className="tool-msg tool-msg--error">{error}</p>}
    </div>
  )
}
