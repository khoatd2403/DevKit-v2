import { useState } from 'react'
import { Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react'

interface Analysis {
  score: number         // 0-4
  entropy: number
  strength: string
  color: string
  checks: { label: string; pass: boolean }[]
  suggestions: string[]
  crack: string
}

const COMMON = ['password', '123456', 'qwerty', 'abc123', 'letmein', 'monkey', 'dragon', 'master', 'sunshine', 'princess', 'welcome', 'shadow', 'superman', 'michael', 'football']

function estimateCrackTime(entropy: number): string {
  // Assuming 10 billion guesses/sec (modern GPU)
  const guesses = Math.pow(2, entropy)
  const secs = guesses / 1e10
  if (secs < 1) return 'instantly'
  if (secs < 60) return `${secs.toFixed(0)} seconds`
  if (secs < 3600) return `${(secs / 60).toFixed(0)} minutes`
  if (secs < 86400) return `${(secs / 3600).toFixed(0)} hours`
  if (secs < 365.25 * 86400) return `${(secs / 86400).toFixed(0)} days`
  if (secs < 100 * 365.25 * 86400) return `${(secs / 365.25 / 86400).toFixed(0)} years`
  if (secs < 1e9 * 365.25 * 86400) return `${(secs / 1e6 / 365.25 / 86400).toFixed(0)} million years`
  return 'centuries'
}

function analyze(pwd: string): Analysis {
  const len = pwd.length
  const hasLower = /[a-z]/.test(pwd)
  const hasUpper = /[A-Z]/.test(pwd)
  const hasDigit = /[0-9]/.test(pwd)
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd)
  const noRepeat = !/(.)\1{2,}/.test(pwd)  // no 3+ repeating chars
  const noSeq = !/(?:abc|bcd|cde|def|efg|123|234|345|456|567|678|789|qwe|wer|ert|asd|sdf)/i.test(pwd)
  const isCommon = COMMON.some(w => pwd.toLowerCase().includes(w))
  const longEnough = len >= 12
  const veryLong = len >= 16

  // Charset size
  let charset = 0
  if (hasLower) charset += 26
  if (hasUpper) charset += 26
  if (hasDigit) charset += 10
  if (hasSpecial) charset += 32

  const entropy = charset > 0 ? +(len * Math.log2(charset)).toFixed(1) : 0

  // Score
  let score = 0
  if (len >= 8) score++
  if (len >= 12) score++
  if ((hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSpecial ? 1 : 0) >= 3) score++
  if (noRepeat && noSeq) score++
  if (isCommon || len < 8) score = Math.max(0, score - 1)

  const levels = [
    { strength: 'Very Weak', color: 'bg-red-500' },
    { strength: 'Weak',      color: 'bg-orange-500' },
    { strength: 'Fair',      color: 'bg-yellow-500' },
    { strength: 'Strong',    color: 'bg-blue-500' },
    { strength: 'Very Strong', color: 'bg-green-500' },
  ]

  const checks = [
    { label: 'At least 8 characters', pass: len >= 8 },
    { label: 'At least 12 characters (recommended)', pass: len >= 12 },
    { label: 'Uppercase letters (A–Z)', pass: hasUpper },
    { label: 'Lowercase letters (a–z)', pass: hasLower },
    { label: 'Numbers (0–9)', pass: hasDigit },
    { label: 'Special characters (!@#$...)', pass: hasSpecial },
    { label: 'No repeating characters', pass: noRepeat },
    { label: 'No common sequences (abc, 123...)', pass: noSeq },
    { label: 'Not a common password', pass: !isCommon },
  ]

  const suggestions: string[] = []
  if (!longEnough) suggestions.push('Use at least 12 characters')
  if (!hasUpper) suggestions.push('Add uppercase letters')
  if (!hasDigit) suggestions.push('Add numbers')
  if (!hasSpecial) suggestions.push('Add special characters (!@#$%)')
  if (!noRepeat) suggestions.push('Avoid repeating characters (aaa, 111)')
  if (isCommon) suggestions.push('Avoid common words or patterns')
  if (len >= 8 && len < 12 && !veryLong) suggestions.push('Longer passwords are significantly harder to crack')

  return { score: Math.min(4, score), entropy, strength: levels[Math.min(4, score)].strength, color: levels[Math.min(4, score)].color, checks, suggestions, crack: len > 0 ? estimateCrackTime(entropy) : '—' }
}

export default function PasswordStrength() {
  const [pwd, setPwd] = useState('MyP@ssw0rd!')
  const [show, setShow] = useState(false)

  const a = analyze(pwd)

  return (
    <div className="space-y-5">
      {/* Input */}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          className="w-full text-base font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
          placeholder="Type or paste a password..."
          autoFocus
        />
        <button onClick={() => setShow(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-1.5">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {pwd && (
        <>
          {/* Strength meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{a.strength}</span>
              <span className="text-xs text-gray-400 font-mono">{a.entropy} bits entropy</span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i <= a.score ? a.color : 'bg-gray-200 dark:bg-gray-700'}`} />
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Length', value: pwd.length },
              { label: 'Entropy', value: `${a.entropy} bits` },
              { label: 'Est. crack time', value: a.crack },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Checklist */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Requirements</p>
              {a.checks.map(c => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  <span className={c.pass ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}>
                    {c.pass ? <Check size={13} /> : <X size={13} />}
                  </span>
                  <span className={c.pass ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            {a.suggestions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Suggestions</p>
                {a.suggestions.map(s => (
                  <div key={s} className="flex items-start gap-2 text-xs">
                    <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400">{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!pwd && (
        <p className="text-center text-sm text-gray-400 py-8">Type a password above to check its strength</p>
      )}
    </div>
  )
}
