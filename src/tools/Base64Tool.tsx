import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

export default function Base64Tool() {
  const [input, setInput] = usePersistentState('tool-base64-input', 'Hello, World! This is a Base64 encoding example.')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const process = (m = mode) => {
    if (!input.trim()) return
    try {
      if (m === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))))
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))))
      }
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const swap = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)
    setInput(output)
    setOutput('')
    setError('')
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
        <button onClick={swap} className="btn-secondary text-xs">⇅ Swap</button>
        <button onClick={() => process()} className="btn-primary ml-auto">Convert</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">{mode === 'encode' ? 'Plain Text' : 'Base64 String'}</label>
          </div>
          <FileDropTextarea className="h-64" placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'} value={input} onChange={setInput} accept="text/*" />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">{mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}</label>
            <CopyButton text={output} toast="Base64 copied" />
          </div>
          <textarea className="tool-textarea-output h-64" readOnly value={output} placeholder="Result will appear here..." />
        </div>
      </div>
      {error && <p className="tool-msg tool-msg--error">{error}</p>}
    </div>
  )
}
