import { useState } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

function encodeHex(text: string): string {
  return Array.from(text)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join(' ')
}

function decodeHex(hex: string): { result: string; error: string } {
  const cleaned = hex.trim()
  // Support both space-separated and continuous hex
  let pairs: string[]
  if (cleaned.includes(' ')) {
    pairs = cleaned.split(/\s+/).filter(Boolean)
  } else {
    if (cleaned.length % 2 !== 0) {
      return { result: '', error: 'Hex string length must be even (each byte is 2 hex characters).' }
    }
    pairs = cleaned.match(/.{2}/g) ?? []
  }

  const chars: string[] = []
  for (const pair of pairs) {
    if (!/^[0-9a-fA-F]{2}$/.test(pair)) {
      return { result: '', error: `Invalid hex pair: "${pair}". Each byte must be exactly 2 hex characters (0-9, a-f).` }
    }
    chars.push(String.fromCharCode(parseInt(pair, 16)))
  }
  return { result: chars.join(''), error: '' }
}

export default function HexEncodeDecode() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('Hello, World!')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleInput = (value: string, currentMode = mode) => {
    setInput(value)
    setError('')
    if (!value) { setOutput(''); return }
    if (currentMode === 'encode') {
      setOutput(encodeHex(value))
    } else {
      const { result, error: err } = decodeHex(value)
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
  const byteCount = new TextEncoder().encode(input).length

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
            {mode === 'encode' ? 'Plain Text' : 'Hex String'}
          </label>
          <FileDropTextarea
            className="h-56"
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'e.g. 68 65 6c 6c 6f  or  68656c6c6f'}
            value={input}
            onChange={handleInput}
            accept="text/*"
          />
          <div className="flex gap-4 mt-1">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {charCount} char{charCount !== 1 ? 's' : ''}
            </span>
            {mode === 'encode' && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {byteCount} byte{byteCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {mode === 'encode' ? 'Hex Output' : 'Decoded Text'}
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
