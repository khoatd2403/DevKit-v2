import { useState } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

function encodeBinary(text: string): string {
  return Array.from(text)
    .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ')
}

function decodeBinary(binary: string): { result: string; error: string } {
  const parts = binary.trim().split(/\s+/).filter(Boolean)
  const chars: string[] = []
  for (const part of parts) {
    if (!/^[01]+$/.test(part)) {
      return { result: '', error: `Invalid binary sequence: "${part}". Only 0 and 1 are allowed.` }
    }
    if (part.length !== 8) {
      return { result: '', error: `Invalid binary sequence: "${part}". Each group must be exactly 8 bits.` }
    }
    chars.push(String.fromCharCode(parseInt(part, 2)))
  }
  return { result: chars.join(''), error: '' }
}

export default function BinaryEncodeDecode() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('Hello')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleInput = (value: string, currentMode = mode) => {
    setInput(value)
    setError('')
    if (!value) { setOutput(''); return }
    if (currentMode === 'encode') {
      setOutput(encodeBinary(value))
    } else {
      const { result, error: err } = decodeBinary(value)
      setOutput(result)
      setError(err)
    }
  }

  const switchMode = (m: 'encode' | 'decode') => {
    setMode(m)
    setOutput('')
    setError('')
    handleInput(input, m)
  }

  const charCount = input.length
  const totalBits = mode === 'encode'
    ? new TextEncoder().encode(input).length * 8
    : input.trim().split(/\s+/).filter(Boolean).length * 8

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
          {(['encode', 'decode'] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-1.5 capitalize transition-colors ${mode === m ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
            {mode === 'encode' ? 'Plain Text' : 'Binary String'}
          </label>
          <FileDropTextarea
            className="h-56"
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'e.g. 01101000 01100101 01101100 01101100 01101111'}
            value={input}
            onChange={handleInput}
            accept="text/*"
          />
          <div className="flex gap-4 mt-1">
            {mode === 'encode' ? (
              <>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {charCount} char{charCount !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {totalBits} bits
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {input.trim() ? input.trim().split(/\s+/).filter(Boolean).length : 0} group{input.trim().split(/\s+/).filter(Boolean).length !== 1 ? 's' : ''} · {totalBits} bits
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {mode === 'encode' ? 'Binary Output' : 'Decoded Text'}
            </label>
            <CopyButton text={output} />
          </div>
          <textarea
            className="tool-textarea h-56"
            readOnly
            value={output}
            placeholder="Result will appear here..."
          />
        </div>
      </div>

      {error && (
        <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
    </div>
  )
}
