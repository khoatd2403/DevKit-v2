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
    <div className="space-y-4">
      <p className="tool-msg tool-msg--warning">
        ⚠️ This is a demo implementation. For production use, install a real bcrypt library.
      </p>

      {/* Hash */}
      <div className="tool-panel space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Generate Hash</h3>
        <div>
          <label className="tool-label block mb-1">Password</label>
          <input type="password" className="tool-textarea h-auto py-2" placeholder="Enter password..." value={input} onChange={e => setInput(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <label className="tool-label">Rounds:</label>
          <div className="tool-tabs">
            {[10, 12, 14].map(r => (
              <button key={r} onClick={() => setRounds(r)} className={`tool-tab ${rounds === r ? 'active' : ''}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} className="btn-primary">Generate Hash</button>
        {hash && (
          <div className="tool-result-row">
            <span className="font-mono text-xs break-all flex-1 text-gray-700 dark:text-gray-300">{hash}</span>
            <CopyButton text={hash} toast="Hash copied" />
          </div>
        )}
      </div>

      {/* Verify */}
      <div className="tool-panel space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Verify Hash</h3>
        <div>
          <label className="tool-label block mb-1">Password</label>
          <input type="password" className="tool-textarea h-auto py-2" placeholder="Enter password to verify..." value={verifyInput} onChange={e => setVerifyInput(e.target.value)} />
        </div>
        <div>
          <label className="tool-label block mb-1">Hash</label>
          <input type="text" className="tool-textarea h-auto py-2 font-mono text-xs" placeholder="$2b$10$..." value={verifyHash} onChange={e => setVerifyHash(e.target.value)} />
        </div>
        <button onClick={verify} className="btn-primary">Verify</button>
        {verifyResult !== null && (
          <p className={`tool-msg ${verifyResult ? 'tool-msg--success' : 'tool-msg--error'}`}>
            {verifyResult ? '✅ Password matches!' : '❌ Password does not match'}
          </p>
        )}
      </div>
    </div>
  )
}
