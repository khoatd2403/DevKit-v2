import { useState, useEffect } from 'react'
import CopyButton from '../components/CopyButton'
import { RefreshCw } from 'lucide-react'

export default function UnixTimestamp() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))
  const [tsInput, setTsInput] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [tsResult, setTsResult] = useState('')
  const [dateResult, setDateResult] = useState('')
  const [error1, setError1] = useState('')
  const [error2, setError2] = useState('')

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(t)
  }, [])

  const tsToDate = () => {
    const ts = parseInt(tsInput)
    if (isNaN(ts)) { setError1('Invalid timestamp'); return }
    const ms = tsInput.length > 11 ? ts : ts * 1000
    const d = new Date(ms)
    setDateResult(d.toISOString() + '\n' + d.toLocaleString() + '\nUTC: ' + d.toUTCString())
    setError1('')
  }

  const dateToTs = () => {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) { setError2('Invalid date'); return }
    setTsResult(`Unix (seconds): ${Math.floor(d.getTime() / 1000)}\nUnix (ms): ${d.getTime()}`)
    setError2('')
  }

  return (
    <div className="space-y-6">
      {/* Live clock */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Current Unix Timestamp</div>
          <div className="font-mono text-2xl font-bold text-primary-600 dark:text-primary-400">{now}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-gray-400 mb-1">Local Time</div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{new Date().toLocaleString()}</div>
        </div>
        <CopyButton text={String(now)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timestamp → Date */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Timestamp → Human Date</h3>
          <div className="flex gap-2">
            <input type="text" className="tool-textarea h-auto py-2 flex-1" placeholder="1700000000" value={tsInput} onChange={e => setTsInput(e.target.value)} />
            <button onClick={() => setTsInput(String(now))} className="btn-secondary flex items-center gap-1"><RefreshCw size={12} /> Now</button>
          </div>
          <button onClick={tsToDate} className="btn-primary w-full">Convert</button>
          {error1 && <p className="text-xs text-red-500">{error1}</p>}
          {dateResult && <textarea className="tool-textarea h-24 text-xs" readOnly value={dateResult} />}
        </div>

        {/* Date → Timestamp */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Human Date → Timestamp</h3>
          <input type="datetime-local" className="tool-textarea h-auto py-2" value={dateInput} onChange={e => setDateInput(e.target.value)} />
          <button onClick={dateToTs} className="btn-primary w-full">Convert</button>
          {error2 && <p className="text-xs text-red-500">{error2}</p>}
          {tsResult && (
            <div className="space-y-1">
              {tsResult.split('\n').map((line, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded px-3 py-1.5">
                  <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{line}</span>
                  <CopyButton text={line.split(': ')[1] || ''} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
