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
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
          {(['encode', 'decode'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 capitalize transition-colors ${mode === m ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {m}
            </button>
          ))}
        </div>
        <button onClick={swap} className="btn-secondary text-xs">⇅ Swap</button>
        <button onClick={() => process()} className="btn-primary ml-auto">{mode === 'encode' ? 'Encode' : 'Decode'}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
            {mode === 'encode' ? 'Plain Text' : 'Base64 String'}
          </label>
          <FileDropTextarea className="h-64" placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'} value={input} onChange={setInput} accept="text/*" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            </label>
            <CopyButton text={output} />
          </div>
          <textarea className="tool-textarea h-64" readOnly value={output} placeholder="Result will appear here..." />
        </div>
      </div>
      {error && <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">{error}</div>}
    </div>
  )
}
