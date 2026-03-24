import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import FileDropTextarea from '../components/FileDropTextarea'
import CopyButton from '../components/CopyButton'

type Mode = 'CBC' | 'GCM'
type KeySize = 128 | 192 | 256
type Tab = 'encrypt' | 'decrypt'

function buf2b64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}

function b642buf(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function concatArrays(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const arr of arrays) { result.set(arr, offset); offset += arr.length }
  return result
}

async function deriveKey(password: string, salt: Uint8Array, keySize: KeySize): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const rawKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    rawKey,
    { name: 'AES-' + (keySize === 128 ? 'CBC' : keySize === 192 ? 'CBC' : 'CBC'), length: keySize },
    false,
    ['encrypt', 'decrypt']
  )
}

async function deriveKeyForMode(password: string, salt: Uint8Array, keySize: KeySize, mode: Mode): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const rawKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    rawKey,
    { name: mode === 'CBC' ? 'AES-CBC' : 'AES-GCM', length: keySize },
    false,
    ['encrypt', 'decrypt']
  )
}

async function aesEncrypt(plaintext: string, password: string, keySize: KeySize, mode: Mode): Promise<string> {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(mode === 'CBC' ? 16 : 12))
  const key = await deriveKeyForMode(password, salt, keySize, mode)
  const alg = mode === 'CBC' ? { name: 'AES-CBC', iv } : { name: 'AES-GCM', iv }
  const ciphertext = await crypto.subtle.encrypt(alg, key, enc.encode(plaintext))
  const combined = concatArrays(salt, iv, new Uint8Array(ciphertext))
  return buf2b64(combined.buffer)
}

async function aesDecrypt(b64: string, password: string, keySize: KeySize, mode: Mode): Promise<string> {
  const data = b642buf(b64.trim())
  const saltLen = 16
  const ivLen = mode === 'CBC' ? 16 : 12
  if (data.length < saltLen + ivLen + 1) throw new Error('Invalid ciphertext: too short')
  const salt = data.slice(0, saltLen)
  const iv = data.slice(saltLen, saltLen + ivLen)
  const ciphertext = data.slice(saltLen + ivLen)
  const key = await deriveKeyForMode(password, salt, keySize, mode)
  const alg = mode === 'CBC' ? { name: 'AES-CBC', iv } : { name: 'AES-GCM', iv }
  const plaintext = await crypto.subtle.decrypt(alg, key, ciphertext)
  return new TextDecoder().decode(plaintext)
}

export default function AesEncrypt() {
  const [tab, setTab] = useState<Tab>('encrypt')
  const [input, setInput] = usePersistentState('tool-aes-input', 'This is a secret message that will be encrypted with AES.')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [keySize, setKeySize] = useState<KeySize>(256)
  const [mode, setMode] = useState<Mode>('GCM')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleProcess = async () => {
    setError('')
    setOutput('')
    if (!input.trim()) { setError('Input is empty.'); return }
    if (!password) { setError('Password is required.'); return }
    setLoading(true)
    try {
      if (tab === 'encrypt') {
        const result = await aesEncrypt(input, password, keySize, mode)
        setOutput(result)
      } else {
        const result = await aesDecrypt(input, password, keySize, mode)
        setOutput(result)
      }
    } catch (e) {
      setError(tab === 'decrypt'
        ? 'Decryption failed. Wrong password, key size, mode, or corrupted data.'
        : (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Tab toggle */}
      <div className="tool-tabs w-fit">
        {(['encrypt', 'decrypt'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setInput(''); setOutput(''); setError('') }}
            className={`tool-tab flex items-center gap-1.5 px-5 py-2 ${tab === t ? 'active' : ''}`}
          >
            {t === 'encrypt' ? <Lock size={14} /> : <Unlock size={14} />}
            {t}
          </button>
        ))}
      </div>

      {/* Input */}
      <div>
        <label className="tool-label block mb-1">
          {tab === 'encrypt' ? 'Plaintext' : 'Ciphertext (Base64)'}
        </label>
        <FileDropTextarea
          className="h-32"
          placeholder={tab === 'encrypt' ? 'Enter text to encrypt...' : 'Paste Base64 ciphertext...'}
          value={input}
          onChange={setInput}
          accept="text/*"
        />
      </div>

      {/* Password */}
      <div>
        <label className="tool-label block mb-1">Password</label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            className="tool-textarea h-auto py-2 pr-10"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter encryption password..."
          />
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Options row */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="tool-label block mb-1">Key Size</label>
          <div className="tool-tabs">
            {([128, 192, 256] as KeySize[]).map(k => (
              <button key={k} onClick={() => setKeySize(k)} className={`tool-tab ${keySize === k ? 'active' : ''}`}>
                {k}-bit
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="tool-label block mb-1">Mode</label>
          <div className="tool-tabs">
            {(['CBC', 'GCM'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)} className={`tool-tab ${mode === m ? 'active' : ''}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action */}
      <button onClick={handleProcess} disabled={loading} className="btn-primary flex items-center gap-2">
        {tab === 'encrypt' ? <Lock size={15} /> : <Unlock size={15} />}
        {loading ? 'Processing...' : tab === 'encrypt' ? 'Encrypt' : 'Decrypt'}
      </button>

      {error && <p className="tool-msg tool-msg--error">{error}</p>}

      {/* Output */}
      {output && (
        <div>
          <div className="tool-output-header">
            <label className="tool-label">
              {tab === 'encrypt' ? 'Ciphertext (Base64)' : 'Decrypted Plaintext'}
            </label>
            <CopyButton text={output} toast={tab === 'encrypt' ? 'Ciphertext copied' : 'Decrypted text copied'} />
          </div>
          <FileDropTextarea className="h-32" value={output} onChange={() => {}} readOnly />
          <p className="tool-note">
            Format: Base64(salt[16] + iv[{mode === 'CBC' ? 16 : 12}] + ciphertext) — AES-{keySize}-{mode} / PBKDF2 100k iterations
          </p>
        </div>
      )}
    </div>
  )
}
