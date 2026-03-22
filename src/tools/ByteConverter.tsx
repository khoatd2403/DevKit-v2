import { useState } from 'react'

const UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
const FACTORS = [1, 1024, 1024**2, 1024**3, 1024**4, 1024**5]

export default function ByteConverter() {
  const [value, setValue] = useState('1073741824')
  const [unit, setUnit] = useState('Bytes')

  const bytes = value ? parseFloat(value) * (FACTORS[UNITS.indexOf(unit)] || 1) : NaN

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Value</label>
          <input
            type="number"
            className="tool-textarea h-auto py-2 text-lg font-mono"
            placeholder="1"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Unit</label>
          <select value={unit} onChange={e => setUnit(e.target.value)} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500">
            {UNITS.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {!isNaN(bytes) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {UNITS.map((u, i) => {
            const val = bytes / (FACTORS[i] || 1)
            return (
              <div key={u} className={`bg-white dark:bg-gray-900 border rounded-xl p-4 ${u === unit ? 'border-primary-400 dark:border-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="text-xs text-gray-400 mb-1">{u}</div>
                <div className="font-mono text-base font-semibold text-gray-800 dark:text-gray-200 break-all">
                  {val < 0.001 ? val.toExponential(3) : val >= 1000 ? val.toLocaleString(undefined, { maximumFractionDigits: 4 }) : val.toPrecision(6).replace(/\.?0+$/, '')}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
