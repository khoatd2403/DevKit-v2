import { useState, useEffect, useCallback } from 'react'
import { Copy, Check, RefreshCw, Shield } from 'lucide-react'

type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-512'
type TimeStep = 30 | 60
type Digits = 6 | 8

// Base32 decode
function base32Decode(input: string): Uint8Array {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const s = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '')
  let bits = 0
  let value = 0
  let index = 0
  const output = new Uint8Array(Math.floor(s.length * 5 / 8))
  for (let i = 0; i < s.length; i++) {
    const idx = ALPHABET.indexOf(s[i]!)
    if (idx === -1) throw new Error(`Invalid base32 character: ${s[i]}`)
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 0xff
      bits -= 8
    }
  }
  return output.slice(0, index)
}

// HMAC via crypto.subtle
async function hmac(algorithm: Algorithm, key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key,
    { name: 'HMAC', hash: algorithm },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, data)
  return new Uint8Array(sig)
}

// Counter as 8-byte big-endian
function counterToBytes(counter: number): Uint8Array {
  const buf = new Uint8Array(8)
  let c = counter
  for (let i = 7; i >= 0; i--) {
    buf[i] = c & 0xff
    c = Math.floor(c / 256)
  }
  return buf
}

// Dynamic truncation
function truncate(hmacResult: Uint8Array, digits: Digits): string {
  const offset = hmacResult[hmacResult.length - 1]! & 0x0f
  const code =
    ((hmacResult[offset]! & 0x7f) << 24) |
    ((hmacResult[offset + 1]! & 0xff) << 16) |
    ((hmacResult[offset + 2]! & 0xff) << 8) |
    (hmacResult[offset + 3]! & 0xff)
  return String(code % Math.pow(10, digits)).padStart(digits, '0')
}

async function generateTotp(secret: string, timeStep: TimeStep, digits: Digits, algorithm: Algorithm, counter: number): Promise<string> {
  const keyBytes = base32Decode(secret)
  const counterBytes = counterToBytes(counter)
  const mac = await hmac(algorithm, keyBytes, counterBytes)
  return truncate(mac, digits)
}

function formatCode(code: string): string {
  if (code.length === 6) return `${code.slice(0, 3)} ${code.slice(3)}`
  if (code.length === 8) return `${code.slice(0, 4)} ${code.slice(4)}`
  return code
}

export default function TotpGenerator() {
  const [secret, setSecret] = useState('JBSWY3DPEHPK3PXP')
  const [timeStep, setTimeStep] = useState<TimeStep>(30)
  const [digits, setDigits] = useState<Digits>(6)
  const [algorithm, setAlgorithm] = useState<Algorithm>('SHA-1')
  const [currentCode, setCurrentCode] = useState('')
  const [prevCode, setPrevCode] = useState('')
  const [nextCode, setNextCode] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const refresh = useCallback(async () => {
    if (!secret.trim()) { setError('Enter a secret key'); return }
    try {
      setError('')
      const now = Math.floor(Date.now() / 1000)
      const counter = Math.floor(now / timeStep)
      const remaining = timeStep - (now % timeStep)
      setTimeRemaining(remaining)
      const [prev, curr, next] = await Promise.all([
        generateTotp(secret.trim(), timeStep, digits, algorithm, counter - 1),
        generateTotp(secret.trim(), timeStep, digits, algorithm, counter),
        generateTotp(secret.trim(), timeStep, digits, algorithm, counter + 1),
      ])
      setPrevCode(prev)
      setCurrentCode(curr)
      setNextCode(next)
    } catch (e) {
      setError((e as Error).message)
      setCurrentCode('')
      setPrevCode('')
      setNextCode('')
    }
  }, [secret, timeStep, digits, algorithm])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 1000)
    return () => clearInterval(interval)
  }, [refresh])

  const handleCopy = () => {
    if (!currentCode) return
    navigator.clipboard.writeText(currentCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const progressPct = timeRemaining / timeStep * 100

  // Build otpauth URI
  const otpauthUri = secret.trim()
    ? `otpauth://totp/AllDevTools?secret=${secret.trim().toUpperCase()}&algorithm=${algorithm.replace('-', '')}&digits=${digits}&period=${timeStep}`
    : ''

  return (
    <div className="space-y-4">
      {/* Secret input */}
      <div>
        <label className="label-text block mb-1">Secret Key (Base32)</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase tracking-widest"
            value={secret}
            onChange={e => setSecret(e.target.value.toUpperCase().replace(/\s/g, ''))}
            placeholder="e.g. JBSWY3DPEHPK3PXP"
          />
          <button
            onClick={() => {
              const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
              let s = ''
              const arr = crypto.getRandomValues(new Uint8Array(20))
              arr.forEach(b => { s += chars[b % 32] })
              setSecret(s)
            }}
            className="btn-secondary flex items-center gap-1.5 text-xs"
            title="Generate random secret"
          >
            <RefreshCw size={13} /> Generate
          </button>
        </div>
        {otpauthUri && (
          <p className="mt-1.5 text-xs font-mono text-gray-400 dark:text-gray-500 break-all leading-relaxed bg-gray-50 dark:bg-gray-900 rounded p-2 border border-gray-200 dark:border-gray-800">
            {otpauthUri}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="label-text block mb-1">Time Step</label>
          <div className="tool-tabs">
            {([30, 60] as TimeStep[]).map(t => (
              <button key={t} onClick={() => setTimeStep(t)}
                className={`tool-tab ${timeStep === t ? 'active' : ''}`}>
                {t}s
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label-text block mb-1">Digits</label>
          <div className="tool-tabs">
            {([6, 8] as Digits[]).map(d => (
              <button key={d} onClick={() => setDigits(d)}
                className={`tool-tab ${digits === d ? 'active' : ''}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label-text block mb-1">Algorithm</label>
          <div className="tool-tabs">
            {(['SHA-1', 'SHA-256', 'SHA-512'] as Algorithm[]).map(a => (
              <button key={a} onClick={() => setAlgorithm(a)}
                className={`tool-tab ${algorithm === a ? 'active' : ''}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="tool-msg tool-msg--error">
          {error}
        </p>
      )}

      {/* TOTP display */}
      {currentCode && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1"><Shield size={11} /> Expires in</span>
              <span className={`font-mono font-semibold ${timeRemaining <= 5 ? 'text-red-500' : timeRemaining <= 10 ? 'text-yellow-500' : 'text-green-500'}`}>
                {timeRemaining}s
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  timeRemaining <= 5 ? 'bg-red-500' : timeRemaining <= 10 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Current code */}
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Current Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-mono font-bold tracking-[0.15em] text-gray-900 dark:text-gray-50 tabular-nums">
                {formatCode(currentCode)}
              </span>
              <button onClick={handleCopy} className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5">
                {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Previous / Next */}
          <div className="flex gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400 mb-1">Previous</p>
              <p className="font-mono text-lg font-semibold text-gray-400 dark:text-gray-600 tracking-widest tabular-nums line-through">
                {formatCode(prevCode)}
              </p>
            </div>
            <div className="w-px bg-gray-100 dark:bg-gray-800" />
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400 mb-1">Next</p>
              <p className="font-mono text-lg font-semibold text-gray-400 dark:text-gray-500 tracking-widest tabular-nums">
                {formatCode(nextCode)}
              </p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Standard RFC 6238 TOTP. Most authenticator apps use SHA-1 / 30s / 6 digits.
      </p>
    </div>
  )
}
