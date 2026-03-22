import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

export default function UrlEncodeTool() {
  const [input, setInput] = usePersistentState('tool-url-encode-input', 'https://example.com/search?q=hello world&lang=en&page=1')
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
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
          {(['encode', 'decode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-1.5 capitalize transition-colors ${mode === m ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              {m}
            </button>
          ))}
        </div>
        <button onClick={() => process()} className="btn-primary ml-auto">{mode === 'encode' ? 'Encode' : 'Decode'}</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">{mode === 'encode' ? 'Plain URL / Text' : 'Encoded URL'}</label>
          <FileDropTextarea className="h-48" placeholder={mode === 'encode' ? 'https://example.com/path?q=hello world&lang=en' : 'https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dhello%20world'} value={input} onChange={setInput} accept="text/*" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Output</label>
            <CopyButton text={output} />
          </div>
          <textarea className="tool-textarea h-48" readOnly value={output} placeholder="Result will appear here..." />
        </div>
      </div>
      {error && <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">{error}</div>}
    </div>
  )
}
