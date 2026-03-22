import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

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
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">JWT Token</label>
        <FileDropTextarea
          className="h-28"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          value={input}
          onChange={setInput}
          accept="text/*"
        />
      </div>
      <button onClick={decode} className="btn-primary">Decode</button>

      {error && <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">{error}</div>}

      {result && (
        <div className="space-y-3">
          {isExpired !== null && (
            <div className={`text-sm px-3 py-2 rounded-lg border ${isExpired ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'}`}>
              {isExpired ? '⚠️ Token is EXPIRED' : '✅ Token is valid (not expired)'}
              {result.payload.exp && ` — Expires: ${new Date((result.payload.exp as number) * 1000).toLocaleString()}`}
            </div>
          )}

          {[
            { label: 'Header', data: result.header, color: 'text-red-500' },
            { label: 'Payload', data: result.payload, color: 'text-purple-500' },
          ].map(({ label, data, color }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <label className={`text-xs font-semibold ${color}`}>{label}</label>
                <CopyButton text={JSON.stringify(data, null, 2)} />
              </div>
              <pre className="tool-textarea text-xs overflow-auto h-auto min-h-[60px]">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold text-blue-500 block mb-1">Signature</label>
            <div className="font-mono text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-500 dark:text-gray-400 break-all">
              {result.signature}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
