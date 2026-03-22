import { useState } from 'react'
import CopyButton from '../components/CopyButton'

// Simple bcrypt simulation note: real bcrypt requires a library
// We'll show a UI that explains this and uses SubtleCrypto SHA-256 as a stand-in
// with a bcrypt-like format note
export default function BcryptTool() {
  const [input, setInput] = useState('')
  const [hash, setHash] = useState('')
  const [verifyInput, setVerifyInput] = useState('')
  const [verifyHash, setVerifyHash] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [rounds, setRounds] = useState(10)

  const generate = async () => {
    if (!input) return
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input + rounds))
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    setHash(`$2b$${rounds.toString().padStart(2, '0')}$${hex}`)
  }

  const verify = async () => {
    if (!verifyInput || !verifyHash) return
    const roundsMatch = verifyHash.match(/\$2b\$(\d+)\$/)
    if (!roundsMatch) { setVerifyResult(false); return }
    const r = parseInt(roundsMatch[1]!)
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifyInput + r))
    const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    setVerifyResult(verifyHash === `$2b$${r.toString().padStart(2, '0')}$${hex}`)
  }

  return (
    <div className="space-y-6">
      <div className="text-xs bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 rounded-lg px-3 py-2">
        ⚠️ This is a demo implementation. For production use, install a real bcrypt library.
      </div>

      {/* Hash */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Generate Hash</h3>
        <input type="password" className="tool-textarea h-auto py-2" placeholder="Enter password..." value={input} onChange={e => setInput(e.target.value)} />
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-400">Rounds:</label>
          {[10, 12, 14].map(r => (
            <button key={r} onClick={() => setRounds(r)}
              className={`px-3 py-1 text-xs rounded border ${rounds === r ? 'bg-primary-100 dark:bg-primary-900 border-primary-400 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700'}`}>
              {r}
            </button>
          ))}
        </div>
        <button onClick={generate} className="btn-primary">Generate Hash</button>
        {hash && (
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <span className="font-mono text-xs break-all flex-1 text-gray-700 dark:text-gray-300">{hash}</span>
            <CopyButton text={hash} />
          </div>
        )}
      </div>

      {/* Verify */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Verify Hash</h3>
        <input type="password" className="tool-textarea h-auto py-2" placeholder="Enter password to verify..." value={verifyInput} onChange={e => setVerifyInput(e.target.value)} />
        <input type="text" className="tool-textarea h-auto py-2 font-mono text-xs" placeholder="$2b$10$..." value={verifyHash} onChange={e => setVerifyHash(e.target.value)} />
        <button onClick={verify} className="btn-primary">Verify</button>
        {verifyResult !== null && (
          <div className={`text-sm px-3 py-2 rounded-lg border ${verifyResult ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}>
            {verifyResult ? '✅ Password matches!' : '❌ Password does not match'}
          </div>
        )}
      </div>
    </div>
  )
}
