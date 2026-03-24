import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'
import { useShareableState } from '../hooks/useShareableState'

function decodeJwt(token: string) {
  const parts = token.trim().split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT: must have 3 parts')
  const decode = (s: string) => {
    const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
    return JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad))
  }
  return {
    header: decode(parts[0]!),
    payload: decode(parts[1]!),
    signature: parts[2],
  }
}

export default function JwtDecoder() {
  const [input, setInput] = usePersistentState('tool-jwt-input', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
  useShareableState(input, setInput)
  const [result, setResult] = useState<ReturnType<typeof decodeJwt> | null>(null)
  const [error, setError] = useState('')

  const decode = () => {
    if (!input.trim()) return
    try {
      setResult(decodeJwt(input))
      setError('')
    } catch (e) {
      setError((e as Error).message)
      setResult(null)
    }
  }

  const isExpired = result?.payload?.exp
    ? (result.payload.exp as number) * 1000 < Date.now()
    : null

  return (
    <div className="space-y-4">
      <div>
        <label className="tool-label block mb-1">JWT Token</label>
        <FileDropTextarea
          className="h-28"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          value={input}
          onChange={setInput}
          accept="text/*"
        />
      </div>
      <button onClick={decode} className="btn-primary">Decode</button>

      {error && <p className="tool-msg tool-msg--error">{error}</p>}

      {result && (
        <div className="space-y-3">
          {isExpired !== null && (
            <p className={`tool-msg ${isExpired ? 'tool-msg--error' : 'tool-msg--success'}`}>
              {isExpired ? '⚠️ Token is EXPIRED' : '✅ Token is valid (not expired)'}
              {result.payload.exp && ` — Expires: ${new Date((result.payload.exp as number) * 1000).toLocaleString()}`}
            </p>
          )}

          {[
            { label: 'Header', data: result.header, color: 'text-red-500' },
            { label: 'Payload', data: result.payload, color: 'text-purple-500' },
          ].map(({ label, data, color }) => (
            <div key={label}>
              <div className="tool-output-header">
                <label className={`tool-label font-semibold ${color}`}>{label}</label>
                <CopyButton text={JSON.stringify(data, null, 2)} toast={`JWT ${label.toLowerCase()} copied`} />
              </div>
              <pre className="tool-textarea-output text-xs overflow-auto h-auto min-h-[60px]">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          ))}

          <div>
            <label className="tool-label font-semibold text-blue-500 block mb-1">Signature</label>
            <div className="tool-textarea-output font-mono text-xs break-all">
              {result.signature}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
