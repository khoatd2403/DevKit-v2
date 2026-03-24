import { useState, useCallback } from 'react'
import CopyButton from '../components/CopyButton'
import { RefreshCw } from 'lucide-react'

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

function getStrength(pwd: string) {
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (pwd.length >= 16) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '25%' }
  if (score <= 4) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' }
  if (score <= 5) return { label: 'Good', color: 'bg-blue-500', width: '75%' }
  return { label: 'Strong', color: 'bg-green-500', width: '100%' }
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true })
  const [password, setPassword] = useState('')
  const [count, setCount] = useState(1)
  const [passwords, setPasswords] = useState<string[]>([])

  const generate = useCallback(() => {
    const charset = Object.entries(options).filter(([, v]) => v).map(([k]) => CHARSETS[k as keyof typeof CHARSETS]).join('')
    if (!charset) return
    const gen = () => Array.from(crypto.getRandomValues(new Uint8Array(length))).map(b => charset[b % charset.length]).join('')
    const list = Array.from({ length: count }, gen)
    setPassword(list[0]!)
    setPasswords(list)
  }, [length, options, count])

  const strength = password ? getStrength(password) : null

  return (
    <div className="space-y-4">
      <div className="tool-panel space-y-4">
        {/* Length */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="tool-label font-semibold">Length</label>
            <span className="text-sm font-mono text-primary-600 dark:text-primary-400">{length}</span>
          </div>
          <input type="range" min={4} max={128} value={length} onChange={e => setLength(+e.target.value)} className="w-full accent-primary-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>4</span><span>128</span></div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(options).map(([key, val]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={val} onChange={e => setOptions(o => ({ ...o, [key]: e.target.checked }))} className="accent-primary-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{key}</span>
            </label>
          ))}
        </div>

        {/* Count */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-400">Generate</label>
          <select value={count} onChange={e => setCount(+e.target.value)} className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300">
            {[1, 5, 10, 20].map(n => <option key={n} value={n}>{n} password{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>

        <button onClick={generate} className="btn-primary w-full flex items-center justify-center gap-2">
          <RefreshCw size={14} /> Generate
        </button>
      </div>

      {passwords.length > 0 && (
        <div className="space-y-2">
          {strength && (
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{strength.label}</span>
            </div>
          )}
          {passwords.map((p, i) => (
            <div key={i} className="tool-result-row">
              <span className="font-mono text-sm text-gray-800 dark:text-gray-200 flex-1 break-all">{p}</span>
              <CopyButton text={p} toast="Password copied" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
