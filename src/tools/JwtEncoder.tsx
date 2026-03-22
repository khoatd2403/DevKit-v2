import { useState, useEffect } from 'react'
import CopyButton from '../components/CopyButton'
import FileDropTextarea from '../components/FileDropTextarea'

type Algorithm = 'HS256' | 'HS384' | 'HS512' | 'none'

const ALGO_MAP: Record<string, string> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
}

function base64urlEncode(data: Uint8Array | string): string {
  let bytes: Uint8Array
  if (typeof data === 'string') {
    bytes = new TextEncoder().encode(data)
  } else {
    bytes = data
  }
  let binary = ''
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64urlDecodeToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const binary = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function signHmac(algorithm: Algorithm, secret: string, isBase64: boolean, headerB64: string, payloadB64: string): Promise<string> {
  if (algorithm === 'none') return ''
  const hashAlg = ALGO_MAP[algorithm]!
  const secretBytes = isBase64 ? base64urlDecodeToBytes(secret) : new TextEncoder().encode(secret)
  const key = await crypto.subtle.importKey(
    'raw', secretBytes,
    { name: 'HMAC', hash: hashAlg },
    false, ['sign']
  )
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  const sig = await crypto.subtle.sign('HMAC', key, data)
  return base64urlEncode(new Uint8Array(sig))
}

const DEFAULT_PAYLOAD = `{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}`

export default function JwtEncoder() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('HS256')
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD)
  const [secret, setSecret] = useState('your-256-bit-secret')
  const [isBase64Secret, setIsBase64Secret] = useState(false)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  const header = JSON.stringify({ alg: algorithm, typ: 'JWT' }, null, 2)

  useEffect(() => {
    let cancelled = false
    async function generate() {
      if (!payload.trim()) { setToken(''); setError(''); return }
      try {
        JSON.parse(payload) // validate
        const headerObj = { alg: algorithm, typ: 'JWT' }
        const headerB64 = base64urlEncode(JSON.stringify(headerObj))
        const payloadB64 = base64urlEncode(payload.trim())
        const sig = await signHmac(algorithm, secret, isBase64Secret, headerB64, payloadB64)
        if (!cancelled) {
          setToken(algorithm === 'none' ? `${headerB64}.${payloadB64}.` : `${headerB64}.${payloadB64}.${sig}`)
          setError('')
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message)
          setToken('')
        }
      }
    }
    setGenerating(true)
    generate().finally(() => { if (!cancelled) setGenerating(false) })
    return () => { cancelled = true }
  }, [algorithm, payload, secret, isBase64Secret])

  function addClaim(claim: Record<string, unknown>) {
    try {
      const parsed = JSON.parse(payload)
      const merged = { ...parsed, ...claim }
      setPayload(JSON.stringify(merged, null, 2))
    } catch {
      // ignore if payload invalid
    }
  }

  function addIat() { addClaim({ iat: Math.floor(Date.now() / 1000) }) }
  function addExp(hours: number) { addClaim({ exp: Math.floor(Date.now() / 1000) + hours * 3600 }) }
  function addNbf() { addClaim({ nbf: Math.floor(Date.now() / 1000) }) }

  // Split token for colored display
  const parts = token.split('.')
  const [headerPart, payloadPart, sigPart] = parts

  return (
    <div className="space-y-4">
      {/* Algorithm selector */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Algorithm</label>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm w-fit">
          {(['HS256', 'HS384', 'HS512', 'none'] as Algorithm[]).map(alg => (
            <button key={alg} onClick={() => setAlgorithm(alg)}
              className={`px-4 py-1.5 transition-colors ${algorithm === alg ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              {alg}
            </button>
          ))}
        </div>
      </div>

      {/* Header (readonly) */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
          Header <span className="text-blue-500">(blue in token)</span>
        </label>
        <pre className="font-mono text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-blue-600 dark:text-blue-400">
          {header}
        </pre>
      </div>

      {/* Payload */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Payload <span className="text-green-500">(green in token)</span>
          </label>
          <div className="flex gap-1 flex-wrap">
            <button onClick={addIat} className="btn-ghost text-xs px-2 py-0.5">+iat</button>
            <button onClick={() => addExp(1)} className="btn-ghost text-xs px-2 py-0.5">+exp 1h</button>
            <button onClick={() => addExp(24)} className="btn-ghost text-xs px-2 py-0.5">+exp 24h</button>
            <button onClick={() => addExp(168)} className="btn-ghost text-xs px-2 py-0.5">+exp 7d</button>
            <button onClick={addNbf} className="btn-ghost text-xs px-2 py-0.5">+nbf</button>
          </div>
        </div>
        <FileDropTextarea
          className="h-40"
          value={payload}
          onChange={setPayload}
          placeholder='{"sub": "1234567890"}'
          accept=".json,text/plain,text/*"
        />
      </div>

      {/* Secret */}
      {algorithm !== 'none' && (
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Secret</label>
          <input
            type="text"
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="your-secret-key"
          />
          <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" checked={isBase64Secret} onChange={e => setIsBase64Secret(e.target.checked)} className="rounded" />
            Base64 encoded secret
          </label>
        </div>
      )}

      {error && (
        <div className="text-sm px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Token output */}
      {token && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Generated JWT {generating && <span className="text-gray-400">(updating...)</span>}
            </label>
            <CopyButton text={token} />
          </div>
          <div className="font-mono text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 break-all leading-relaxed">
            <span className="text-blue-600 dark:text-blue-400">{headerPart}</span>
            <span className="text-gray-400">.</span>
            <span className="text-green-600 dark:text-green-400">{payloadPart}</span>
            <span className="text-gray-400">.</span>
            <span className="text-orange-600 dark:text-orange-400">{sigPart}</span>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span className="text-blue-500">Header</span>
            <span className="text-green-500">Payload</span>
            <span className="text-orange-500">Signature</span>
          </div>
        </div>
      )}
    </div>
  )
}
