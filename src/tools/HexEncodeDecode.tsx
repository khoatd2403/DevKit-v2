import { useState, useEffect } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { ArrowLeftRight } from 'lucide-react'
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
  const [mode, setMode] = usePersistentState<'encode' | 'decode'>('hex-encode-mode', 'encode')
  const [input, setInput] = useState('Hello, World!')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    if (!input) { setOutput(''); return }
    if (mode === 'encode') {
      setOutput(encodeHex(input))
    } else {
      const { result, error: err } = decodeHex(input)
      setOutput(result)
      setError(err)
    }
  }, [input, mode])

  const handleSwap = () => {
    setMode(m => m === 'encode' ? 'decode' : 'encode')
    if (output && !error) {
      setInput(output)
    }
  }

  const charCount = input.length
  const byteCount = new TextEncoder().encode(input).length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="tool-tabs">
          {(['encode', 'decode'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`tool-tab capitalize ${mode === m ? 'active' : ''}`}>
              {m}
            </button>
          ))}
        </div>
        <button onClick={handleSwap} className="flex items-center gap-1.5 btn-secondary text-xs px-3 py-1.5 ml-2">
          <ArrowLeftRight size={13} /> Swap
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="tool-output-header">
            <label className="tool-label">{mode === 'encode' ? 'Plain Text' : 'Hex String'}</label>
          </div>
          <FileDropTextarea
            className="h-56"
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'e.g. 68 65 6c 6c 6f  or  68656c6c6f'}
            value={input}
            onChange={setInput}
            accept="text/*"
          />
          <p className="tool-note">
            {charCount} char{charCount !== 1 ? 's' : ''}
            {mode === 'encode' && <> · {byteCount} byte{byteCount !== 1 ? 's' : ''}</>}
          </p>
        </div>

        <div>
          <div className="tool-output-header">
            <label className="tool-label">{mode === 'encode' ? 'Hex Output' : 'Decoded Text'}</label>
            <CopyButton text={output} toast={mode === 'encode' ? 'Hex copied' : 'Decoded text copied'} />
          </div>
          <textarea className="tool-textarea-output h-56" readOnly value={output} placeholder="Result will appear here..." />
        </div>
      </div>

      {error && <p className="tool-msg tool-msg--error">{error}</p>}
    </div>
  )
}
