import { useState } from 'react'
import CopyButton from '../components/CopyButton'

const BASES = [
  { label: 'Binary', base: 2, prefix: '0b' },
  { label: 'Octal', base: 8, prefix: '0o' },
  { label: 'Decimal', base: 10, prefix: '' },
  { label: 'Hexadecimal', base: 16, prefix: '0x' },
]

export default function NumberBaseConverter() {
  const [values, setValues] = useState<Record<number, string>>({ 2: '11111111', 8: '377', 10: '255', 16: 'FF' })
  const [error, setError] = useState('')

  const handleChange = (base: number, raw: string) => {
    setError('')
    const val = raw.trim().replace(/^(0x|0b|0o)/i, '')
    if (!val) { setValues({ 2: '', 8: '', 10: '', 16: '' }); return }
    try {
      const decimal = parseInt(val, base)
      if (isNaN(decimal)) throw new Error('Invalid number for this base')
      if (decimal < 0) throw new Error('Negative numbers not supported')
      setValues({
        2: decimal.toString(2),
        8: decimal.toString(8),
        10: decimal.toString(10),
        16: decimal.toString(16).toUpperCase(),
      })
    } catch (e) {
      setValues(v => ({ ...v, [base]: raw }))
      setError((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BASES.map(({ label, base, prefix }) => (
          <div key={base} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Base {base}</span>
                <CopyButton text={values[base] || ''} toast={`${label} copied`} />
              </div>
            </div>
            <div className="flex items-center gap-1">
              {prefix && <span className="font-mono text-sm text-gray-400">{prefix}</span>}
              <input
                type="text"
                className="flex-1 font-mono text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200"
                value={values[base] || ''}
                onChange={e => handleChange(base, e.target.value)}
                placeholder={base === 10 ? '255' : base === 16 ? 'FF' : base === 2 ? '11111111' : '377'}
              />
            </div>
          </div>
        ))}
      </div>
      {error && <p className="tool-msg tool-msg--error">{error}</p>}

      {/* Quick reference */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Common Values</h3>
        <div className="grid grid-cols-4 gap-2 text-xs font-mono">
          <div className="text-gray-400">Dec</div><div className="text-gray-400">Hex</div><div className="text-gray-400">Oct</div><div className="text-gray-400">Bin</div>
          {[0, 1, 8, 10, 15, 16, 32, 64, 128, 255].map(n => (
            <>
              <div key={`d${n}`} className="text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary-600" onClick={() => handleChange(10, n.toString())}>{n}</div>
              <div key={`h${n}`} className="text-gray-700 dark:text-gray-300">{n.toString(16).toUpperCase()}</div>
              <div key={`o${n}`} className="text-gray-700 dark:text-gray-300">{n.toString(8)}</div>
              <div key={`b${n}`} className="text-gray-700 dark:text-gray-300">{n.toString(2)}</div>
            </>
          ))}
        </div>
      </div>
    </div>
  )
}
