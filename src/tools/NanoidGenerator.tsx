import { useState } from 'react'
import { RefreshCw, Copy, Check } from 'lucide-react'
import CopyButton from '../components/CopyButton'

// --- Nano ID ---
const ALPHABETS = {
  default: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  lowercase: 'abcdefghijklmnopqrstuvwxyz0123456789',
  numbers: '0123456789',
}

function generateNanoId(length: number, alphabet: string): string {
  if (alphabet.length === 0) return ''
  const bytes = new Uint8Array(length * 2)
  crypto.getRandomValues(bytes)
  let result = ''
  let i = 0
  while (result.length < length) {
    const byte = bytes[i++ % bytes.length]!
    if (byte < 256 - (256 % alphabet.length)) {
      result += alphabet[byte % alphabet.length]!
    }
  }
  return result.slice(0, length)
}

// --- ULID ---
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function encodeBase32(value: bigint, length: number): string {
  let result = ''
  for (let i = length - 1; i >= 0; i--) {
    result = CROCKFORD[Number(value & 31n)]! + result
    value >>= 5n
  }
  return result
}

function generateUlid(): string {
  const now = BigInt(Date.now())
  const timeStr = encodeBase32(now, 10)
  const randBytes = new Uint8Array(10)
  crypto.getRandomValues(randBytes)
  let rand = 0n
  for (const b of randBytes) rand = (rand << 8n) | BigInt(b)
  // 80 bits: use lower 80 bits
  rand &= (1n << 80n) - 1n
  const randStr = encodeBase32(rand, 16)
  return timeStr + randStr
}

function decodeUlidTimestamp(ulid: string): { timestamp: Date; ms: number } | null {
  if (ulid.length !== 26) return null
  const timePart = ulid.slice(0, 10).toUpperCase()
  let ms = 0n
  for (const ch of timePart) {
    const idx = CROCKFORD.indexOf(ch)
    if (idx === -1) return null
    ms = ms * 32n + BigInt(idx)
  }
  const msNum = Number(ms)
  return { timestamp: new Date(msNum), ms: msNum }
}

function CopyAllButton({ texts }: { texts: string[] }) {
  const [copied, setCopied] = useState(false)
  async function copyAll() {
    await navigator.clipboard.writeText(texts.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copyAll} className="btn-ghost flex items-center gap-1 text-xs">
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy All'}
    </button>
  )
}

export default function NanoidGenerator() {
  const [tab, setTab] = useState<'nanoid' | 'ulid'>('nanoid')

  // Nano ID state
  const [nanoLength, setNanoLength] = useState(21)
  const [nanoCount, setNanoCount] = useState(10)
  const [alphabetPreset, setAlphabetPreset] = useState<keyof typeof ALPHABETS>('default')
  const [customAlphabet, setCustomAlphabet] = useState('')
  const [nanoIds, setNanoIds] = useState<string[]>([])

  // ULID state
  const [ulidCount, setUlidCount] = useState(10)
  const [ulids, setUlids] = useState<string[]>([])
  const [decodeInput, setDecodeInput] = useState('')
  const [decodeResult, setDecodeResult] = useState<{ ms: number; timestamp: Date; random: string } | null>(null)
  const [decodeError, setDecodeError] = useState('')
  const [expandedUlid, setExpandedUlid] = useState<number | null>(null)

  function generateNanoIds() {
    const alphabet = alphabetPreset === 'default' && customAlphabet
      ? customAlphabet
      : ALPHABETS[alphabetPreset]
    if (!alphabet || alphabet.length < 2) return
    setNanoIds(Array.from({ length: nanoCount }, () => generateNanoId(nanoLength, alphabet)))
  }

  function generateUlids() {
    setUlids(Array.from({ length: ulidCount }, generateUlid))
    setExpandedUlid(null)
  }

  function handleDecode(val: string) {
    setDecodeInput(val)
    if (!val.trim()) { setDecodeResult(null); setDecodeError(''); return }
    const result = decodeUlidTimestamp(val.trim())
    if (!result) { setDecodeError('Invalid ULID format'); setDecodeResult(null); return }
    setDecodeError('')
    setDecodeResult({ ...result, random: val.slice(10) })
  }

  const effectiveAlphabet = alphabetPreset === 'default' && customAlphabet
    ? customAlphabet
    : ALPHABETS[alphabetPreset]

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="tool-tabs w-fit">
        {(['nanoid', 'ulid'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`tool-tab ${tab === t ? 'active' : ''}`}>
            {t === 'nanoid' ? 'Nano ID' : 'ULID'}
          </button>
        ))}
      </div>

      {/* Nano ID tab */}
      {tab === 'nanoid' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="tool-label block mb-1">Length</label>
              <input
                type="number"
                min={1} max={256}
                value={nanoLength}
                onChange={e => setNanoLength(Math.max(1, Math.min(256, +e.target.value)))}
                className="w-20 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm text-gray-700 dark:text-gray-300"
              />
            </div>
            <div>
              <label className="tool-label block mb-1">Count</label>
              <input
                type="number"
                min={1} max={100}
                value={nanoCount}
                onChange={e => setNanoCount(Math.max(1, Math.min(100, +e.target.value)))}
                className="w-20 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm text-gray-700 dark:text-gray-300"
              />
            </div>
            <div>
              <label className="tool-label block mb-1">Alphabet</label>
              <select
                value={alphabetPreset}
                onChange={e => setAlphabetPreset(e.target.value as keyof typeof ALPHABETS)}
                className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300"
              >
                <option value="default">A-Za-z0-9_- (default)</option>
                <option value="alphanumeric">Alphanumeric</option>
                <option value="lowercase">Lowercase + digits</option>
                <option value="numbers">Numbers only</option>
              </select>
            </div>
          </div>

          {alphabetPreset === 'default' && (
            <div>
              <label className="tool-label block mb-1">Custom Alphabet (overrides default)</label>
              <input
                type="text"
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                placeholder="Leave empty to use default"
                value={customAlphabet}
                onChange={e => setCustomAlphabet(e.target.value)}
              />
              {effectiveAlphabet && (
                <p className="text-xs text-gray-400 mt-1">{effectiveAlphabet.length} chars — {(Math.log2(effectiveAlphabet.length) * nanoLength).toFixed(1)} bits of entropy</p>
              )}
            </div>
          )}

          <button onClick={generateNanoIds} className="btn-primary flex items-center gap-2">
            <RefreshCw size={14} /> Generate
          </button>

          {nanoIds.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{nanoIds.length} IDs generated</span>
                <CopyAllButton texts={nanoIds} />
              </div>
              <div className="space-y-1.5">
                {nanoIds.map((id, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                    <span className="font-mono text-sm text-gray-700 dark:text-gray-300 flex-1 break-all">{id}</span>
                    <CopyButton text={id} toast="ID copied" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ULID tab */}
      {tab === 'ulid' && (
        <div className="space-y-4">
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="tool-label block mb-1">Count</label>
              <input
                type="number"
                min={1} max={100}
                value={ulidCount}
                onChange={e => setUlidCount(Math.max(1, Math.min(100, +e.target.value)))}
                className="w-20 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm text-gray-700 dark:text-gray-300"
              />
            </div>
            <button onClick={generateUlids} className="btn-primary flex items-center gap-2">
              <RefreshCw size={14} /> Generate
            </button>
          </div>

          {ulids.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{ulids.length} ULIDs generated</span>
                <CopyAllButton texts={ulids} />
              </div>
              <div className="space-y-1.5">
                {ulids.map((id, i) => {
                  const decoded = decodeUlidTimestamp(id)
                  const isExpanded = expandedUlid === i
                  return (
                    <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2">
                        <button onClick={() => setExpandedUlid(isExpanded ? null : i)} className="font-mono text-sm text-gray-700 dark:text-gray-300 flex-1 text-left">
                          <span className="text-blue-600 dark:text-blue-400">{id.slice(0, 10)}</span>
                          <span className="text-orange-600 dark:text-orange-400">{id.slice(10)}</span>
                        </button>
                        <CopyButton text={id} toast="ID copied" />
                      </div>
                      {isExpanded && decoded && (
                        <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <div><span className="text-blue-500 font-medium">Timestamp:</span> {decoded.timestamp.toISOString()} ({decoded.ms} ms)</div>
                          <div><span className="text-orange-500 font-medium">Randomness:</span> <span className="font-mono">{id.slice(10)}</span></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">Click a ULID to expand and see its decoded timestamp and randomness.</p>
            </div>
          )}

          {/* Decode panel */}
          <div>
            <label className="tool-label block mb-1">Decode a ULID</label>
            <input
              type="text"
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              placeholder="01ARZ3NDEKTSV4RRFFQ69G5FAV"
              value={decodeInput}
              onChange={e => handleDecode(e.target.value)}
            />
            {decodeError && (
              <p className="tool-msg tool-msg--error mt-1">
                {decodeError}
              </p>
            )}
            {decodeResult && (
              <div className="mt-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 text-sm space-y-1">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Decoded</div>
                <div><span className="text-blue-500 font-medium">Timestamp part:</span> <span className="font-mono">{decodeInput.slice(0, 10)}</span></div>
                <div><span className="text-gray-600 dark:text-gray-400">Unix ms:</span> <strong>{decodeResult.ms}</strong></div>
                <div><span className="text-gray-600 dark:text-gray-400">Date/Time:</span> <strong>{decodeResult.timestamp.toISOString()}</strong></div>
                <div><span className="text-orange-500 font-medium">Randomness part:</span> <span className="font-mono">{decodeResult.random}</span></div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p><strong className="text-gray-700 dark:text-gray-300">ULID:</strong> Universally Unique Lexicographically Sortable Identifier — 26 chars, 128 bits total.</p>
            <p><strong className="text-blue-500">First 10 chars</strong> encode a 48-bit millisecond timestamp. <strong className="text-orange-500">Last 16 chars</strong> are 80 bits of randomness.</p>
            <p>Alphabet: Crockford Base32 — <code className="font-mono">0123456789ABCDEFGHJKMNPQRSTVWXYZ</code></p>
          </div>
        </div>
      )}
    </div>
  )
}
