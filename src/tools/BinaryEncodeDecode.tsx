import { useState, useEffect } from 'react'
import { ArrowLeftRight } from 'lucide-react'
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

  useEffect(() => {
    setError('')
    if (!input) { setOutput(''); return }
    if (mode === 'encode') {
      setOutput(encodeBinary(input))
    } else {
      const { result, error: err } = decodeBinary(input)
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
  const totalBits = mode === 'encode'
    ? new TextEncoder().encode(input).length * 8
    : input.trim().split(/\s+/).filter(Boolean).length * 8

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
            <label className="tool-label">{mode === 'encode' ? 'Plain Text' : 'Binary String'}</label>
          </div>
          <FileDropTextarea
            className="h-56"
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'e.g. 01101000 01100101 01101100 01101100 01101111'}
            value={input}
            onChange={setInput}
            accept="text/*"
          />
          <p className="tool-note">
            {mode === 'encode' ? (
              <>{charCount} char{charCount !== 1 ? 's' : ''} · {totalBits} bits</>
            ) : (
              <>{input.trim() ? input.trim().split(/\s+/).filter(Boolean).length : 0} group{input.trim().split(/\s+/).filter(Boolean).length !== 1 ? 's' : ''} · {totalBits} bits</>
            )}
          </p>
        </div>

        <div>
          <div className="tool-output-header">
            <label className="tool-label">{mode === 'encode' ? 'Binary Output' : 'Decoded Text'}</label>
            <CopyButton text={output} toast={mode === 'encode' ? 'Binary copied' : 'Decoded text copied'} />
          </div>
          <textarea className="tool-textarea-output h-56" readOnly value={output} placeholder="Result will appear here..." />
        </div>
      </div>

      {error && <p className="tool-msg tool-msg--error">{error}</p>}
    </div>
  )
}
