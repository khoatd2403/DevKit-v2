import { useState, useEffect } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'
import { useShareableState } from '../hooks/useShareableState'
import { SmartNextSteps } from '../components/SmartNextSteps'

export default function Base64Tool() {
  const [input, setInput] = usePersistentState('tool-base64-input', 'SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgQmFzZTY0IGVuY29kaW5nIGV4YW1wbGUu')
  useShareableState(input, setInput)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'decode' | 'encode'>('decode')

  const process = (val: string, m: 'encode' | 'decode') => {
    if (!val.trim()) { setOutput(''); setError(''); return }
    try {
      if (m === 'encode') {
        setOutput(btoa(val))
      } else {
        setOutput(atob(val))
      }
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  useEffect(() => {
    process(input, mode)
  }, [input, mode])

  return (
    <div className="space-y-4">
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {(['encode', 'decode'] as const).map(m => (
          <button 
            key={m} 
            onClick={() => setMode(m)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === m 
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {m === 'encode' ? 'Encode Text' : 'Decode Base64'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Input {mode === 'encode' ? 'Text' : 'Base64'}</label>
          </div>
          <FileDropTextarea
            className="h-44"
            placeholder={mode === 'encode' ? 'Type or drop files...' : 'SGVsbG8gd29ybGQ='}
            value={input}
            onChange={setInput}
            accept="text/*"
          />
        </div>
        <div>
          <div className="tool-output-header">
            <label className="tool-label">Output {mode === 'encode' ? 'Base64' : 'Text'}</label>
            <CopyButton text={output} toast={`${mode === 'encode' ? 'Base64' : 'Text'} copied`} />
          </div>
          <textarea
            className="tool-textarea-output h-44"
            readOnly
            value={output}
            placeholder="Result will appear here..."
          />
        </div>
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm italic">
          Error: {error}
        </div>
      )}

      {output && !error && (
        <SmartNextSteps currentToolId="base64-encode-decode" output={output} />
      )}
    </div>
  )
}
